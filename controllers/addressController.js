import Address from "../models/Address.js";
import ApiError from "../utils/ApiError.js";

// Add Address
export const addAddress = async (req, res) => {
  try {
    const {
      fullName,
      phone,
      street,
      city,
      state,
      postalCode,
      country,
      isDefault,
    } = req.body;

    // Remove extra spaces
    const data = {
      fullName: fullName?.trim(),
      phone: phone?.trim(),
      street: street?.trim(),
      city: city?.trim(),
      state: state?.trim(),
      postalCode: postalCode?.trim(),
      country: country?.trim() || "PAKISTAN",
    };

    // Required Fields Validation
    if (
      !data.fullName ||
      !data.phone ||
      !data.street ||
      !data.city ||
      !data.state ||
      !data.postalCode
    ) {
      throw new ApiError(400, "Please fill all required fields");
    }

    // Check Duplicate Address
    const existingAddress = await Address.findOne({
      user: req.user.id,
      street: data.street,
      city: data.city,
      postalCode: data.postalCode,
    });

    if (existingAddress) {
      throw new ApiError(400, "This address already exists");
    }

    // First address automatically becomes default
    const totalAddresses = await Address.countDocuments({
      user: req.user.id,
    });

    const defaultStatus =
      totalAddresses === 0 ? true : isDefault || false;

    // If user selects another default address
    if (defaultStatus) {
      await Address.updateMany(
        { user: req.user.id },
        { isDefault: false }
      );
    }

    // Create Address
    const address = await Address.create({
      user: req.user.id,
      fullName: data.fullName,
      phone: data.phone,
      street: data.street,
      city: data.city,
      state: data.state,
      postalCode: data.postalCode,
      country: data.country.toUpperCase(),
      isDefault: defaultStatus,
    });

    res.status(201).json({
      success: true,
      message: "Address added successfully",
      address,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, error.message || "Internal Server Error");
  }
};

// Get My Addresses
export const getMyAddresses = async (req, res) => {
  try {
    const addresses = await Address.find({
      user: req.user.id,
    }).sort({ isDefault: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: addresses.length,
      addresses,
    });

  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, error.message || "Internal Server Error");
  }
};

// Update Address
export const updateAddress = async (req, res) => {
  try {
    const address = await Address.findById(req.params.id);

    if (!address) {
      throw new ApiError(404, "Address not found");
    }

    if (address.user.toString() !== req.user.id) {
      throw new ApiError(403, "Unauthorized Access");
    }

    const {
      fullName,
      phone,
      street,
      city,
      state,
      postalCode,
      country,
      isDefault,
    } = req.body;

    if (isDefault) {
      await Address.updateMany(
        { user: req.user.id },
        { isDefault: false }
      );
    }

    address.fullName = fullName || address.fullName;
    address.phone = phone || address.phone;
    address.street = street || address.street;
    address.city = city || address.city;
    address.state = state || address.state;
    address.postalCode = postalCode || address.postalCode;
    address.country = country || address.country;

    if (typeof isDefault === "boolean") {
      address.isDefault = isDefault;
    }

    await address.save();

    res.status(200).json({
      success: true,
      message: "Address updated successfully",
      address,
    });

  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, error.message || "Internal Server Error");
  }
};

// Delete Address
export const deleteAddress = async (req, res) => {
  try {
    const address = await Address.findById(req.params.id);

    if (!address) {
      throw new ApiError(404, "Address not found");
    }

    if (address.user.toString() !== req.user.id) {
      throw new ApiError(403, "Unauthorized Access");
    }

    const wasDefault = address.isDefault;

    await address.deleteOne();

    if (wasDefault) {
      const nextAddress = await Address.findOne({
        user: req.user.id,
      }).sort({ createdAt: 1 });

      if (nextAddress) {
        nextAddress.isDefault = true;
        await nextAddress.save();
      }
    }

    res.status(200).json({
      success: true,
      message: "Address deleted successfully",
    });

  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, error.message || "Internal Server Error");
  }
};

// Set Default Address
export const setDefaultAddress = async (req, res) => {
  try {
    const address = await Address.findById(req.params.id);

    if (!address) {
      throw new ApiError(404, "Address not found");
    }

    if (address.user.toString() !== req.user.id) {
      throw new ApiError(403, "Unauthorized Access");
    }

    await Address.updateMany(
      { user: req.user.id },
      { isDefault: false }
    );

    address.isDefault = true;
    await address.save();

    res.status(200).json({
      success: true,
      message: "Default address updated successfully",
      address,
    });

  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, error.message || "Internal Server Error");
  }
};