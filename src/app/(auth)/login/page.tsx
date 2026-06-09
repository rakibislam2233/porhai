"use client";

import { SocialLogin } from '@/components/SocialLogin'
import { FileText, Sparkles, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex w-full bg-slate-50 font-sans">
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
