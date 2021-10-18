import Joi from "joi";

const GameSchema = Joi.object({
  name: Joi.string().empty().required(),
  image: Joi.string().pattern(/(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|gif|png)/).required(),
  stockTotal: Joi.number().integer().min(1).required(),
  categoryId: Joi.number().integer().min(1).required(),
  pricePerDay: Joi.number().integer().min(1).required(),
  id: Joi.any().forbidden()
});

export { GameSchema };