import express from "express";
import {
  addToWishlist,
  getMyWishlist,
  removeFromWishlist,
} from "../controllers/wishlistController.js";

import { isAuthenticated } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", isAuthenticated, addToWishlist);
router.get("/", isAuthenticated, getMyWishlist);
router.delete("/:id", isAuthenticated, removeFromWishlist);

export default router;