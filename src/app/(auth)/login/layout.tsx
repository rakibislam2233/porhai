import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Log in",
  description: "Sign in to your Porhai account to chat with your PDFs.",
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
