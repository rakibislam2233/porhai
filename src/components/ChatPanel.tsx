"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft,
  Send,
  FileText,
  BookOpen,
  Search,
  Trash2,
  Clock,
  Layers,
  Bot,
  Copy,
  Check,
  Download,
  Menu,
  X,
} from "lucide-react";
import { PDFDocument, Message } from "@/types/chat";

interface ChatPanelProps {
  doc: PDFDocument;
  onBack: () => void;
  otherDocs: PDFDocument[];
  onSelectDoc: (doc: PDFDocument) => void;
}

export default function ChatPanel({
  doc,
  onBack,
  otherDocs,
  onSelectDoc,
}: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const sampleSuggestions = [
    {
      text: "Summarize insights",
      query: "Summarize the key insights of this document.",
    },
    {
      text: "List statistics",
      query:
        "Are there any critical metrics or statistics in this PDF? List them.",
    },
    {
      text: "Core lessons",
      query: "What are the core lessons or recommendations presented?",
    },
  ];

  useEffect(() => {
    setMessages([
      {
        id: "welcome",
        sender: "assistant",
        text: `Hello! I have completed processing **${doc.name}** (${doc.size}, ${doc.pageCount} pages). \n\nFeel free to ask me anything about the contents, ask for a quick summary, or check specific figures. I will fetch the matching answers from the document instantly!`,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ]);
  }, [doc]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isTyping) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsTyping(true);

    try {
      const res = await fetch("/api/chat/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: textToSend,
          documentId: doc.id,
          history: messages.slice(-6).map((m) => ({
            role: m.sender === "user" ? "user" : "assistant",
            content: m.text,
          })),
        }),
      });

      const data = await res.json();

      const botMsg: Message = {
        id: `assistant-${Date.now()}`,
        sender: "assistant",
        text: data.answer,
        sources: data.sources, // page numbers
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          sender: "assistant",
          text: "Something went wrong. Please try again later.",
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownloadTranscript = () => {
    const header = `Chat Transcript with PDF Assistant\nDocument: ${doc.name}\nDate: ${new Date().toLocaleDateString()}\n\n========================================\n\n`;
    const body = messages
      .map(
        (m) =>
          `[${m.timestamp}] ${m.sender === "user" ? "User" : "AI Assistant"}:\n${m.text}\n`,
      )
      .join("\n---\n\n");
    const element = document.createElement("a");
    const file = new Blob([header + body], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `${doc.name.replace(/\.pdf$/i, "")}_transcript.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleClearHistory = () => {
    if (
      window.confirm(
        "Are you sure you want to clear your conversation history?",
      )
    ) {
      setMessages([
        {
          id: "welcome",
          sender: "assistant",
          text: `Chat history cleared! Ask me anything about **${doc.name}**.`,
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans">
      {/* LEFT SIDEBAR */}
      <AnimatePresence>
        {(isSidebarOpen ||
          (typeof window !== "undefined" && window.innerWidth >= 1024)) && (
          <>
            {isSidebarOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsSidebarOpen(false)}
                className="fixed inset-0 bg-slate-900/40 z-40 lg:hidden"
              />
            )}

            <motion.aside
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed lg:static inset-y-0 left-0 w-80 bg-white border-r border-slate-200 flex flex-col h-full z-50 flex-shrink-0"
            >
              <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                <button
                  onClick={onBack}
                  className="flex items-center space-x-2 text-slate-600 font-semibold text-sm transition-colors"
                >
                  <div className="p-1.5 rounded-md transition-colors">
                    <ArrowLeft size={16} />
                  </div>
                  <span>Dashboard</span>
                </button>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="lg:hidden p-1.5 text-slate-400 rounded-md"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-5 border-b border-slate-200 bg-slate-50">
                <div className="flex items-start space-x-3 mb-4">
                  <div className="p-2.5 bg-cyan-600 text-white rounded-lg">
                    <FileText size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3
                      className="text-sm font-bold text-slate-900 line-clamp-2 leading-tight"
                      title={doc.name}
                    >
                      {doc.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                      ID: {doc.id.slice(0, 8)}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 bg-white border border-slate-200 rounded-lg p-3 text-xs font-medium text-slate-700">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 flex items-center">
                      <Layers size={14} className="mr-1.5" /> Pages
                    </span>
                    <span>{doc.pageCount}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 flex items-center">
                      <BookOpen size={14} className="mr-1.5" /> Size
                    </span>
                    <span>{doc.size}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                    <span className="text-slate-500">Status</span>
                    <span className="text-cyan-600 font-semibold flex items-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 mr-1.5" />{" "}
                      Analyzed
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Other Documents
                  </h4>
                  <div className="space-y-1">
                    {otherDocs.filter((d) => d.id !== doc.id).length === 0 ? (
                      <div className="text-xs text-slate-400 bg-slate-50 p-3 rounded-lg text-center border border-dashed border-slate-200">
                        No other PDFs found
                      </div>
                    ) : (
                      otherDocs
                        .filter((d) => d.id !== doc.id)
                        .map((d) => (
                          <button
                            key={d.id}
                            onClick={() => {
                              onSelectDoc(d);
                              setIsSidebarOpen(false);
                            }}
                            className="w-full text-left p-2.5 rounded-lg border border-transparent transition-all flex items-center space-x-2 text-sm text-slate-700 group"
                          >
                            <div className="p-1.5 bg-slate-100 rounded-md group-">
                              <FileText
                                size={14}
                                className="text-slate-500 group-"
                              />
                            </div>
                            <span className="truncate flex-1 font-medium">
                              {d.name}
                            </span>
                          </button>
                        ))
                    )}
                  </div>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* CHAT PANEL - Now Takes Full Width */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative bg-white">
        {/* Header */}
        <div className="px-5 py-3 lg:py-4 bg-white border-b border-slate-200 flex items-center justify-between z-10">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 text-slate-600 rounded-md"
            >
              <Menu size={20} />
            </button>
            <h2 className="text-sm lg:text-base font-bold text-slate-900 flex items-center space-x-2">
              <Bot size={20} className="text-cyan-600" />
              <span>AI Assistant</span>
            </h2>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={handleDownloadTranscript}
              className="text-slate-500 p-1.5 lg:p-2 rounded-md transition-colors"
              title="Download Transcript"
            >
              <Download size={18} />
            </button>
            <div className="w-px h-4 bg-slate-200 mx-1" />
            <button
              onClick={handleClearHistory}
              className="text-slate-500 p-1.5 lg:p-2 rounded-md transition-colors"
              title="Clear Chat"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto px-4 lg:px-8 py-6 space-y-6">
          <div className="max-w-4xl mx-auto space-y-6">
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`flex space-x-3 max-w-[85%] lg:max-w-[75%] ${msg.sender === "user" ? "flex-row-reverse space-x-reverse" : "flex-row"}`}
                  >
                    {msg.sender === "assistant" && (
                      <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg bg-cyan-600 text-white flex items-center justify-center flex-shrink-0 mt-1">
                        <Bot size={20} />
                      </div>
                    )}
                    <div>
                      <div
                        className={`px-5 py-4 text-sm lg:text-base leading-relaxed ${
                          msg.sender === "user"
                            ? "bg-cyan-600 text-white rounded-2xl rounded-tr-sm"
                            : "bg-white text-slate-800 rounded-2xl rounded-tl-sm border border-slate-200"
                        }`}
                      >
                        <div className="space-y-3">
                          {msg.text.split("\n\n").map((paragraph, pIdx) => {
                            if (paragraph.startsWith("###"))
                              return (
                                <h4
                                  key={pIdx}
                                  className="font-bold text-slate-900 text-base mb-1"
                                >
                                  {paragraph.replace("###", "").trim()}
                                </h4>
                              );
                            if (
                              paragraph.startsWith("*") ||
                              paragraph.startsWith("-")
                            ) {
                              return (
                                <ul
                                  key={pIdx}
                                  className="list-disc pl-5 space-y-1 my-2"
                                >
                                  {paragraph.split("\n").map((line, lIdx) => (
                                    <li key={lIdx}>
                                      {line
                                        .replace(/^[\s*-]+/, "")
                                        .trim()
                                        .split("**")
                                        .map((chunk, cIdx) => {
                                          if (cIdx % 2 === 1)
                                            return (
                                              <strong
                                                key={cIdx}
                                                className={
                                                  msg.sender === "user"
                                                    ? "text-white font-bold"
                                                    : "text-slate-900 font-bold"
                                                }
                                              >
                                                {chunk}
                                              </strong>
                                            );
                                          return chunk;
                                        })}
                                    </li>
                                  ))}
                                </ul>
                              );
                            }
                            return (
                              <p key={pIdx} className={pIdx > 0 ? "mt-3" : ""}>
                                {paragraph
                                  .split("**")
                                  .map((chunk, chunkIdx) => {
                                    if (chunkIdx % 2 === 1)
                                      return (
                                        <strong
                                          key={chunkIdx}
                                          className={
                                            msg.sender === "user"
                                              ? "text-white"
                                              : "text-slate-900 font-semibold"
                                          }
                                        >
                                          {chunk}
                                        </strong>
                                      );
                                    return chunk;
                                  })}
                              </p>
                            );
                          })}
                        </div>
                        {msg.sender === "assistant" && (
                          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                            <button
                              onClick={() => handleCopyText(msg.text, msg.id)}
                              className="text-slate-400 flex items-center space-x-1 text-xs font-medium bg-slate-50 px-2 py-1 rounded-md transition-colors"
                            >
                              {copiedId === msg.id ? (
                                <>
                                  <Check
                                    size={14}
                                    className="text-emerald-500"
                                  />
                                  <span>Copied!</span>
                                </>
                              ) : (
                                <>
                                  <Copy size={14} />
                                  <span>Copy</span>
                                </>
                              )}
                            </button>
                            {msg.sources && msg.sources.length > 0 && (
                              <div className="flex items-center space-x-1 flex-wrap">
                                <span className="text-slate-400 text-xs">
                                  Sources:
                                </span>
                                {msg.sources.map((page) => (
                                  <span
                                    key={page}
                                    className="text-xs bg-cyan-50 text-cyan-600 border border-cyan-100 px-2 py-0.5 rounded font-medium"
                                  >
                                    p.{page}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <div
                        className={`text-[11px] text-slate-400 mt-1.5 px-1 flex items-center space-x-1 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <span>{msg.timestamp}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex space-x-3 max-w-4xl mx-auto w-full"
                >
                  <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg bg-cyan-600 text-white flex items-center justify-center mt-1">
                    <Bot size={20} />
                  </div>
                  <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-5 py-4 flex items-center space-x-1.5">
                    <span
                      className="w-2 h-2 rounded-full bg-cyan-600 animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    />
                    <span
                      className="w-2 h-2 rounded-full bg-cyan-600 animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <span
                      className="w-2 h-2 rounded-full bg-cyan-600 animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} className="h-4" />
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 lg:p-6 bg-white border-t border-slate-200 z-20">
          <div className="max-w-4xl mx-auto space-y-3">
            {messages.length === 1 && (
              <div className="flex flex-wrap gap-2">
                {sampleSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSendMessage(suggestion.query)}
                    className="text-xs lg:text-sm bg-white border border-slate-200 text-slate-600 px-3 py-1.5 lg:px-4 lg:py-2 rounded-lg transition-colors font-medium"
                  >
                    {suggestion.text}
                  </button>
                ))}
              </div>
            )}
            <div className="relative flex items-end bg-white border border-slate-300 rounded-xl p-1.5 focus-within:border-cyan-600 focus-within:ring-2 focus-within:ring-cyan-600/20 transition-all">
              <textarea
                rows={1}
                placeholder="Message AI Assistant about this document..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(inputText);
                  }
                }}
                disabled={isTyping}
                className="flex-1 max-h-32 min-h-[44px] bg-transparent text-slate-900 placeholder-slate-400 text-sm lg:text-base px-4 py-3 focus:outline-none resize-none disabled:opacity-50"
              />
              <button
                onClick={() => handleSendMessage(inputText)}
                disabled={!inputText.trim() || isTyping}
                className="m-1 w-10 h-10 lg:w-12 lg:h-12 rounded-lg bg-cyan-600 text-white disabled:bg-slate-200 disabled:text-slate-400 flex items-center justify-center transition-colors flex-shrink-0"
              >
                <Send size={18} className="ml-0.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
