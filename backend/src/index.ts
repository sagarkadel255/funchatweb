import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import compression from "compression";
import morgan from "morgan";
import "express-async-errors";

import routes from "./routes";
import { connectDB } from "./config/database";
import { config } from "./config/env";
import { errorHandler, notFoundHandler } from "./middleware/error";
import { corsMiddleware, securityMiddleware } from "./middleware/security";
import { apiLimiter } from "./middleware/ratelimit";
import { SocketService } from "./services/socketservice";

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: true,
    credentials: true,
  },
});

// Connect Database
connectDB();

// Middleware
app.use(compression());
app.use(morgan("combined"));
app.use(securityMiddleware);
app.use(corsMiddleware);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use("/uploads", express.static("uploads"));
app.use(apiLimiter);

// Initialize Socket.io Service
new SocketService(io);

// Routes
app.use("/api", routes);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date() });
});

// Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start Server
const PORT = config.port;
server.listen(PORT, () => {
  console.log(`\n✅ Server running on port ${PORT}`);
  console.log(`📝 Environment: ${config.nodeEnv}`);
  console.log(`🗄️  MongoDB: ${config.mongodb.uri}\n`);
});

// Graceful Shutdown
process.on("SIGINT", async () => {
  console.log("\n🛑 Shutting down gracefully...");
  server.close(() => {
    console.log("✅ Server closed");
    process.exit(0);
  });
});

export { app, server, io };
