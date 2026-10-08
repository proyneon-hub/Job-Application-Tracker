import { z } from "zod";

// Shared by the auth forms (for instant feedback) and the Server Actions (the real check).

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "Enter your email address.")
  .max(320, "That email address is too long.")
  .pipe(z.email("Enter a valid email address."));

// bcrypt (used by Supabase Auth) only looks at the first 72 bytes of a password.
export const newPasswordSchema = z
  .string()
  .min(8, "Use at least 8 characters.")
  .max(72, "Use 72 characters or fewer.");

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Enter your password."),
});

export const signUpSchema = z
  .object({
    email: emailSchema,
    password: newPasswordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match.",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z
  .object({
    password: newPasswordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match.",
    path: ["confirmPassword"],
  });
