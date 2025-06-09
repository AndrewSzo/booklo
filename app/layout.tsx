import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/lib/providers/QueryProvider";
import { AuthProvider } from "@/lib/providers/AuthProvider";
import { BookDetailsProvider } from "@/lib/providers/BookDetailsContext";
import { LibraryProvider } from "@/lib/providers/LibraryContext";
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
            <LibraryProvider>
              <BookDetailsProvider>
                <div className="min-h-screen bg-background text-foreground">
                  <header className="bg-white border-b sticky top-0 z-40">
                    <div className="h-16 px-4 md:px-6 flex items-center justify-between">
                      <Logo />
                      <AuthButton />
                    </div>
                  </header>
                  <main className="h-[calc(100vh-4rem)]">
                    {children}
                  </main>
                </div>
              </BookDetailsProvider>
            </LibraryProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
