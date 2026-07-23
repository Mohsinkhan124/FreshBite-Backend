import express from "express";
import { isAuthenticated, isAdmin } from "../middleware/authMiddleware.js";
import { getDashboardStats } from "../controllers/dashboardController.js";

const router = express.Router();

router.get("/", isAuthenticated, isAdmin, getDashboardStats);

export default router;