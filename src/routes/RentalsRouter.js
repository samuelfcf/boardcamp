import { Router } from "express";
import connection from "../database/Connection.js";
import { RentalSchema } from "../schemas/RentalSchema.js";

const rentalsRouter = Router();

rentalsRouter.post("/", async (req, res) => {
  try {
    const { customerId, gameId, daysRented } = req.body;
    const { error } = RentalSchema.validate({ customerId, gameId, daysRented });

    const gameExists = await connection.query(`SELECT * FROM games WHERE id = $1`, [gameId]);
    const customerExists = await connection.query(`SELECT * FROM customers WHERE id = $1`, [customerId]);
    const gamesRented = await connection.query(`
      SELECT 
        rentals.*,
        games."stockTotal"
      FROM rentals
        JOIN games
        ON rentals."gameId" = games.id
      WHERE "gameId" = $1 AND rentals."returnDate" IS null;
    `, [gameId]);

    const qtyRentalsOfThisGame = gamesRented.rows.length;
    const totalStockOfThisGame = gameExists.rows[0].stockTotal;
    const pricePerDayOfThisGame = gameExists.rows[0].pricePerDay;

    if (error || gameExists.rows.length === 0 || customerExists.rows.length === 0 || (qtyRentalsOfThisGame === totalStockOfThisGame)) {
      res.sendStatus(400);
    } else {
      const rentDate = new Date();
      const returnDate = null;
      const originalPrice = (daysRented * pricePerDayOfThisGame);
      const delayFee = null;

      await connection.query(`
        INSERT INTO 
          rentals ("customerId", "gameId", "rentDate", "daysRented", "returnDate", "originalPrice", "delayFee") 
        VALUES ($1, $2, $3, $4, $5, $6, $7);`, [customerId, gameId, rentDate, daysRented, returnDate, originalPrice, delayFee]);

      res.sendStatus(201);
    }
  } catch (err) {
    console.log(err.menssage);
  }
});

rentalsRouter.post("/:id/return", async (req, res) => {
  try {
    const id = req.params.id;

    const result = await connection.query(`
      SELECT 
        rentals.*,
        games."pricePerDay"
      FROM rentals
        JOIN games
          ON rentals."gameId" = games.id 
      WHERE rentals.id = $1`, [id]);

    const rentExists = result.rows[0];

    if (!rentExists) {
      res.sendStatus(404);
    }
    if (rentExists.returnDate !== null) {
      res.sendStatus(400);
    }

    const rentDate = rentExists.rentDate;
    const returnDate = new Date();
    const pricePerDayOfThisGame = rentExists.pricePerDay;
    const rentedDaysOfThisGame = rentExists.daysRented;
    let delayFee = null;

    if (returnDate.toDateString() < rentDate.toDateString()) {
      const delayDays = returnDate.getDate() - rentDate.getDate();

      if (delayDays > rentedDaysOfThisGame) {
        delayFee = delayDays * pricePerDayOfThisGame;
      }
    }

    await connection.query('UPDATE rentals SET "returnDate" = $1, "delayFee" = $2 WHERE id = $3;', [returnDate, delayFee, id]);
    res.sendStatus(200);
  } catch (err) {
    console.log(err.menssage);
  }
});

rentalsRouter.get("/", async (req, res) => {
  try {
    const customerIdSearch = req.query.customerId;
    const gameIdSearch = req.query.gameId;

    if (customerIdSearch && gameIdSearch) {
      const result = await connection.query(`
        SELECT 
          rentals.*,
          customers.name AS "customerName",
          games.name AS "gameName",
          games."categoryId",
          categories.name AS "categoryName"
        FROM rentals
          JOIN customers
            ON rentals."customerId" = customers.id
          JOIN games
            ON rentals."gameId" = games.id
          JOIN categories
            ON games."categoryId" = categories.id
        WHERE rentals."customerId" = $1 AND rentals."gameId" = $2
    ;`, [customerIdSearch, gameIdSearch]);
      const rents = result.rows;

      const response = rents.map(rent => ({
        ...rent,
        customer: {
          id: rent.customerId,
          name: rent.customerName
        },
        game: {
          id: rent.gameId,
          name: rent.gameName,
          categoryId: rent.categoryId,
          categoryName: rent.categoryName
        }
      }))

      response.forEach(rent => {
        delete rent.customerName,
          delete rent.gameName,
          delete rent.categoryId,
          delete rent.categoryName;
      });
      res.status(200).send(response)
    } else if (customerIdSearch && !gameIdSearch) {
      const result = await connection.query(`
        SELECT 
          rentals.*,
          customers.name AS "customerName",
          games.name AS "gameName",
          games."categoryId",
          categories.name AS "categoryName"
        FROM rentals
          JOIN customers
            ON rentals."customerId" = customers.id
          JOIN games
            ON rentals."gameId" = games.id
          JOIN categories
            ON games."categoryId" = categories.id
        WHERE rentals."customerId" = $1
    ;`, [customerIdSearch]);
      const rents = result.rows;

      const response = rents.map(rent => ({
        ...rent,
        customer: {
          id: rent.customerId,
          name: rent.customerName
        },
        game: {
          id: rent.gameId,
          name: rent.gameName,
          categoryId: rent.categoryId,
          categoryName: rent.categoryName
        }
      }))

      response.forEach(rent => {
        delete rent.customerName,
          delete rent.gameName,
          delete rent.categoryId,
          delete rent.categoryName;
      });
      res.status(200).send(response)
    } else if (!customerIdSearch && gameIdSearch) {
      const result = await connection.query(`
        SELECT 
          rentals.*,
          customers.name AS "customerName",
          games.name AS "gameName",
          games."categoryId",
          categories.name AS "categoryName"
        FROM rentals
          JOIN customers
            ON rentals."customerId" = customers.id
          JOIN games
            ON rentals."gameId" = games.id
          JOIN categories
            ON games."categoryId" = categories.id
        WHERE rentals."gameId" = $1
    ;`, [gameIdSearch]);
      const rents = result.rows;

      const response = rents.map(rent => ({
        ...rent,
        customer: {
          id: rent.customerId,
          name: rent.customerName
        },
        game: {
          id: rent.gameId,
          name: rent.gameName,
          categoryId: rent.categoryId,
          categoryName: rent.categoryName
        }
      }))

      response.forEach(rent => {
        delete rent.customerName,
          delete rent.gameName,
          delete rent.categoryId,
          delete rent.categoryName;
      });
      res.status(200).send(response)
    } else {
      const result = await connection.query(`
          SELECT 
            rentals.*,
            customers.name AS "customerName",
            games.name AS "gameName",
            games."categoryId",
            categories.name AS "categoryName"
          FROM rentals
            JOIN customers
              ON rentals."customerId" = customers.id
            JOIN games
              ON rentals."gameId" = games.id
            JOIN categories
              ON games."categoryId" = categories.id
        ;`);

      const rents = result.rows;

      const response = rents.map(rent => ({
        ...rent,
        customer: {
          id: rent.customerId,
          name: rent.customerName
        },
        game: {
          id: rent.gameId,
          name: rent.gameName,
          categoryId: rent.categoryId,
          categoryName: rent.categoryName
        }
      }))

      response.forEach(rent => {
        delete rent.customerName,
          delete rent.gameName,
          delete rent.categoryId,
          delete rent.categoryName;
      });

      res.status(200).send(response)
    }
  } catch (err) {
    console.log(err.menssage);
  }
});

rentalsRouter.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const rentExists = await connection.query('SELECT * FROM rentals WHERE id = $1;', [id]);
    console.log(rentExists.rows);
    if (rentExists.rows.length === 0) {
      res.sendStatus(404);
    }
    if (rentExists.rows[0].returnDate !== null) {
      res.sendStatus(400);
    }
    else {
      await connection.query('DELETE FROM rentals WHERE id = $1;', [id]);
      res.sendStatus(200);
    }
  } catch (err) {
    console.log(err.menssage);
  }
})

export default rentalsRouter;