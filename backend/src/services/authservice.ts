import { sign, verify } from "jsonwebtoken";
import type { StringValue } from "ms";
import { User } from "../models/user";
import { UserRepository } from "../repositories/userrepository";
import { NotificationService } from "../services/notificationservice";
import { config } from "../config/env";
import {
  UnauthorizedError,
  ConflictError,
  NotFoundError,
} from "../errors";

export class AuthService {
  private userRepo = new UserRepository();
  private notificationService = new NotificationService();

  // ================= REGISTER =================
  async register(username: string, email: string, password: string) {
    const existingUser = await this.userRepo.findByUsername(username);
    if (existingUser) throw new ConflictError("Username already taken");

    const existingEmail = await this.userRepo.findByEmail(email);
    if (existingEmail) throw new ConflictError("Email already registered");

    const user = await this.userRepo.create({
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      password,
    });

    // 🔔 Welcome Notification (First time)
    await this.notificationService.createNotification(
      user._id.toString(),
      "system",
      "Welcome ",
      `Welcome to the platform, ${user.username}!`
    );

    const tokens = this.generateTokens(user);

    return {
      user: this.formatUser(user),
      ...tokens,
    };
  }

  // ================= LOGIN =================
  async login(email: string, password: string) {
    const user = await User.findOne({ email }).select("+password");
    if (!user) throw new UnauthorizedError("Invalid credentials");

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) throw new UnauthorizedError("Invalid credentials");

    user.status = "online";
    user.lastSeen = new Date();
    await user.save();

    // 🔔 Welcome Back Notification
    await this.notificationService.createNotification(
      user._id.toString(),
      "system",
      "Welcome Back 👋",
      `Welcome back, ${user.username}!`
    );

    const tokens = this.generateTokens(user);

    return {
      user: this.formatUser(user),
      ...tokens,
    };
  }

  // ================= REFRESH TOKEN =================
  async refreshToken(token: string) {
    try {
      const decoded = verify(token, config.jwt.refreshSecret) as any;

      const user = await this.userRepo.findById(decoded.id);
      if (!user) throw new NotFoundError("User not found");

      return this.generateTokens(user);
    } catch (error) {
      throw new UnauthorizedError("Invalid refresh token");
    }
  }

  // ================= LOGOUT =================
  async logout(userId: string) {
    const user = await this.userRepo.findById(userId);
    if (user) {
      user.status = "offline";
      user.lastSeen = new Date();
      await user.save();
    }
  }

  // ================= UPDATE PROFILE =================
  async updateProfile(userId: string, data: any) {
    const user = await this.userRepo.update(userId, data);
    if (!user) throw new NotFoundError("User not found");
    return this.formatUser(user);
  }

  // ================= CHANGE PASSWORD =================
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ) {
    const user = await User.findById(userId).select("+password");
    if (!user) throw new NotFoundError("User not found");

    const isValid = await user.comparePassword(currentPassword);
    if (!isValid) throw new UnauthorizedError("Current password incorrect");

    user.password = newPassword;
    await user.save();
  }

  // ================= SEARCH USERS =================
  async searchUsers(query: string) {
    return await this.userRepo.search(query);
  }

  // ================= TOKEN GENERATOR =================
  private generateTokens(user: any) {
    const token = sign(
      {
        id: user._id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn as StringValue }
    );

    const refreshToken = sign(
      { id: user._id },
      config.jwt.refreshSecret,
      { expiresIn: config.jwt.refreshExpiresIn as StringValue }
    );

    return { token, refreshToken };
  }

  // ================= FORMAT USER =================
  private formatUser(user: any) {
    return {
      id: user._id,
      username: user.username,
      email: user.email,
      profileImage: user.profileImage,
      status: user.status,
      bio: user.bio,
      role: user.role,
    };
  }
}
