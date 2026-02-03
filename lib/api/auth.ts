import { LoginData, RegisterData } from "../../app/auth/schema";
import { API } from "./endpoints";

export interface AuthResponse {
    success: boolean;
    message: string;
    token?: string;
    data?: any;
}

export const register = async (registerData: RegisterData): Promise<AuthResponse> => {
    try {
        const response = await fetch(API.AUTH.REGISTER, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(registerData),
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Registration failed');
        }

        return data;
    } catch (error: Error | any) {
        console.error('Registration error:', error);
        return {
            success: false,
            message: error.message || 'Registration failed'
        };
    }
}

export const login = async (loginData: LoginData): Promise<AuthResponse> => {
    try {
        const response = await fetch(API.AUTH.LOGIN, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(loginData),
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Login failed');
        }

        return data;
    } catch (error: Error | any) {
        console.error('Login error:', error);
        return {
            success: false,
            message: error.message || 'Login failed'
        };
    }
}