import express from "express";
import cors from "cors";
import pg from "pg";

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

app.get("/categories", (req, res) => {
  connection.query("SELECT * FROM categories;")
    .then(result => {
      res.send(result.rows)
    });
})

app.listen(4000, () => {
  console.clear();
  console.log("Server is running on port 4000");
})