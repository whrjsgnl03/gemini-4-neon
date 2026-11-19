import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

export function AmbientBackdrop() {
  const backdropRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const trigger = {
          trigger: document.documentElement,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1.2,
        };

        gsap.to('.ambient-orb--azure', {
          yPercent: 20,
          xPercent: 8,
          ease: 'none',
          scrollTrigger: trigger,
        });

        gsap.to('.ambient-orb--cyan', {
          yPercent: -16,
          xPercent: -9,
          ease: 'none',
          scrollTrigger: trigger,
        });

        gsap.to('.ambient-orb--coral', {
          yPercent: -24,
          xPercent: 12,
          ease: 'none',
          scrollTrigger: trigger,
        });

        gsap.to('.ambient-orb--pearl', {
          yPercent: -18,
          xPercent: -7,
          ease: 'none',
          scrollTrigger: trigger,
        });

        gsap.to('.ambient-beam', {
          yPercent: 28,
          rotation: -6,
          ease: 'none',
          scrollTrigger: trigger,
        });
      });
    },
    { scope: backdropRef },
  );

  return (
    <div ref={backdropRef} className="ambient-backdrop" aria-hidden="true">
      <div className="ambient-orb ambient-orb--azure" />
      <div className="ambient-orb ambient-orb--cyan" />
      <div className="ambient-orb ambient-orb--coral" />
      <div className="ambient-orb ambient-orb--pearl" />
      <div className="ambient-beam" />
    </div>
  );
}
