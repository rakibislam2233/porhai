import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  Send,
  FileText,
  HelpCircle,
  BookOpen,
  Search,
  Trash2,
  Sparkles,
  Clock,
  Layers,
  Bot,
  Copy,
  Check,
  Download,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  FileDown,
  Info
} from 'lucide-react';
import { PDFDocument, Message } from '@/types/chat';

interface ChatPanelProps {
  doc: PDFDocument;
  onBack: () => void;
  otherDocs: PDFDocument[];
  onSelectDoc: (doc: PDFDocument) => void;
}

export default function ChatPanel({ doc, onBack, otherDocs, onSelectDoc }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // PDF Document Viewer interactive states
  const [currentPage, setCurrentPage] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [highlightedText, setHighlightedText] = useState<string | null>(null);
  const [pdfSearchQuery, setPdfSearchQuery] = useState('');
  const pdfScrollContainerRef = useRef<HTMLDivElement>(null);

  // Scroll target helper function
  const scrollToPage = (pageNum: number) => {
    const container = pdfScrollContainerRef.current;
    if (!container) return;
    const targetElement = container.querySelector(`[data-page="${pageNum}"]`);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Suggested prompt pills
  const sampleSuggestions = [
    { text: "Summarize key insights", query: "Summarize the key insights of this document." },
    { text: "List critical statistics", query: "Are there any critical metrics or statistics in this PDF? List them." },
    { text: "Core lessons", query: "What are the core lessons or recommendations presented?" }
  ];

  // Prepopulate first welcome message when the document is instantiated
  useEffect(() => {
    setMessages([
      {
        id: 'welcome',
        sender: 'assistant',
        text: `Hello! I have completed processing and preparing **${doc.name}** (${doc.size}, ${doc.pageCount} pages). \n\nI have read and indexed all chapters of the document. Feel free to ask me anything about the contents, ask for a quick summary, or check specific figures. I will fetch the matching paragraphs from the document instantly!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setCurrentPage(1);
    setHighlightedText(null);
    setTimeout(() => {
      const container = pdfScrollContainerRef.current;
      if (container) {
        container.scrollTop = 0;
      }
    }, 100);
  }, [doc]);

  // Handle message container scrolling to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Set up intersection observer to monitor scroll and sync pagination view in real-time
  useEffect(() => {
    const container = pdfScrollContainerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const pageNum = parseInt(entry.target.getAttribute('data-page') || '1', 10);
            setCurrentPage(pageNum);
          }
        });
      },
      {
        root: container,
        rootMargin: '-20% 0px -60% 0px',
        threshold: 0,
      }
    );

    const pageElements = container.querySelectorAll('[data-page]');
    pageElements.forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
    };
  }, [doc.id, doc.pageCount]);

  const handleSendMessage = (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    // Simulate typing and response after 1 second
    setTimeout(() => {
      let responseText = '';
      let targetCitationPage = 1;
      const lowercaseQuery = textToSend.toLowerCase();

      if (lowercaseQuery.includes('summar') || lowercaseQuery.includes('insight')) {
        targetCitationPage = Math.min(3, doc.pageCount);
        responseText = `### Key Summary of the Document\n\nHere are the most important takeaways from our review of **${doc.name}**:\n\n* **Main Goal**: Creating scalable and easy-to-manage operating workflows.\n* **Key Improvement**: The document shows a smart design that successfully reduces overhead and delay by about **35%** [Page ${targetCitationPage}].\n* **Reliability**: Keeps system processing running smoothly even with very large files.\n\nCould I help you summarize any other specific section of this document?`;
      } else if (lowercaseQuery.includes('metric') || lowercaseQuery.includes('statistic') || lowercaseQuery.includes('list') || lowercaseQuery.includes('figure')) {
        targetCitationPage = Math.min(4, doc.pageCount);
        responseText = `### Critical Metrics & Performance Data\n\nI found the following quantitative data and highlights in **${doc.name}**:\n\n* **Work speed (throughput)**: Boosted by **42%** during peak tests [Page ${targetCitationPage}].\n* **Timing consistency (standard deviation)**: Remains stable under **1.2 milliseconds** overall.\n* **Trial samples**: Documented over **14 separate verification rounds** with positive results.\n\nWould you like me to analyze these figures further?`;
      } else {
        targetCitationPage = Math.min(2, doc.pageCount);
        responseText = `I have read through the pages of **${doc.name}** to look for your query: *"${textToSend}"*.\n\nAccording to the details found on **Page ${targetCitationPage}**, the system ensures proper operation by isolating active environments. This allows high-speed safety and reliable behavior during usage [Page ${targetCitationPage}].\n\nIs there any other information inside these ${doc.pageCount} pages you want me to find?`;
      }

      const botMsg: Message = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);

      // Auto shift PDF viewer to cited page and trigger text highlight
      scrollToPage(targetCitationPage);
      if (lowercaseQuery.includes('summar') || lowercaseQuery.includes('insight')) {
        setHighlightedText("Optimization of complex, scalable multi-node processing workflows. Custom heuristics are deployed which reduce operational latency by approximately 35% compared to benchmark baselines.");
      } else if (lowercaseQuery.includes('metric') || lowercaseQuery.includes('statistic') || lowercaseQuery.includes('list') || lowercaseQuery.includes('figure')) {
        setHighlightedText("Throughput efficiency is increased by 42% under normal load characteristics. Standard deviation is kept below 1.2ms overall.");
      } else {
        setHighlightedText("The system ensures proper operation by isolating active environments. This allows high-speed safety and reliable behavior during usage");
      }
    }, 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage(inputText);
    }
  };

  // Action: Copy reply text
  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  // Action: Download Chat Transcript
  const handleDownloadTranscript = () => {
    const header = `Chat Transcript with PDF Assistant\nDocument: ${doc.name}\nDate: ${new Date().toLocaleDateString()}\nActive Session: rakib\n\n========================================\n\n`;
    const body = messages.map(m => `[${m.timestamp}] ${m.sender === 'user' ? 'User' : 'AI Assistant'}:\n${m.text}\n`).join('\n---\n\n');

    const element = document.createElement("a");
    const file = new Blob([header + body], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${doc.name.replace(/\.pdf$/i, '')}_chat_transcript.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Action: Clear Chat History
  const handleClearHistory = () => {
    if (window.confirm("Are you sure you want to clear your current conversation history?")) {
      setMessages([
        {
          id: 'welcome',
          sender: 'assistant',
          text: `Chat history cleared! Ask me anything about **${doc.name}** and I'll find the answers for you instantly.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setHighlightedText(null);
    }
  };

  // Simulated PDF text content per page
  const getPdfPageText = (page: number) => {
    const contents: Record<number, { title: string; paragraphs: string[] }> = {
      1: {
        title: "Chapter 1: Application Architecture Foundations",
        paragraphs: [
          "This handbook details the operating procedures for designing high-performance digital automation tools.",
          "Our modern layouts incorporate isolated runtime parameters which isolate high-volume requests and prevent typical bottleneck delays.",
          "By employing custom page setups and clean text layers, non-technical operators can easily explore files without complex setups."
        ]
      },
      2: {
        title: "Chapter 2: Safety & Environment Controls",
        paragraphs: [
          "The system ensures proper operation by isolating active environments. This allows high-speed safety and reliable behavior during usage.",
          "For safety, always store configuration tokens securely and do not share root secrets publicly.",
          "Our automated memory cleanup triggers after 10 minutes of inactivity to keep your viewer running at maximum speed."
        ]
      },
      3: {
        title: "Chapter 3: Workflow Performance Optimization",
        paragraphs: [
          "Optimization of complex, scalable multi-node processing workflows. Custom heuristics are deployed which reduce operational latency by approximately 35% compared to benchmark baselines.",
          "Our research demonstrates that smart distribution algorithms scale smoothly with documents exceeding 5,000 pages.",
          "To test this improvement manually, navigate to the Benchmarks menu and trigger a simulated analysis run."
        ]
      },
      4: {
        title: "Chapter 4: Statistical Testing & Analysis",
        paragraphs: [
          "Throughput efficiency is increased by 42% under normal load characteristics. Standard deviation is kept below 1.2ms overall.",
          "We evaluated these outcomes across 14 distinct testing trials, establishing a high degree of confidence in the metrics.",
          "Users interested in reviewing individual CSV files or telemetry reports may download the full archive from our companion site."
        ]
      },
      5: {
        title: "Chapter 5: Conclusion & Smart Features",
        paragraphs: [
          "This concludes the general overview of the smart document processing models.",
          "Future updates will provide automated summarization templates and direct export integrations for external business tools.",
          "We look forward to expanding interactive document features to help you work faster every day."
        ]
      }
    };

    // Default return for pages exceeding the mock contents
    const pageKey = page <= 5 ? page : (page % 5 || 5);
    return contents[pageKey];
  };

  const activePageContent = getPdfPageText(currentPage);

  // Filter page paragraphs based on viewer search state
  const highlightOrMatch = (paragraph: string) => {
    if (highlightedText && paragraph.toLowerCase().includes(highlightedText.toLowerCase().slice(0, 30))) {
      return (
        <span className="bg-amber-100 border-l-4 border-amber-500 pl-2 py-1 my-1 block text-slate-900 font-semibold rounded-r transition-all duration-500 animate-pulse">
          {paragraph}
        </span>
      );
    }

    if (pdfSearchQuery && paragraph.toLowerCase().includes(pdfSearchQuery.toLowerCase())) {
      const parts = paragraph.split(new RegExp(`(${pdfSearchQuery})`, 'gi'));
      return (
        <span>
          {parts.map((p, i) =>
            p.toLowerCase() === pdfSearchQuery.toLowerCase()
              ? <mark key={i} className="bg-cyan-200 text-slate-950 font-medium px-0.5 rounded">{p}</mark>
              : p
          )}
        </span>
      );
    }

    return paragraph;
  };

  // Click handler for citation link
  const handleCitationClick = (pageNumber: number, textSnippet: string) => {
    const cleanNum = Math.min(pageNumber, doc.pageCount);
    scrollToPage(cleanNum);
    setHighlightedText(textSnippet);
    // Reset after 4 seconds of notification highlight
    setTimeout(() => {
      setHighlightedText(null);
    }, 4000);
  };

  return (
    <div className="flex h-screen bg-white text-slate-800 overflow-hidden">

      {/* LEFT SIDEBAR: Document list & Details */}
      <aside className="w-80 border-r border-slate-200/80 flex-shrink-0 bg-slate-50 flex flex-col h-full hidden lg:flex">

        {/* Navigation Head */}
        <div className="p-4 border-b border-slate-200 bg-white">
          <button
            onClick={onBack}
            className="group flex items-center space-x-2 text-slate-600 hover:text-cyan-600 font-semibold text-sm transition-colors py-1 px-1.5 rounded-lg hover:bg-cyan-50 focus:outline-none"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Dashboard</span>
          </button>
        </div>

        {/* Current Document File Metadata */}
        <div className="p-5 border-b border-slate-200 bg-white/60">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2.5 bg-cyan-100 text-cyan-600 rounded-xl">
              <FileText size={20} />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-slate-800 truncate" title={doc.name}>
                {doc.name}
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">ID: pdf-{doc.id.slice(0, 8)}</p>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-400">File size:</span>
              <span className="font-medium text-slate-700">{doc.size}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-400">Total length:</span>
              <span className="font-medium text-slate-700">{doc.pageCount} Pages</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Status:</span>
              <span className="font-semibold text-cyan-600 flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 mr-1 animate-pulse" />
                <span>Ready to Chat</span>
              </span>
            </div>
          </div>
        </div>

        {/* Other Active Documents Navigation */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div>
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-2 mb-2">
              Switch Target PDF
            </h4>
            <div className="space-y-1">
              {otherDocs.filter(d => d.id !== doc.id).length === 0 ? (
                <p className="text-xs text-slate-400 italic px-2 py-1">No other documents loaded</p>
              ) : (
                otherDocs
                  .filter((d) => d.id !== doc.id)
                  .map((d) => (
                    <button
                      key={d.id}
                      onClick={() => onSelectDoc(d)}
                      className="w-full text-left p-2.5 rounded-xl hover:bg-white border border-transparent hover:border-slate-100 transition-all flex items-center space-x-2 text-xs text-slate-600 hover:text-slate-900 group"
                    >
                      <FileText size={14} className="text-slate-400 group-hover:text-cyan-500" />
                      <span className="truncate flex-1">{d.name}</span>
                    </button>
                  ))
              )}
            </div>
          </div>

          {/* Prompt guide widget */}
          <div className="bg-cyan-50 border border-cyan-100/30 rounded-2xl p-4">
            <div className="flex items-center space-x-2 text-cyan-800 mb-2">
              <Info size={15} className="text-cyan-600" />
              <span className="text-xs font-bold font-sans">AI Assistant Connected</span>
            </div>
            <p className="text-[11px] text-cyan-700 leading-relaxed font-normal">
              AI Assistant Connected - Ask anything about this document. Our assistant has thoroughly analyzed the text layout and figures.
            </p>
          </div>
        </div>

        {/* Micro footer */}
        <div className="p-4 border-t border-slate-200 text-center bg-white text-[10px] text-slate-400 font-mono">
          Active Session: <strong className="text-slate-600 font-semibold">rakib</strong>
        </div>
      </aside>

      {/* SPLIT WINDOW CONTAINER: LEFT is PDF Viewer, RIGHT is Chat Panel */}
      <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden bg-slate-100">

        {/* =========================================================================
            LEFT COLUMN: INTERACTIVE PDF DOCUMENT READER
         ========================================================================= */}
        <section className="flex-1 md:w-1/2 flex flex-col bg-slate-100 border-r border-slate-200/60 h-full overflow-hidden">

          {/* PDF Viewer Header toolbar */}
          <div className="p-3 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex items-center space-x-2">
              <span className="p-1 px-2 text-[10px] bg-slate-100 text-slate-600 rounded font-semibold uppercase tracking-wider">PDF Viewer</span>
              <span className="text-xs font-bold text-slate-800 truncate max-w-[120px] sm:max-w-xs">{doc.name}</span>
            </div>

            {/* Pagination settings */}
            <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 rounded-lg p-1">
              <button
                onClick={() => {
                  const target = Math.max(1, currentPage - 1);
                  scrollToPage(target);
                }}
                disabled={currentPage === 1}
                className="p-1 text-slate-500 hover:text-cyan-600 disabled:opacity-40 transition-colors"
                title="Previous Page"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs font-medium text-slate-700 px-1 font-mono min-w-[56px] text-center">
                Page {currentPage} of {doc.pageCount}
              </span>
              <button
                onClick={() => {
                  const target = Math.min(doc.pageCount, currentPage + 1);
                  scrollToPage(target);
                }}
                disabled={currentPage === doc.pageCount}
                className="p-1 text-slate-500 hover:text-cyan-600 disabled:opacity-40 transition-colors"
                title="Next Page"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Zoom controls */}
            <div className="hidden sm:flex items-center space-x-1 bg-slate-50 border border-slate-200 rounded-lg p-1 text-slate-500">
              <button
                onClick={() => setZoomLevel(z => Math.max(50, z - 25))}
                className="p-1 hover:text-cyan-600"
                title="Zoom Out"
              >
                <ZoomOut size={14} />
              </button>
              <span className="text-[10px] font-bold px-1.5 w-10 text-center font-mono text-slate-700">{zoomLevel}%</span>
              <button
                onClick={() => setZoomLevel(z => Math.min(200, z + 25))}
                className="p-1 hover:text-cyan-600"
                title="Zoom In"
              >
                <ZoomIn size={14} />
              </button>
            </div>

            {/* In-Document Search */}
            <div className="relative text-xs w-full sm:w-auto sm:max-w-[150px]">
              <span className="absolute inset-y-0 left-0 flex items-center pl-2 text-slate-400">
                <Search size={12} />
              </span>
              <input
                type="text"
                placeholder="Find in page..."
                value={pdfSearchQuery}
                onChange={(e) => setPdfSearchQuery(e.target.value)}
                className="w-full text-xs pl-7 pr-2.5 py-1 border border-slate-200 bg-white rounded-md focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* PDF Page Canvas Wrapper */}
          <div
            ref={pdfScrollContainerRef}
            className="flex-1 overflow-y-auto p-6 space-y-8 bg-slate-200/50 custom-pdf-scrollbar flex flex-col items-center"
          >
            {Array.from({ length: doc.pageCount }, (_, i) => {
              const pageNum = i + 1;
              const pageContent = getPdfPageText(pageNum);
              return (
                <div
                  key={pageNum}
                  data-page={pageNum}
                  style={{ width: `${zoomLevel}%`, maxWidth: '100%' }}
                  className="bg-white rounded-xl shadow-lg shadow-slate-200/40 border border-slate-200/60 p-8 sm:p-12 min-h-[500px] transition-all relative overflow-hidden flex-shrink-0"
                >
                  {/* Decorative indicator showing page separation */}
                  <div className="absolute top-4 right-4 bg-slate-100 text-slate-500 font-medium text-[10px] uppercase font-mono px-2 py-0.5 rounded border border-slate-200/80">
                    p. {pageNum}
                  </div>

                  {/* Header watermarks & PDF Page Number */}
                  <div className="flex justify-between items-center text-[10px] uppercase text-slate-400 font-mono border-b border-slate-100 pb-3 mb-6">
                    <span>Smart Document Previewer</span>
                    <span>Page {pageNum} of {doc.pageCount}</span>
                  </div>

                  {/* Title representation */}
                  <h1 className="text-xl font-bold font-sans-display text-slate-900 mb-6 leading-tight">
                    {pageContent.title}
                  </h1>

                  {/* Simulated Page Paragraph Text with high aesthetics styling */}
                  <div className="space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
                    {pageContent.paragraphs.map((para, idx) => (
                      <p key={idx} className="transition-all hover:text-slate-900 hover:bg-slate-50 p-2 rounded-lg">
                        {highlightOrMatch(para)}
                      </p>
                    ))}
                  </div>

                  {/* Simulated illustration asset on pages to look highly detailed */}
                  {pageNum % 2 === 0 ? (
                    <div className="mt-8 bg-slate-50 border border-slate-100 rounded-xl p-4 text-center">
                      <div className="flex items-center justify-center space-x-2 text-[10px] text-slate-400 font-mono uppercase mb-2">
                        <Layers size={12} className="text-cyan-500" />
                        <span>Visual layout chunk diagram</span>
                      </div>
                      <div className="h-24 bg-gradient-to-r from-cyan-500/10 via-teal-500/10 to-cyan-500/5 rounded-lg flex items-center justify-center border border-dashed border-cyan-100">
                        <span className="text-xs text-cyan-600 font-mono">Statistical Benchmark Representation Matrix</span>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-8 pt-8 border-t border-slate-100 text-center text-[10px] text-slate-400 font-mono">
                      All rights reserved. Reproduced by ChatWithPDF SaaS UI simulation.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* =========================================================================
            RIGHT COLUMN: FOCUSED CONVERSATIONAL WORKSPACE
         ========================================================================= */}
        <section className="flex-1 md:w-1/2 flex flex-col bg-slate-50 h-full overflow-hidden">

          {/* Conversational Header with controller */}
          <div className="px-5 py-3.5 bg-white border-b border-slate-200/80 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>AI Assistant Conversation</span>
              </h2>
              <p className="text-[10px] text-slate-400 mt-0.5 font-sans">
                Active session: <strong>rakib</strong>
              </p>
            </div>

            <div className="flex items-center space-x-2">
              {/* Clear Chat Button */}
              <button
                onClick={handleClearHistory}
                className="text-slate-400 hover:text-rose-500 p-2 hover:bg-rose-50 rounded-xl transition-all flex items-center space-x-1"
                title="Clear Chat History"
              >
                <Trash2 size={16} />
                <span className="text-xs font-semibold hidden md:inline">Clear Chat</span>
              </button>

              {/* Download Transcript */}
              <button
                onClick={handleDownloadTranscript}
                className="text-slate-400 hover:text-cyan-600 p-2 hover:bg-cyan-50/55 rounded-xl transition-all flex items-center space-x-1"
                title="Download Chat Transcript"
              >
                <Download size={16} />
                <span className="text-xs font-semibold hidden md:inline">Download</span>
              </button>
            </div>
          </div>

          {/* Chat dialog messages timeline container */}
          <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 space-y-6">
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start space-x-2.5 max-w-[90%] sm:max-w-[85%]`}>
                    {msg.sender === 'assistant' && (
                      <div className="w-8 h-8 rounded-lg bg-cyan-600 text-white flex items-center justify-center flex-shrink-0 font-bold shadow-md shadow-cyan-600/10">
                        <Bot size={16} />
                      </div>
                    )}

                    <div>
                      {/* Message body dialog box */}
                      <div className={`rounded-2xl p-4 text-sm leading-relaxed shadow-sm relative group/msg ${
                        msg.sender === 'user'
                          ? 'bg-cyan-600 text-white rounded-tr-none font-medium'
                          : 'bg-white text-slate-800 rounded-tl-none border border-slate-150'
                      }`}>
                        {/* Simplistic Markdown support for helper text */}
                        <div className="space-y-2">
                          {msg.text.split('\n\n').map((paragraph, pIdx) => {
                            if (paragraph.startsWith('###')) {
                              return (
                                <h4 key={pIdx} className="font-bold text-slate-900 text-sm mb-2 mt-1">
                                  {paragraph.replace('###', '').trim()}
                                </h4>
                              );
                            }
                            if (paragraph.startsWith('*') || paragraph.startsWith('-')) {
                              return (
                                <ul key={pIdx} className="list-disc pl-5 space-y-1 my-2">
                                  {paragraph.split('\n').map((line, lIdx) => (
                                    <li key={lIdx}>
                                      {/* Highlight double-star chunks or link citations */}
                                      {line.replace(/^[\s*-]+/, '').trim().split('**').map((chunk, cIdx) => {
                                        if (cIdx % 2 === 1) {
                                          return <strong key={cIdx} className={msg.sender === 'user' ? 'text-cyan-150' : 'text-slate-950 font-bold'}>{chunk}</strong>;
                                        }

                                        // Process Page citations like [Page 3]
                                        return chunk.split(/(\[Page \d+\])/g).map((subchunk, sIdx) => {
                                          const pageMatch = subchunk.match(/\[Page (\d+)\]/);
                                          if (pageMatch) {
                                            const pageNum = parseInt(pageMatch[1], 10);
                                            return (
                                              <button
                                                key={sIdx}
                                                onClick={() => handleCitationClick(pageNum, line)}
                                                className="bg-cyan-50 hover:bg-cyan-100 border border-cyan-100 text-[11px] text-cyan-700 font-bold px-1.5 py-0.5 rounded ml-1 transition-all inline-flex items-center space-x-0.5 cursor-pointer"
                                                title={`Click to preview Page ${pageNum}`}
                                              >
                                                <span>Source: p.{pageNum}</span>
                                              </button>
                                            );
                                          }
                                          return subchunk;
                                        });
                                      })}
                                    </li>
                                  ))}
                                </ul>
                              );
                            }

                            // Standard paragraph highlight & page citation hook processing
                            return (
                              <p key={pIdx} className={pIdx > 0 ? 'mt-2' : ''}>
                                {paragraph.split('**').map((chunk, chunkIdx) => {
                                  if (chunkIdx % 2 === 1) {
                                    return <strong key={chunkIdx} className={msg.sender === 'user' ? 'text-white font-extrabold' : 'text-slate-950 font-semibold'}>{chunk}</strong>;
                                  }

                                  return chunk.split(/(\[Page \d+\])/g).map((subchunk, subIdx) => {
                                    const pageMatch = subchunk.match(/\[Page (\d+)\]/);
                                    if (pageMatch) {
                                      const pageNum = parseInt(pageMatch[1], 10);
                                      return (
                                        <button
                                          key={subIdx}
                                          onClick={() => handleCitationClick(pageNum, paragraph)}
                                          className="bg-cyan-50 hover:bg-cyan-100 hover:scale-105 border border-cyan-100/80 text-[11px] text-cyan-700 font-bold px-1.5 py-0.5 rounded mx-1 transition-all inline-flex items-center space-x-0.5 cursor-pointer"
                                          title={`Click to preview Page ${pageNum}`}
                                        >
                                          <span>Source: p.{pageNum}</span>
                                        </button>
                                      );
                                    }
                                    return subchunk;
                                  });
                                })}
                              </p>
                            );
                          })}
                        </div>

                        {/* Action Tools at the bottom of Assistant Message block (Copy text and download transcript) */}
                        {msg.sender === 'assistant' && (
                          <div className="mt-4 pt-3 border-t border-slate-100/60 flex items-center justify-end space-x-2">
                            <span className="text-[10px] text-slate-400 mr-auto flex items-center space-x-1">
                              <Sparkles size={11} className="text-cyan-500 animate-pulse" />
                              <span>Powered by Smart Assistant</span>
                            </span>

                            {/* Copy button */}
                            <button
                              onClick={() => handleCopyText(msg.text, msg.id)}
                              className="text-slate-400 hover:text-cyan-600 p-1.5 hover:bg-slate-50 rounded-lg transition-all"
                              title="Copy Text to Clipboard"
                            >
                              {copiedId === msg.id ? (
                                <Check size={14} className="text-emerald-500" />
                              ) : (
                                <Copy size={13} />
                              )}
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Timestamp overlay */}
                      <div className={`text-[10px] text-slate-400 mt-1 px-1 flex items-center space-x-1 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <Clock size={10} className="text-slate-300" />
                        <span>{msg.timestamp}</span>
                      </div>
                    </div>

                    {msg.sender === 'user' && (
                      <div className="w-8 h-8 rounded-lg bg-teal-500 text-white flex items-center justify-center flex-shrink-0 font-bold shadow-md shadow-teal-500/10 uppercase text-xs">
                        RA
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}

              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex justify-start items-start space-x-2.5 max-w-[85%]"
                >
                  <div className="w-8 h-8 rounded-lg bg-cyan-600 text-white flex items-center justify-center flex-shrink-0 font-bold shadow-md shadow-cyan-600/10">
                    <Bot size={16} />
                  </div>
                  <div className="bg-white border border-slate-150 rounded-2xl rounded-tl-none p-4 shadow-sm">
                    <div className="flex items-center space-x-1.5 py-1 px-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-cyan-600 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2.5 h-2.5 rounded-full bg-cyan-600 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2.5 h-2.5 rounded-full bg-cyan-600 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>

          {/* Bottom input area with suggested prompt pills */}
          <div className="p-4 bg-white border-t border-slate-200">
            <div className="max-w-3xl mx-auto space-y-4">

              {/* Quick-pill Prompt Suggestions bar */}
              {messages.length === 1 && (
                <div className="flex flex-wrap gap-2.5 overflow-x-auto pb-1 max-w-full">
                  {sampleSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSendMessage(suggestion.query)}
                      className="whitespace-nowrap text-xs bg-slate-50 hover:bg-cyan-50 hover:text-cyan-700 hover:border-cyan-200 border border-slate-200/70 text-slate-600 px-3 py-1.5 rounded-full transition-all duration-200 focus:outline-none flex items-center space-x-1"
                    >
                      <span>{suggestion.text}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Main message draft submission bar */}
              <div className="flex items-center space-x-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl px-4 py-2 hover:border-cyan-400 focus-within:ring-2 focus-within:ring-cyan-500/30 focus-within:border-cyan-500 bg-white transition-all">
                <input
                  type="text"
                  placeholder={`Ask a question about ${doc.name}...`}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isTyping}
                  className="flex-1 bg-transparent text-slate-800 placeholder-slate-400 text-sm py-2 focus:outline-none focus:ring-0 disabled:opacity-50"
                />
                <button
                  onClick={() => handleSendMessage(inputText)}
                  disabled={!inputText.trim() || isTyping}
                  className="p-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white disabled:bg-slate-100 disabled:text-slate-300 font-semibold transition-all shadow-md shadow-cyan-600/10 flex-shrink-0"
                  title="Send Message"
                >
                  <Send size={16} />
                </button>
              </div>

              {/* Citations info and instructions */}
              <div className="flex justify-between items-center text-[10px] text-slate-400 px-1 font-sans">
                <span className="flex items-center space-x-1">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-500" />
                  <span>Tip: Click on <strong>Source: p.X</strong> to instantly open that page inside the viewer!</span>
                </span>
                <span className="hidden sm:inline">Press Enter to send</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
