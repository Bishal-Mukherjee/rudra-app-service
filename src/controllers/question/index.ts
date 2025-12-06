import { Request, Response } from "express";
import { pool } from "@/config/db";
import { redisClient } from "@/config/redis";
import {
  LabelOption,
  OptionKey,
  QuestionRow,
  DataObject,
  FormattedQuestion,
} from "@/controllers/question/types";
import { speciesAgeGroups, confirmationOptions } from "@/constants/constants";
import { getStaticLookup } from "@/utils/static-lookup";

export const getAllQuestions = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const typeInUpperCase = req.params.type.toUpperCase();

    const allowedTypes = ["REPORTING", "SIGHTING"];

    if (!allowedTypes.includes(typeInUpperCase)) {
      res.status(400).json({ message: "Invalid question type" });
      return;
    }

    const questionType =
      typeInUpperCase.charAt(0) + typeInUpperCase.slice(1).toLowerCase();

    const cachedKey = `question_set:${req.params.type.toLowerCase()}`;
    const cachedData = await redisClient.get(cachedKey);

    if (cachedData) {
      const parsedData = JSON.parse(cachedData);
      res.status(200).json({
        message: `${questionType} questions fetched successfully`,
        result: { questions: parsedData, speciesAgeGroups },
      });
      return;
    }

    const [
      threatsData,
      fishingGearsData,
      channelTypesData,
      waterBodiesData,
      waterBodyConditionData,
      weatherConditionData,
      questionsQuery,
    ] = await Promise.all([
      getStaticLookup("disturbances"),
      getStaticLookup("fishing_gears"),
      getStaticLookup("channel_types"),
      getStaticLookup("water_bodies"),
      getStaticLookup("water_body_conditions"),
      getStaticLookup("weather_conditions"),
      pool.query(
        "SELECT index, topic, label_en, label_bn, option_key, type, is_optional FROM questions WHERE contexts @> $1::text[]",
        [[typeInUpperCase]],
      ),
    ]);

    const dataObj: DataObject = {
      threats: threatsData,
      fishing_gears: fishingGearsData,
      water_bodies: waterBodiesData,
      water_body_conditions: waterBodyConditionData,
      weather_conditions: weatherConditionData,
      yes_no: confirmationOptions,
      channel_types: channelTypesData,
    };

    const appendOptions = (
      optionKey: string | null,
      options: LabelOption[] | null,
    ): { optionKey: string; options: LabelOption[] } | undefined => {
      if (options && options.length > 0) {
        return { optionKey: optionKey!, options };
      }

      if (optionKey && !options) {
        return { optionKey, options: [] };
      }

      return undefined;
    };

    const questions: FormattedQuestion[] = (
      questionsQuery.rows as QuestionRow[]
    )
      .sort((a, b) => a.index - b.index)
      .map((question): FormattedQuestion => {
        const optionKey: OptionKey = question.option_key;
        const optionsObj = appendOptions(optionKey, dataObj[optionKey]);

        const baseQuestion: FormattedQuestion = {
          topic: question.topic,
          label: {
            en: question.label_en,
            bn: question.label_bn,
          },
          type: question.type,
          isOptional: question.is_optional,
        };

        if (optionsObj) {
          return {
            ...baseQuestion,
            ...optionsObj,
          };
        }

        return baseQuestion;
      });

    await redisClient.set(cachedKey, JSON.stringify(questions), {
      EX: 604800, // 7 days (60 * 60 * 24 * 7)
    });

    res.status(200).json({
      message: `${questionType} questions fetched successfully`,
      result: {
        questions,
        speciesAgeGroups,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
