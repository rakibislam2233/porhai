export type PDFDocument = {
  id: string;
  name: string;
  size: string;
  pageCount: number;
  status: "uploading" | "processing" | "completed" | "failed";
  createdAt: string;
};

export type Message = {
  id: string;
  sender: "user" | "assistant";
  text: string;
  sources?: number[];
  timestamp: string;
};

export type ChatAnswerResponse = {
  answer: string;
  sources: number[];
};

export type DocumentsResponse = {
  documents: PDFDocument[];
};

export type ChatSessionResponse = {
  session: {
    id: string;
    messages: {
      id: string;
      role: "user" | "assistant";
      content: string;
      sources: number[] | null;
      createdAt: string;
    }[];
  } | null;
};
