import { DurableObject } from "cloudflare:workers";
import type { ChatAnswerResponse } from "@/types/chat";

export class ChatRoomDO extends DurableObject {
  private history: { role: string; content: string }[] = [];
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
      return new Response("Chat history cleared");
    }
    return new Response("Not found", { status: 404 });
  }

  async webSocketMessage(ws: WebSocket, message: ArrayBuffer | string) {
    const { question, documentId } = JSON.parse(message.toString());
    this.history.push({ role: "user", content: question });
    
    // Limit the history to the last 20 messages
    if (this.history.length > 20) {
      this.history = this.history.slice(-20);
    }
    // Simulate a response from the assistant (replace with actual logic)
    const res = await fetch(
      `${this.env.WORKER_SELF_REFERENCE}/api/chat/answer`,
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
    const { answer, sources } = (await res.json()) as ChatAnswerResponse;
    this.history.push({ role: "assistant", content: answer });
    ws.send(JSON.stringify({ answer, sources }));
  }
  async webSocketClose(ws: WebSocket) {
    ws.close();
  }
}
