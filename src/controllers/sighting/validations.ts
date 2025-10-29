import Joi from "joi";

export const postSightingSchema = Joi.object({
  latitude: Joi.number().invalid(0).required().messages({
    "number.base": "Latitude must be a number",
    "number.invalid": "Latitude must be a valid latitude",
    "any.required": "Latitude is a required field",
  }),
  longitude: Joi.number().invalid(0).required().messages({
    "number.base": "Longitude must be a number",
    "number.invalid": "Longitude must be a valid longitude",
    "any.required": "Longitude is a required field",
  }),
  observedAt: Joi.date().iso().required().messages({
    "date.base": "ObservedAt must be a valid date",
    "any.required": "ObservedAt is a required field",
  }),
  species: Joi.array()
    .items(Joi.object().unknown(true))
    .min(1)
    .required()
    .messages({
      "array.base": "Species must be an array",
      "array.min": "Species must contain at least 1 record",
      "any.required": "Species is a required field",
    }),
  waterBodyCondition: Joi.string().required().messages({
    "string.base": "Water body condition must be a string",
    "any.required": "Water body condition is a required field",
  }),
  weatherCondition: Joi.string().required().messages({
    "string.base": "Weather condition must be a string",
    "any.required": "Weather condition is a required field",
  }),
  waterBody: Joi.string().required().messages({
    "string.base": "Water body must be a string",
    "any.required": "Water body is a required field",
  }),
  threats: Joi.array().items(Joi.string()).required().messages({
    "array.base": "Threats must be an array",
    "any.required": "Threats is a required field",
  }),
  district: Joi.string().optional(),
  block: Joi.string().optional(),
  state: Joi.string().required().messages({
    "string.base": "State must be a string",
    "any.required": "State is a required field",
  }),
  villageOrGhat: Joi.string().optional(),
  fishingGears: Joi.array().items(Joi.string()).optional(),
  images: Joi.array().items(Joi.string()).optional(),
  notes: Joi.string().optional(),
});
