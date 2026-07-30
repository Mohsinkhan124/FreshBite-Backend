import express from "express";
import { forgotPassword, getProfile, loginUser, registerUser, resetPassword, updateProfile } from "../controllers/authController.js";
import { isAdmin, isAuthenticated } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", isAuthenticated, getProfile);
router.put("/profile", isAuthenticated, updateProfile);
router.get("/admin", isAuthenticated, isAdmin, (req, res) => {
  res.json({
    success: true,
    message: "Welcome Admin",
  });
});
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

export default router;