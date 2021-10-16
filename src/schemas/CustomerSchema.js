import Joi from "joi";

const CustomerSchema = Joi.object({
  name: Joi.string().empty().required(),
  phone: Joi.string().min(10).max(11).pattern(/^[0-9]+$/).required(),
  cpf: Joi.string().length(11).empty().pattern(/^[0-9]+$/).required(),
  birthday: Joi.date().iso().required(),
  id: Joi.any().forbidden()
});

export { CustomerSchema }