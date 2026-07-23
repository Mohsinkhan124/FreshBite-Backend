import Order from "../models/Order.js";
import asyncHandler from "../middleware/asyncHandler.js";
import User from "../models/User.js";

export const getMonthlySales = asyncHandler(async (req, res) => {

  const monthlySales = await Order.aggregate([
    {
      $group: {
        _id: { $month: "$createdAt" },
        revenue: { $sum: "$finalAmount" },
        orders: { $sum: 1 }
      }
    },
    {
      $sort: {
        "_id": 1
      }
    }
  ]);

  const months = [
    "",
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec"
  ];

  const data = monthlySales.map(item => ({
    month: months[item._id],
    revenue: item.revenue,
    orders: item.orders
  }));

  res.status(200).json({
    success: true,
    analytics: data
  });

});


export const getOrderStatusAnalytics = asyncHandler(async (req, res) => {

  const data = await Order.aggregate([
    {
      $group: {
        _id: "$orderStatus",
        total: { $sum: 1 }
      }
    }
  ]);

  res.status(200).json({
    success: true,
    analytics: data
  });

});

export const getTopSellingProducts = asyncHandler(async (req, res) => {

  const topProducts = await Order.aggregate([
    {
      $unwind: "$items"
    },
    {
      $group: {
        _id: "$items.product",
        name: { $first: "$items.name" },
        totalSold: { $sum: "$items.quantity" },
        revenue: {
          $sum: {
            $multiply: ["$items.quantity", "$items.price"]
          }
        }
      }
    },
    {
      $sort: {
        totalSold: -1
      }
    },
    {
      $limit: 5
    }
  ]);

  res.status(200).json({
    success: true,
    analytics: topProducts
  });

});


export const getLatestOrders = asyncHandler(async (req, res) => {

  const latestOrders = await Order.find()
    .populate("user", "name email")
    .sort({ createdAt: -1 })
    .limit(5);

  res.status(200).json({
    success: true,
    analytics: latestOrders,
  });

});

export const getLatestUsers = asyncHandler(async (req, res) => {

  const latestUsers = await User.find()
  .select("-password -resetPasswordToken -resetPasswordExpire")
  .sort({ createdAt: -1 })
  .limit(5);

  res.status(200).json({
    success: true,
    analytics: latestUsers,
  });

});