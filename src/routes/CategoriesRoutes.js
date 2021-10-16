import { Router } from "express";
import connection from "../database/Connection.js";
import { CategorieSchema } from "../schemas/CategorieSchema.js";

const categoriesRouter = Router();

categoriesRouter.post("/", async (req, res) => {
  const { name } = req.body;
  const { error } = CategorieSchema.validate({ name });

  if (error) {
    res.sendStatus(400);
    return;
  }

  try {
    const categorieExists = await connection.query('SELECT * FROM categories WHERE name = $1;', [name]);

    if (categorieExists.rows.length) {
      res.sendStatus(409);
    } else {
      await connection.query('INSERT INTO categories (name) VALUES ($1);', [name]);
      res.sendStatus(201);

    }
  } catch (err) {
    console.log(err.message);
  }
});

categoriesRouter.get("/", async (req, res) => {
  try {
    const result = await connection.query('SELECT * FROM categories;');
    res.status(200).send(result.rows)
  } catch (err) {
    console.log(err.message)
  }
});

export default categoriesRouter;