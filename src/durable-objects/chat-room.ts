import { DurableObject } from "cloudflare:workers";
import type { ChatAnswerResponse } from "@/types/chat";
export class ChatRoomDO extends DurableObject {
  private history: { role: string; content: string }[] = [];

  constructor(ctx: any, env: any) {
    super(ctx, env);
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/websocket") {
      const webSocketPair = new WebSocketPair();
      const [client, server] = Object.values(webSocketPair);

      this.ctx.acceptWebSocket(server);
      return new Response(null, { status: 101, webSocket: client });
    }

    if (url.pathname === "/clear") {
      this.history = [];
      return new Response("Chat history cleared", { status: 200 });
    }

    return new Response("Not found", { status: 404 });
  }

  async webSocketMessage(ws: WebSocket, message: ArrayBuffer | string) {
    try {
      const { question, documentId } = JSON.parse(message.toString());
      this.history.push({ role: "user", content: question });

      if (this.history.length > 20) {
        this.history = this.history.slice(-20);
      }

      // 🎯 Accessing global internal bindings safely via implicit base properties map
      const res = await fetch(
        `${(this.env as any).WORKER_SELF_REFERENCE}/api/chat/answer`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question,
            documentId,
            history: this.history.slice(-6),
          }),
        },
      );

      if (!res.ok) {
        throw new Error(
          `Next.js internal API engine responded with status code: ${res.status}`,
        );
      }

      const { answer, sources } = (await res.json()) as ChatAnswerResponse;
      this.history.push({ role: "assistant", content: answer });

      ws.send(JSON.stringify({ answer, sources }));
    } catch (error: any) {
      console.error(
        "🔴 Error caught inside ChatRoomDO context stream processing:",
        error,
      );
      ws.send(
        JSON.stringify({
          answer:
            "Something went wrong while retrieving answers from the cognitive systems engine.",
          sources: [],
        }),
      );
    }
  }

  async webSocketClose(ws: WebSocket) {
    ws.close();
  }
}
