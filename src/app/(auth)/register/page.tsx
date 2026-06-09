"use client";
import { SocialLogin } from "@/components/SocialLogin";
import { Logo } from "@/components/Logo";
import { Sparkles } from "lucide-react";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex w-full bg-slate-50 font-sans">
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 relative w-full lg:w-1/2 bg-white">
        <div className="lg:hidden absolute top-8 left-6">
          <Logo height={36} />
        </div>

        <div className="w-full max-w-[400px] mx-auto z-10">
          <div className="text-center mb-8 mt-12 lg:mt-0">
            <div className="hidden lg:flex justify-center mb-6">
              <Logo height={44} href="/" />
            </div>
            <div className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-700 text-xs font-bold tracking-wide uppercase mb-5">
              <Sparkles className="w-3 h-3 mr-1.5" />
              Get Started Free
            </div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">
              Create your account
            </h2>
            <p className="text-slate-600 text-sm">
              Join us instantly using your social profile
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-10">
            <SocialLogin type="register" />

            <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col items-center space-y-4">
              <p className="text-sm text-slate-600">
                Already have an account?{" "}
                <a
                  href="/login"
                  className="text-cyan-600 font-semibold transition-colors"
                >
                  Sign in
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
