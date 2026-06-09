import type { Metadata } from "next"
import { Open_Sans } from "next/font/google"
import "./globals.css"

const openSans = Open_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: {
    template: "%s | Porhai",
    default: "Porhai - Chat with your PDFs using AI",
  },
  description: "Upload any document, report, or book. Our advanced AI instantly reads, understands, and answers any question you have about your files.",
  keywords: ["PDF", "AI", "Chat", "Document Analysis", "Porhai", "SaaS"],
  openGraph: {
    title: "Porhai - Chat with your PDFs using AI",
    description: "Upload any document, report, or book. Our advanced AI instantly reads, understands, and answers any question you have about your files.",
    url: "https://porhai.com",
    siteName: "Porhai",
    type: "website",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`${openSans.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  )
}
