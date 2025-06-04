"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const faqs = [
  {
    question: "Dlaczego nazywamy to publiczną beta?",
    answer: "Nazywamy to wydanie 'publiczną betą', ponieważ powierzchnia funkcjonalna produktu jest ogromna. W zasadzie zbudowaliśmy pięć różnych rodzajów aplikacji do czytania jednocześnie, nie tworząc przypadkowo softwarowego odpowiednika widelca-łyżki. Jednocześnie musieliśmy upewnić się, że aplikacja działa dobrze na Chrome, Firefox i Safari oraz iOS i Android."
  },
  {
    question: "Jak będzie wycenione Booklo?",
    answer: "Obecnie Booklo jest darmowe przez 30-dniowy okres próbny, a następnie wymaga subskrypcji. Możemy zdecydować się na wydzielenie Booklo jako osobną subskrypcję w pewnym momencie, ale nigdy nie podniesiemy ceny dla obecnych subskrybentów."
  },
  {
    question: "Czy Booklo działa na urządzeniach mobilnych i komputerach?",
    answer: "Tak! Booklo jest dostępne na iOS i Android, a także jako lokalna aplikacja internetowa. Całe doświadczenie jest międzyplatformowe, co oznacza, że wszystkie dane są stale synchronizowane między wszystkimi Twoimi urządzeniami."
  },
  {
    question: "Czy mogę zaimportować swoją bibliotekę z innych aplikacji?",
    answer: "Tak! Możesz zaimportować swoją istniejącą bibliotekę z Goodreads, Kindle i kilku innych platform. Obsługujemy również import z najpopularniejszych aplikacji do zarządzania książkami."
  },
  {
    question: "Jakie są główne funkcje Booklo?",
    answer: "Booklo oferuje kompletne zarządzanie biblioteką książek, śledzenie postępów czytania, tworzenie notatek i cytatów, ocenianie książek, ustawianie celów czytania oraz synchronizację między urządzeniami. Wszystko w pięknym, intuicyjnym interfejsie."
  }
];

export function FAQSection() {
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(item => item !== index)
        : [...prev, index]
    );
  };

  return (
    <section className="py-24 bg-gradient-to-br from-emerald-50 to-green-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Często zadawane pytania
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index}
              className="bg-white rounded-2xl shadow-sm border border-emerald-100 overflow-hidden"
            >
              <button
                className="w-full px-8 py-6 text-left flex items-center justify-between hover:bg-emerald-50 transition-colors duration-200"
                onClick={() => toggleItem(index)}
              >
                <span className="font-semibold text-gray-900 pr-4">
                  {faq.question}
                </span>
                {openItems.includes(index) ? (
                  <ChevronUp className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                )}
              </button>
              
              {openItems.includes(index) && (
                <div className="px-8 pb-6">
                  <div className="border-t border-emerald-100 pt-4">
                    <p className="text-gray-600 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 