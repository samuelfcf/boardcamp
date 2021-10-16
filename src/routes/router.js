import { Router } from "express";
import categoriesRouter from "./CategoriesRoutes.js";
import customersRouter from "./CustomersRouter.js";
import gamesRouter from "./GamesRouter.js";

const router = Router();

router.use("/categories", categoriesRouter);
router.use("/games", gamesRouter);
router.use("/customers", customersRouter);

export default router;