import { z } from 'zod';

export const emailSchema = z.string().trim().email('Enter a valid email address');
export const passwordSchema = z.string().min(8, 'Use at least 8 characters');

export const loginSchema = z.object({ email: emailSchema, password: passwordSchema });
export const registerSchema = loginSchema.extend({
  fullName: z.string().trim().min(2, 'Enter your full name'),
  confirmPassword: passwordSchema,
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const addressSchema = z.object({
  firstName: z.string().trim().min(1, 'Required'),
  lastName: z.string().trim().min(1, 'Required'),
  company: z.string().trim().optional(),
  address1: z.string().trim().min(4, 'Enter a street address'),
  address2: z.string().trim().optional(),
  city: z.string().trim().min(2, 'Required'),
  province: z.string().trim().min(2, 'Required'),
  postalCode: z.string().trim().min(3, 'Required'),
  country: z.string().trim().min(2, 'Required'),
  phone: z.string().trim().optional(),
});

export const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  title: z.string().trim().min(3).max(80),
  body: z.string().trim().min(20).max(1000),
});

export const discountCodeSchema = z.string().trim().min(3).max(32).transform((value) => value.toUpperCase());
