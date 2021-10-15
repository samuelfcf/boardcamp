import express from "express";
import cors from "cors";
import pg from "pg";
import { CategorieSchema } from "./schemas/CategorieSchema.js";
import { GameSchema } from "./schemas/GameShema.js";
import { capitalizeFirstLetter } from "./utils/auxFunctions.js";

const { Pool } = pg;

const connection = new Pool({
  user: 'bootcamp_role',
  password: 'senha_super_hiper_ultra_secreta_do_role_do_bootcamp',
  host: 'localhost',
  port: 5432,
  database: 'boardcamp'
})

const app = express();
app.use(cors());
app.use(express.json());

// CATEGORIES
app.get("/categories", async (req, res) => {
  try {
    const result = await connection.query('SELECT * FROM categories;');
    res.status(200).send(result.rows)
  } catch (err) {
    console.log(err.message)
  }
});

app.post("/categories", async (req, res) => {
  const { name } = req.body;
  const { error } = CategorieSchema.validate({ name });

  if (error) {
    res.status(400).send("Nome não pode estar vazio")
    return;
  }

  try {
    const categorieExists = await connection.query('SELECT * FROM categories WHERE name = $1;', [name]);

    if (categorieExists.rows.length) {
      res.status(409).send("Esse já existe ai ein meu");
    } else {
      await connection.query('INSERT INTO categories (name) VALUES ($1);', [name]);
      res.status(201).send("cadastrou");

    }
  } catch (err) {
    console.log(err.message);
  }
});

//GAMES
app.get("/games", async (req, res) => {
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

app.post("/games", async (req, res) => {
  const { name, image, stockTotal, categoryId, pricePerDay } = req.body;

  try {
    const { error } = GameSchema.validate({ name, image, stockTotal, pricePerDay });
    const categoryExists = await connection.query('SELECT * FROM categories WHERE id = $1', [categoryId]);
    const gameExists = await connection.query('SELECT * FROM games WHERE name = $1', [name]);

    if (!categoryExists.rows.length || error) {
      res.status(400).send("Algo de errado não está certo")
    } else if (gameExists.rows.length) {
      res.status(409).send("Esse game já existe")
    } else {
      await connection.query('INSERT INTO GAMES (name, image, "stockTotal", "categoryId", "pricePerDay") VALUES ($1, $2, $3, $4, $5)', [name, image, stockTotal, categoryId, pricePerDay])
      res.status(201).send("Jogo cadastrado com sucesso");
    }
  } catch (err) {
    console.log(err.message)
  }
});

/* app.delete("/categories", (req, res) => {
  connection.query("DELETE FROM categories WHERE id = 17;").then(result => res.send("apagou"))
}) */

/* app.delete("/games", (req, res) => {
  connection.query("DELETE FROM games WHERE id =2;").then(res.send("apagou game"));
}); */

app.listen(4000, () => {
  console.clear();
  console.log("Server is running on port 4000");
})