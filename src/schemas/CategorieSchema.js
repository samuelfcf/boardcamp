import Joi from "joi";

const CategorieSchema = Joi.object({
  name: Joi.string().required(),
  id: Joi.any().forbidden()
});

export { CategorieSchema };