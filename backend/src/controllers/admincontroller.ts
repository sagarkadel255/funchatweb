import { Request, Response } from "express";
import { AdminService } from "../services/adminservice";
import { ApiResponse } from "../types";

const adminService = new AdminService();

export class AdminController {
  static async getStats(req: Request, res: Response) {
    const stats = await adminService.getStats();
    const response: ApiResponse<any> = {
      success: true,
      message: "Stats retrieved",
      data: stats,
      statusCode: 200,
      timestamp: new Date(),
    };
    res.status(200).json(response);
  }

  static async getAllUsers(req: Request, res: Response) {
    const { page } = req.query;
    const users = await adminService.getAllUsers(parseInt(page as string) || 1);
    const response: ApiResponse<any> = {
      success: true,
      message: "Users retrieved",
      data: users,
      statusCode: 200,
      timestamp: new Date(),
    };
    res.status(200).json(response);
  }

  static async deleteUser(req: Request, res: Response) {
    const { userId } = req.params;
    await adminService.deleteUser(userId);
    const response: ApiResponse<null> = {
      success: true,
      message: "User deleted",
      statusCode: 200,
      timestamp: new Date(),
    };
    res.status(200).json(response);
  }

  static async banUser(req: Request, res: Response) {
    const { userId } = req.params;
    await adminService.banUser(userId);
    const response: ApiResponse<null> = {
      success: true,
      message: "User banned",
      statusCode: 200,
      timestamp: new Date(),
    };
    res.status(200).json(response);
  }

  static async getMessageStats(req: Request, res: Response) {
    const stats = await adminService.getMessageStats();
    const response: ApiResponse<any> = {
      success: true,
      message: "Message stats retrieved",
      data: stats,
      statusCode: 200,
      timestamp: new Date(),
    };
    res.status(200).json(response);
  }
}