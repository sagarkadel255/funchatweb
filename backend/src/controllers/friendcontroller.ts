import { Request, Response } from "express";
import { FriendService } from "../services/friendservice";
import { UserRepository } from "../repositories/userrepository";
import { ApiResponse } from "../types";

const friendService = new FriendService();
const userRepo = new UserRepository();

export class FriendController {

    static async cancelRequest(req: Request, res: Response) {
  const { requestId } = req.params;
  const senderId = req.user!.id;

  await friendService.cancelRequest(requestId, senderId);

  res.status(200).json({
    success: true,
    message: "Request cancelled",
  });
}
  static async sendRequest(req: Request, res: Response) {
    const senderId = req.user!.id;
    const { receiverId } = req.body;
    const request = await friendService.sendRequest(senderId, receiverId);
    const response: ApiResponse<any> = {
      success: true,
      message: "Friend request sent",
      data: request,
      statusCode: 201,
      timestamp: new Date(),
    };
    res.status(201).json(response);
  }

  static async acceptRequest(req: Request, res: Response) {
    const { requestId } = req.body;
    const request = await friendService.acceptRequest(requestId);
    const response: ApiResponse<any> = {
      success: true,
      message: "Request accepted",
      data: request,
      statusCode: 200,
      timestamp: new Date(),
    };
    res.status(200).json(response);
  }

  static async rejectRequest(req: Request, res: Response) {
    const { requestId } = req.body;
    const request = await friendService.rejectRequest(requestId);
    const response: ApiResponse<any> = {
      success: true,
      message: "Request rejected",
      data: request,
      statusCode: 200,
      timestamp: new Date(),
    };
    res.status(200).json(response);
  }

  static async getFriendRequests(req: Request, res: Response) {
    const userId = req.user!.id;
    const { type } = req.query;
    const requestType =

    type === "sent" || type === "received"

    ? type

    : "received";
    const requests = await friendService.getFriendRequests(userId,requestType);
    const response: ApiResponse<any> = {
      success: true,
      message: "Requests retrieved",
      data: requests,
      statusCode: 200,
      timestamp: new Date(),
    };
    res.status(200).json(response);
  }

  static async getFriends(req: Request, res: Response) {
    const userId = req.user!.id;
    const { page } = req.query;
    const friends = await userRepo.findFriends(userId, parseInt(page as string) || 1);
    const response: ApiResponse<any> = {
      success: true,
      message: "Friends retrieved",
      data: friends,
      statusCode: 200,
      timestamp: new Date(),
    };
    res.status(200).json(response);
  }

  static async blockUser(req: Request, res: Response) {
    const userId = req.user!.id;
    const { blockId } = req.body;
    await friendService.blockUser(userId, blockId);
    const response: ApiResponse<null> = {
      success: true,
      message: "User blocked",
      statusCode: 200,
      timestamp: new Date(),
    };
    res.status(200).json(response);
  }

  static async unblockUser(req: Request, res: Response) {
    const userId = req.user!.id;
    const { unblockId } = req.body;
    await friendService.unblockUser(userId, unblockId);
    const response: ApiResponse<null> = {
      success: true,
      message: "User unblocked",
      statusCode: 200,
      timestamp: new Date(),
    };
    res.status(200).json(response);
  }
}

    