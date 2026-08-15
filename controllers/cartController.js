import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import ApiError from "../utils/ApiError.js";

// Add To Cart
export const addToCart = async (req, res) => {
  try {
    const { product, quantity = 1 } = req.body;

    const productData = await Product.findById(product);

    if (!productData) {
      throw new ApiError(404, "Product not found");
    }

    if (productData.stock < quantity) {
      throw new ApiError(400, "Not enough stock available");
    }

    let cart = await Cart.findOne({
      user: req.user.id,
      product,
    });

    if (cart) {
      cart.quantity += quantity;
      cart.subtotal = cart.quantity * cart.priceAtTime;

      await cart.save();

      await cart.populate({
        path: "product",
        populate: {
          path: "category",
          select: "name",
        },
      });

      return res.status(200).json({
        success: true,
        message: "Cart updated successfully",
        cart,
      });
    }

    cart = await Cart.create({
      user: req.user.id,
      product,
      quantity,
      priceAtTime: productData.price,
      subtotal: productData.price * quantity,
    });

    await cart.populate({
      path: "product",
      populate: {
        path: "category",
        select: "name",
      },
    });

    res.status(201).json({
      success: true,
      message: "Product added to cart",
      cart,
    });

  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, error.message || "Internal Server Error");
  }
};

// Get My Cart
export const getMyCart = async (req, res) => {
  try {
    const cartItems = await Cart.find({ user: req.user.id })
      .populate({
        path: "product",
        populate: {
          path: "category",
          select: "name",
        },
      });

    const grandTotal = cartItems.reduce((total, item) => {
      return total + item.priceAtTime * item.quantity;
    }, 0);

    res.status(200).json({
      success: true,
      count: cartItems.length,
      grandTotal,
      cartItems,
    });

  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, error.message || "Internal Server Error");
  }
};

// Update Cart
export const updateCart = async (req, res) => {
  try {
    const { quantity } = req.body;
    const cart = await Cart.findById(req.params.id);

    if (!cart) {
      throw new ApiError(404, "Cart item not found");
    }

    if (cart.user.toString() !== req.user.id) {
      throw new ApiError(403, "Unauthorized Access");
    }

    if (quantity < 1) {
      throw new ApiError(400, "Quantity must be at least 1");
    }

    cart.quantity = quantity;
    cart.subtotal = cart.priceAtTime * quantity;

    await cart.save();

    await cart.populate({
      path: "product",
      populate: {
        path: "category",
        select: "name",
      },
    });

    res.status(200).json({
      success: true,
      message: "Quantity updated successfully",
      cart,
    });

  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, error.message || "Internal Server Error");
  }
};

// Remove From Cart
export const removeFromCart = async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.id);

    if (!cart) {
      throw new ApiError(404, "Cart item not found");
    }

    if (cart.user.toString() !== req.user.id) {
      throw new ApiError(403, "Unauthorized Access");
    }

    await cart.deleteOne();

    res.status(200).json({
      success: true,
      message: "Item removed from cart",
    });

  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, error.message || "Internal Server Error");
  }
};