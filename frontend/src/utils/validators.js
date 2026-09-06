import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z
  .object({
    email: z.string().email('Invalid email'),
    username: z.string().min(3, 'Min 3 characters').max(100),
    full_name: z.string().min(1, 'Required').max(255),
    password: z.string().min(6, 'Min 6 characters'),
    confirmPassword: z.string(),
    role: z.enum(['team_member', 'manager', 'admin']).default('team_member'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });