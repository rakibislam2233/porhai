"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Dashboard from '@/components/Dashboard';
import { PDFDocument } from '@/types/chat';

export default function DashboardClient() {
  const router = useRouter();
  
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

  const handleSelectDoc = (doc: PDFDocument) => {
    router.push(`/chat/${doc.id}`);
  };

  const handleDeleteDoc = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  };

  return (
    <Dashboard
      documents={documents}
      onSelectDoc={handleSelectDoc}
      onDeleteDoc={handleDeleteDoc}
    />
  );
}
