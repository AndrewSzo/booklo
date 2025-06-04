"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BookOpen, Star } from "lucide-react";

const ANIMATED_WORDS = [
  "organizacji książek",
  "śledzenia czytania", 
  "zapisywania cytatów",
  "zarządzania biblioteką"
];

export function BookHeroSection() {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWordIndex((prevIndex) => (prevIndex + 1) % ANIMATED_WORDS.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen pt-16 overflow-hidden">
      {/* Background gradient and bubbles */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-green-50">
        <div className="absolute top-20 left-10 w-64 h-64 bg-emerald-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-green-200/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 leading-tight">
                <div className="mb-4">
                  <span>Pierwsza aplikacja do </span>
                </div>
                <div className="relative min-h-40 lg:min-h-48 mb-4 flex items-center">
                  {ANIMATED_WORDS.map((word, index) => (
                    <div
                      key={index}
                      className={`absolute inset-0 flex items-center justify-start transition-all duration-700 ease-in-out bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent font-bold leading-tight ${
                        index === currentWordIndex 
                          ? 'opacity-100 transform translate-y-0' 
                          : 'opacity-0 transform translate-y-4'
                      }`}
                    >
                      <span className="w-full">{word}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <span>dla pasjonatów książek.</span>
                </div>
              </h1>
              
              <p className="text-xl text-gray-600 max-w-lg leading-relaxed">
                Organizuj wszystkie swoje książki w jednym miejscu, śledź postępy czytania jak profesjonalista 
                i zamień chaos w bibliotece na perfekcyjny system.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                asChild 
                size="lg"
                className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
              >
                <Link href="/auth/register">
                  Zacznij za darmo (beta)
                </Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 pt-8 border-t border-emerald-100">
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-600">1000+</div>
                <div className="text-sm text-gray-500">Zadowolonych czytelników</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-600">50k+</div>
                <div className="text-sm text-gray-500">Zarządzanych książek</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-600">99%</div>
                <div className="text-sm text-gray-500">Satysfakcji użytkowników</div>
              </div>
            </div>
          </div>

          {/* Right Content - Mockup */}
          <div className="relative">
            {/* Main device mockup */}
            <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden transform rotate-2 hover:rotate-0 transition-transform duration-500">
              <div className="bg-gradient-to-r from-emerald-500 to-green-500 h-3"></div>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <BookOpen className="w-6 h-6 text-emerald-600" />
                    <span className="font-semibold text-gray-800">Moja biblioteka</span>
                  </div>
                  <div className="text-sm text-gray-500">247 książek</div>
                </div>
                
                {/* Category tabs */}
                <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
                  <div className="flex-1 bg-white rounded-md py-2 px-3 text-center text-sm font-medium text-emerald-600 shadow-sm">
                    Czytam (3)
                  </div>
                  <div className="flex-1 py-2 px-3 text-center text-sm text-gray-500">
                    Przeczytane
                  </div>
                  <div className="flex-1 py-2 px-3 text-center text-sm text-gray-500">
                    Chcę przeczytać
                  </div>
                </div>
                
                {/* Books list */}
                <div className="space-y-3">
                  {[
                    { title: "Atomic Habits", author: "James Clear", progress: 67, notes: 5, quotes: 2 },
                    { title: "Deep Work", author: "Cal Newport", progress: 23, notes: 2, quotes: 1 },
                    { title: "Sapiens", author: "Y. N. Harari", progress: 89, notes: 12, quotes: 8 }
                  ].map((book, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-emerald-50 transition-colors">
                      <div className="w-10 h-14 bg-gradient-to-b from-emerald-400 to-green-500 rounded flex-shrink-0"></div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-800 truncate">{book.title}</div>
                        <div className="text-xs text-gray-500">{book.author}</div>
                        <div className="flex items-center space-x-2 mt-1">
                          <div className="flex-1 bg-gray-200 rounded-full h-1.5 max-w-20">
                            <div 
                              className="bg-gradient-to-r from-emerald-500 to-green-500 h-1.5 rounded-full"
                              style={{ width: `${book.progress}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-400">{book.progress}%</span>
                        </div>
                        <div className="flex items-center space-x-3 mt-1">
                          <span className="text-xs text-emerald-600">📝 {book.notes}</span>
                          <span className="text-xs text-amber-600">💭 {book.quotes}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* AI Chat mockup */}
            <div className="absolute -bottom-6 -right-6 w-72 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden transform -rotate-3 hover:rotate-0 transition-transform duration-500">
              <div className="bg-gradient-to-r from-emerald-500 to-green-500 h-2"></div>
              <div className="p-4 space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">🤖</span>
                  </div>
                  <span className="font-medium text-sm">AI Chat o książce</span>
                </div>
                
                <div className="space-y-2">
                  <div className="bg-gray-100 rounded-lg p-2">
                    <div className="text-xs text-gray-600">
                      &ldquo;Jakie są główne lekcje z Atomic Habits?&rdquo;
                    </div>
                  </div>
                  <div className="bg-emerald-50 rounded-lg p-2">
                    <div className="text-xs text-emerald-800">
                      <strong>AI:</strong> Główne lekcje to: 1% lepszego każdego dnia, znaczenie sygnałów środowiskowych...
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-gray-100 rounded-full px-3 py-1">
                    <div className="text-xs text-gray-400">Zadaj pytanie...</div>
                  </div>
                  <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">→</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes popup */}
            <div className="absolute -top-4 -left-6 w-64 bg-white rounded-xl shadow-lg border border-gray-100 p-4 transform rotate-6 hover:rotate-3 transition-transform duration-300">
              <div className="flex items-center space-x-2 mb-3">
                <Star className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-medium text-gray-800">Moja notatka</span>
              </div>
              <div className="space-y-2">
                <div className="bg-yellow-50 border-l-3 border-yellow-400 p-2 rounded">
                  <p className="text-xs text-yellow-800 font-medium">
                    &ldquo;Jesteśmy tym, co robimy wielokrotnie&rdquo;
                  </p>
                  <p className="text-xs text-yellow-600 mt-1">
                    Kluczowe! Nawyki kształtują naszą tożsamość...
                  </p>
                </div>
                <div className="text-xs text-gray-400">
                  Atomic Habits • str. 38
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white via-emerald-50/30 to-transparent"></div>
    </section>
  );
} 