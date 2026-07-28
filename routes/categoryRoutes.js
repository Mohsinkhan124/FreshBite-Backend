import express from "express";
import {
  createCategory,
  getAllCategories,
  getSingleCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController.js";
import upload from "../middleware/uploadMiddleware.js";
import {isAuthenticated, isAdmin,} from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", isAuthenticated, isAdmin, upload.single("image"), createCategory);
router.get("/", getAllCategories);
router.get("/:id", getSingleCategory);
router.put("/:id", isAuthenticated, isAdmin, upload.single("image"), updateCategory);
router.delete("/:id", isAuthenticated, isAdmin, deleteCategory);

export default router;