import Order from "../models/Order.js";
import ApiError from "../utils/ApiError.js";

// Make Payment
export const makePayment = async (req, res) => {
  try {
    const { orderId, paymentMethod } = req.body;

    if (!orderId || !paymentMethod) {
      throw new ApiError(400, "orderId and paymentMethod are required");
    }

    // Payment Method Validation
    const validMethods = ["COD", "CARD", "JAZZCASH", "EASYPAISA"];

    if (!validMethods.includes(paymentMethod)) {
      throw new ApiError(400, "Invalid payment method");
    }

    const order = await Order.findById(orderId);

    if (!order) {
      throw new ApiError(404, "Order not found");
    }

    // Security Check
    if (order.user.toString() !== req.user.id) {
      throw new ApiError(403, "Unauthorized Access");
    }

    // Cancelled Order
    if (order.orderStatus === "Cancelled") {
      throw new ApiError(400, "Cancelled orders cannot be paid");
    }

    // Already Paid
    if (order.paymentStatus === "Paid") {
      throw new ApiError(400, "This order has already been paid");
    }

    // Fake Payment Success
    order.paymentStatus = "Paid";
    order.paymentMethod = paymentMethod;
    order.transactionId = `TXN-${Date.now()}`;
    order.paidAt = new Date();

    await order.save();

    res.status(200).json({
      success: true,
      message: "Payment completed successfully",
      payment: {
        orderId: order._id,
        amount: order.totalAmount,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        transactionId: order.transactionId,
        paidAt: order.paidAt,
      },
    });

  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, error.message || "Internal Server Error");
  }
};

// Fail Payment
export const failPayment = async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      throw new ApiError(400, "orderId is required");
    }

    const order = await Order.findById(orderId);

    if (!order) {
      throw new ApiError(404, "Order not found");
    }

    // Security Check
    if (order.user.toString() !== req.user.id) {
      throw new ApiError(403, "Unauthorized Access");
    }

    // Already Paid
    if (order.paymentStatus === "Paid") {
      throw new ApiError(400, "Paid orders cannot be marked as failed");
    }

    order.paymentStatus = "Failed";

    await order.save();

    res.status(200).json({
      success: true,
      message: "Payment marked as failed",
      payment: {
        orderId: order._id,
        paymentStatus: order.paymentStatus,
      },
    });

  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, error.message || "Internal Server Error");
  }
};

// Get Payment Status
export const getPaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);

    if (!order) {
      throw new ApiError(404, "Order not found");
    }

    // Security Check
    if (order.user.toString() !== req.user.id) {
      throw new ApiError(403, "Unauthorized Access");
    }

    res.status(200).json({
      success: true,
      payment: {
        orderId: order._id,
        amount: order.totalAmount,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        transactionId: order.transactionId,
        paidAt: order.paidAt,
      },
    });

  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, error.message || "Internal Server Error");
  }
};