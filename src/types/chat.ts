export interface PDFDocument {
  id: string;
  name: string;
  size: string;
  uploadedAt: string;
  pageCount: number | null;
  status: "uploading" | "processing" | "completed" | "failed";
  b2Url?: string;
}

export interface Message {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
  sources?: number[];
}
