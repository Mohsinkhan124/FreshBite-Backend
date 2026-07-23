import express from "express";
import {
  createReview,
  getProductReviews,
  updateReview,
  deleteReview,
} from "../controllers/reviewController.js";

import { isAuthenticated } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", isAuthenticated, createReview);
router.get("/:productId", getProductReviews);
router.put("/:id", isAuthenticated, updateReview);
router.delete("/:id", isAuthenticated, deleteReview);

export default router;