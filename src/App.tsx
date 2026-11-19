import { useEffect, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { AmbientBackdrop } from './components/AmbientBackdrop';
import { ArchitectureStory } from './components/ArchitectureStory';
import { BenchmarkSection } from './components/BenchmarkSection';
import { DeveloperSection } from './components/DeveloperSection';
import { Footer } from './components/Footer';
import { GlassNav } from './components/GlassNav';
import { HeroSection } from './components/HeroSection';
import { LineupComparison } from './components/LineupComparison';
import { ParticleStage } from './components/ParticleStage';
import { ThinkingLab } from './components/ThinkingLab';
import type { ThinkingLevelId } from './data/neonData';

gsap.registerPlugin(ScrollTrigger, useGSAP);
ScrollTrigger.config({ ignoreMobileResize: true });

export function App() {
  const [thinkingLevel, setThinkingLevel] = useState<ThinkingLevelId>('high');

  useEffect(() => {
    let active = true;
    document.fonts?.ready.then(() => {
      if (active) {
        ScrollTrigger.refresh();
      }
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="page-root">
      <AmbientBackdrop />
      <ParticleStage thinkingLevel={thinkingLevel} />
      <GlassNav />
      <main className="page-main">
        <HeroSection />
        <ArchitectureStory />
        <ThinkingLab level={thinkingLevel} onLevelChange={setThinkingLevel} />
        <LineupComparison />
        <BenchmarkSection />
        <DeveloperSection />
      </main>
      <Footer />
    </div>
  );
}

export default App;
