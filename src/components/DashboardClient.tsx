"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Dashboard from '@/components/Dashboard';
import { PDFDocument, DocumentsResponse } from '@/types/chat';

export default function DashboardClient() {
  const router = useRouter();
  const [documents, setDocuments] = useState<PDFDocument[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUserDocuments() {
      try {
        setLoading(true);
        const response = await fetch('/api/documents'); 
        
        if (!response.ok) {
          throw new Error('Failed to fetch real time database documents');
        }
        const data = (await response.json()) as DocumentsResponse;
        
        if (data && Array.isArray(data.documents)) {
          const mappedDocs = data.documents.map(doc => ({
            ...doc,
            uploadedAt: doc.createdAt || new Date(doc.createdAt).toLocaleDateString()
          })) as unknown as PDFDocument[];

          setDocuments(mappedDocs);
        }
      } catch (err: any) {
        console.error("🔴 Dashboard Data Fetching Error:", err);
        setError(err.message || 'Something went wrong while fetching data');
      } finally {
        setLoading(false);
      }
    }

    fetchUserDocuments();
  }, []);

  const handleSelectDoc = (doc: PDFDocument) => {
    router.push(`/chat/${doc.id}`);
  };

  const handleDeleteDoc = async (id: string) => {
    const previousDocs = [...documents];
    setDocuments((prev) => prev.filter((d) => d.id !== id));

    try {
      const response = await fetch(`/api/documents/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Backend failed to process deletion request');
      }
      console.log(`✨ Document ${id} securely wiped out from cloud data store.`);
    } catch (err) {
      console.error("🔴 Deletion failed, rolling back UI snapshot:", err);
      setDocuments(previousDocs);
      alert('Could not delete document. Rolled back state change.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-slate-500">Loading your synchronized data shelf...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="bg-white p-6 rounded-xl border border-red-200 text-center max-w-sm">
          <p className="text-red-600 font-bold mb-1">Data Fetch Failed</p>
          <p className="text-slate-500 text-xs mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-lg text-xs border border-slate-200"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <Dashboard
      documents={documents as any}
      onSelectDoc={handleSelectDoc}
      onDeleteDoc={handleDeleteDoc}
    />
  );
}