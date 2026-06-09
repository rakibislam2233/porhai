import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Register",
  description: "Create a free Porhai account and unlock the knowledge hidden in your PDFs.",
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
