import mongoose from "mongoose";

const connectDB = () => {
    const DB_URL = process.env.MONGODB_URI;

    mongoose.connect(DB_URL);
    mongoose.connection.on("connected", () => {
        console.log("Connected to MongoDB");
    });

    mongoose.connection.on("error", (err) => {
        console.error("Error connecting to MongoDB:", err);
    });
}

export default connectDB;