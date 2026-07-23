import Notification from "../models/notificationModel.js";
import asyncHandler from "../middleware/asyncHandler.js";
import ApiError from "../utils/apiError.js";

// Get Notifications
export const getNotifications = asyncHandler(async (req, res) => {

  const notifications = await Notification.find({
    user: req.user.id,
  }).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    notifications,
  });

});

// Mark Single Notification as Read
export const markAsRead = asyncHandler(async (req, res) => {

  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    throw new ApiError(404, "Notification not found");
  }

  if (notification.user.toString() !== req.user.id) {
    throw new ApiError(403, "Unauthorized Access");
  }

  notification.isRead = true;

  await notification.save();

  res.status(200).json({
    success: true,
    message: "Notification marked as read",
    notification,
  });

});

// Mark All Notifications as Read
export const markAllAsRead = asyncHandler(async (req, res) => {

  await Notification.updateMany(
    { user: req.user.id },
    { isRead: true }
  );

  res.status(200).json({
    success: true,
    message: "All notifications marked as read",
  });

});

// Delete Notification
export const deleteNotification = asyncHandler(async (req, res) => {

  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    throw new ApiError(404, "Notification not found");
  }

  if (notification.user.toString() !== req.user.id) {
    throw new ApiError(403, "Unauthorized Access");
  }

  await notification.deleteOne();

  res.status(200).json({
    success: true,
    message: "Notification deleted successfully",
  });

});