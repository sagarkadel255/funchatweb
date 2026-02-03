import { UserRepository } from "../repositories/user.repository";
import { HttpError } from "../errors/http-error";
import bcryptjs from "bcryptjs";
import { IUser } from "../models/user.model";

const userRepository = new UserRepository();

export class AdminService {
    /**
     * Get all users (simple version without pagination in repo)
     */
    async getAllUsers() {
        try {
            const users = await userRepository.getAllUsers();
            
            // Remove passwords
            const usersWithoutPasswords = users.map(user => {
                const userObj = user.toObject ? user.toObject() : { ...user };
                delete userObj.password;
                return userObj;
            });

            return {
                users: usersWithoutPasswords,
                total: users.length
            };
        } catch (error) {
            throw new HttpError(500, "Error fetching users");
        }
    }

    /**
     * Get user by ID (without password)
     */
    async getUserById(id: string) {
        const user = await userRepository.getUserById(id);
        if (!user) {
            throw new HttpError(404, "User not found");
        }
        
        const userObj = user.toObject ? user.toObject() : { ...user };
        delete userObj.password;
        return userObj;
    }

    /**
     * Create new user (admin only)
     */
    async createUser(data: {
        email: string;
        password: string;
        username: string;
        firstName?: string;
        lastName?: string;
        role?: 'user' | 'admin';
        profileImage?: string;
    }) {
        const emailCheck = await userRepository.getUserByEmail(data.email);
        if (emailCheck) throw new HttpError(400, "Email already in use");

        const usernameCheck = await userRepository.getUserByUsername(data.username);
        if (usernameCheck) throw new HttpError(400, "Username already in use");

        const hashedPassword = await bcryptjs.hash(data.password, 10);
        
        const userData: Partial<IUser> = {
            email: data.email,
            password: hashedPassword,
            username: data.username,
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            role: data.role || 'user',
            profileImage: data.profileImage || ''
        };

        const newUser = await userRepository.createUser(userData);
        
        const userObj = newUser.toObject ? newUser.toObject() : { ...newUser };
        delete userObj.password;
        return userObj;
    }

    /**
     * Update user
     */
    async updateUser(id: string, updates: Partial<IUser>) {
        const existingUser = await userRepository.getUserById(id);
        if (!existingUser) throw new HttpError(404, "User not found");

        // Check duplicates
        if (updates.email && updates.email !== existingUser.email) {
            const emailCheck = await userRepository.getUserByEmail(updates.email);
            if (emailCheck) throw new HttpError(400, "Email already in use");
        }

        if (updates.username && updates.username !== existingUser.username) {
            const usernameCheck = await userRepository.getUserByUsername(updates.username);
            if (usernameCheck) throw new HttpError(400, "Username already in use");
        }

        // Hash password if updating
        if (updates.password) {
            updates.password = await bcryptjs.hash(updates.password, 10);
        }

        const updatedUser = await userRepository.updateUser(id, updates);
        if (!updatedUser) throw new HttpError(500, "Failed to update user");

        const userObj = updatedUser.toObject ? updatedUser.toObject() : { ...updatedUser };
        delete userObj.password;
        return userObj;
    }

    /**
     * Delete user
     */
    async deleteUser(id: string) {
        const result = await userRepository.deleteUser(id);
        if (!result) throw new HttpError(404, "User not found");
        return { message: "User deleted successfully" };
    }
}