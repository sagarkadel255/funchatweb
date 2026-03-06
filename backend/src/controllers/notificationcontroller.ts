import { Request, Response } from "express";
import { NotificationService } from "../services/notificationservice";
import { ApiResponse } from "../types";

const notificationService = new NotificationService();

export class NotificationController {
  static async getNotifications(req: Request, res: Response) {
    const userId = req.user!.id;
    const { page, isRead } = req.query;

    const notifications = await notificationService.getNotifications(
      userId,
      parseInt(page as string) || 1,
      20,
      isRead ? JSON.parse(isRead as string) : undefined
    );

    const response: ApiResponse<any> = {
      success: true,
      message: "Notifications retrieved",
      data: notifications,
      statusCode: 200,
      timestamp: new Date(),
    };
    res.status(200).json(response);
  }

  static async getUnreadCount(req: Request, res: Response) {
    const userId = req.user!.id;
    const unreadCount = await notificationService.getUnreadCount(userId);

    const response: ApiResponse<any> = {
      success: true,
      message: "Unread count retrieved",
      data: { unreadCount },
      statusCode: 200,
      timestamp: new Date(),
    };
    res.status(200).json(response);
  }

  static async markAsRead(req: Request, res: Response) {
    const userId = req.user!.id;
    const { notificationId } = req.params;

    const notification = await notificationService.markAsRead(notificationId, userId);

    const response: ApiResponse<any> = {
      success: true,
      message: "Notification marked as read",
      data: notification,
      statusCode: 200,
      timestamp: new Date(),
    };
    res.status(200).json(response);
  }

  static async markAllAsRead(req: Request, res: Response) {
    const userId = req.user!.id;
    const count = await notificationService.markAllAsRead(userId);

    const response: ApiResponse<any> = {
      success: true,
      message: "All notifications marked as read",
      data: { modifiedCount: count },
      statusCode: 200,
      timestamp: new Date(),
    };
    res.status(200).json(response);
  }

  static async deleteNotification(req: Request, res: Response) {
    const userId = req.user!.id;
    const { notificationId } = req.params;

    await notificationService.deleteNotification(notificationId, userId);

    const response: ApiResponse<null> = {
      success: true,
      message: "Notification deleted",
      statusCode: 200,
      timestamp: new Date(),
    };
    res.status(200).json(response);
  }

  static async deleteAllNotifications(req: Request, res: Response) {
    const userId = req.user!.id;
    const count = await notificationService.deleteAllNotifications(userId);

    const response: ApiResponse<any> = {
      success: true,
      message: "All notifications deleted",
      data: { deletedCount: count },
      statusCode: 200,
      timestamp: new Date(),
    };
    res.status(200).json(response);
  }

  static async getNotificationsByType(req: Request, res: Response) {
    const userId = req.user!.id;
    const { type, page } = req.query;

    const notifications = await notificationService.getNotificationsByType(
      userId,
      type as string,
      parseInt(page as string) || 1
    );

    const response: ApiResponse<any> = {
      success: true,
      message: "Notifications retrieved",
      data: notifications,
      statusCode: 200,
      timestamp: new Date(),
    };
    res.status(200).json(response);
  }
}