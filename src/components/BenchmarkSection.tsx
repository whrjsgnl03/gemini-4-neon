import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { BENCHMARKS } from '../data/neonData';

export function BenchmarkSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const fillsRef = useRef<(HTMLDivElement | null)[]>([]);
  const scoresRef = useRef<(HTMLSpanElement | null)[]>([]);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from('.bench-callout', {
          opacity: 0,
          y: 30,
          rotateX: 6,
          scale: 0.96,
          transformPerspective: 900,
          duration: 0.72,
          stagger: 0.1,
          ease: 'power3.out',
          clearProps: 'transform,opacity',
          scrollTrigger: {
            trigger: '.bench-summary',
            start: 'top 90%',
            once: true,
          },
        });

        const fills = fillsRef.current.filter((el): el is HTMLDivElement => el !== null);
        if (fills.length === 0) return;

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: '.bench-panel',
            start: 'top 90%',
            once: true,
          },
        });

        tl.fromTo(
          fills,
          { scaleX: 0 },
          {
            scaleX: (idx) => (BENCHMARKS[idx]?.score ?? 0) / 100,
            duration: 0.85,
            stagger: 0.06,
            ease: 'power4.out',
          },
          0,
        );

        BENCHMARKS.forEach((item, idx) => {
          const el = scoresRef.current[idx];
          if (!el) return;
          const counter = { val: 0 };
          tl.to(
            counter,
            {
              val: item.score,
              duration: 0.85,
              ease: 'power4.out',
              onUpdate: () => {
                el.textContent = `${counter.val.toFixed(item.decimals)}${item.suffix}`;
              },
            },
            idx * 0.06,
          );
        });
      });
    },
    { scope: sectionRef },
  );

  return (
    <section id="benchmarks" ref={sectionRef} className="section">
      <div className="container">
        <div className="spatial-triptych bench-triptych">
          <div className="spatial-left bench-summary">
            <div className="section-header" style={{ marginBottom: '4px' }}>
              <h2 className="section-title">독립 벤치마크로 검증된 실전 역량</h2>
              <p className="section-desc">
                Coding Agent Index 전체 1위와 지능 지수 61점을 기록하며 작업 처리 비용을 약 32%
                낮췄습니다.
              </p>
            </div>

            <div className="bench-callout glass-panel">
              <div className="bench-callout-num tabular-nums">전체 1위 · 58.6점</div>
              <div style={{ fontWeight: 700, color: 'var(--ink-primary)' }}>
                Artificial Analysis Coding Agent Index
              </div>
              <p className="story-chapter-body">
                Antigravity CLI 기반 도구 호출·저장소 디버깅 평가에서 최상위권 비용 대비 성능을
                입증했습니다.
              </p>
            </div>

            <div className="bench-callout glass-panel">
              <div className="bench-callout-num tabular-nums">~32% 절감</div>
              <div style={{ fontWeight: 700, color: 'var(--ink-primary)' }}>
                작업당 비용 효율 극대화
              </div>
              <p className="story-chapter-body">
                Carbon에 육박하는 추론 정확도를 유지하면서도 1M 입력 $3 / 출력 $15 요금으로 대규모
                투입 부담을 낮췄습니다.
              </p>
            </div>
          </div>

          <div className="spatial-center-stage" aria-hidden="true" />

          <div className="spatial-right bench-panel glass-panel">
            {BENCHMARKS.map((item, idx) => (
              <div key={item.name} className="bench-row glass-well">
                <div className="bench-row-top">
                  <span className="bench-name">{item.name}</span>
                  <span
                    ref={(el) => {
                      scoresRef.current[idx] = el;
                    }}
                    className="bench-score tabular-nums"
                  >
                    {item.score.toFixed(item.decimals)}
                    {item.suffix}
                  </span>
                </div>
                <div className="bench-track" aria-hidden="true">
                  <div
                    ref={(el) => {
                      fillsRef.current[idx] = el;
                    }}
                    className="bench-fill"
                    style={{ transform: `scaleX(${item.score / 100})` }}
                  />
                </div>
                <div className="bench-note">{item.note}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
