import express from "express";
import {
  addToCart,
  getMyCart,
  updateCart,
  removeFromCart,
} from "../controllers/cartController.js";

import { isAuthenticated } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", isAuthenticated, addToCart);
router.get("/", isAuthenticated, getMyCart);
router.put("/:id", isAuthenticated, updateCart);
router.delete("/:id", isAuthenticated, removeFromCart);

export default router;