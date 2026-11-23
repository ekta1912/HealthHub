const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const { chatbotLimiter } = require("../middlewares/rateLimiter");
const { chatWithDoctorAI } = require("../controllers/chatbotController");

const router = express.Router();

// POST /api/v1/chatbot/chat (Protected & Rate Limited)
router.post("/chat", authMiddleware, chatbotLimiter, chatWithDoctorAI);

module.exports = router;
