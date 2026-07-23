import express from "express";
import {
  createCoupon,
  getAllCoupons,
  updateCoupon,
  deleteCoupon,
  applyCoupon,
} from "../controllers/couponController.js";

import {
  isAuthenticated,
  isAdmin,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", isAuthenticated, isAdmin, createCoupon);
router.get("/", getAllCoupons);
router.put("/:id", isAuthenticated, isAdmin, updateCoupon);
router.delete("/:id", isAuthenticated, isAdmin, deleteCoupon);
router.post("/apply", applyCoupon);

export default router;