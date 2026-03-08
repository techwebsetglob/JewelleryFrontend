import { z } from 'zod'

const safeString = (min, max) =>
  z.string()
    .min(min)
    .max(max)
    .refine(val => !/<[^>]*>/.test(val), 'HTML not allowed')
    .refine(val => !/[${}]/.test(val), 'Invalid characters')

export const loginSchema = z.object({
  email: z.string().email('Invalid email').max(254),
  password: z.string().min(6).max(128),
})

export const registerSchema = z.object({
  name: safeString(2, 50),
  email: z.string().email().max(254),
  password: z.string()
    .min(8, 'Minimum 8 characters')
    .max(128)
    .regex(/[A-Z]/, 'Must contain uppercase')
    .regex(/[0-9]/, 'Must contain a number')
    .regex(/[^A-Za-z0-9]/, 'Must contain a special character'),
  confirmPassword: z.string()
}).refine(d => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
})

export const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  title: safeString(1, 100),
  body: safeString(20, 1000),
})

export const checkoutSchema = z.object({
  firstName: safeString(1, 50),
  lastName: safeString(1, 50),
  email: z.string().email().max(254),
  address: safeString(5, 200),
  city: safeString(2, 100),
  country: safeString(2, 100),
  postalCode: z.string().regex(/^[A-Z0-9\s\-]{3,12}$/i, 'Invalid postal code'),
})

export const promoSchema = z.object({
  code: z.string()
    .min(3).max(20)
    .regex(/^[A-Z0-9\-]+$/i, 'Invalid promo code format')
})

export const profileSchema = z.object({
  displayName: safeString(2, 50),
  phoneNumber: z.string().regex(/^\+?[\d\s\-()]{7,20}$/).optional().or(z.literal('')),
  dob: z.string().optional(),
})

export const consultationSchema = z.object({
  name: safeString(2, 100),
  email: z.string().email().max(254),
  message: safeString(10, 2000),
})
