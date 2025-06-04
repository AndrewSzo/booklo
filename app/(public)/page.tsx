import { BookHeroSection } from "@/components/homepage/BookHeroSection";
import { FeaturesSection } from "@/components/homepage/FeaturesSection";
import { PowerfulOrganizationSection } from "@/components/homepage/PowerfulOrganizationSection";
import { TestimonialsSection } from "@/components/homepage/TestimonialsSection";
import { IntegrationsSection } from "@/components/homepage/IntegrationsSection";
import { DevicesSection } from "@/components/homepage/DevicesSection";
import { FAQSection } from "@/components/homepage/FAQSection";
import { CTASection } from "@/components/homepage/CTASection";
import { NavbarComponent } from "@/components/homepage/NavbarComponent";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50">
      <NavbarComponent />
      <BookHeroSection />
      <FeaturesSection />
      <PowerfulOrganizationSection />
      <TestimonialsSection />
      <IntegrationsSection />
      <DevicesSection />
      <FAQSection />
      <CTASection />
    </div>
  );
} 