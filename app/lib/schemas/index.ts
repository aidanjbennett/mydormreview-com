import { z } from 'zod'

export const signupFormSchema = z
  .object({
    name: z.string().min(1, 'Name is required'),
    email: z.email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    agreedToTerms: z.boolean()
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword']
  })
  .refine((data) => data.agreedToTerms === true, {
    message: 'You must agree to the terms',
    path: ['agreedToTerms']
  })

export const loginFormSchema = z.object({
  email: z.email('Please enter a valid email').min(1, 'Email is required'),
  password: z.string('Please enter a valid password').min(1, 'Password is required')
})
