import Joi from "joi";

export const submitTierAssessmentSchema = Joi.object({
  answers: Joi.array()
    .items(
      Joi.object({
        question: Joi.string().uuid().required().messages({
          "string.guid": "question must be a valid UUID",
          "any.required": "question is a required field",
        }),
        option: Joi.string().uuid().required().messages({
          "string.guid": "option must be a valid UUID",
          "any.required": "option is a required field",
        }),
      }),
    )
    .min(1)
    .required()
    .messages({
      "array.base": "answers must be an array",
      "array.min": "answers must contain at least 1 item",
      "any.required": "answers is a required field",
    }),
});
