import { Header } from "@/components/header";
import { HeroSection } from "@/components/hero-section";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
      </main>
      <Footer />
    </>
  );
}
