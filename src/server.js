import express from "express";
import cors from "cors";
import pg from "pg";
import { CategorieSchema } from "./schemas/CategorieSchema.js";
import { GameSchema } from "./schemas/GameShema.js";
import { CustomerSchema } from "./schemas/CustomerSchema.js";

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

// COSTUMERS
app.get("/customers", async (req, res) => {
  const cpfSearch = req.query.cpf;

  if (cpfSearch) {
    try {
      const result = await connection.query(`SELECT * FROM customers WHERE cpf iLIKE $1;`, [cpfSearch + "%"]);
      result.rows = result.rows.map(user => ({
        ...user,
        birthday: new Date(user.birthday).toLocaleDateString('pt-Br')
      }
      ));
      res.status(200).send(result.rows)
    } catch (err) {
      console.log(err.message);
    }
  } else {
    try {
      const result = await connection.query(`SELECT * FROM customers;`);
      result.rows = result.rows.map(user => ({
        ...user,
        birthday: new Date(user.birthday).toLocaleDateString('pt-Br')
      }
      ));
      res.status(200).send(result.rows)
    } catch (err) {
      console.log(err.message);
    }
  }
});

app.get("/customers/:id", async (req, res) => {
  const id = req.params.id;
  const result = await connection.query('SELECT * FROM customers WHERE id = $1', [id]);
  if (result.rows.length === 0) {
    res.sendStatus(404);
  } else {
    result.rows = result.rows.map(e => ({
      ...e,
      birthday: new Date(e.birthday).toLocaleDateString('pt-Br')
    }));
    res.status(200).send(result.rows[0]);
  }
});

app.post("/customers", async (req, res) => {
  const { name, phone, cpf, birthday } = req.body;
  const custumerExists = await connection.query('SELECT * FROM customers WHERE cpf = $1;', [cpf])
  try {
    const { error } = CustomerSchema.validate({ name, phone, cpf, birthday });

    if (error) {
      console.log(error)
      res.sendStatus(400)
    }
    else if (custumerExists.rows.length > 0) {
      res.sendStatus(409)
    }
    else {
      await connection.query('INSERT INTO customers (name, phone, cpf, birthday) VALUES ($1, $2, $3, $4);', [name, phone, cpf, birthday]);
      res.sendStatus(201)
    }
  } catch (err) {
    console.log(err.message)
  }
});

app.put("/customers/:id", async (req, res) => {
  const id = req.params.id
  const { name, phone, cpf, birthday } = req.body;
  /* const custumerExists = await connection.query('SELECT * FROM customers WHERE cpf = $1;', [cpf]) */

  try {
    const { error } = CustomerSchema.validate({ name, phone, cpf, birthday });

    if (error) {
      console.log(error)
      res.sendStatus(400)
    }
    /*   else if (custumerExists.rows.length > 0) {
        res.sendStatus(409)
      } */
    else {
      await connection.query('UPDATE customers SET name = $1, phone = $2, cpf = $3, birthday = $4 WHERE id = $5;', [name, phone, cpf, birthday, id]);
      res.sendStatus(200)
    }
  } catch (err) {
    console.log(err.message)
  }
})

/* app.delete("/categories", (req, res) => {
  connection.query("DELETE FROM categories WHERE id = 20;").then(result => res.send("apagou"))
}) */

/* app.delete("/customers", (req, res) => {
  connection.query("DELETE FROM customers WHERE id = 2;").then(result => res.send("apagou"))
}) */

/* app.delete("/games", (req, res) => {
  connection.query("DELETE FROM games WHERE id =2;").then(res.send("apagou game"));
}); */

app.listen(4000, () => {
  console.clear();
  console.log("Server is running on port 4000");
})