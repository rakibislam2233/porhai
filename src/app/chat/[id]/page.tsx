import { Metadata } from "next";
import ChatClient from "@/components/ChatClient";

export const metadata: Metadata = {
  title: "Chat Session",
  description: "Interact with your PDF document.",
};

export default function ChatPage() {
  return <ChatClient />;
}
