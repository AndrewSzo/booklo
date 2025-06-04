import { Zap, BookOpen } from "lucide-react";

const integrations = [
  { name: "Goodreads", logo: "G", description: "Import twojej biblioteki" },
  { name: "Kindle", logo: "K", description: "Synchronizacja książek" },
  { name: "Audible", logo: "A", description: "Audiobooki i postępy" },
  { name: "Notion", logo: "N", description: "Export notatek" },
  { name: "Obsidian", logo: "O", description: "Zarządzanie wiedzą" },
  { name: "Apple Books", logo: "📚", description: "Biblioteka iOS" }
];

export function IntegrationsSection() {
  return (
    <section className="py-24 bg-gradient-to-br from-emerald-50 to-green-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Zintegrowane z Twoimi ulubionymi narzędziami
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Twoje notatki powinny płynnie przepływać z aplikacji do czytania do Twojego narzędzia do pisania. 
            Zamiast tego tracisz godziny na ponowne formatowanie, reorganizację i powtarzanie. Booklo eliminuje ten problem.
          </p>
        </div>

        {/* Integration logos */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 mb-16">
          {integrations.map((integration, index) => (
            <div 
              key={index}
              className="group text-center p-6 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl flex items-center justify-center text-white font-bold text-xl mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                {integration.logo}
              </div>
              <div className="font-semibold text-gray-800 mb-1">{integration.name}</div>
              <div className="text-xs text-gray-500">{integration.description}</div>
            </div>
          ))}
        </div>

        <div className="text-center mb-12">
          <p className="text-gray-600">
            Booklo bezproblemowo łączy się z popularnymi platformami do eksportu w Notion, Obsidian, Evernote i więcej
          </p>
        </div>

        {/* Feature cards */}
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-emerald-100">
            <div className="flex items-center space-x-3 mb-4">
              <Zap className="w-8 h-8 text-emerald-600" />
              <div>
                <h3 className="font-semibold text-gray-900">Integruj przez nasze publiczne API</h3>
              </div>
            </div>
            <p className="text-gray-600">
              Booklo jest zbudowane z myślą o API: twórz własne rozwiązania i integruj swoje narzędzia za pomocą naszego API.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm border border-emerald-100">
            <div className="flex items-center space-x-3 mb-4">
              <BookOpen className="w-8 h-8 text-emerald-600" />
              <div>
                <h3 className="font-semibold text-gray-900">Łatwy i spójny przegląd</h3>
              </div>
            </div>
            <p className="text-gray-600">
              Booklo automatycznie synchronizuje się z Twoimi narzędziami, ułatwiając przeglądanie i uczenie się z Twoich notatek.
            </p>
          </div>
        </div>

        {/* Background bubbles */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-emerald-200/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-green-200/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
    </section>
  );
} 