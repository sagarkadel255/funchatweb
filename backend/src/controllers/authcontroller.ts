import { Request, Response } from "express";
import { AuthService } from "../services/authservice";
import { ApiResponse } from "../types";

const authService = new AuthService();

export class AuthController {
  static async register(req: Request, res: Response) {
    const { username, email, password } = req.body;
    const result = await authService.register(username, email, password);
    const response: ApiResponse<any> = {
      success: true,
      message: "User registered successfully",
      data: result,
      statusCode: 201,
      timestamp: new Date(),
    };
    res.status(201).json(response);
  }

  static async login(req: Request, res: Response) {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    const response: ApiResponse<any> = {
      success: true,
      message: "Login successful",
      data: result,
      statusCode: 200,
      timestamp: new Date(),
    };
    res.status(200).json(response);
  }

  static async refreshToken(req: Request, res: Response) {
    const { refreshToken } = req.body;
    const tokens = await authService.refreshToken(refreshToken);
    const response: ApiResponse<any> = {
      success: true,
      message: "Token refreshed",
      data: tokens,
      statusCode: 200,
      timestamp: new Date(),
    };
    res.status(200).json(response);
  }

  static async logout(req: Request, res: Response) {
    const userId = req.user!.id;
    await authService.logout(userId);
    const response: ApiResponse<null> = {
      success: true,
      message: "Logout successful",
      statusCode: 200,
      timestamp: new Date(),
    };
    res.status(200).json(response);
  }

  static async getProfile(req: Request, res: Response) {
    const userId = req.user!.id;
    const userRepo = new (require("../repositories/UserRepository").UserRepository)();
    const user = await userRepo.findById(userId);
    const response: ApiResponse<any> = {
      success: true,
      message: "Profile retrieved",
      data: user,
      statusCode: 200,
      timestamp: new Date(),
    };
    res.status(200).json(response);
  }

  static async updateProfile(req: Request, res: Response) {
    const userId = req.user!.id;
    const updateData = req.body;
    if (req.file) {
      updateData.profileImage = req.file.path;
    }
    const user = await authService.updateProfile(userId, updateData);
    const response: ApiResponse<any> = {
      success: true,
      message: "Profile updated",
      data: user,
      statusCode: 200,
      timestamp: new Date(),
    };
    res.status(200).json(response);
  }

  static async changePassword(req: Request, res: Response) {
    const userId = req.user!.id;
    const { currentPassword, newPassword } = req.body;
    await authService.changePassword(userId, currentPassword, newPassword);
    const response: ApiResponse<null> = {
      success: true,
      message: "Password changed successfully",
      statusCode: 200,
      timestamp: new Date(),
    };
    res.status(200).json(response);
  }

  static async searchUsers(req: Request, res: Response) {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({
        success: false,
        message: "Search query required",
        statusCode: 400,
        timestamp: new Date(),
      });
    }
    const users = await authService.searchUsers(query as string);
    const response: ApiResponse<any> = {
      success: true,
      message: "Users found",
      data: users,
      statusCode: 200,
      timestamp: new Date(),
    };
    res.status(200).json(response);
  }
}