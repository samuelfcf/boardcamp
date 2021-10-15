import express from "express";
import cors from "cors";
import pg from "pg";
import { CategorieSchema } from "./schemas/CategorieSchema.js";

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
app.get("/categories", (req, res) => {
  connection.query("SELECT * FROM categories;")
    .then(result => {
      res.send(result.rows)
    });
});

app.post("/categories", async (req, res) => {
  const { name } = req.body;
  const { error } = CategorieSchema.validate({ name });

  if (error) {
    res.status(400).send("Nome não pode estar vazio")
    return;
  }

  try {
    const categorieExists = await connection.query("SELECT * FROM categories WHERE name = $1;", [name])

    if (categorieExists.rows.length > 0) {
      res.status(409).send("Esse já existe ai ein meu")
    } else {
      await connection.query("INSERT INTO categories (name) VALUES ($1);", [name]);
      res.status(201).send("cadastrou")
    }
  } catch (err) {
    console.log(err.message);
  }
})

/* app.delete("/categories", (req, res) => {
  connection.query("DELETE FROM categories WHERE id = 14;").then(result => res.send("apagou"))
}) */

app.listen(4000, () => {
  console.clear();
  console.log("Server is running on port 4000");
})