const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const errorHandler = require("./middlewares/errorMiddleware");

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware: CORS
app.use(
  cors({
    origin: process.env.CLIENT_URL || true,
    credentials: true,
  })
);

// Middleware: Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Security Headers Middleware
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  next();
});

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
  next();
});

// API Routes
app.use("/api/v1/user", require("./routes/userRoutes"));
app.use("/api/v1/admin", require("./routes/adminRoutes"));
app.use("/api/v1/doctor", require("./routes/doctorRoutes"));
app.use("/api/v1/hospitals", require("./routes/hospitalRoutes"));
app.use("/api/v1/chatbot", require("./routes/chatbotRoutes"));

// Liveness probe
app.get(["/", "/health"], (req, res) => {
  res.status(200).json({
    status: "healthy",
    message: "HealthHub API is operational",
    uptime: `${process.uptime().toFixed(1)}s`,
    timestamp: new Date().toISOString(),
    version: "2.0.0",
  });
});

// Readiness probe
app.get("/ready", (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  const status = isDbConnected ? 200 : 503;
  res.status(status).json({
    ready: isDbConnected,
    dependencies: {
      database: isDbConnected ? "connected" : "disconnected",
    },
    timestamp: new Date().toISOString(),
  });
});

// 404 Route Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl} - Route not found on HealthHub API`,
  });
});

// Centralized Error Handling Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`HealthHub Server running on port ${PORT} in ${process.env.NODE_ENV || "development"} mode`);
  });
}

module.exports = app;
