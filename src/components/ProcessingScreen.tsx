import { motion } from 'motion/react';
import { Loader2, Cpu, Database, Eye } from 'lucide-react';

interface ProcessingScreenProps {
  fileName: string;
}

export default function ProcessingScreen({ fileName }: ProcessingScreenProps) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-slate-800">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-100 p-8 text-center relative overflow-hidden">
        {/* Decorative background pulse elements */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-cyan-400 via-teal-500 to-cyan-500" />

        {/* Tech abstract icons floating around center animation */}
        <div className="relative h-32 w-32 mx-auto mb-6 flex items-center justify-center">
          {/* External circling pulse */}
          <motion.div
            className="absolute inset-0 rounded-full border border-cyan-100 bg-cyan-50/30"
            animate={{ scale: [1, 1.25, 1], opacity: [0.6, 0.2, 0.6] }}
            transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute w-24 h-24 rounded-full border border-teal-200 bg-teal-50/50"
            animate={{ scale: [1, 1.15, 1], opacity: [0.8, 0.4, 0.8] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut', delay: 0.2 }}
          />

          {/* Main animated loader */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
            className="relative z-10 text-cyan-600"
          >
            <Loader2 size={56} className="animate-spin" />
          </motion.div>
        </div>

        <motion.h2
          className="text-2xl font-bold tracking-tight text-slate-900 mb-2 font-sans"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          Processing PDF
        </motion.h2>

        <motion.p
          className="text-cyan-600 font-medium text-sm mb-4 truncate px-4 bg-cyan-50 py-1.5 rounded-full inline-block max-w-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {fileName}
        </motion.p>

        <p className="text-slate-500 text-sm font-normal mb-8 leading-relaxed max-w-sm mx-auto">
          Scanning pages, extracting paragraphs, and matching definitions. Please wait while we prepare your reading assistant...
        </p>

        {/* Dynamic status stepper representation to keep user engaged */}
        <div className="space-y-3 pt-4 border-t border-slate-100 text-left text-xs max-w-xs mx-auto">
          <div className="flex items-center space-x-3 text-slate-600">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-cyan-100 text-cyan-600 flex items-center justify-center font-semibold">1</span>
            <span className="truncate">Scanning document layout...</span>
            <span className="ml-auto text-teal-600 font-medium">Done</span>
          </div>
          <div className="flex items-center space-x-3 text-slate-600">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-cyan-100 text-cyan-500 flex items-center justify-center animate-pulse"><Cpu size={12} /></span>
            <span className="truncate text-slate-800 font-medium">Extracting readable text...</span>
            <span className="ml-auto text-slate-400">Loading...</span>
          </div>
          <div className="flex items-center space-x-3 text-slate-400">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center"><Database size={10} /></span>
            <span className="truncate">Setting up smart AI Assistant...</span>
            <span className="ml-auto">Pending</span>
          </div>
        </div>
      </div>
    </div>
  );
}
