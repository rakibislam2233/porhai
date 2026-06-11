"use client";
import { Logo } from "@/components/Logo";
import { useUpload } from "@/hooks/useUpload";
import { authClient } from "@/lib/auth-client";
import {
  ArrowRight,
  Loader2,
  LogOut,
  Shield,
  ShieldCheck,
  Sparkles,
  Upload,
  User,
  Zap
} from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

export default function LandingPageClient() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // When upload is done, redirect to the chat page for the new document
  const { upload, uploading, progress, error, reset } = useUpload((documentId) => {
    router.push(`/chat/${documentId}`);
  });

  const handleUploadClick = () => {
    if (!session) {
      router.push("/login");
      return;
    }
    fileInputRef.current?.click();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (!session) {
      router.push("/login");
      return;
    }
    const file = e.dataTransfer.files?.[0];
    if (file && (file.type === "application/pdf" || file.name.endsWith(".pdf"))) {
      upload(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      upload(file);
    }
    // Reset input so same file can be re-selected if needed
    e.target.value = "";
  };

  const handleSignOut = async () => {
    await authClient.signOut();
  };

  // Determine the upload zone label based on current state
  const getUploadLabel = () => {
    if (uploading) {
      if (progress < 80) return "Uploading your PDF...";
      return "Starting document processing...";
    }
    if (isDragging) return "Drop your PDF here";
    return "Upload your PDF to begin";
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans selection:bg-cyan-100">
      <div className="relative z-10">
        {/* Navigation */}
        <nav className="container mx-auto px-6 py-6 flex items-center justify-between">
          <Logo height={40} />
          <div className="flex items-center space-x-4">
            {session ? (
              <>
                <Link href="/dashboard" className="text-sm font-medium text-slate-600 transition-colors">
                  Dashboard
                </Link>
                <div className="flex items-center space-x-3 border border-slate-200 rounded-lg px-3 py-1.5">
                  <div className="w-7 h-7 rounded-full bg-cyan-600 flex items-center justify-center text-white text-xs font-bold">
                    {session.user?.name?.charAt(0)?.toUpperCase() || <User size={14} />}
                  </div>
                  <span className="text-sm font-medium text-slate-700 hidden sm:block">
                    {session.user?.name || "User"}
                  </span>
                  <button onClick={handleSignOut} className="text-slate-400 p-1">
                    <LogOut size={14} />
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm font-medium text-slate-600 transition-colors">
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 rounded-lg bg-cyan-600 text-white text-sm font-medium transition-all"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </nav>

        {/* Hero Section */}
        <main className="container mx-auto px-6 pt-20 pb-16 text-center max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-700 text-sm font-semibold mb-8"
          >
            <Sparkles className="w-4 h-4" />
            <span>AI-Powered Document Intelligence</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
            className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6 leading-tight text-slate-900"
          >
            Unlock the knowledge <br className="hidden md:block" />
            hidden in your <span className="text-cyan-600">PDFs</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
            className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Upload any document, report, or book. Our advanced AI instantly reads, understands,
            and answers any question you have about your files.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
            className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 mb-16"
          >
            <Link
              href={session ? "/dashboard" : "/register"}
              className="group flex items-center justify-center space-x-2 px-8 py-3 rounded-lg bg-cyan-600 text-white font-semibold text-base transition-colors w-full sm:w-auto"
            >
              <span>Start Chatting Free</span>
              <ArrowRight className="w-4 h-4 transition-transform" />
            </Link>
            <Link
              href="#features"
              className="px-8 py-3 rounded-lg bg-white border border-slate-200 text-slate-700 text-base font-semibold transition-colors w-full sm:w-auto"
            >
              See how it works
            </Link>
          </motion.div>

          {/* Upload Zone */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
            className="max-w-3xl mx-auto"
          >
            <div
              className={`relative rounded-2xl transition-all duration-200 bg-white ${
                uploading
                  ? "border-2 border-dashed border-cyan-400 cursor-not-allowed"
                  : isDragging
                  ? "border-2 border-dashed border-cyan-600 bg-cyan-50 cursor-copy"
                  : "border-2 border-dashed border-slate-300 cursor-pointer"
              }`}
              onClick={!uploading ? handleUploadClick : undefined}
              onDragOver={!uploading ? handleDragOver : undefined}
              onDragLeave={!uploading ? handleDragLeave : undefined}
              onDrop={!uploading ? handleDrop : undefined}
            >
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".pdf,application/pdf"
                onChange={handleFileChange}
                disabled={uploading}
              />

              <div className="py-16 px-6 sm:px-12 text-center flex flex-col items-center justify-center">
                {/* Icon: spinner while uploading, upload icon otherwise */}
                <div className="w-16 h-16 rounded-xl bg-cyan-50 border border-cyan-100 flex items-center justify-center mb-6">
                  {uploading ? (
                    <Loader2 size={28} className="text-cyan-600 animate-spin" />
                  ) : (
                    <Upload size={28} className="text-cyan-600" />
                  )}
                </div>

                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  {getUploadLabel()}
                </h3>

                <p className="text-slate-600 text-sm mb-6">
                  {uploading ? (
                    <span className="text-cyan-600 font-medium">
                      Please wait, do not close this tab...
                    </span>
                  ) : session ? (
                    <>
                      Drag and drop your file, or{" "}
                      <span className="text-cyan-600 font-semibold">browse your computer</span>.
                    </>
                  ) : (
                    <>Sign in first to upload and chat with your PDFs.</>
                  )}
                </p>

                {/* Progress bar — only visible while uploading */}
                {uploading && (
                  <div className="w-full max-w-xs mx-auto mb-4">
                    <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-cyan-600 rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-400 mt-1.5">{progress}%</p>
                  </div>
                )}

                {/* Error message with retry option */}
                {error && (
                  <div className="mb-4 flex items-center space-x-2">
                    <p className="text-sm text-red-500">{error}</p>
                    <button
                      onClick={(e) => { e.stopPropagation(); reset(); }}
                      className="text-xs text-cyan-600 underline"
                    >
                      Try again
                    </button>
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-slate-500 bg-slate-50 py-2.5 px-5 rounded-lg border border-slate-200">
                  <span className="flex items-center space-x-1.5">
                    <ShieldCheck size={14} className="text-cyan-600" />
                    <span>Secure & Private</span>
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                  <span className="flex items-center space-x-1.5">
                    <Zap size={14} className="text-cyan-600" />
                    <span>Instant Analysis</span>
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300 hidden sm:block" />
                  <span className="hidden sm:block">Up to 50MB</span>
                </div>
              </div>
            </div>
          </motion.div>
        </main>

        {/* Features Section */}
        <section id="features" className="container mx-auto px-6 py-24 border-t border-slate-200 bg-white">
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                icon: <Zap className="w-5 h-5 text-cyan-600" />,
                title: "Lightning Fast Analysis",
                desc: "Powered by Cloudflare Hyperdrive and Neon DB. Your documents are indexed and ready to chat in milliseconds."
              },
              {
                icon: <Sparkles className="w-5 h-5 text-cyan-600" />,
                title: "Intelligent Extraction",
                desc: "We don't just search text. Our AI understands context, tables, and complex formatting perfectly."
              },
              {
                icon: <Shield className="w-5 h-5 text-cyan-600" />,
                title: "Secure by Design",
                desc: "Your data is encrypted and strictly private. Built with enterprise-grade Better Auth and Drizzle ORM."
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="p-6 rounded-2xl bg-slate-50 border border-slate-100"
              >
                <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold mb-2 text-slate-900">{feature.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}