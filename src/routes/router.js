import { Router } from "express";
import categoriesRouter from "./CategoriesRoutes.js";
import customersRouter from "./CustomersRouter.js";
import gamesRouter from "./GamesRouter.js";
import rentalsRouter from "./RentalsRouter.js";

const router = Router();

router.use("/categories", categoriesRouter);
router.use("/games", gamesRouter);
router.use("/customers", customersRouter);
router.use("/rentals", rentalsRouter);

export default router;