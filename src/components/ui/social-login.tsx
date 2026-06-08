"use client"

import { useState } from 'react'
import { motion } from 'motion/react'
import { Loader2, Google, Github, Fingerprint, Mail } from 'lucide-react'
import { Button } from './button'

interface SocialLoginProps {
  provider: 'google' | 'github' | 'email'
  label: string
  icon: React.ReactNode
  onClick: () => void
  isLoading?: boolean
}

function SocialLoginButton({ provider, label, icon, onClick, isLoading }: SocialLoginProps) {
  const [isAnimating, setIsAnimating] = useState(false)

  const handleClick = () => {
    if (isLoading) return
    setIsAnimating(true)
    onClick()
    setTimeout(() => setIsAnimating(false), 300)
  }

  return (
    <Button
      variant="outline"
      className="w-full h-11 relative overflow-hidden group transition-all duration-200 hover:shadow-md hover:shadow-cyan-500/20"
      onClick={handleClick}
      disabled={isLoading}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
      {isLoading ? (
        <Loader2 className="w-5 h-5 animate-spin text-cyan-600" />
      ) : (
        <div className="flex items-center justify-center space-x-3 relative z-10">
          {icon}
          <span className="font-medium text-sm text-slate-700 group-hover:text-cyan-700 transition-colors">
            {label}
          </span>
        </div>
      )}
    </Button>
  )
}

export function SocialLogin({ type = 'login' }: { type?: 'login' | 'register' }) {
  const [isLoading, setIsLoading] = useState(false)

  const handleSocialLogin = async (provider: string) => {
    setIsLoading(true)
    // Social login logic would go here
    console.log(`Social login with ${provider}`)

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))

    setIsLoading(false)
    // In a real app, this would redirect to dashboard
  }

  const handleEmailLogin = async () => {
    setIsLoading(true)
    // Email login logic would go here
    console.log('Email login')
    await new Promise(resolve => setTimeout(resolve, 1500))
    setIsLoading(false)
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-4 text-slate-400 font-medium">
            Continue with
          </span>
        </div>
      </div>

      <div className="space-y-3">
        <SocialLoginButton
          provider="google"
          label={type === 'login' ? 'Sign in with Google' : 'Sign up with Google'}
          icon={<Google className="w-5 h-5 text-red-500" />}
          onClick={() => handleSocialLogin('google')}
          isLoading={isLoading}
        />

        <SocialLoginButton
          provider="github"
          label={type === 'login' ? 'Sign in with GitHub' : 'Sign up with GitHub'}
          icon={<Github className="w-5 h-5 text-slate-700" />}
          onClick={() => handleSocialLogin('github')}
          isLoading={isLoading}
        />

        <SocialLoginButton
          provider="email"
          label={type === 'login' ? 'Sign in with Email' : 'Sign up with Email'}
          icon={<Mail className="w-5 h-5 text-cyan-600" />}
          onClick={handleEmailLogin}
          isLoading={isLoading}
        />
      </div>

      <div className="text-center mt-4">
        <p className="text-xs text-slate-400">
          By continuing, you agree to our{' '}
          <a href="#" className="text-cyan-600 hover:text-cyan-700 underline">Terms of Service</a>
          {' '}and{' '}
          <a href="#" className="text-cyan-600 hover:text-cyan-700 underline">Privacy Policy</a>
        </p>
      </div>
    </div>
  )
}
