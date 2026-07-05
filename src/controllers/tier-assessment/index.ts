import { Request, Response } from "express";
import { pool } from "@/config/db";
import { submitTierAssessmentSchema } from "@/controllers/tier-assessment/validations";
import {
  SubmitAssessmentBody,
  TierQuestionOptionRow,
  TierQuestionRow,
  TierQuestionType,
} from "@/controllers/tier-assessment/types";

const TIER_PATTERN = /^TIER_\d+$/;

const isAssessableTier = (tier: string): boolean => TIER_PATTERN.test(tier);

const getNextTier = (currentTier: string): string => {
  const tierLevel = currentTier.split("_").pop();
  return `TIER_${parseInt(tierLevel || "0", 10) + 1}`;
};

const setsMatch = (a: string[], b: string[]): boolean => {
  if (a.length !== b.length) {
    return false;
  }

  const sortedA = [...a].sort();
  const sortedB = [...b].sort();

  return sortedA.every((value, index) => value === sortedB[index]);
};

const isQuestionAnswerCorrect = (
  questionType: TierQuestionType,
  selectedOptionIds: string[],
  questionOptions: TierQuestionOptionRow[],
): boolean => {
  const uniqueSelected = [...new Set(selectedOptionIds)];

  if (uniqueSelected.length !== selectedOptionIds.length) {
    return false;
  }

  const validOptionIds = new Set(questionOptions.map((option) => option.id));

  if (!uniqueSelected.every((optionId) => validOptionIds.has(optionId))) {
    return false;
  }

  if (questionType === "SINGLE-SELECT" && uniqueSelected.length !== 1) {
    return false;
  }

  const correctOptionIds = questionOptions
    .filter((option) => option.is_correct)
    .map((option) => option.id);

  return setsMatch(uniqueSelected, correctOptionIds);
};

export const getTierQuestions = async (
  req: Request<{ tier: string }>,
  res: Response,
) => {
  try {
    const { id } = req.user;
    const { tier } = req.params;

    if (!isAssessableTier(tier)) {
      res.status(400).json({ message: "Invalid tier" });
      return;
    }

    const { rows: userRows } = await pool.query(
      "SELECT tier FROM users WHERE id = $1",
      [id],
    );

    if (userRows.length === 0) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const userTier = userRows[0].tier as string;

    if (userTier.localeCompare(tier) !== 0) {
      res.status(403).json({ message: "Forbidden: Access denied" });
      return;
    }

    const { rows: questionRows } = await pool.query<TierQuestionRow>(
      `SELECT id, index, label_en, label_bn, type
       FROM tier_questions
       WHERE tier = $1 AND is_active = true
       ORDER BY index ASC`,
      [tier],
    );

    if (questionRows.length === 0) {
      res
        .status(404)
        .json({ message: "No assessment questions found for tier" });
      return;
    }

    const questionIds = questionRows.map((question) => question.id);

    const { rows: optionRows } = await pool.query<TierQuestionOptionRow>(
      `SELECT id, question_id, index, label_en, label_bn
       FROM tier_question_options
       WHERE question_id = ANY($1::uuid[])
       ORDER BY index ASC`,
      [questionIds],
    );

    const optionsByQuestionId = optionRows.reduce<
      Record<string, TierQuestionOptionRow[]>
    >((acc, option) => {
      if (!acc[option.question_id]) {
        acc[option.question_id] = [];
      }
      acc[option.question_id].push(option);
      return acc;
    }, {});

    const questions = questionRows.map((question) => ({
      topic: question.id, // was id, now topic
      type: question.type,
      label: {
        en: question.label_en,
        bn: question.label_bn,
      },
      options: (optionsByQuestionId[question.id] || []).map((option) => ({
        value: option.id, // was id, now value
        label: {
          en: option.label_en,
          bn: option.label_bn,
        },
      })),
      type: "SINGLE-SELECT", // hardcoded for now
    }));

    res.status(200).json({
      message: "Tier assessment questions fetched successfully",
      result: {
        tier,
        questions,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const submitTierAssessment = async (
  req: Request<{ tier: string }>,
  res: Response,
) => {
  const { error } = submitTierAssessmentSchema.validate(req.body);

  if (error) {
    res
      .status(400)
      .json({ error: "Validation error", message: error.details[0].message });
    return;
  }

  const client = await pool.connect();

  try {
    const { id } = req.user;
    const { tier } = req.params;
    const { answers } = req.body as SubmitAssessmentBody;

    if (!isAssessableTier(tier)) {
      res.status(400).json({ message: "Invalid tier" });
      return;
    }

    await client.query("BEGIN");

    const { rows: userRows } = await client.query(
      "SELECT tier FROM users WHERE id = $1 FOR UPDATE",
      [id],
    );

    if (userRows.length === 0) {
      await client.query("ROLLBACK");
      res.status(404).json({ message: "User not found" });
      return;
    }

    const userTier = userRows[0].tier as string;

    if (userTier.localeCompare(tier) !== 0) {
      await client.query("ROLLBACK");
      res.status(403).json({ message: "Forbidden: Access denied" });
      return;
    }

    const { rows: questionRows } = await client.query<TierQuestionRow>(
      `SELECT id, index, label_en, label_bn, type
       FROM tier_questions
       WHERE tier = $1 AND is_active = true
       ORDER BY index ASC`,
      [tier],
    );

    if (questionRows.length === 0) {
      await client.query("ROLLBACK");
      res
        .status(404)
        .json({ message: "No assessment questions found for tier" });
      return;
    }

    const questionsById = questionRows.reduce<Record<string, TierQuestionRow>>(
      (acc, question) => {
        acc[question.id] = question;
        return acc;
      },
      {},
    );

    const questionIds = new Set(questionRows.map((question) => question.id));
    const submittedQuestionIds = new Set<string>();

    for (const answer of answers) {
      if (!questionIds.has(answer.question)) {
        await client.query("ROLLBACK");
        res.status(400).json({ message: "Invalid question in submission" });
        return;
      }

      if (submittedQuestionIds.has(answer.question)) {
        await client.query("ROLLBACK");
        res.status(400).json({ message: "Duplicate answers for question" });
        return;
      }

      const question = questionsById[answer.question];

      if (question.type === "SINGLE-SELECT" && answer.option.length !== 1) {
        await client.query("ROLLBACK");
        res
          .status(400)
          .json({
            message: "Single-select question must have exactly 1 option",
          });
        return;
      }

      if (new Set(answer.option).size !== answer.option.length) {
        await client.query("ROLLBACK");
        res.status(400).json({ message: "Duplicate options in submission" });
        return;
      }

      submittedQuestionIds.add(answer.question);
    }

    if (submittedQuestionIds.size !== questionRows.length) {
      await client.query("ROLLBACK");
      res.status(400).json({ message: "All questions must be answered" });
      return;
    }

    const { rows: optionRows } = await client.query<TierQuestionOptionRow>(
      `SELECT id, question_id, index, label_en, label_bn, is_correct
       FROM tier_question_options
       WHERE question_id = ANY($1::uuid[])`,
      [[...questionIds]],
    );

    const optionsByQuestionId = optionRows.reduce<
      Record<string, TierQuestionOptionRow[]>
    >((acc, option) => {
      if (!acc[option.question_id]) {
        acc[option.question_id] = [];
      }
      acc[option.question_id].push(option);
      return acc;
    }, {});

    let correctCount = 0;

    for (const answer of answers) {
      const question = questionsById[answer.question];
      const questionOptions = optionsByQuestionId[answer.question] || [];

      const isCorrect = isQuestionAnswerCorrect(
        question.type,
        answer.option,
        questionOptions,
      );

      if (isCorrect) {
        correctCount += 1;
      }
    }

    const totalQuestions = questionRows.length;
    const passed = correctCount === totalQuestions;
    const nextTier = getNextTier(tier);

    const { rows: nextTierRows } = await client.query(
      "SELECT id FROM tiers WHERE tier = $1",
      [nextTier],
    );

    let promoted = false;
    let resultingTier = userTier;

    if (passed && nextTierRows.length > 0) {
      await client.query("UPDATE users SET tier = $1 WHERE id = $2", [
        nextTier,
        id,
      ]);
      promoted = true;
      resultingTier = nextTier;
    }

    await client.query(
      `INSERT INTO tier_assessment_attempts
        (user_id, tier, passed, total_questions, correct_count)
       VALUES ($1, $2, $3, $4, $5)`,
      [id, tier, passed, totalQuestions, correctCount],
    );

    await client.query("COMMIT");

    res.status(200).json({
      message: "Tier assessment submitted successfully",
      result: {
        promoted,
        tier: resultingTier,
      },
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    client.release();
  }
};
