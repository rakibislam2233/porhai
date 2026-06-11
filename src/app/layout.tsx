import type { Metadata } from "next"
import { Hind_Siliguri, } from "next/font/google"
import "./globals.css"
const hindSiliguri = Hind_Siliguri({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
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
        className={`${hindSiliguri.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  )
}