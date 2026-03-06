export interface AuthUser {
  id: string;
  username: string;
  email: string;
  profileImage?: string;
  bio?: string;
  phone?: string;
  status: "online" | "offline" | "away";
  role: "user" | "admin";
  lastSeen?: string;
  
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;

}

export interface AuthResponse {
  user: AuthUser;
  token: string;
  refreshToken: string;
}