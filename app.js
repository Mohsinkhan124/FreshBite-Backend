import dns from "dns";
dns.setServers(["1.1.1.1", "8.8.8.8"]);

import express from "express"
import cors from "cors";
import "dotenv/config";
import connectDB from "./database/db.js";
import authRoutes from "./routes/authRoutes.js"
import categoryRoutes from "./routes/categoryRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import addressRoutes from "./routes/addressRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import couponRoutes from "./routes/couponRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import rateLimit from "express-rate-limit";
import errorMiddleware from "./middleware/errorMiddleware.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";

const app = express();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(cors({
    origin: "https://freshbite-shop.vercel.app/",
    methods: ["GET", "POST", "PUT","PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(helmet());
app.use(limiter);
app.use(morgan("dev"));
app.use(compression());
app.use(express.json());

const port = process.env.PORT || 4000;

connectDB();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/address", addressRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/notifications", notificationRoutes);


app.use(errorMiddleware);

if (process.env.NODE_ENV !== "production") {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

export default app;