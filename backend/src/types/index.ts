export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  statusCode: number;
  timestamp: Date;
}

export interface JwtPayload {
  id: string;
  email: string;
  username: string;
  role: "user" | "admin";
}

export interface UserData {
  id: string;
  username: string;
  email: string;
  profileImage?: string;
  status: string;
  bio?: string;
}