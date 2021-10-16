import { Router } from "express";
import connection from "../database/Connection.js";
import { GameSchema } from "../schemas/GameSchema.js";

const gamesRouter = Router();

gamesRouter.post("/", async (req, res) => {
  const { name, image, stockTotal, categoryId, pricePerDay } = req.body;

  try {
    const { error } = GameSchema.validate({ name, image, stockTotal, pricePerDay });
    const categoryExists = await connection.query('SELECT * FROM categories WHERE id = $1', [categoryId]);
    const gameExists = await connection.query('SELECT * FROM games WHERE name = $1', [name]);

    if (!categoryExists.rows.length || error) {
      res.sendStatus(400);
    }
    else if (gameExists.rows.length) {
      res.sendStatus(409);
    }
    else {
      await connection.query('INSERT INTO games (name, image, "stockTotal", "categoryId", "pricePerDay") VALUES ($1, $2, $3, $4, $5)', [name, image, stockTotal, categoryId, pricePerDay])
      res.sendStatus(201);
    }
  } catch (err) {
    console.log(err.message)
  }
});

gamesRouter.get("/", async (req, res) => {
  const nameSearch = req.query.name;

  if (nameSearch) {
    try {
      const result = await connection.query(`
        SELECT 
          games.*,
          categories.name AS "categoryName"
        FROM games
          JOIN categories
            ON games."categoryId" = categories.id
          WHERE games.name iLIKE $1
        ;`, [nameSearch + "%"]);

      res.status(200).send(result.rows)
    } catch (err) {
      console.log(err.message);
    }
  } else {
    try {
      const result = await connection.query(`
        SELECT 
          games.*,
          categories.name AS "categoryName"
        FROM games
          JOIN categories
            ON games."categoryId" = categories.id
        ;`);

      res.status(200).send(result.rows)
    } catch (err) {
      console.log(err.message);
    }
  }
});

export default gamesRouter;