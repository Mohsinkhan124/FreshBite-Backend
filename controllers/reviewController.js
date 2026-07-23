import Review from "../models/Review.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import ApiError from "../utils/ApiError.js";

const updateProductRating = async (productId) => {
  const reviews = await Review.find({ product: productId });

  const totalReviews = reviews.length;

  let averageRating = 0;

  if (totalReviews > 0) {
    const totalRating = reviews.reduce(
      (sum, review) => sum + review.rating,
      0
    );

    averageRating = totalRating / totalReviews;
  }

  await Product.findByIdAndUpdate(productId, {
    averageRating: Number(averageRating.toFixed(1)),
    totalReviews,
  });
};

// Create Review
export const createReview = async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;

    // Required Fields
    if (!productId || !rating || !comment) {
      throw new ApiError(400, "Please fill all required fields");
    }

    // Product Exists
    const product = await Product.findById(productId);

    if (!product) {
      throw new ApiError(404, "Product not found");
    }

    // Rating Validation
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      throw new ApiError(400, "Rating must be an integer between 1 and 5");
    }

    // Duplicate Review Check
    const alreadyReviewed = await Review.findOne({
      user: req.user.id,
      product: productId,
    });

    if (alreadyReviewed) {
      throw new ApiError(400, "You have already reviewed this product");
    }

    // Verified Purchase Check
    const purchased = await Order.findOne({
      user: req.user.id,
      orderStatus: "Delivered",
      "items.product": productId,
    });

    if (!purchased) {
      throw new ApiError(400, "You can review only purchased products");
    }

    // Create Review
    const review = await Review.create({
      user: req.user.id,
      product: productId,
      rating,
      comment: comment.trim(),
    });

    await updateProductRating(productId);

    res.status(201).json({
      success: true,
      message: "Review added successfully",
      review,
    });

  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, error.message || "Internal Server Error");
  }
};

// Get Product Reviews
export const getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({
      product: req.params.productId,
    })
      .populate("user", "name avatar")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
    });

  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, error.message || "Internal Server Error");
  }
};

// Update Review
export const updateReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      throw new ApiError(404, "Review not found");
    }

    if (review.user.toString() !== req.user.id) {
      throw new ApiError(403, "Unauthorized Access");
    }

    const { rating, comment } = req.body;

    if (rating !== undefined) {
      if (rating < 1 || rating > 5) {
        throw new ApiError(400, "Rating must be between 1 and 5");
      }

      review.rating = rating;
    }

    if (comment) {
      review.comment = comment.trim();
    }

    await review.save();

    await updateProductRating(review.product);

    res.status(200).json({
      success: true,
      message: "Review updated successfully",
      review,
    });

  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, error.message || "Internal Server Error");
  }
};

// Delete Review
export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      throw new ApiError(404, "Review not found");
    }

    if (review.user.toString() !== req.user.id) {
      throw new ApiError(403, "Unauthorized Access");
    }

    const productId = review.product;

    await review.deleteOne();

    await updateProductRating(productId);

    res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });

  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, error.message || "Internal Server Error");
  }
};