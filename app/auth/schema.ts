import z from "zod";

export const loginSchema = z.object({
    email: z.string()
        .min(1, "Email is required")
        .email("Enter a valid email address"),
    password: z.string()
        .min(1, "Password is required")
        .min(6, "Password must be at least 6 characters"),
    rememberMe: z.boolean(), // Change this to default(false)
});

export type LoginData = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
    firstName: z.string()
        .min(1, "First name is required")
        .min(2, "Minimum 2 characters"),
    lastName: z.string()
        .min(1, "Last name is required")
        .min(2, "Minimum 2 characters"),
    email: z.string()
        .min(1, "Email is required")
        .email("Enter a valid email address"),
    username: z.string()
        .min(1, "Username is required")
        .min(3, "Username must be at least 3 characters")
        .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
    password: z.string()
        .min(1, "Password is required")
        .min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string()
        .min(1, "Confirm password is required"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

export type RegisterData = z.infer<typeof registerSchema>;