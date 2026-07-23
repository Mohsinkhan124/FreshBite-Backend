import express from "express";
import {
  createOrder,
  deleteOrder,
  getAllOrders,
  getMyOrders,
  getSingleOrder,
  updateOrderStatus,
} from "../controllers/orderController.js";

import { isAuthenticated, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();
router.post("/", isAuthenticated, createOrder);
router.get("/my-orders", isAuthenticated, getMyOrders);
router.get("/:id", isAuthenticated, getSingleOrder);

// Admin
router.get("/", isAuthenticated, isAdmin, getAllOrders);
router.put("/:id/status", isAuthenticated, isAdmin, updateOrderStatus);
router.delete("/:id", isAuthenticated, isAdmin, deleteOrder);

export default router;