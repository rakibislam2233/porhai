"use client"

import { useState } from 'react'
import { motion } from 'motion/react'
import { Mail, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { Button } from './button'
import { Input } from './input'
import { Label } from './label'
import { Form, FormItem, FormMessage } from './form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type LoginFormData = z.infer<typeof loginSchema>
type RegisterFormData = z.infer<typeof registerSchema>

interface AuthFormProps {
  type: 'login' | 'register'
  onSubmit?: (data: LoginFormData | RegisterFormData) => void
}

export function AuthForm({ type, onSubmit }: AuthFormProps) {
  const [showPassword, setShowPassword] = useState(false)

  const form = useForm<LoginFormData | RegisterFormData>({
    resolver: zodResolver(type === 'login' ? loginSchema : registerSchema),
    defaultValues: type === 'login' ? { email: '', password: '' } : { name: '', email: '', password: '', confirmPassword: '' },
  })

  const handleSubmit = (data: LoginFormData | RegisterFormData) => {
    if (onSubmit) {
      onSubmit(data)
    } else {
      console.log('Form submitted:', data)
    }
  }

  return (
    <div className="mt-8">
      <Form>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          {type === 'register' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-2"
            >
              <FormItem>
                <Label className="text-sm font-medium text-slate-700">Full Name</Label>
                <Input
                  placeholder="John Doe"
                  {...form.register('name')}
                  className="h-11 border-slate-200 focus:border-cyan-500 focus:ring-cyan-500"
                />
                {(form.formState.errors as any).name && (
                  <FormMessage className="text-xs">
                    {(form.formState.errors as any).name.message as string}
                  </FormMessage>
                )}
              </FormItem>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-2"
          >
            <FormItem>
              <Label className="text-sm font-medium text-slate-700">Email</Label>
              <div className="relative">
                <Input
                  type="email"
                  placeholder="name@example.com"
                  {...form.register('email')}
                  className="h-11 border-slate-200 focus:border-cyan-500 focus:ring-cyan-500 pl-10"
                />
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              </div>
              {form.formState.errors.email && (
                <FormMessage className="text-xs">
                  {form.formState.errors.email.message as string}
                </FormMessage>
              )}
            </FormItem>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-2"
          >
            <FormItem>
              <Label className="text-sm font-medium text-slate-700">Password</Label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  {...form.register('password')}
                  className="h-11 border-slate-200 focus:border-cyan-500 focus:ring-cyan-500 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {form.formState.errors.password && (
                <FormMessage className="text-xs">
                  {form.formState.errors.password.message as string}
                </FormMessage>
              )}
            </FormItem>
          </motion.div>

          {type === 'register' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-2"
            >
              <FormItem>
                <Label className="text-sm font-medium text-slate-700">Confirm Password</Label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  {...form.register('confirmPassword')}
                  className="h-11 border-slate-200 focus:border-cyan-500 focus:ring-cyan-500"
                />
                {(form.formState.errors as any).confirmPassword && (
                  <FormMessage className="text-xs">
                    {(form.formState.errors as any).confirmPassword.message as string}
                  </FormMessage>
                )}
              </FormItem>
            </motion.div>
          )}

          {type === 'login' && (
            <div className="flex justify-end">
              <a href="/register" className="text-xs text-cyan-600 hover:text-cyan-700 font-medium">
                Forgot password?
              </a>
            </div>
          )}

          <Button
            type="submit"
            className="w-full h-11 bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800 text-white shadow-lg shadow-cyan-600/20"
          >
            {type === 'login' ? 'Sign In' : 'Create Account'}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </form>
      </Form>

      <div className="mt-6 text-center">
        <p className="text-xs text-slate-500">
          {type === 'login' ? "Don't have an account? " : "Already have an account? "}
          <a href={type === 'login' ? '/register' : '/login'} className="text-cyan-600 hover:text-cyan-700 font-medium">
            {type === 'login' ? 'Sign up' : 'Sign in'}
          </a>
        </p>
      </div>
    </div>
  )
}
