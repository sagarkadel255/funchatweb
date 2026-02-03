"use server";

import { login, register } from "../../lib/api/auth";
import { LoginData, RegisterData } from "../../app/auth/schema";
import { setAuthToken, setUserData, clearAuthCookies } from "../cookie";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export const handleRegister = async (data: RegisterData) => {
    try {
        const response = await register(data);
        
        if (response.success) {
            return {
                success: true,
                message: 'Registration successful! You can now login.',
                data: response.data
            };
        }
        
        return {
            success: false,
            message: response.message || 'Registration failed'
        };
    } catch (error: Error | any) {
        return { 
            success: false, 
            message: error.message || 'Registration action failed' 
        };
    }
}

export const handleLogin = async (data: LoginData) => {
    try {
        const response = await login(data);
        
        if (response.success && response.token && response.data) {
            // Store token and user data in cookies
            await setAuthToken(response.token);
            await setUserData(response.data);
            
            // Redirect based on user role
            if (response.data.role === 'admin') {
                redirect('/admin');
            } else {
                redirect('/dashboard');
            }
        }
        
        return {
            success: false,
            message: response.message || 'Login failed'
        };
    } catch (error: Error | any) {
        return { 
            success: false, 
            message: error.message || 'Login action failed' 
        };
    }
}

export const handleLogout = async () => {
    await clearAuthCookies();
    revalidatePath('/');
    redirect('/auth/login');
}