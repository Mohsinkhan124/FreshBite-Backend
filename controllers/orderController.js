import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import Address from "../models/Address.js";
import mongoose from "mongoose";
import User from "../models/User.js";
import Coupon from "../models/Coupon.js";
import { sendEmail } from "../services/emailService.js";
import orderConfirmationEmail from "../templates/orderConfirmationEmail.js";
import ApiError from "../utils/ApiError.js";

// Create Order
export const createOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  let sessionEnded = false;

  try {
    const { addressId, paymentMethod, couponCode } = req.body;

    // Find Address
    const address = await Address.findById(addressId).session(session);

    if (!address) {
      throw new ApiError(404, "Address not found");
    }

    // Security Check
    if (address.user.toString() !== req.user.id) {
      throw new ApiError(403, "Unauthorized Access");
    }

    // Get Cart
    const cartItems = await Cart.find({
      user: req.user.id,
    })
      .populate("product")
      .session(session);

    if (cartItems.length === 0) {
      throw new ApiError(400, "Cart is empty");
    }

    let totalAmount = 0;
    let discount = 0;
    let finalAmount = totalAmount;
    let appliedCoupon = "";
    const orderItems = [];

    for (const item of cartItems) {
      const product = item.product;

      if (!product) {
        throw new ApiError(404, "Product not found");
      }

      if (product.stock < item.quantity) {
        throw new ApiError(400, `${product.name} is out of stock`);
      }

      totalAmount += product.price * item.quantity;

      orderItems.push({
        product: product._id,
        name: product.name,
        image: product.image,
        price: product.price,
        quantity: item.quantity,
      });

      product.stock -= item.quantity;
      await product.save({ session });
    }

    if (couponCode) {

      const coupon = await Coupon.findOne({
        code: couponCode.toUpperCase(),
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

      if (totalAmount >= coupon.minAmount) {
        discount =
          (totalAmount * coupon.discount) / 100;

        finalAmount = totalAmount - discount;

        appliedCoupon = coupon.code;
      } else {
        throw new ApiError(400, `Minimum order amount is ${coupon.minAmount}`);
      }

    } else {
      finalAmount = totalAmount;
    }

    const orderNumber = `FB-${Date.now()}`;

    const order = await Order.create(
      [
        {
          orderNumber,
          user: req.user.id,

          address: {
            fullName: address.fullName,
            phone: address.phone,
            street: address.street,
            city: address.city,
            state: address.state,
            postalCode: address.postalCode,
            country: address.country,
          },

          items: orderItems,

          totalAmount,
          discount,
          finalAmount,
          coupon: appliedCoupon,

          paymentMethod,
        },
      ],
      { session }
    );

    const user = await User.findById(req.user.id);

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    await Cart.deleteMany(
      {
        user: req.user.id,
      },
      { session }
    );

    await session.commitTransaction();

    if (!sessionEnded) {
      session.endSession();
      sessionEnded = true;
    }

    await sendEmail(
      user.email,
      "Order Confirmed 🎉",
      orderConfirmationEmail(order[0])
    );

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order: order[0],
    });

  } catch (error) {
    if (!sessionEnded && session.inTransaction()) {
      await session.abortTransaction();
    }

    if (!sessionEnded) {
      session.endSession();
      sessionEnded = true;
    }

    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(500, error.message || "Internal Server Error");
  }
};


// Get My Orders
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.user.id,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });

  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, error.message || "Internal Server Error");
  }
};


// Get Single Order
export const getSingleOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("items.product", "name image price category");

    if (!order) {
      throw new ApiError(404, "Order not found");
    }

    // Security Check
    if (order.user.toString() !== req.user.id) {
      throw new ApiError(403, "Unauthorized Access");
    }

    res.status(200).json({
      success: true,
      order,
    });

  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, error.message || "Internal Server Error");
  }
};


// Get All Orders (Admin)
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });

  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, error.message || "Internal Server Error");
  }
};


// Update Order Status (Admin)
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus } = req.body;

    const validStatus = [
      "Pending",
      "Preparing",
      "Out for Delivery",
      "Delivered",
      "Cancelled",
    ];

    // Invalid Status Check
    if (!validStatus.includes(orderStatus)) {
      throw new ApiError(400, "Invalid Order Status");
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      throw new ApiError(404, "Order not found");
    }

    // Delivered Order Protection
    if (order.orderStatus === "Delivered") {
      throw new ApiError(400, "Delivered order cannot be updated");
    }

    // Cancelled Order Protection
    if (order.orderStatus === "Cancelled") {
      throw new ApiError(400, "Cancelled order cannot be updated");
    }

    order.orderStatus = orderStatus;

    await order.save();

    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      order,
    });

  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, error.message || "Internal Server Error");
  }
};


// Cancel Order (Admin)
export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      throw new ApiError(404, "Order not found");
    }

    if (order.orderStatus === "Delivered") {
      throw new ApiError(400, "Delivered order cannot be cancelled");
    }

    if (order.orderStatus === "Cancelled") {
      throw new ApiError(400, "Order is already cancelled");
    }

    order.orderStatus = "Cancelled";

    await order.save();

    res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      order,
    });

  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, error.message || "Internal Server Error");
  }
};