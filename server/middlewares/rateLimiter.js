/**
 * In-memory sliding window rate limiter
 * Gracefully protects endpoints without external Redis dependencies
 */

const createRateLimiter = ({ windowMs = 60 * 1000, max = 60, message = "Too many requests, please try again later." }) => {
  const requests = new Map();

  // Periodically clean up stale records every 2 minutes
  const cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of requests.entries()) {
      if (now - entry.startTime > windowMs * 2) {
        requests.delete(key);
      }
    }
  }, 120000);

  if (cleanupInterval.unref) {
    cleanupInterval.unref();
  }

  return (req, res, next) => {
    // Generate key based on IP or authenticated user ID
    const clientKey = req.userId || req.ip || req.connection.remoteAddress || "anonymous";
    const key = `${clientKey}_${req.baseUrl}`;
    const now = Date.now();

    const record = requests.get(key) || { count: 0, startTime: now };

    if (now - record.startTime > windowMs) {
      record.count = 1;
      record.startTime = now;
    } else {
      record.count += 1;
    }

    requests.set(key, record);

    res.setHeader("X-RateLimit-Limit", max);
    res.setHeader("X-RateLimit-Remaining", Math.max(0, max - record.count));
    res.setHeader("X-RateLimit-Reset", Math.ceil((record.startTime + windowMs) / 1000));

    if (record.count > max) {
      return res.status(429).json({
        success: false,
        message,
        retryAfterSeconds: Math.ceil((record.startTime + windowMs - now) / 1000),
      });
    }

    next();
  };
};

module.exports = {
  createRateLimiter,
  authLimiter: createRateLimiter({ windowMs: 60 * 1000, max: 20, message: "Too many authentication attempts. Please try again in a minute." }),
  bookingLimiter: createRateLimiter({ windowMs: 60 * 1000, max: 20, message: "Too many booking requests. Please wait a moment." }),
  chatbotLimiter: createRateLimiter({ windowMs: 60 * 1000, max: 30, message: "AI Chat rate limit reached. Please wait a moment before sending more messages." }),
  generalLimiter: createRateLimiter({ windowMs: 60 * 1000, max: 150, message: "Rate limit exceeded. Please throttle requests." }),
};
