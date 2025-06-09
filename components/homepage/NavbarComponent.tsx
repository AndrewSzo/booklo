"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";

export function NavbarComponent() {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-emerald-100" data-testid="navbar">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" data-testid="navbar-content">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link 
              href="/" 
              className="flex items-center space-x-2 text-emerald-700 hover:text-emerald-800 transition-colors"
              data-testid="logo-link"
            >
              <BookOpen className="w-8 h-8" data-testid="logo-icon" />
              <span className="text-xl font-bold" data-testid="logo-text">Booklo</span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-4" data-testid="navbar-actions">
            <Button
              variant="ghost"
              asChild
              className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
              data-testid="login-button"
            >
              <Link href="/auth/login">
                Zaloguj się
              </Link>
            </Button>
            
            <Button
              asChild
              className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-lg"
              data-testid="signup-button"
            >
              <Link href="/auth/register">
                Zacznij za darmo
              </Link>
            </Button>
          </div>
        </div>
      </nav>
    </div>
  );
} 