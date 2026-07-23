import Coupon from "../models/Coupon.js";
import ApiError from "../utils/ApiError.js";

// Create Coupon
export const createCoupon = async (req, res) => {
  try {
    const { code, discount, expiryDate, minAmount } = req.body;

    const existingCoupon = await Coupon.findOne({
      code: code.toUpperCase(),
    });

    if (existingCoupon) {
      throw new ApiError(400, "Coupon already exists");
    }

    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      discount,
      expiryDate,
      minAmount,
    });

    res.status(201).json({
      success: true,
      message: "Coupon created successfully",
      coupon,
    });

  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, error.message || "Internal Server Error");
  }
};

// Get All Coupons
export const getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: coupons.length,
      coupons,
    });

  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, error.message || "Internal Server Error");
  }
};

// Update Coupon
export const updateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      throw new ApiError(404, "Coupon not found");
    }

    const { code, discount, expiryDate, minAmount, isActive } = req.body;

    coupon.code = code?.toUpperCase() || coupon.code;
    coupon.discount = discount ?? coupon.discount;
    coupon.expiryDate = expiryDate || coupon.expiryDate;
    coupon.minAmount = minAmount ?? coupon.minAmount;

    if (typeof isActive === "boolean") {
      coupon.isActive = isActive;
    }

    await coupon.save();

    res.status(200).json({
      success: true,
      message: "Coupon updated successfully",
      coupon,
    });

  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, error.message || "Internal Server Error");
  }
};

// Delete Coupon
export const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      throw new ApiError(404, "Coupon not found");
    }

    await coupon.deleteOne();

    res.status(200).json({
      success: true,
      message: "Coupon deleted successfully",
    });

  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, error.message || "Internal Server Error");
  }
};

// Apply Coupon
export const applyCoupon = async (req, res) => {
  try {
    const { code, totalAmount } = req.body;

    if (!code || !totalAmount) {
      throw new ApiError(400, "Coupon code and total amount are required");
    }

    const coupon = await Coupon.findOne({
      code: code.toUpperCase(),
    });

    if (!coupon) {
      throw new ApiError(404, "Invalid coupon code");
    }

    if (!coupon.isActive) {
      throw new ApiError(400, "Coupon is inactive");
    }

    if (new Date() > coupon.expiryDate) {
      throw new ApiError(400, "Coupon has expired");
    }

    if (totalAmount < coupon.minAmount) {
      throw new ApiError(400, `Minimum order amount is ${coupon.minAmount}`);
    }

    const discountAmount =
      (totalAmount * coupon.discount) / 100;

    const finalAmount = totalAmount - discountAmount;

    res.status(200).json({
      success: true,
      message: "Coupon applied successfully",
      coupon: coupon.code,
      discount: coupon.discount,
      discountAmount,
      finalAmount,
    });

  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, error.message || "Internal Server Error");
  }
};