"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import ChatPanel from "@/components/ChatPanel";
import { PDFDocument } from "@/types/chat";
import { useDocuments } from "@/hooks/useDocuments";

export default function ChatClient() {
  const router = useRouter();
  const params = useParams();
  const docId = params?.id as string;
  const { documents, loading } = useDocuments();
  const [activeDoc, setActiveDoc] = useState<PDFDocument | null>(null);

  useEffect(() => {
    if (!loading && docId) {
      const doc = documents.find((d) => d.id === docId);
      if (doc) {
        setActiveDoc(doc);
      } else {
        router.push("/dashboard");
      }
    }
  }, [docId, documents, loading, router]);

  if (loading || !activeDoc) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <ChatPanel
      doc={activeDoc}
      onBack={() => router.push("/dashboard")}
      otherDocs={documents}
      onSelectDoc={(doc) => router.push(`/chat/${doc.id}`)}
    />
  );
}