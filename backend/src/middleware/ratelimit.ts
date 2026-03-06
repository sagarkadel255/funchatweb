// middleware/ratelimit.ts
import rateLimit from "express-rate-limit";

const isDev = process.env.NODE_ENV !== "production";

export const authLimiter = rateLimit({
  windowMs: isDev ? 60 * 1000 : 15 * 60 * 1000, // 1 min in dev, 15 min in prod
  max: isDev ? 1000 : 5,
  message: "Too many login attempts, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
});

export const messageLimiter = rateLimit({
  windowMs: isDev ? 60 * 1000 : 1 * 60 * 1000,
  max: isDev ? 1000 : 30,
  message: "Too many messages, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
});

export const friendLimiter = rateLimit({
  windowMs: isDev ? 60 * 1000 : 10 * 60 * 1000,
  max: isDev ? 1000 : 20,
  message: "Too many friend requests, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
});

export const apiLimiter = rateLimit({
  windowMs: isDev ? 60 * 1000 : 15 * 60 * 1000,
  max: isDev ? 5000 : 100, // very high in dev
  standardHeaders: true,
  legacyHeaders: false,
});