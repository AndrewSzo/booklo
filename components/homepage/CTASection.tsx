import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BookOpen, Sparkles } from "lucide-react";

export function CTASection() {
  return (
    <section className="relative py-24 bg-gradient-to-br from-emerald-600 via-green-600 to-emerald-700 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-emerald-300/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-green-400/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Icon */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl">
            <BookOpen className="w-10 h-10 text-white" />
          </div>
        </div>

        {/* Content */}
        <div className="space-y-8">
          <h2 className="text-4xl lg:text-6xl font-bold text-white leading-tight">
            Doświadcz przyszłości
            <div className="mt-2">
              <span className="inline-flex items-center">
                czytania
                <Sparkles className="w-8 h-8 lg:w-12 lg:h-12 ml-4 text-yellow-300 animate-pulse" />
              </span>
            </div>
          </h2>
          
          <p className="text-xl text-emerald-100 max-w-2xl mx-auto leading-relaxed">
            Dołącz do tysięcy czytelników, którzy już odkryli lepszy sposób na organizację 
            i śledzenie swojego czytania. Zacznij swoją podróż już dziś.
          </p>

          {/* CTA Button */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              asChild 
              size="lg"
              className="bg-white text-emerald-700 hover:bg-emerald-50 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 px-8 py-4 text-lg font-semibold"
            >
              <Link href="/auth/register">
                Zacznij za darmo (beta)
              </Link>
            </Button>
          </div>

          <div className="text-emerald-200 text-sm">
            Dla web, desktop, iOS i Android.
          </div>

          {/* Features highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="text-center">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <span className="text-white text-xl">📚</span>
              </div>
              <div className="text-white font-medium">Unlimited Books</div>
              <div className="text-emerald-200 text-sm">Organizuj bez limitów</div>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <span className="text-white text-xl">🔄</span>
              </div>
              <div className="text-white font-medium">Cross-Platform Sync</div>
              <div className="text-emerald-200 text-sm">Wszystkie urządzenia</div>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <span className="text-white text-xl">⚡</span>
              </div>
              <div className="text-white font-medium">Lightning Fast</div>
              <div className="text-emerald-200 text-sm">Błyskawiczna wydajność</div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg className="w-full h-16 fill-current text-emerald-800" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"></path>
        </svg>
      </div>
    </section>
  );
} 