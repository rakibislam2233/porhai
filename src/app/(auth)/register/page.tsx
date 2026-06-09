"use client";

import { SocialLogin } from '@/components/SocialLogin'
import { FileText, Sparkles, ShieldCheck } from "lucide-react";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex w-full bg-slate-50 font-sans">
      {/* LEFT SIDE - Brand & Hero Graphic (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-cyan-600 relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjIiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] bg-repeat opacity-50" />

        <div className="relative z-10 w-full max-w-lg">
          <div className="flex items-center space-x-3 mb-10">
            <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center">
              <FileText className="w-6 h-6 text-cyan-600" />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">Porhai</span>
          </div>
          
          <h1 className="text-4xl font-extrabold text-white mb-6 leading-tight tracking-tight">
            Start chatting with<br />
            your PDFs today
          </h1>
          
          <p className="text-base text-cyan-50 mb-12 leading-relaxed">
            Join thousands of users who are already using AI to read, extract, and understand their complex documents faster.
          </p>

          <div className="bg-cyan-700 border border-cyan-500 rounded-xl p-5 max-w-md">
            <div className="flex text-amber-300 mb-2 space-x-1">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <p className="text-sm text-cyan-50 italic">"Porhai completely changed how I process research papers. I just upload them and ask questions. It's incredibly fast."</p>
            <p className="text-xs text-white font-semibold mt-3">— Dr. Sarah Jenkins, Researcher</p>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - Authentication Form (Responsive) */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 relative w-full lg:w-1/2 bg-white">
        <div className="lg:hidden flex items-center space-x-2 mb-10 absolute top-8 left-6">
          <div className="w-8 h-8 rounded-lg bg-cyan-600 flex items-center justify-center">
            <FileText className="w-4 h-4 text-white" />
          </div>
          <span className="text-xl font-bold text-slate-900 tracking-tight">Porhai</span>
        </div>

        <div className="w-full max-w-[400px] mx-auto z-10">
          <div className="text-center mb-8 mt-12 lg:mt-0">
            <div className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-700 text-xs font-bold tracking-wide uppercase mb-5">
              <Sparkles className="w-3 h-3 mr-1.5" />
              Get Started Free
            </div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">Create your account</h2>
            <p className="text-slate-600 text-sm">Join us instantly using your social profile</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-10">
            <SocialLogin type="register" />

            <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col items-center space-y-4">
              <div className="flex items-center text-xs text-slate-600 space-x-1.5 bg-slate-50 px-3 py-2 rounded-md border border-slate-200 w-full justify-center">
                <ShieldCheck className="w-4 h-4 text-cyan-600" />
                <span>We never post without your permission</span>
              </div>
              
              <p className="text-sm text-slate-600">
                Already have an account?{' '}
                <a href="/login" className="text-cyan-600 font-semibold transition-colors">
                  Sign in
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
