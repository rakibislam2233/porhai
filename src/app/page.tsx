"use client"

import React, { useState } from 'react';
import { PDFDocument } from '@/types/chat';
import Dashboard from '@/components/Dashboard';
import ProcessingScreen from '@/components/ProcessingScreen';
import ChatPanel from '@/components/ChatPanel';

type ViewState = 'dashboard' | 'processing' | 'chat';

export default function MainPage() {
  const [view, setView] = useState<ViewState>('dashboard');
  const [documents, setDocuments] = useState<PDFDocument[]>([
    {
      id: 'doc-1',
      name: 'AI_Agents_Architectural_Design_Patterns_2026.pdf',
      size: '2.4 MB',
      uploadedAt: 'Active session',
      pageCount: 16
    },
    {
      id: 'doc-2',
      name: 'Global_SaaS_User_Retention_Benchmark_Q2.pdf',
      size: '1.8 MB',
      uploadedAt: '3 hours ago',
      pageCount: 24
    },
    {
      id: 'doc-3',
      name: 'Vite_HMR_Latency_Under_Isolated_Containers.pdf',
      size: '954 KB',
      uploadedAt: '1 day ago',
      pageCount: 10
    }
  ]);
  const [activeDoc, setActiveDoc] = useState<PDFDocument | null>(null);
  const [processingFileName, setProcessingFileName] = useState('');

  // Simulator for file upload
  const handleUploadFile = (file: File) => {
    // Generate page counts randomly for mockup
    const pageCount = Math.floor(Math.random() * 25) + 5;

    // Convert byte length to readable format
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(1);
    const sizeLabel = parseFloat(sizeInMB) > 0 ? `${sizeInMB} MB` : `${(file.size / 1024).toFixed(0)} KB`;

    setProcessingFileName(file.name);
    setView('processing');

    // Simulate 3-seconds extraction process
    setTimeout(() => {
      const newDoc: PDFDocument = {
        id: `pdf-${Date.now()}`,
        name: file.name,
        size: sizeLabel,
        uploadedAt: 'Just now',
        pageCount: pageCount
      };

      setDocuments((prev) => [newDoc, ...prev]);
      setActiveDoc(newDoc);
      setView('chat');
    }, 3000);
  };

  const handleSelectDoc = (doc: PDFDocument) => {
    setActiveDoc(doc);
    setView('chat');
  };

  const handleDeleteDoc = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
    if (activeDoc?.id === id) {
      setActiveDoc(null);
      setView('dashboard');
    }
  };

  const handleBackToDashboard = () => {
    setView('dashboard');
    setActiveDoc(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 antialiased selection:bg-cyan-100 selection:text-cyan-800">
      {view === 'dashboard' && (
        <Dashboard
          documents={documents}
          onUpload={handleUploadFile}
          onSelectDoc={handleSelectDoc}
          onDeleteDoc={handleDeleteDoc}
        />
      )}

      {view === 'processing' && (
        <ProcessingScreen fileName={processingFileName} />
      )}

      {view === 'chat' && activeDoc && (
        <ChatPanel
          doc={activeDoc}
          onBack={handleBackToDashboard}
          otherDocs={documents}
          onSelectDoc={handleSelectDoc}
        />
      )}
    </div>
  );
}
