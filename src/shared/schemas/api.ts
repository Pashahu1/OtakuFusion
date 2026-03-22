import { z } from 'zod';


export const LoginBodySchema = z.object({
  email: z.string().min(1, 'Email is required'),
  password: z.string().min(1, 'Password is required'),
});

export const RegisterBodySchema = z.object({
  username: z.string().min(1, 'Username is required'),
  email: z.string().min(1, 'Email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});


export const RegisterPageFormSchema = z
  .object({
    username: z
      .string()
      .min(1, 'Please fill in all fields.')
      .min(3, 'Username must be at least 3 characters.')
      .regex(
        /^[a-zA-Z0-9_]+$/,
        'Username can contain only letters, numbers and underscores.'
      ),
    email: z
      .string()
      .min(1, 'Please fill in all fields.')
      .email('Invalid email format.'),
    password: z
      .string()
      .min(1, 'Please fill in all fields.')
      .min(6, 'Password must be at least 6 characters.')
      .refine(
        (p) => /[A-Za-z]/.test(p) && /[0-9]/.test(p),
        'Password must contain letters and numbers.'
      ),
    confirm: z.string().min(1, 'Please fill in all fields.'),
  })
  .refine((d) => d.password === d.confirm, {
    message: 'Passwords do not match.',
    path: ['confirm'],
  });

export const ChangePasswordBodySchema = z.object({
  oldPassword: z.string().min(1, 'Old password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});

export const UpdateUserBodySchema = z.object({
  username: z.string().min(1, 'Username is required'),
});

export type LoginBody = z.infer<typeof LoginBodySchema>;
export type RegisterBody = z.infer<typeof RegisterBodySchema>;
export type ChangePasswordBody = z.infer<typeof ChangePasswordBodySchema>;
export type UpdateUserBody = z.infer<typeof UpdateUserBodySchema>;
