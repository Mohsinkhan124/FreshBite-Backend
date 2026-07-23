import express from "express";
import {
    createProduct,
    getAllProducts,
    getSingleProduct,
    updateProduct,
    deleteProduct,
} from "../controllers/productController.js";

import {
    isAuthenticated,
    isAdmin,
} from "../middleware/authMiddleware.js";

import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.post("/", isAuthenticated, isAdmin, upload.single("image"), createProduct);
router.get("/", getAllProducts);
router.get("/:id", getSingleProduct);
router.put("/:id", isAuthenticated, isAdmin, upload.single("image"), updateProduct);
router.delete("/:id", isAuthenticated, isAdmin, deleteProduct);

export default router;