import React, { useRef, useState } from 'react';
import { motion } from 'motion/react';
import {
  Upload,
  FileText,
  ShieldCheck,
  Calendar,
  Layers,
  Search,
  Trash2,
  BookOpen,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { PDFDocument } from '@/types/chat';

interface DashboardProps {
  documents: PDFDocument[];
  onUpload: (file: File) => void;
  onSelectDoc: (doc: PDFDocument) => void;
  onDeleteDoc: (id: string) => void;
}

export default function Dashboard({ documents, onUpload, onSelectDoc, onDeleteDoc }: DashboardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        onUpload(file);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      onUpload(file);
    }
  };

  const handleZoneClick = () => {
    fileInputRef.current?.click();
  };

  const filteredDocs = documents.filter((doc) =>
    doc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* SaaS Top Header Section */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-600 flex items-center justify-center text-white font-black shadow-lg shadow-cyan-600/10">
              <FileText size={20} />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent font-sans">
                ChatWithPDF
              </span>
              <span className="ml-1.5 px-2 py-0.5 rounded-md bg-cyan-50 text-[10px] text-cyan-600 font-semibold tracking-wider uppercase">
                SaaS UI Edition
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center bg-cyan-50 border border-cyan-100/50 rounded-full px-3 py-1 font-mono text-xs text-cyan-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse mr-2" />
              Active Session: <strong className="ml-1 text-cyan-900 font-semibold">rakib</strong>
            </div>
          </div>
        </div>
      </header>

      {/* Main Workspace Frame */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-10 text-center sm:text-left">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center space-x-2 bg-slate-100 px-3 py-1.5 rounded-full text-xs text-slate-600 mb-4"
          >
            <Sparkles size={14} className="text-cyan-600" />
            <span>Chat with your brochures, manuals, and reports instantly</span>
          </motion.div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-950 font-sans sm:text-5xl">
            Smart Document Hub
          </h1>
          <p className="mt-3 text-slate-500 max-w-xl text-base leading-relaxed">
            Upload any PDF file, such as an instruction guide, contract, or textbook. Our friendly assistant will read it instantly so you can ask questions and write summaries.
          </p>
        </div>

        {/* Drag and Drop Box */}
        <motion.div
          whileHover={{ scale: 1.002 }}
          whileTap={{ scale: 0.998 }}
          className={`relative rounded-2xl cursor-pointer overflow-hidden transition-all duration-300 ${
            isDragging
              ? 'border-2 border-dashed border-cyan-600 bg-cyan-50/75 shadow-lg shadow-cyan-100'
              : 'border-2 border-dashed border-slate-200 bg-white hover:border-cyan-400 hover:shadow-xl hover:shadow-cyan-100/30'
          }`}
          onClick={handleZoneClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".pdf,application/pdf"
            onChange={handleFileChange}
          />

          <div className="p-10 sm:p-14 text-center">
            {/* Visual elements */}
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-cyan-50 flex items-center justify-center text-cyan-600">
              <Upload size={28} className="animate-bounce" />
            </div>

            <h3 className="text-lg font-bold text-slate-900">
              Upload PDF to AI Assistant
            </h3>
            <p className="mt-2 text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
              Drag and drop your PDF here, or <span className="text-cyan-600 font-semibold underline decoration-2 underline-offset-2">browse computer files</span>.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400 font-medium">
              <span className="flex items-center space-x-1">
                <ShieldCheck size={14} className="text-slate-400" />
                <span>Securely stored</span>
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-200" />
              <span>Max file size: 50MB</span>
            </div>
          </div>
        </motion.div>

        {/* PDF Document Grid */}
        <section className="mt-16">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-5 mb-8">
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-950 to-slate-800 bg-clip-text text-transparent">
                Your Saved Documents
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Select any saved document to start an interactive chat session with our AI assistant
              </p>
            </div>

            {/* Search inputs */}
            <div className="mt-4 sm:mt-0 relative w-full sm:w-72">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 pointer-events-none">
                <Search size={16} />
              </span>
              <input
                type="text"
                placeholder="Search saved PDFs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-sm pl-9 pr-4 py-2 border-slate-200 border rounded-xl bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
              />
            </div>
          </div>

          {filteredDocs.length === 0 ? (
            <div className="bg-white rounded-xl border border-dashed border-slate-200 p-12 text-center">
              <FileText size={40} className="mx-auto text-slate-300 mb-3" />
              <p className="text-slate-600 font-medium">No results found</p>
              <p className="text-slate-400 text-xs mt-1">Upload PDF files above to store your documents for chatting</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDocs.map((doc, idx) => (
                <motion.div
                  key={doc.id}
                  layoutId={`doc-card-${doc.id}`}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="group relative bg-white rounded-2xl border border-slate-100 hover:border-cyan-100 hover:shadow-xl hover:shadow-cyan-500/5 transition-all duration-300 overflow-hidden"
                >
                  {/* Premium color bar on top */}
                  <div className="h-1 bg-gradient-to-r from-cyan-400 to-teal-500" />

                  <div className="p-6">
                    {/* Document title & icon */}
                    <div className="flex items-start justify-between">
                      <div className="p-3 bg-cyan-50 text-cyan-600 rounded-xl group-hover:bg-cyan-600 group-hover:text-white transition-colors duration-300">
                        <FileText size={22} />
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteDoc(doc.id);
                        }}
                        className="text-slate-300 hover:text-rose-500 p-1.5 hover:bg-rose-50 rounded-lg transition-all"
                        title="Delete Document"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="mt-5">
                      <h3 className="font-bold text-slate-900 group-hover:text-cyan-700 transition-colors duration-200 text-base line-clamp-1">
                        {doc.name}
                      </h3>

                      <div className="mt-4 grid grid-cols-2 gap-y-3 gap-x-2 text-xs text-slate-500 border-t border-slate-100 pt-4">
                        <div className="flex items-center space-x-1.5">
                          <Layers size={14} className="text-slate-400" />
                          <span>{doc.pageCount} Pages</span>
                        </div>
                        <div className="flex items-center space-x-1.5">
                          <BookOpen size={14} className="text-slate-400" />
                          <span>{doc.size}</span>
                        </div>
                        <div className="col-span-2 flex items-center space-x-1.5 mt-1 text-[11px] text-slate-400">
                          <Calendar size={13} />
                          <span>{doc.uploadedAt}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between group-hover:bg-cyan-50/50 transition-colors">
                    <button
                      onClick={() => onSelectDoc(doc)}
                      className="text-cyan-600 text-xs font-semibold flex items-center space-x-1 focus:outline-none"
                    >
                      <span>Start Chatting</span>
                    </button>
                    <ChevronRight size={14} className="text-slate-400 group-hover:text-cyan-600 group-hover:translate-x-0.5 transition-all duration-300" />
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
