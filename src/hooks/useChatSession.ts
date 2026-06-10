"use client";

import { useState, useEffect } from "react";
import { Message, ChatSessionResponse } from "@/types/chat";

export function useChatSession(documentId: string) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [initialMessages, setInitialMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initSession = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/chat/sessions?documentId=${documentId}`);
        const data = (await res.json()) as ChatSessionResponse;

        if (data.session) {
          setSessionId(data.session.id);

          const converted: Message[] = data.session.messages.map((m) => ({
            id: m.id,
            sender: m.role === "user" ? "user" : "assistant",
            text: m.content,
            sources: m.sources ?? undefined,
            timestamp: new Date(m.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          }));
          setInitialMessages(converted);
        } else {
          const createRes = await fetch("/api/chat/sessions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ documentId }),
          });
          const createData = await createRes.json();
          setSessionId(createData.session.id);
          setInitialMessages([]);
        }
      } catch (error) {
        console.error("Failed to init chat session:", error);
      } finally {
        setLoading(false);
      }
    };

    if (documentId) initSession();
  }, [documentId]);

  return { sessionId, initialMessages, loading };
}
