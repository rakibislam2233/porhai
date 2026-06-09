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
    if (!file || file.type !== "application/pdf") {
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
      // Step 1: Get presigned URL from our API
      setState((prev) => ({ ...prev, progress: 10 }));
      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          fileSize: file.size,
        }),
      });

      console.log("Upload Response", uploadRes);

      if (!uploadRes.ok) throw new Error("Failed to initiate upload");
      const { presignedUrl, documentId } = (await uploadRes.json()) as {
        presignedUrl: string;
        documentId: string;
      };

      console.log("Presigned URL:", presignedUrl);
      // Step 2: Backblaze এ directly upload
      setState((prev) => ({ ...prev, progress: 30 }));
      const b2Res = await fetch(presignedUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": "application/pdf" },
      });

      console.log("Backblaze Response", b2Res);

      if (!b2Res.ok) throw new Error("Failed to upload file to storage");

      setState((prev) => ({ ...prev, progress: 80 }));

      // Step 3: confirm uploadation to our API
      const confirmRes = await fetch("/api/upload/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId }),
      });

      if (!confirmRes.ok)
        throw new Error("Failed to initiate document processing");

      setState({ uploading: false, progress: 100, error: null, documentId });
      onSuccess?.(documentId);
    } catch (err: any) {
      setState((prev) => ({
        ...prev,
        uploading: false,
        error: err.message || "Failed to upload document",
      }));
    }
  };

  const reset = () =>
    setState({ uploading: false, progress: 0, error: null, documentId: null });

  return { ...state, upload, reset };
}
