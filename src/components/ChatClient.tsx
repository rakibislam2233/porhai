"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import ChatPanel from '@/components/ChatPanel';
import { PDFDocument } from '@/types/chat';

export default function ChatClient() {
  const router = useRouter();
  const params = useParams();
  const docId = params?.id as string;
  
  // Simulated global state of docs (in a real app, this would be fetched from DB)
  const [documents] = useState<PDFDocument[]>([
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

  useEffect(() => {
    if (docId) {
      const doc = documents.find(d => d.id === docId);
      if (doc) {
        setActiveDoc(doc);
      } else if (docId.startsWith('pdf-')) {
        // Handling a newly uploaded doc simulation
        setActiveDoc({
          id: docId,
          name: 'Newly_Uploaded_Document.pdf',
          size: '1.2 MB',
          uploadedAt: 'Just now',
          pageCount: 12
        });
      } else {
        router.push('/dashboard');
      }
    }
  }, [docId, documents, router]);

  const handleBack = () => {
    router.push('/dashboard');
  };

  const handleSelectDoc = (doc: PDFDocument) => {
    router.push(`/chat/${doc.id}`);
  };

  if (!activeDoc) {
    return <div className="flex h-screen items-center justify-center bg-slate-50"><div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  return (
    <ChatPanel
      doc={activeDoc}
      onBack={handleBack}
      otherDocs={documents}
      onSelectDoc={handleSelectDoc}
    />
  );
}
