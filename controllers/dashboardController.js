import User from "../models/User.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import asyncHandler from "../middleware/asyncHandler.js";

export const getDashboardStats = asyncHandler(async (req, res) => {

  const [
    totalUsers,
    totalProducts,
    totalOrders,
    pendingOrders,
    lowStockProducts,
    revenueData,
  ] = await Promise.all([
    User.countDocuments(),
    Product.countDocuments(),
    Order.countDocuments(),
    Order.countDocuments({ orderStatus: "Pending" }),
    Product.countDocuments({ stock: { $lt: 10 } }),
    Order.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: {
            $sum: "$finalAmount",
          },
        },
      },
    ]),
  ]);

  const totalRevenue =
    revenueData.length > 0
      ? revenueData[0].totalRevenue
      : 0;

  res.status(200).json({
    success: true,
    stats: {
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue,
      pendingOrders,
      lowStockProducts,
    },
  });

});