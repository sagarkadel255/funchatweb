import z from "zod";

export const UserSchema = z.object({
    username: z.string().min(1, "Username is required"),
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    role: z.enum(["user", "admin"]).default("user"),
    profileImage: z.string().optional(), // Add profile image field
    createdAt: z.date().optional(),
    updatedAt: z.date().optional(),
});

// Schema for user creation (without timestamps)
export const CreateUserSchema = UserSchema.omit({ 
    createdAt: true, 
    updatedAt: true 
});

// Schema for user update (all fields optional except required ones)
export const UpdateUserSchema = UserSchema.partial()
    .omit({ createdAt: true, updatedAt: true })
    .extend({
        id: z.string().optional(),
        profileImage: z.any().optional(), // Allow file upload for updates
    });

// Schema for admin user creation (with optional image)
export const AdminCreateUserSchema = CreateUserSchema.extend({
    profileImage: z.any().optional(), // Allow file upload for admin
});

// Schema for admin user update
export const AdminUpdateUserSchema = UpdateUserSchema;

export type UserType = z.infer<typeof UserSchema>;
export type CreateUserType = z.infer<typeof CreateUserSchema>;
export type UpdateUserType = z.infer<typeof UpdateUserSchema>;
export type AdminCreateUserType = z.infer<typeof AdminCreateUserSchema>;
export type AdminUpdateUserType = z.infer<typeof AdminUpdateUserSchema>;