import { ClientsSection } from "./ClientsSection";
import { CoursesSection } from "./CoursesSection";
import { CtaFooterSection } from "./CtaFooterSection";
import { FaqSection } from "./FaqSection";
import { FeaturesSection } from "./FeaturesSection";
import { HeroSection } from "./HeroSection";
import { HowItWorksSection } from "./HowItWorksSection";
import { ShowcaseSection } from "./ShowcaseSection";
import { TestimonialsSection } from "./TestimonialsSection";

export function LandingPage() {
  return (
    <main className="min-h-screen bg-white">
      <HeroSection />
      <CoursesSection />
      <FeaturesSection />
      <ClientsSection />
      <HowItWorksSection />
      <ShowcaseSection />
      <TestimonialsSection />
      <FaqSection />
      <CtaFooterSection />
    </main>
  );
}
