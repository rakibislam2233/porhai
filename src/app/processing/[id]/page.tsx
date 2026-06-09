import { Suspense } from "react";
import { Metadata } from "next";
import ProcessingClient from "@/components/ProcessingClient";

export const metadata: Metadata = {
  title: "Processing Document",
  description: "Please wait while we process your PDF...",
};

export default function ProcessingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading...</div>}>
      <ProcessingClient />
    </Suspense>
  );
}
