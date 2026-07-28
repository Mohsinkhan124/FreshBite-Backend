import Product from "../models/Product.js";
import Category from "../models/Category.js";
import cloudinary from "../services/cloudinary.js";
import streamifier from "streamifier";
import ApiError from "../utils/ApiError.js";

// Create Product
export const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      stock,
      unit,
      featured,
    } = req.body;

    if (!name || !description || !price || !category) {
      throw new ApiError(400, "All required fields are mandatory");
    }

    const categoryExists = await Category.findById(category);

    if (!categoryExists) {
      throw new ApiError(404, "Category not found");
    }

    let image = "";

    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "FreshBite/Products" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );

        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });

      image = result.secure_url;
    }

    const product = await Product.create({
      name,
      description,
      price,
      category,
      stock,
      unit,
      featured,
      image,
    });

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });

  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, error.message || "Internal Server Error");
  }
};

// Get All Products
export const getAllProducts = async (req, res) => {
  try {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      featured,
      sort,
      page = 1,
      limit = 10,
    } = req.query;

    const filter = {};

    // Search
    if (search) {
      filter.name = {
        $regex: search,
        $options: "i",
      };
    }

    // Category Filter
    if (category) {
      filter.category = category;
    }

    // Price Filter
    if (minPrice || maxPrice) {
      filter.price = {};

      if (minPrice) {
        filter.price.$gte = Number(minPrice);
      }

      if (maxPrice) {
        filter.price.$lte = Number(maxPrice);
      }

      // Validation
      if (
        minPrice &&
        maxPrice &&
        Number(minPrice) > Number(maxPrice)
      ) {
        throw new ApiError(400, "minPrice cannot be greater than maxPrice");
      }
    }

    // Featured Filter
    if (featured !== undefined) {
      filter.featured = featured === "true";
    }

    let sortOption = { createdAt: -1 };

    switch (sort) {
      case "price":
        sortOption = { price: 1 };
        break;

      case "-price":
        sortOption = { price: -1 };
        break;

      case "name":
        sortOption = { name: 1 };
        break;

      case "-name":
        sortOption = { name: -1 };
        break;

      case "rating":
        sortOption = { averageRating: -1 };
        break;

      case "oldest":
        sortOption = { createdAt: 1 };
        break;

      case "newest":
        sortOption = { createdAt: -1 };
        break;

      default:
        sortOption = { createdAt: -1 };
    }

    const currentPage = Number(page);
    const perPage = Number(limit);

    const skip = (currentPage - 1) * perPage;
    const totalProducts = await Product.countDocuments(filter);
    const totalPages = Math.ceil(totalProducts / perPage);

    const products = await Product.find(filter)
      .populate("category", "name")
      .sort(sortOption)
      .skip(skip)
      .limit(perPage);

    res.status(200).json({
      success: true,
      count: products.length,
      page: currentPage,
      totalPages,
      totalProducts,
      products,
    });

  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, error.message || "Internal Server Error");
  }
};

// Get Single Product
export const getSingleProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("category", "name");

    if (!product) {
      throw new ApiError(404, "Product not found");
    }

    res.status(200).json({
      success: true,
      product,
    });

  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, error.message || "Internal Server Error");
  }
};

// Update Product
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      throw new ApiError(404, "Product not found");
    }

    const {
      name,
      description,
      price,
      category,
      stock,
      unit,
      featured,
    } = req.body;

    // Agar nayi image upload hui hai
    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "FreshBite/Products" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );

        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });

      product.image = result.secure_url;
    }

    if (name !== undefined) product.name = name;
    if (description !== undefined) product.description = description;
    if (price !== undefined) product.price = price;
    if (category !== undefined) product.category = category;
    if (stock !== undefined) product.stock = stock;
    if (unit !== undefined) product.unit = unit;
    if (featured !== undefined) product.featured = featured;

    await product.save();

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    if (error instanceof ApiError) throw error;

    throw new ApiError(500, error.message || "Internal Server Error");
  }
};

// Delete Product
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      throw new ApiError(404, "Product not found");
    }

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });

  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, error.message || "Internal Server Error");
  }
};