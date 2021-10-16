import Joi from "joi";

const CategorieSchema = Joi.object({
  name: Joi.string().empty().required(),
  id: Joi.any().forbidden()
});

export { CategorieSchema };