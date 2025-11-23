import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { AuthProvider } from "@/lib/auth-context"
import "./globals.css"
import { Analytics } from "@vercel/analytics/next"


const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Laporan Keuangan Event",
  description: "Sistem laporan keuangan untuk event",
  generator: "",
  icons: {
    icon: [
      {
        url: "/ccs.jpg",
        type: "image/jpeg",
      },
    ],
    //apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id">
      <body className={`font-sans antialiased`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
