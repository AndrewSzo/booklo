"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Anna Kowalska",
    role: "Blogerka literacka",
    content: "Booklo całkowicie zrewolucjonizował sposób, w jaki organizuję swoje czytanie. Piękny interfejs i błyskawiczna szybkość. To jak Spotify dla książek - nie chcesz czytać nigdzie indziej.",
    avatar: "A"
  },
  {
    name: "Michał Nowak",
    role: "Przedsiębiorca",
    content: "Spędzam cały dzień czytając artykuły, książki i raporty. Booklo to narzędzie do czytania, na które czekałem. Perfekcyjne uzupełnienie mojego workflow. Absolutnie przełomowe.",
    avatar: "M"
  },
  {
    name: "Katarzyna Wiśniewska",
    role: "Profesor, Uniwersytet Warszawski",
    content: "Przeszukałam wszędzie w poszukiwaniu idealnej aplikacji do czytania. Mimo że Booklo jest wciąż w fazie beta, już zastąpił moją poprzednią aplikację. (A zawsze dwa razy się zastanawiam przed zmianą!)",
    avatar: "K"
  }
];

export function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            <span>Kochane przez </span>
            <span className="bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
              czytelników
            </span>
          </h2>
        </div>

        <div className="relative max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-3xl p-8 lg:p-12">
            <div className="text-center">
              <Quote className="w-12 h-12 text-emerald-400 mx-auto mb-6" />
              
              <blockquote className="text-xl lg:text-2xl text-gray-800 leading-relaxed mb-8">
                {testimonials[currentIndex].content}
              </blockquote>
              
              <div className="flex items-center justify-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full flex items-center justify-center text-white font-bold">
                  {testimonials[currentIndex].avatar}
                </div>
                <div className="text-left">
                  <div className="font-semibold text-gray-900">
                    {testimonials[currentIndex].name}
                  </div>
                  <div className="text-emerald-600">
                    {testimonials[currentIndex].role}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center space-x-4 mt-8">
            <button
              onClick={prevTestimonial}
              className="p-2 rounded-full bg-emerald-100 hover:bg-emerald-200 transition-colors duration-200"
            >
              <ChevronLeft className="w-5 h-5 text-emerald-600" />
            </button>
            
            <div className="flex space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-3 h-3 rounded-full transition-colors duration-200 ${
                    index === currentIndex 
                      ? 'bg-emerald-500' 
                      : 'bg-emerald-200 hover:bg-emerald-300'
                  }`}
                />
              ))}
            </div>
            
            <button
              onClick={nextTestimonial}
              className="p-2 rounded-full bg-emerald-100 hover:bg-emerald-200 transition-colors duration-200"
            >
              <ChevronRight className="w-5 h-5 text-emerald-600" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
} 