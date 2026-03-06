import { Request, Response } from "express";
import { MessageService } from "../services/messageservice";
import { ApiResponse } from "../types";

const messageService = new MessageService();

export class MessageController {
  static async sendMessage(req: Request, res: Response) {
    const senderId = req.user!.id;
    const { receiverId, content } = req.body;
    const message = await messageService.sendMessage(senderId, receiverId, content);
    const response: ApiResponse<any> = {
      success: true,
      message: "Message sent",
      data: message,
      statusCode: 201,
      timestamp: new Date(),
    };
    res.status(201).json(response);
  }

  static async getMessages(req: Request, res: Response) {
    const { conversationId } = req.params;
    const { page } = req.query;
    const messages = await messageService.getMessages(conversationId, parseInt(page as string) || 1);
    const response: ApiResponse<any> = {
      success: true,
      message: "Messages retrieved",
      data: messages,
      statusCode: 200,
      timestamp: new Date(),
    };
    res.status(200).json(response);
  }

  static async editMessage(req: Request, res: Response) {
    const userId = req.user!.id;
    const { messageId } = req.params;
    const { content } = req.body;
    const message = await messageService.editMessage(messageId, userId, content);
    const response: ApiResponse<any> = {
      success: true,
      message: "Message updated",
      data: message,
      statusCode: 200,
      timestamp: new Date(),
    };
    res.status(200).json(response);
  }

  static async deleteMessage(req: Request, res: Response) {
    const userId = req.user!.id;
    const { messageId } = req.params;
    await messageService.deleteMessage(messageId, userId);
    const response: ApiResponse<null> = {
      success: true,
      message: "Message deleted",
      statusCode: 200,
      timestamp: new Date(),
    };
    res.status(200).json(response);
  }

  static async markAsSeen(req: Request, res: Response) {
    const userId = req.user!.id;
    const { messageIds } = req.body;
    await messageService.markAsSeen(messageIds, userId);
    const response: ApiResponse<null> = {
      success: true,
      message: "Messages marked as seen",
      statusCode: 200,
      timestamp: new Date(),
    };
    res.status(200).json(response);
  }

  static async getConversations(req: Request, res: Response) {
    const userId = req.user!.id;
    const { page } = req.query;
    const conversations = await messageService.getConversations(userId, parseInt(page as string) || 1);
    const response: ApiResponse<any> = {
      success: true,
      message: "Conversations retrieved",
      data: conversations,
      statusCode: 200,
      timestamp: new Date(),
    };
    res.status(200).json(response);
  }

  static async searchMessages(req: Request, res: Response) {
    const { conversationId, query } = req.query;
    const messages = await messageService.searchMessages(conversationId as string, query as string);
    const response: ApiResponse<any> = {
      success: true,
      message: "Messages found",
      data: messages,
      statusCode: 200,
      timestamp: new Date(),
    };
    res.status(200).json(response);
  }
}