export interface PDFDocument {
  id: string;
  name: string;
  size: string;
  uploadedAt: string;
  pageCount: number;
}

export interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}
