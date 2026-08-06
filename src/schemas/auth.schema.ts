import { z } from "zod";

// * Mirror dari LoginRequest di src/types/auth.ts
export const loginRequestSchema = z.object({
  email: z.email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export type LoginRequestInput = z.infer<typeof loginRequestSchema>;

// * Mirror dari RegisterRequest di src/types/auth.ts, plus refine buat
// mastiin confirmPassword sama persis dengan password.
export const registerRequestSchema = z
  .object({
    email: z.email("Please enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    nickname: z.string().min(1, "Nickname is required").max(50, "Nickname is too long"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterRequestInput = z.infer<typeof registerRequestSchema>;
