import Wishlist from "../models/Wishlist.js";
import Product from "../models/Product.js";
import ApiError from "../utils/ApiError.js";

// Add To Wishlist
export const addToWishlist = async (req, res) => {
  try {
    const { product } = req.body;

    const productExists = await Product.findById(product);

    if (!productExists) {
      throw new ApiError(404, "Product not found");
    }

    const alreadyExists = await Wishlist.findOne({
      user: req.user.id,
      product,
    });

    if (alreadyExists) {
      throw new ApiError(400, "Product already in wishlist");
    }

    const wishlist = await Wishlist.create({
      user: req.user.id,
      product,
    });

    res.status(201).json({
      success: true,
      message: "Product added to wishlist",
      wishlist,
    });

  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, error.message || "Internal Server Error");
  }
};

// Get My Wishlist
export const getMyWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.find({
      user: req.user.id,
    }).populate({
      path: "product",
      populate: {
        path: "category",
        select: "name",
      },
    });

    res.status(200).json({
      success: true,
      count: wishlist.length,
      wishlist,
    });

  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, error.message || "Internal Server Error");
  }
};

// Remove From Wishlist
export const removeFromWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findById(req.params.id);

    if (!wishlist) {
      throw new ApiError(404, "Wishlist item not found");
    }

    if (wishlist.user.toString() !== req.user.id) {
      throw new ApiError(403, "Unauthorized Access");
    }

    await wishlist.deleteOne();

    res.status(200).json({
      success: true,
      message: "Product removed from wishlist",
    });

  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, error.message || "Internal Server Error");
  }
};