import { SocialLogin } from './social-login'

export function LoginPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Image/Brand */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-cyan-600 to-teal-700 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjIiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIvPjwvc3ZnPg==')] bg-repeat opacity-20" />

        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

        <div className="relative z-10 flex flex-col justify-between h-full p-16">
          <div>
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="text-2xl font-bold text-white tracking-tight">ChatWithPDF</span>
            </div>
            <h1 className="text-5xl font-bold text-white mb-4 leading-tight">
              Chat with your PDFs<br />intelligently
            </h1>
            <p className="text-lg text-cyan-100 max-w-md">
              Upload any PDF document and chat with our AI assistant. Get instant summaries, answers, and insights from your documents.
            </p>
          </div>

          <div className="flex items-center space-x-4 text-cyan-200/60 text-sm">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-cyan-600 bg-slate-200 overflow-hidden">
                  <img src={`https://ui-avatars.com/api/?name=User${i}&background=random`} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            <span>Trusted by 10,000+ users</span>
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 bg-slate-50">
        <div className="w-full max-w-md">
          <div className="text-center mb-8 lg:hidden">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-xl bg-cyan-600 flex items-center justify-center">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <h2 className="text-3xl font-bold text-slate-900">Welcome back</h2>
            <p className="text-slate-500 mt-2">Sign in to continue</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8">
            <div className="lg:hidden text-center mb-8">
              <SocialLogin type="login" />
            </div>

            <div className="hidden lg:block mb-6">
              <h2 className="text-3xl font-bold text-slate-900">Welcome back</h2>
              <p className="text-slate-500 mt-2">Sign in to your account</p>
            </div>

            <div className="lg:hidden">
              <SocialLogin type="login" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
