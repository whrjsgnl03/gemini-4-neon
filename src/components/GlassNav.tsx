import { useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { NAV_ITEMS } from '../data/neonData';

export function GlassNav() {
  const navRef = useRef<HTMLElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [activeId, setActiveId] = useState<string>('overview');

  useGSAP(
    () => {
      if (progressRef.current) {
        gsap.to(progressRef.current, {
          scaleX: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: document.documentElement,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.2,
            refreshPriority: -10,
          },
        });
      }

      const sectionIds = [...NAV_ITEMS.map((item) => item.id), 'developer'];
      sectionIds.forEach((id) => {
        const target = document.getElementById(id);
        if (!target) return;

        ScrollTrigger.create({
          trigger: target,
          start: 'top 42%',
          end: 'bottom 42%',
          refreshPriority: -10,
          onEnter: () => setActiveId(id),
          onEnterBack: () => setActiveId(id),
        });
      });
    },
    { scope: navRef },
  );

  const handleNavClick = (event: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    const target = document.getElementById(id);
    if (!target) return;
    event.preventDefault();
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    setActiveId(id);
  };

  return (
    <header ref={navRef} className="nav-shell">
      <nav className="nav-bar glass-nav" aria-label="주요 섹션 이동">
        <a
          href="#overview"
          className="nav-brand"
          onClick={(e) => handleNavClick(e, 'overview')}
        >
          <span className="neon-spectral-dot" aria-hidden="true" />
          <span>Gemini 4 Neon</span>
          <span className="nav-badge tabular-nums">Ne · 10</span>
        </a>

        <ul className="nav-links">
          {NAV_ITEMS.map((item) => {
            const isActive = activeId === item.id;
            return (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className={`nav-link${isActive ? ' is-active' : ''}`}
                  aria-current={isActive ? 'true' : undefined}
                  onClick={(e) => handleNavClick(e, item.id)}
                >
                  {item.label}
                </a>
              </li>
            );
          })}
        </ul>

        <div className="nav-actions-right">
          <div className="nav-shape-chip" aria-hidden="true">
            <span className="neon-spectral-dot" />
            <span id="nav-particle-label">Gemini 네온 스타</span>
          </div>

          <a
            href="#developer"
            className="nav-cta tactile-press"
            onClick={(e) => handleNavClick(e, 'developer')}
          >
            API 사양
          </a>
        </div>

        <div className="nav-progress-track" aria-hidden="true">
          <div ref={progressRef} className="nav-progress-fill" />
        </div>
      </nav>
    </header>
  );
}
