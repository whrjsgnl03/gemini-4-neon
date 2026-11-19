import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { HERO_METRICS } from '../data/neonData';

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const floatRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const specularRef = useRef<HTMLDivElement>(null);
  const ringsRef = useRef<SVGSVGElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from('[data-hero-anim]', {
          opacity: 0,
          y: 34,
          rotateX: 8,
          scale: 0.94,
          transformPerspective: 1000,
          duration: 0.85,
          stagger: 0.08,
          ease: 'power4.out',
          clearProps: 'transform,opacity',
        });

        if (floatRef.current) {
          gsap.to(floatRef.current, {
            y: -8,
            duration: 3.2,
            yoyo: true,
            repeat: -1,
            ease: 'sine.inOut',
          });
        }

        if (ringsRef.current) {
          gsap.to(ringsRef.current, {
            rotation: 360,
            transformOrigin: '69% 33%',
            duration: 38,
            repeat: -1,
            ease: 'none',
          });
        }

        const heroParallax = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: 0.7,
          },
        });

        heroParallax
          .to(
            '.prism-stage',
            {
              y: -22,
              rotateZ: -0.45,
              ease: 'none',
            },
            0,
          )
          .to(
            '.hero-copy',
            {
              y: -14,
              opacity: 0.88,
              ease: 'none',
            },
            0,
          );

        const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
        const card = cardRef.current;
        const specular = specularRef.current;
        if (!finePointer || !card || !specular) return;

        const rotX = gsap.quickTo(card, 'rotateX', { duration: 0.45, ease: 'power3.out' });
        const rotY = gsap.quickTo(card, 'rotateY', { duration: 0.45, ease: 'power3.out' });
        const specX = gsap.quickTo(specular, 'x', { duration: 0.45, ease: 'power3.out' });
        const specY = gsap.quickTo(specular, 'y', { duration: 0.45, ease: 'power3.out' });

        const onPointerMove = (e: PointerEvent) => {
          const rect = card.getBoundingClientRect();
          const nx = (e.clientX - rect.left) / rect.width - 0.5;
          const ny = (e.clientY - rect.top) / rect.height - 0.5;
          rotY(nx * 10);
          rotX(-ny * 10);
          specX(nx * 50);
          specY(ny * 50);
        };

        const onPointerLeave = () => {
          rotX(0);
          rotY(0);
          specX(0);
          specY(0);
        };

        card.addEventListener('pointermove', onPointerMove);
        card.addEventListener('pointerleave', onPointerLeave);

        return () => {
          card.removeEventListener('pointermove', onPointerMove);
          card.removeEventListener('pointerleave', onPointerLeave);
        };
      });
    },
    { scope: sectionRef },
  );

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  };

  return (
    <section id="overview" ref={sectionRef} className="hero-section">
      <div className="container">
        <div className="spatial-triptych hero-triptych">
          <div className="spatial-left hero-copy">
            <div className="glass-chip" data-hero-anim>
              <span className="neon-spectral-dot" aria-hidden="true" />
              <span>2026년 11월 18일 공개 · Gemini 4 패밀리</span>
            </div>

            <h1 className="hero-title" data-hero-anim>
              깊이 있는 추론,
              <br />
              거침없는 실행 속도.
            </h1>

            <p className="hero-subtitle" data-hero-anim>
              Google DeepMind의 Gemini 4 Neon은 대규모 저장소 코딩, 1M 통합 컨텍스트, 4단계 추론
              깊이 제어를 결합해 프론티어 급 지능과 프로덕션 효율을 동시에 달성한 핵심 모델입니다.
            </p>

            <div className="hero-actions" data-hero-anim>
              <button
                type="button"
                className="glass-btn-primary"
                onClick={() => scrollToSection('thinking')}
              >
                추론 깊이 체험하기
              </button>
              <button
                type="button"
                className="glass-btn-secondary"
                onClick={() => scrollToSection('architecture')}
              >
                아키텍처 살펴보기
              </button>
            </div>
          </div>

          <div className="spatial-center-stage" aria-hidden="true" />

          <div className="spatial-right prism-stage" data-hero-anim>
            <div ref={floatRef} className="prism-stack">
              <div ref={cardRef} className="prism-card glass-panel">
                <div ref={specularRef} className="prism-specular" aria-hidden="true" />

                <svg
                  ref={ringsRef}
                  className="prism-rings"
                  viewBox="0 0 420 420"
                  fill="none"
                  aria-hidden="true"
                >
                  <circle
                    cx="290"
                    cy="140"
                    r="138"
                    stroke="rgba(56, 189, 248, 0.28)"
                    strokeWidth="1.4"
                    strokeDasharray="6 6"
                  />
                  <circle
                    cx="290"
                    cy="140"
                    r="96"
                    stroke="rgba(34, 211, 238, 0.3)"
                    strokeWidth="1.3"
                  />
                  <circle
                    cx="290"
                    cy="140"
                    r="52"
                    stroke="rgba(255, 107, 74, 0.42)"
                    strokeWidth="1.6"
                  />
                </svg>

                <div className="prism-card-top">
                  <span className="prism-atomic-num tabular-nums">원자 번호 10 · 비활성 기체</span>
                  <span className="prism-status-pill">
                    <span className="neon-spectral-dot" aria-hidden="true" />
                    <span>GA 정식 출시</span>
                  </span>
                </div>

                <div className="prism-center">
                  <div className="prism-symbol tabular-nums">Ne</div>
                  <div className="prism-name">Gemini 4 Neon</div>
                  <code className="prism-id-chip">gemini-4-neon</code>
                </div>

                <div className="prism-specs">
                  <div className="prism-spec-box glass-well">
                    <div className="prism-spec-k">컨텍스트 윈도우</div>
                    <div className="prism-spec-v tabular-nums">1,048,576 토큰</div>
                  </div>
                  <div className="prism-spec-box glass-well">
                    <div className="prism-spec-k">코딩 에이전트 지수</div>
                    <div className="prism-spec-v tabular-nums">58.6점 (전체 1위)</div>
                  </div>
                </div>
              </div>

              <div className="hero-metrics glass-panel">
                {HERO_METRICS.map((metric) => (
                  <div key={metric.value} className="hero-metric-item glass-well">
                    <span className="hero-metric-value tabular-nums">{metric.value}</span>
                    <span className="hero-metric-label">{metric.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
