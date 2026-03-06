import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors";
import { ApiResponse } from "../types";

export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error("❌ Error:", error);

  if (error instanceof AppError) {
    const response: ApiResponse<null> = {
      success: false,
      message: error.message,
      error: error.message,
      statusCode: error.statusCode,
      timestamp: new Date(),
    };
    return res.status(error.statusCode).json(response);
  }

  const response: ApiResponse<null> = {
    success: false,
    message: "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? error.message : "Something went wrong",
    statusCode: 500,
    timestamp: new Date(),
  };
  res.status(500).json(response);
};

export const notFoundHandler = (req: Request, res: Response) => {
  const response: ApiResponse<null> = {
    success: false,
    message: "Route not found",
    statusCode: 404,
    timestamp: new Date(),
  };
  res.status(404).json(response);
};