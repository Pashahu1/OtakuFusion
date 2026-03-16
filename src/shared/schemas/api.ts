import { z } from 'zod';

/** Body для POST /api/auth/login */
export const LoginBodySchema = z.object({
  email: z.string().min(1, 'Email is required'),
  password: z.string().min(1, 'Password is required'),
});

/** Body для POST /api/auth/register */
export const RegisterBodySchema = z.object({
  username: z.string().min(1, 'Username is required'),
  email: z.string().min(1, 'Email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

/** Body для PATCH /api/user/change-password */
export const ChangePasswordBodySchema = z.object({
  oldPassword: z.string().min(1, 'Old password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});

/** Body для PATCH /api/user/update */
export const UpdateUserBodySchema = z.object({
  username: z.string().min(1, 'Username is required'),
});

export type LoginBody = z.infer<typeof LoginBodySchema>;
export type RegisterBody = z.infer<typeof RegisterBodySchema>;
export type ChangePasswordBody = z.infer<typeof ChangePasswordBodySchema>;
export type UpdateUserBody = z.infer<typeof UpdateUserBodySchema>;
