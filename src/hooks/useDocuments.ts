"use client";
import { useState, useEffect } from "react";
import { PDFDocument } from "@/types/chat";

export function useDocuments() {
  const [documents, setDocuments] = useState<PDFDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/documents");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setDocuments(data.documents);
    } catch (err) {
      setError("Failed to load documents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  return { documents, loading, error, refetch: fetchDocuments };
}
