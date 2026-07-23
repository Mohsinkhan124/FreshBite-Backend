import express from "express";
import {
  addAddress,
  getMyAddresses,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from "../controllers/addressController.js";

import { isAuthenticated } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", isAuthenticated, addAddress);
router.get("/", isAuthenticated, getMyAddresses);
router.put("/:id", isAuthenticated, updateAddress);
router.delete("/:id", isAuthenticated, deleteAddress);
router.patch("/default/:id", isAuthenticated, setDefaultAddress);

export default router;