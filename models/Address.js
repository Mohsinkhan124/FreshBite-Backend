import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        fullName: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100,
        },

        phone: {
            type: String,
            required: true,
            trim: true,
            match: [/^03\d{9}$/, "Please enter a valid Pakistani phone number"],
        },

        street: {
            type: String,
            required: true,
            trim: true,
        },

        city: {
            type: String,
            required: true,
            trim: true,
        },

        state: {
            type: String,
            required: true,
            trim: true,
        },

        postalCode: {
            type: String,
            required: true,
            trim: true,
            match: [/^\d{5}$/, "Postal code must be 5 digits"],
        },

        country: {
            type: String,
            trim: true,
            uppercase: true,
            default: "PAKISTAN",
        },

        isDefault: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

const Address = mongoose.model("Address", addressSchema);

export default Address;