import { Monitor, Smartphone, Tablet, Globe } from "lucide-react";

export function DevicesSection() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h3 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
            Czytaj wszędzie, zawsze
          </h3>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Dostęp do wszystkich Twoich treści z dowolnego urządzenia z pełną synchronizacją. Nawet offline. 
            Booklo synchronizuje się przez potężną, lokalną aplikację internetową, aplikację iOS i Android.
          </p>
        </div>

        <div className="relative">
          {/* Device mockups */}
          <div className="grid lg:grid-cols-3 gap-8 items-center">
            {/* Desktop */}
            <div className="transform hover:scale-105 transition-transform duration-500">
              <div className="bg-gray-900 rounded-t-2xl p-4">
                <div className="flex space-x-2 mb-4">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <div className="bg-white rounded-lg p-6 space-y-4">
                  <div className="flex items-center space-x-3">
                    <Monitor className="w-5 h-5 text-emerald-600" />
                    <span className="font-medium">Aplikacja webowa</span>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-emerald-100 rounded w-full"></div>
                    <div className="h-3 bg-emerald-100 rounded w-3/4"></div>
                    <div className="h-3 bg-emerald-100 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-800 rounded-b-2xl h-8"></div>
            </div>

            {/* Mobile */}
            <div className="mx-auto">
              <div className="bg-gray-900 rounded-3xl p-2 transform hover:scale-105 transition-transform duration-500">
                <div className="bg-white rounded-2xl p-6 space-y-4">
                  <div className="flex items-center space-x-3">
                    <Smartphone className="w-5 h-5 text-emerald-600" />
                    <span className="font-medium text-sm">iOS & Android</span>
                  </div>
                  <div className="space-y-2">
                    <div className="h-2 bg-emerald-100 rounded w-full"></div>
                    <div className="h-2 bg-emerald-100 rounded w-4/5"></div>
                    <div className="h-2 bg-emerald-100 rounded w-3/5"></div>
                  </div>
                  <div className="bg-emerald-50 rounded-lg p-3">
                    <div className="h-2 bg-emerald-200 rounded w-full mb-2"></div>
                    <div className="h-2 bg-emerald-200 rounded w-2/3"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tablet */}
            <div className="transform hover:scale-105 transition-transform duration-500">
              <div className="bg-gray-900 rounded-2xl p-3">
                <div className="bg-white rounded-xl p-6 space-y-4">
                  <div className="flex items-center space-x-3">
                    <Tablet className="w-5 h-5 text-emerald-600" />
                    <span className="font-medium">iPad & Tablet</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="h-2 bg-emerald-100 rounded w-full"></div>
                      <div className="h-2 bg-emerald-100 rounded w-3/4"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-2 bg-emerald-100 rounded w-full"></div>
                      <div className="h-2 bg-emerald-100 rounded w-2/3"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
            <div className="text-center p-6 bg-emerald-50 rounded-2xl">
              <Globe className="w-8 h-8 text-emerald-600 mx-auto mb-3" />
              <h4 className="font-semibold text-gray-900 mb-2">Offline Ready</h4>
              <p className="text-sm text-gray-600">Czytaj bez internetu</p>
            </div>
            
            <div className="text-center p-6 bg-emerald-50 rounded-2xl">
              <div className="w-8 h-8 bg-emerald-600 rounded-full mx-auto mb-3 flex items-center justify-center">
                <span className="text-white text-xs font-bold">⚡</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Instant Sync</h4>
              <p className="text-sm text-gray-600">Synchronizacja w czasie rzeczywistym</p>
            </div>
            
            <div className="text-center p-6 bg-emerald-50 rounded-2xl">
              <div className="w-8 h-8 bg-emerald-600 rounded-full mx-auto mb-3 flex items-center justify-center">
                <span className="text-white text-xs font-bold">🔒</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Secure</h4>
              <p className="text-sm text-gray-600">Szyfrowanie end-to-end</p>
            </div>
            
            <div className="text-center p-6 bg-emerald-50 rounded-2xl">
              <div className="w-8 h-8 bg-emerald-600 rounded-full mx-auto mb-3 flex items-center justify-center">
                <span className="text-white text-xs font-bold">🚀</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Fast</h4>
              <p className="text-sm text-gray-600">Błyskawiczna wydajność</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 