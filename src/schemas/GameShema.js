import Joi from "joi";

const GameSchema = Joi.object({
  name: Joi.string().required(),
  stockTotal: Joi.number().positive().greater(0).required(),
  pricePerDay: Joi.number().positive().greater(0).required(),
  image: Joi.string().pattern(/(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|gif|png)/),
  id: Joi.any().forbidden()
});

export { GameSchema };