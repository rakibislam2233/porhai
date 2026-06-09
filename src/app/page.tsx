import { Metadata } from "next";
import LandingPageClient from "@/components/LandingPageClient";

export const metadata: Metadata = {
  title: "Porhai | Chat with your PDFs intelligently",
  description: "The fastest way to read, understand, and extract insights from your PDF documents.",
};

export default function LandingPage() {
  return <LandingPageClient />;
}
