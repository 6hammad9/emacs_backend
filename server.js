import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url"; // Needed for __dirname in ES Modules

import authRoutes from "./src/routes/authRoutes.js";
import personRoutes from "./src/routes/personRoutes.js";
import cameraRoutes from "./src/routes/cameraRoutes.js";
import departmentRoutes from "./src/routes/departmentRoutes.js";

// Fix __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Update CORS to allow requests from your frontend at http://localhost:5173
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Serve static files from the uploads folder with additional headers

app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"), {
    setHeaders: (res, filePath) => {
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    },
  })
);
app.use("/uploads", express.static("uploads"));
// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error("❌ MONGO_URI is not defined. Check your .env file.");
  process.exit(1);
}

mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// Routes
app.use("/api/users", authRoutes);
app.use("/register-person", personRoutes);
app.use("/api/cameras", cameraRoutes);
app.use("/api/departments", departmentRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
