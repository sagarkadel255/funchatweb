import z from "zod";
import { UserSchema } from "../types/user.type";

// Signup DTO
export const CreateUserDTO = UserSchema.pick({
  firstName: true,
  lastName: true,
  email: true,
  password: true,
})
  .extend({
    confirmPassword: z.string().min(6, "Confirm password is required"),
    username: z.string().min(3).optional(), // optional, auto-generated if not provided
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .transform((data) => ({
    ...data,
    username: data.username || data.email.split("@")[0], // auto-generate username
  }));

export type CreateUserDTO = z.infer<typeof CreateUserDTO>;

// Login DTO
export const LoginUserDTO = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});
export type LoginUserDTO = z.infer<typeof LoginUserDTO>;
