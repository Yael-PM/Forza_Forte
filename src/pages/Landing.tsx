/** Página principal: presenta el hero y la historia interactiva del producto. */
import { useState, useCallback } from 'react';
import FuturisticLoader from '../components/UX/Loader';
import Navbar from '../components/UI/Navbar';
import HeroSection from '../components/landing/HeroSection';
import ScrollStorySection from '../components/landing/ScrollStorySection';
import Footer from '../components/UI/Footer';

export default function Landing() {
  const [loaded, setLoaded] = useState(false);
  const handleLoadComplete = useCallback(() => setLoaded(true), []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {!loaded && <FuturisticLoader onComplete={handleLoadComplete} />}
      <Navbar />
      <main>
        <HeroSection />
        <ScrollStorySection />
      </main>
      <Footer />
    </div>
  );
}
