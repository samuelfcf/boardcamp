import { Router } from "express";
import connection from "../database/Connection.js";
import { CustomerSchema } from "../schemas/CustomerSchema.js";

const customersRouter = Router();

customersRouter.post("/", async (req, res) => {
  const { name, phone, cpf, birthday } = req.body;
  const custumerExists = await connection.query('SELECT * FROM customers WHERE cpf = $1;', [cpf])
  try {
    const { error } = CustomerSchema.validate({ name, phone, cpf, birthday });

    if (error) {
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

customersRouter.get("/", async (req, res) => {
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

customersRouter.get("/:id", async (req, res) => {
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

customersRouter.put("/:id", async (req, res) => {
  const id = req.params.id
  const { name, phone, cpf, birthday } = req.body;
  const custumerExists = await connection.query('SELECT * FROM customers WHERE cpf = $1 AND id <> $2;', [cpf, id])

  try {
    const { error } = CustomerSchema.validate({ name, phone, cpf, birthday });

    if (error) {
      res.sendStatus(400)
    }
    else if (custumerExists.rows.length > 0) {
      res.sendStatus(409)
    }
    else {
      await connection.query('UPDATE customers SET name = $1, phone = $2, cpf = $3, birthday = $4 WHERE id = $5;', [name, phone, cpf, birthday, id]);
      res.sendStatus(200)
    }
  } catch (err) {
    console.log(err.message)
  }
});

export default customersRouter;