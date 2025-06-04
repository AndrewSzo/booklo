import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/lib/providers/QueryProvider";
import { AuthProvider } from "@/lib/providers/AuthProvider";
import { BookDetailsProvider } from "@/lib/providers/BookDetailsContext";
import AuthButton from "@/components/common/AuthButton";
import Logo from "@/components/common/Logo";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Booklo - Book Management App",
  description: "Manage your reading list with ease",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <QueryProvider>
          <AuthProvider>
            <BookDetailsProvider>
              <div className="min-h-screen bg-background">
                <nav className="border-b border-border bg-card">
                  <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                    <Logo />
                    <AuthButton />
                  </div>
                </nav>
                <main>
                  {children}
                </main>
              </div>
            </BookDetailsProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
