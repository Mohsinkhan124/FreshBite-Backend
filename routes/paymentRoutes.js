import express from "express";
import {
  makePayment,
  failPayment,
  getPaymentStatus,
} from "../controllers/paymentController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Fake Payment Success
router.post("/pay", protect, makePayment);
// Fake Payment Failed
router.post("/fail", protect, failPayment);
// Get Payment Status
router.get("/status/:orderId", protect, getPaymentStatus);

export default router;