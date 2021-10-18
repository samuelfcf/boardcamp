import Joi from "joi";

const RentalSchema = Joi.object({
  customerId: Joi.number().integer().min(1).required(),
  gameId: Joi.number().integer().min(1).required(),
  daysRented: Joi.number().integer().positive().greater(0).required(),
  id: Joi.any().forbidden()
});

export { RentalSchema }
