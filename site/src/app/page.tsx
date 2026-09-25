import { Navbar } from "@/components/navbar";
import { HeroScroll } from "@/components/hero-scroll";
import { FeaturesSection } from "@/components/features";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#08090a] text-white">
      <Navbar />
      <HeroScroll />
      <FeaturesSection />
      <Footer />
    </main>
  );
}
