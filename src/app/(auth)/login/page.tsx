"use client";

import { SocialLogin } from '@/components/SocialLogin'
import { FileText, Sparkles, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex w-full bg-slate-50 font-sans">
      {/* LEFT SIDE - Brand & Hero Graphic (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-cyan-600 relative overflow-hidden items-center justify-center p-12">
        {/* Subtle patterned overlay (not gradient) */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjIiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] bg-repeat opacity-50" />

        <div className="relative z-10 w-full max-w-lg">
          <div className="flex items-center space-x-3 mb-10">
            <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center">
              <FileText className="w-6 h-6 text-cyan-600" />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">Porhai</span>
          </div>

          <h1 className="text-4xl font-extrabold text-white mb-6 leading-tight tracking-tight">
            Unlock the knowledge<br />
            hidden in your PDFs
          </h1>

          <p className="text-base text-cyan-50 mb-12 leading-relaxed">
            Welcome back to your AI-powered document workspace. Sign in to continue analyzing, summarizing, and chatting with your files instantly.
          </p>

          <div className="flex items-center space-x-4 bg-cyan-700 p-4 rounded-xl w-max">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-cyan-700 bg-white overflow-hidden">
                  <img src={`https://ui-avatars.com/api/?name=User${i}&background=random`} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            <div className="text-sm">
              <p className="text-white font-semibold">Join 10,000+ users</p>
              <p className="text-cyan-200">Working smarter every day</p>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - Authentication Form (Responsive) */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 relative w-full lg:w-1/2 bg-white">
        {/* Mobile Header (Only visible on small screens) */}
        <div className="lg:hidden flex items-center space-x-2 mb-10 absolute top-8 left-6">
          <div className="w-8 h-8 rounded-lg bg-cyan-600 flex items-center justify-center">
            <FileText className="w-4 h-4 text-white" />
          </div>
          <span className="text-xl font-bold text-slate-900 tracking-tight">Porhai</span>
        </div>

        <div className="w-full max-w-[400px] mx-auto z-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-700 text-xs font-bold tracking-wide uppercase mb-5">
              <Sparkles className="w-3 h-3 mr-1.5" />
              Welcome Back
            </div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">Sign in to your account</h2>
            <p className="text-slate-600 text-sm">Choose your preferred provider below</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-10">
            <SocialLogin type="login" />

            <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col items-center space-y-4">
              <div className="flex items-center text-xs text-slate-500 space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-cyan-600" />
                <span>Secure, passwordless authentication</span>
              </div>

              <p className="text-sm text-slate-600">
                Don't have an account?{' '}
                <a href="/register" className="text-cyan-600 font-semibold transition-colors">
                  Create one now
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
