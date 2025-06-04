import { BookOpen, Star, Target, Smartphone, FileText, Users, Globe, Library } from "lucide-react";

const features = [
  {
    icon: BookOpen,
    title: "Organizacja książek",
    description: "Kategoryzuj swoje książki według statusu: czytane, przeczytane, do przeczytania. Nigdy więcej nie zgubisz się w swojej bibliotece."
  },
  {
    icon: Target,
    title: "Cele czytania",
    description: "Ustaw cele miesięczne i roczne. Śledź swoje postępy i motywuj się do regularnego czytania."
  },
  {
    icon: Star,
    title: "Oceny i recenzje",
    description: "Oceniaj przeczytane książki i pisz notatki. Twórz osobistą bazę wiedzy o tym, co czytałeś."
  },
  {
    icon: FileText,
    title: "Notatki i cytaty",
    description: "Zapisuj ulubione cytaty i rób notatki podczas czytania. Wszystko w jednym miejscu, łatwo dostępne."
  },
  {
    icon: Globe,
    title: "Synchronizacja",
    description: "Dostęp do swojej biblioteki z każdego urządzenia. Wszystkie dane synchronizowane w czasie rzeczywistym."
  },
  {
    icon: Users,
    title: "Społeczność czytelników",
    description: "Odkrywaj rekomendacje od innych czytelników i dziel się swoimi ulubionymi pozycjami."
  },
  {
    icon: Library,
    title: "Integracje",
    description: "Łączenie z popularnymi platformami jak Goodreads, Kindle czy Audible. Import istniejących bibliotek."
  },
  {
    icon: Smartphone,
    title: "Aplikacja mobilna",
    description: "Pełna funkcjonalność na telefonach iOS i Android. Czytaj i zarządzaj książkami gdziekolwiek jesteś."
  }
];

export function FeaturesSection() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Wszystko w jednym miejscu.
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Koniec z żonglowaniem dziesiątkami aplikacji do czytania. Tylko jedna: nazywamy ją Booklo.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="group p-6 rounded-2xl border border-gray-100 hover:border-emerald-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white"
            >
              <div className="flex flex-col items-start space-y-4">
                <div className="p-3 bg-emerald-50 rounded-xl group-hover:bg-emerald-100 transition-colors duration-300">
                  <feature.icon className="w-8 h-8 text-emerald-600" />
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-16 text-center">
          <div className="inline-flex items-center space-x-3 p-6 bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl border border-emerald-100">
            <BookOpen className="w-8 h-8 text-emerald-600" />
            <div className="text-left">
              <div className="font-semibold text-emerald-800">Dlaczego stworzyliśmy Booklo</div>
              <div className="text-sm text-emerald-600">Poznaj naszą historię</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 