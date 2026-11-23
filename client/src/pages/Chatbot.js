import React, { useState, useEffect, useRef, useCallback } from "react";
import Layout from "../components/Layout";
import axios from "axios";
import { Card, Input, Button, Spin, Tag, message } from "antd";

const QUICK_PROMPTS = [
  "What is the first aid for sudden high fever?",
  "What home remedies help for an acute migraine?",
  "I have stomach acidity and heartburn after eating.",
  "What precautions should I take for low blood pressure?",
];

const Chatbot = () => {
  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: "Hello! I am Dr. AI, your HealthHub medical assistant. How may I help you today? You can type your symptoms below or click the microphone to speak.",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  const chatBottomRef = useRef(null);
  const recognitionRef = useRef(null);
  const voicesRef = useRef([]);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Initialize Speech Synthesis and Speech Recognition
  useEffect(() => {
    // Load speech synthesis voices
    if (typeof window !== "undefined" && window.speechSynthesis) {
      const loadVoices = () => {
        voicesRef.current = window.speechSynthesis.getVoices();
      };
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    // Initialize Web Speech API for voice recognition
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInput(transcript);
          handleSend(transcript);
        }
        setIsListening(false);
      };

      recognition.onerror = (event) => {
        console.warn("Speech recognition error:", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Text to speech voice synthesis
  const speakText = useCallback(
    (text) => {
      if (!voiceEnabled || typeof window === "undefined" || !window.speechSynthesis) return;

      window.speechSynthesis.cancel();
      const clean = text.replace(/[*_#`]/g, "");
      const utterance = new SpeechSynthesisUtterance(clean);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      // Select gentle natural voice if available
      const preferred = voicesRef.current.find(
        (v) =>
          v.name.includes("Google") ||
          v.name.includes("Samantha") ||
          v.name.includes("Natural") ||
          v.name.includes("Zira")
      );
      if (preferred) utterance.voice = preferred;

      window.speechSynthesis.speak(utterance);
    },
    [voiceEnabled]
  );

  // Toggle voice recognition
  const toggleListening = () => {
    if (!recognitionRef.current) {
      return message.warning("Speech recognition is not supported in this browser.");
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error("Failed to start speech recognition:", err);
      }
    }
  };

  // Send message to backend Gemini / Dr. AI endpoint
  const handleSend = async (customPrompt) => {
    const textToSend = typeof customPrompt === "string" ? customPrompt : input;
    if (!textToSend.trim() || loading) return;

    const userMessage = {
      role: "user",
      text: textToSend.trim(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post(
        "/api/v1/chatbot/chat",
        {
          message: textToSend.trim(),
          chatHistory: messages.map((m) => ({
            role: m.role === "user" ? "user" : "model",
            parts: [{ text: m.text }],
          })),
        },
        {
          headers: { Authorization: "Bearer " + localStorage.getItem("token") },
        }
      );

      if (res.data && res.data.success) {
        const replyText = res.data.reply;
        const aiMessage = {
          role: "ai",
          text: replyText,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, aiMessage]);
        speakText(replyText);
      } else {
        message.error(res.data.message || "Unable to get advice right now.");
      }
    } catch (error) {
      console.error("Chatbot error:", error);
      const fallbackReply =
        "I am currently experiencing connectivity issues reaching the clinical service. For emergencies, please call emergency services or visit the nearest hospital.";
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: fallbackReply,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = () => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setMessages([
      {
        role: "ai",
        text: "Conversation refreshed. How may I assist you with your health today?",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
    message.info("Chat conversation cleared");
  };

  return (
    <Layout>
      <div className="p-4" style={{ maxWidth: "1000px", margin: "0 auto" }}>
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
          <div>
            <h2 style={{ color: "#1e293b", fontWeight: "bold", margin: 0 }}>
              <i className="fa-solid fa-robot text-primary me-2"></i> Dr. AI â€” Medical Chatbot & Symptom Triage
            </h2>
            <p className="text-muted mb-0">
              Interactive clinical assistance powered by Google Gemini and intelligent medical heuristics.
            </p>
          </div>
          <div className="d-flex gap-2 align-items-center">
            <Button
              type={voiceEnabled ? "primary" : "default"}
              onClick={() => {
                if (voiceEnabled && window.speechSynthesis) window.speechSynthesis.cancel();
                setVoiceEnabled(!voiceEnabled);
              }}
              style={{ borderRadius: "8px" }}
            >
              <i className={`fa-solid ${voiceEnabled ? "fa-volume-high" : "fa-volume-xmark"} me-1`}></i>
              {voiceEnabled ? "Voice On" : "Voice Muted"}
            </Button>
            <Button onClick={handleClearHistory} danger style={{ borderRadius: "8px" }}>
              <i className="fa-solid fa-trash-can me-1"></i> Clear Chat
            </Button>
          </div>
        </div>

        {/* Emergency Notice */}
        <div
          className="p-3 mb-3 d-flex align-items-center justify-content-between rounded-3"
          style={{ background: "#fef2f2", border: "1px solid #fecaca" }}
        >
          <div className="d-flex align-items-center">
            <i className="fa-solid fa-triangle-exclamation text-danger fs-4 me-3"></i>
            <span className="small text-danger fw-semibold">
              Emergency Advisory: For severe chest pain, extreme breathlessness, or trauma, immediately call emergency
              services (112 / 911) or visit the nearest hospital emergency room.
            </span>
          </div>
          <Tag color="red" className="fw-bold">
            EMERGENCY: 112
          </Tag>
        </div>

        {/* Chat Conversation Card */}
        <Card
          className="shadow-sm border-0 d-flex flex-column"
          style={{
            borderRadius: "16px",
            height: "580px",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
          bodyStyle={{
            padding: 0,
            display: "flex",
            flexDirection: "column",
            height: "100%",
          }}
        >
          {/* Messages Scroll Area */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "24px",
              background: "#f8fafc",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            {messages.map((msg, index) => {
              const isAi = msg.role === "ai";
              return (
                <div
                  key={index}
                  style={{
                    alignSelf: isAi ? "flex-start" : "flex-end",
                    maxWidth: "80%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <div
                    style={{
                      background: isAi ? "#ffffff" : "linear-gradient(135deg, #2563eb, #1d4ed8)",
                      color: isAi ? "#1e293b" : "#ffffff",
                      padding: "14px 18px",
                      borderRadius: isAi ? "18px 18px 18px 4px" : "18px 18px 4px 18px",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                      border: isAi ? "1px solid #e2e8f0" : "none",
                      fontSize: "14.5px",
                      lineHeight: "1.6",
                    }}
                  >
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <i className={`fa-solid ${isAi ? "fa-user-doctor text-primary" : "fa-user text-white"}`}></i>
                      <span className="fw-bold small">{isAi ? "Dr. AI" : "You"}</span>
                    </div>
                    {msg.text}
                  </div>
                  <span
                    className="small text-muted mt-1"
                    style={{
                      alignSelf: isAi ? "flex-start" : "flex-end",
                      fontSize: "11px",
                      padding: "0 4px",
                    }}
                  >
                    {msg.time}
                  </span>
                </div>
              );
            })}

            {loading && (
              <div
                style={{
                  alignSelf: "flex-start",
                  background: "#ffffff",
                  padding: "12px 18px",
                  borderRadius: "18px 18px 18px 4px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                  border: "1px solid #e2e8f0",
                }}
              >
                <Spin size="small" /> <span className="ms-2 small text-muted">Dr. AI is analyzing symptoms...</span>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Quick Prompts */}
          <div className="px-3 py-2 bg-white border-top d-flex flex-wrap gap-2 align-items-center">
            <span className="small text-muted fw-semibold">Quick Inquiries:</span>
            {QUICK_PROMPTS.map((prompt, idx) => (
              <Tag
                key={idx}
                color="processing"
                style={{ cursor: "pointer", borderRadius: "12px", padding: "2px 10px" }}
                onClick={() => handleSend(prompt)}
              >
                {prompt}
              </Tag>
            ))}
          </div>

          {/* Input Bar */}
          <div className="p-3 bg-white border-top d-flex gap-2 align-items-center">
            <Button
              shape="circle"
              size="large"
              type={isListening ? "primary" : "default"}
              danger={isListening}
              onClick={toggleListening}
              title={isListening ? "Stop voice listening" : "Click to speak with Dr. AI"}
            >
              <i className={`fa-solid ${isListening ? "fa-microphone-lines fa-fade" : "fa-microphone"}`}></i>
            </Button>

            <Input
              size="large"
              placeholder={isListening ? "Listening to your voice..." : "Describe symptoms, medicines, or health questions..."}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onPressEnter={() => handleSend()}
              disabled={loading}
              style={{ borderRadius: "24px" }}
            />

            <Button
              type="primary"
              size="large"
              shape="circle"
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              title="Send message"
            >
              <i className="fa-solid fa-paper-plane"></i>
            </Button>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default Chatbot;
