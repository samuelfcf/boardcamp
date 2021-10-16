import Joi from "joi";

const GameSchema = Joi.object({
  name: Joi.string().empty().required(),
  image: Joi.string().pattern(/(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|gif|png)/).required(),
  stockTotal: Joi.number().positive().greater(0).required(),
  categoryId: Joi.number().positive().required(),
  pricePerDay: Joi.number().positive().greater(0).required(),
  id: Joi.any().forbidden()
});

export { GameSchema };