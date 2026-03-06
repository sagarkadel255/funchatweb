import { Request, Response } from "express";
import { CallService } from "../services/callservice";
import { ApiResponse } from "../types";

const callService = new CallService();

export class CallController {
  static async initiateCall(req: Request, res: Response) {
    const callerId = req.user!.id;
    const { recipientId, callType } = req.body;
    const call = await callService.initiateCall(callerId, recipientId, callType);
    const response: ApiResponse<any> = {
      success: true,
      message: "Call initiated",
      data: call,
      statusCode: 201,
      timestamp: new Date(),
    };
    res.status(201).json(response);
  }

  static async acceptCall(req: Request, res: Response) {
    const userId = req.user!.id;
    const { callId } = req.body;
    const call = await callService.acceptCall(callId, userId);
    const response: ApiResponse<any> = {
      success: true,
      message: "Call accepted",
      data: call,
      statusCode: 200,
      timestamp: new Date(),
    };
    res.status(200).json(response);
  }

  static async rejectCall(req: Request, res: Response) {
    const userId = req.user!.id;
    const { callId } = req.body;
    const call = await callService.rejectCall(callId, userId);
    const response: ApiResponse<any> = {
      success: true,
      message: "Call rejected",
      data: call,
      statusCode: 200,
      timestamp: new Date(),
    };
    res.status(200).json(response);
  }

  static async endCall(req: Request, res: Response) {
    const userId = req.user!.id;
    const { callId } = req.body;
    const call = await callService.endCall(callId, userId);
    const response: ApiResponse<any> = {
      success: true,
      message: "Call ended",
      data: call,
      statusCode: 200,
      timestamp: new Date(),
    };
    res.status(200).json(response);
  }

  static async getCallHistory(req: Request, res: Response) {
    const userId = req.user!.id;
    const { page } = req.query;
    const calls = await callService.getCallHistory(userId, parseInt(page as string) || 1);
    const response: ApiResponse<any> = {
      success: true,
      message: "Call history retrieved",
      data: calls,
      statusCode: 200,
      timestamp: new Date(),
    };
    res.status(200).json(response);
  }

  static async getMissedCalls(req: Request, res: Response) {
    const userId = req.user!.id;
    const calls = await callService.getMissedCalls(userId);
    const response: ApiResponse<any> = {
      success: true,
      message: "Missed calls retrieved",
      data: calls,
      statusCode: 200,
      timestamp: new Date(),
    };
    res.status(200).json(response);
  }

  static async clearActiveCalls(req: Request, res: Response) {
    const userId = req.user!.id;
    const cleared = await callService.clearActiveCalls(userId);
    const response: ApiResponse<any> = {
      success: true,
      message: `Cleared ${cleared} stale call(s)`,
      data: { cleared },
      statusCode: 200,
      timestamp: new Date(),
    };
    res.status(200).json(response);
  }
}