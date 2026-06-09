import { useState } from "react";

interface UploadState {
  uploading: boolean;
  progress: number;
  error: string | null;
  documentId: string | null;
}

export function useUpload(onSuccess?: (documentId: string) => void) {
  const [state, setState] = useState<UploadState>({
    uploading: false,
    progress: 0,
    error: null,
    documentId: null,
  });

  const upload = async (file: File) => {
    if (!file || (file.type !== "application/pdf" && !file.name.endsWith(".pdf"))) {
      setState((prev) => ({ ...prev, error: "Only PDF files are allowed" }));
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setState((prev) => ({
        ...prev,
        error: "File size must be less than 50MB",
      }));
      return;
    }

    setState({ uploading: true, progress: 0, error: null, documentId: null });

    try {
      const formData = new FormData();
      formData.append("file", file);

      setState((prev) => ({ ...prev, progress: 15 }));

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      setState((prev) => ({ ...prev, progress: 85 }));

      const rawBody = await uploadRes.text();
      let data: { documentId?: string; error?: string } = {};

      if (rawBody) {
        try {
          data = JSON.parse(rawBody) as { documentId?: string; error?: string };
        } catch {
          throw new Error("Upload failed: invalid server response");
        }
      }

      if (!uploadRes.ok) {
        throw new Error(data.error || `Upload failed (${uploadRes.status})`);
      }

      if (!data.documentId) {
        throw new Error("Upload succeeded but no document ID was returned");
      }

      setState({
        uploading: false,
        progress: 100,
        error: null,
        documentId: data.documentId,
      });
      onSuccess?.(data.documentId);
    } catch (err: unknown) {
      let message = "Failed to upload document";
      if (err instanceof Error) {
        message =
          err.message === "Failed to fetch" || err.message.includes("fetch")
            ? "Network error while uploading. Please try again."
            : err.message;
      }
      setState((prev) => ({
        ...prev,
        uploading: false,
        error: message,
      }));
    }
  };

  const reset = () =>
    setState({ uploading: false, progress: 0, error: null, documentId: null });

  return { ...state, upload, reset };
}
