import Category from "../models/Category.js";
import cloudinary from "../services/cloudinary.js";
import streamifier from "streamifier";
import ApiError from "../utils/ApiError.js";

// Create Category
export const createCategory = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      throw new ApiError(400, "Category name is required");
    }

    const existingCategory = await Category.findOne({ name });

    if (existingCategory) {
      throw new ApiError(400, "Category already exists");
    }

    let image = "";

    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "FreshBite/Categories" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );

        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });

      image = result.secure_url;
    }

    const category = await Category.create({
      name,
      image,
    });

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      category,
    });

  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, error.message || "Internal Server Error");
  }
};

// Get All Categories
export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: categories.length,
      categories,
    });

  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, error.message || "Internal Server Error");
  }
};

// Get Single Category
export const getSingleCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      throw new ApiError(404, "Category not found");
    }

    res.status(200).json({
      success: true,
      category,
    });

  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, error.message || "Internal Server Error");
  }
};

// Update Category
export const updateCategory = async (req, res) => {
  try {
    const updateData = {
      name: req.body.name,
    };

    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "FreshBite/Categories" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );

        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });

      updateData.image = result.secure_url;
    }

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!category) {
      throw new ApiError(404, "Category not found");
    }

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      category,
    });

  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, error.message || "Internal Server Error");
  }
};

// Delete Category
export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);

    if (!category) {
      throw new ApiError(404, "Category not found");
    }

    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });

  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, error.message || "Internal Server Error");
  }
};