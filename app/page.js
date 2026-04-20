import HeroSection from '@/components/HeroSection';
import AboutSection from '@/components/AboutSection';
import ServicesSection from '@/components/ServicesSection';
import TeamSection from '@/components/TeamSection';
import ContactSection from '@/components/ContactSection';
import LibraryBanner from '@/components/LibraryBanner';

export const metadata = {
  title: 'Unimak Public Health Society Portal',
  description: 'University of Makeni Public Health Society — Academic notes, exam resources, and career guidance.',
};

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <AboutSection />
      <ServicesSection />
      <LibraryBanner />
      <TeamSection />
      <ContactSection />
    </>
  );
}
