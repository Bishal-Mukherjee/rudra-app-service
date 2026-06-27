import { Request, Response } from "express";
import { pool } from "@/config/db";
import { submitTierAssessmentSchema } from "@/controllers/tier-assessment/validations";
import {
  SubmitAssessmentBody,
  TierQuestionOptionRow,
  TierQuestionRow,
} from "@/controllers/tier-assessment/types";

const TIER_PATTERN = /^TIER_\d+$/;

const isAssessableTier = (tier: string): boolean => TIER_PATTERN.test(tier);

const getNextTier = (currentTier: string): string => {
  const tierLevel = currentTier.split("_").pop();
  return `TIER_${parseInt(tierLevel || "0", 10) + 1}`;
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
      `SELECT id, index, label_en, label_bn
       FROM tier_questions
       WHERE tier = $1 AND is_active = true
       ORDER BY index ASC`,
      [tier],
    );

    if (questionRows.length === 0) {
      res.status(404).json({ message: "No assessment questions found for tier" });
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
      id: question.id,
      label: {
        en: question.label_en,
        bn: question.label_bn,
      },
      options: (optionsByQuestionId[question.id] || []).map((option) => ({
        id: option.id,
        label: {
          en: option.label_en,
          bn: option.label_bn,
        },
      })),
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
      `SELECT id, index, label_en, label_bn
       FROM tier_questions
       WHERE tier = $1 AND is_active = true
       ORDER BY index ASC`,
      [tier],
    );

    if (questionRows.length === 0) {
      await client.query("ROLLBACK");
      res.status(404).json({ message: "No assessment questions found for tier" });
      return;
    }

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
      const questionOptions = optionsByQuestionId[answer.question] || [];
      const selectedOption = questionOptions.find(
        (option) => option.id === answer.option,
      );

      if (!selectedOption) {
        await client.query("ROLLBACK");
        res.status(400).json({ message: "Invalid option for question" });
        return;
      }

      if (selectedOption.is_correct) {
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
