// src/routes/index.ts
import { Router, Request, Response, NextFunction } from "express";
import { AuthController } from "../controllers/authcontroller";
import { FriendController } from "../controllers/friendcontroller";
import { MessageController } from "../controllers/messagecontroller";
import { CallController } from "../controllers/callcontroller";
import { AdminController } from "../controllers/admincontroller";
import { authMiddleware, adminOnly } from "../middleware/auth";
import {
  handleValidationErrors,
  validateRegister,
  validateLogin,
  validateSendMessage,
  validateFriendRequest,
} from "../middleware/validation";
import { authLimiter, messageLimiter, friendLimiter } from "../middleware/ratelimit";
import { upload } from "../middleware/multer";
import { NotificationController } from "../controllers/notificationcontroller";

const router = Router();

// Wrap async handlers
const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// ===== AUTH ROUTES =====
router.post("/auth/register", validateRegister, handleValidationErrors, authLimiter, asyncHandler(AuthController.register));
router.post("/auth/login", validateLogin, handleValidationErrors, authLimiter, asyncHandler(AuthController.login));
router.post("/auth/refresh", asyncHandler(AuthController.refreshToken));
router.post("/auth/logout", authMiddleware, asyncHandler(AuthController.logout));
router.get("/auth/profile", authMiddleware, asyncHandler(AuthController.getProfile));
router.put("/auth/profile", authMiddleware, upload.single("profileImage"), asyncHandler(AuthController.updateProfile));
router.post("/auth/change-password", authMiddleware, asyncHandler(AuthController.changePassword));
router.get("/auth/search", authMiddleware, asyncHandler(AuthController.searchUsers));

// ===== FRIEND ROUTES =====
router.post("/friends/request", authMiddleware, validateFriendRequest, handleValidationErrors, friendLimiter, asyncHandler(FriendController.sendRequest));
router.post("/friends/accept", authMiddleware, asyncHandler(FriendController.acceptRequest));
router.post("/friends/reject", authMiddleware, asyncHandler(FriendController.rejectRequest));
router.get("/friends/requests", authMiddleware, asyncHandler(FriendController.getFriendRequests));
router.get("/friends", authMiddleware, asyncHandler(FriendController.getFriends));
router.post("/friends/block", authMiddleware, asyncHandler(FriendController.blockUser));
router.post("/friends/unblock", authMiddleware, asyncHandler(FriendController.unblockUser));
router.delete("/friends/request/:requestId", authMiddleware, asyncHandler(FriendController.cancelRequest));
// ===== MESSAGE ROUTES =====
router.post("/messages", authMiddleware, validateSendMessage, handleValidationErrors, messageLimiter, asyncHandler(MessageController.sendMessage));
router.get("/messages/:conversationId", authMiddleware, asyncHandler(MessageController.getMessages));
router.put("/messages/:messageId", authMiddleware, asyncHandler(MessageController.editMessage));
router.delete("/messages/:messageId", authMiddleware, asyncHandler(MessageController.deleteMessage));
router.post("/messages/seen", authMiddleware, asyncHandler(MessageController.markAsSeen));
router.get("/messages/search/:conversationId", authMiddleware, asyncHandler(MessageController.searchMessages));
router.get("/conversations", authMiddleware, asyncHandler(MessageController.getConversations));

// ===== CALL ROUTES =====
router.post("/calls", authMiddleware, asyncHandler(CallController.initiateCall));
router.post("/calls/accept", authMiddleware, asyncHandler(CallController.acceptCall));
router.post("/calls/reject", authMiddleware, asyncHandler(CallController.rejectCall));
router.post("/calls/end", authMiddleware, asyncHandler(CallController.endCall));
router.post("/calls/clear-stale", authMiddleware, asyncHandler(CallController.clearActiveCalls));
router.get("/calls/history", authMiddleware, asyncHandler(CallController.getCallHistory));
router.get("/calls/missed", authMiddleware, asyncHandler(CallController.getMissedCalls));

// ===== ADMIN ROUTES =====
router.get("/admin/stats", authMiddleware, adminOnly, asyncHandler(AdminController.getStats));
router.get("/admin/users", authMiddleware, adminOnly, asyncHandler(AdminController.getAllUsers));
router.delete("/admin/users/:userId", authMiddleware, adminOnly, asyncHandler(AdminController.deleteUser));
router.post("/admin/users/:userId/ban", authMiddleware, adminOnly, asyncHandler(AdminController.banUser));
router.get("/admin/messages/stats", authMiddleware, adminOnly, asyncHandler(AdminController.getMessageStats));


// ===== NOTIFICATION ROUTES =====
router.get("/notifications", authMiddleware, asyncHandler(NotificationController.getNotifications));
router.get("/notifications/unread/count", authMiddleware, asyncHandler(NotificationController.getUnreadCount));
router.get("/notifications/type/:type", authMiddleware, asyncHandler(NotificationController.getNotificationsByType));
router.post("/notifications/:notificationId/read", authMiddleware, asyncHandler(NotificationController.markAsRead));
router.post("/notifications/read-all", authMiddleware, asyncHandler(NotificationController.markAllAsRead));
router.delete("/notifications/:notificationId", authMiddleware, asyncHandler(NotificationController.deleteNotification));
router.delete("/notifications", authMiddleware, asyncHandler(NotificationController.deleteAllNotifications));

export default router;