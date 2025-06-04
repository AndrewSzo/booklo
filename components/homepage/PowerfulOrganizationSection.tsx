import { Highlighter, Tag, BookMarked } from "lucide-react";

export function PowerfulOrganizationSection() {
  return (
    <section className="py-24 bg-gradient-to-br from-emerald-50 to-green-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900">
              Potężna organizacja dla prawdziwych czytelników
            </h2>
            <div className="space-y-6 text-lg text-gray-600 leading-relaxed">
              <p>
                Organizacja powinna być kluczową funkcją cyfrowego czytania. Zamiast tego, 
                kategoryzowanie, tagowanie i notowanie są zaniedbywanymi dodatkami w innych aplikacjach.
              </p>
              <p>
                Wierzymy, że organizacja to klucz do wyciągnięcia więcej z tego, co czytasz. 
                Dlatego rozwinęliśmy organizację jako funkcję pierwszej klasy. Kategoryzuj książki, 
                dodawaj tagi, twórz kolekcje i więcej. Na każdym urządzeniu.
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                <Highlighter className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <div className="font-semibold text-gray-800">Smart Highlights</div>
                <div className="text-sm text-gray-500">AI-powered insights</div>
              </div>
              <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                <Tag className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <div className="font-semibold text-gray-800">Advanced Tagging</div>
                <div className="text-sm text-gray-500">Custom categories</div>
              </div>
              <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                <BookMarked className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <div className="font-semibold text-gray-800">Collections</div>
                <div className="text-sm text-gray-500">Curated lists</div>
              </div>
            </div>
          </div>
          
          <div className="relative">
            {/* Main mockup */}
            <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-500 to-green-500 h-3"></div>
              <div className="p-8">
                {/* Book entry with highlight */}
                <div className="space-y-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-12 h-16 bg-gradient-to-b from-emerald-400 to-green-500 rounded"></div>
                    <div>
                      <div className="font-semibold text-gray-800">Atomic Habits</div>
                      <div className="text-sm text-gray-500">James Clear</div>
                    </div>
                  </div>
                  
                  {/* Highlighted text */}
                  <div className="bg-emerald-50 border-l-4 border-emerald-400 p-4 rounded-r-lg">
                    <p className="text-gray-800 text-sm leading-relaxed">
                      &ldquo;Habits are the compound interest of self-improvement. The same way that money multiplies through compound interest, 
                      the effects of your habits multiply as you repeat them.&rdquo;
                    </p>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex space-x-2">
                        <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full">motivation</span>
                        <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full">habits</span>
                      </div>
                      <div className="text-xs text-gray-400">str. 15</div>
                    </div>
                  </div>
                  
                  {/* Note */}
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                    <div className="text-xs font-medium text-yellow-800 mb-1">Moja notatka:</div>
                    <p className="text-sm text-yellow-700">
                      To kluczowe spostrzeżenie! Nawyki to podstawa długoterminowego sukcesu. 
                      Muszę zastosować to w praktyce.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Floating note */}
            <div className="absolute -top-4 -right-4 bg-white rounded-xl shadow-lg border border-gray-100 p-4 max-w-xs transform rotate-3">
              <div className="flex items-center space-x-2 mb-2">
                <BookMarked className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-medium text-gray-800">Ulubione cytaty</span>
              </div>
              <p className="text-xs text-gray-600">
                &ldquo;The quality of your life is determined by the quality of your thoughts.&rdquo;
              </p>
              <div className="text-xs text-gray-400 mt-1">- Marcus Aurelius</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 