import express from "express";
import { isAuthenticated, isAdmin } from "../middleware/authMiddleware.js";
import { getLatestUsers, getMonthlySales, getOrderStatusAnalytics, getTopSellingProducts  } from "../controllers/analyticsController.js";
import { getLatestOrders } from "../controllers/analyticsController.js";


const router = express.Router();

router.get("/monthly-sales", isAuthenticated, isAdmin, getMonthlySales);
router.get("/order-status", isAuthenticated, isAdmin, getOrderStatusAnalytics);
router.get("/top-products", isAuthenticated, isAdmin, getTopSellingProducts);
router.get("/latest-orders", isAuthenticated, isAdmin, getLatestOrders);
router.get("/latest-users", isAuthenticated, isAdmin, getLatestUsers);

export default router;