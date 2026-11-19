import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { LINEUP_COLUMNS, LINEUP_ROWS } from '../data/neonData';

export function LineupComparison() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
        gsap.from('.spectrum-node', {
          opacity: 0,
          x: -24,
          duration: 0.65,
          stagger: 0.08,
          ease: 'power3.out',
          clearProps: 'transform,opacity',
          scrollTrigger: {
            trigger: '.spectrum-bar',
            start: 'top 90%',
            once: true,
          },
        });

        gsap.from('.table-panel', {
          opacity: 0,
          x: 28,
          duration: 0.72,
          ease: 'power3.out',
          clearProps: 'transform,opacity',
          scrollTrigger: {
            trigger: '.table-panel',
            start: 'top 90%',
            once: true,
          },
        });

        gsap.from('.compare-table tbody tr', {
          opacity: 0,
          y: 12,
          duration: 0.5,
          stagger: 0.045,
          ease: 'power3.out',
          clearProps: 'transform,opacity',
          scrollTrigger: {
            trigger: '.table-panel',
            start: 'top 90%',
            once: true,
          },
        });
      });

      mm.add('(max-width: 1023px) and (prefers-reduced-motion: no-preference)', () => {
        gsap.from('.spectrum-node, .table-panel', {
          opacity: 0,
          y: 22,
          duration: 0.65,
          stagger: 0.08,
          ease: 'power3.out',
          clearProps: 'transform,opacity',
          scrollTrigger: {
            trigger: '.lineup-triptych',
            start: 'top 92%',
            once: true,
          },
        });
      });
    },
    { scope: sectionRef },
  );

  return (
    <section id="lineup" ref={sectionRef} className="section">
      <div className="container">
        <div className="spatial-triptych lineup-triptych">
          <div className="spatial-left lineup-left-col">
            <div className="section-header" style={{ marginBottom: '22px' }}>
              <h2 className="section-title">Gemini 4 패밀리 속 Neon</h2>
              <p className="section-desc">
                Hydrogen의 빠른 속도와 Carbon의 심층 추론 사이에서 프로덕션 최적점을 담당합니다.
              </p>
            </div>

            <div className="spectrum-bar spectrum-bar--stacked glass-panel" aria-label="Gemini 4 모델 스펙트럼">
              {LINEUP_COLUMNS.map((col) => {
                const isNeon = col.id === 'neon';
                return (
                  <div
                    key={col.id}
                    className={`spectrum-node${isNeon ? ' spectrum-node--neon' : ''}`}
                  >
                    <div className="spectrum-node-head">
                      <span className="spectrum-el">{col.name}</span>
                      <span className="story-chapter-pill tabular-nums">{col.elementCode}</span>
                    </div>
                    <div className="spectrum-role">{col.role}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="spatial-center-stage" aria-hidden="true" />

          <div className="spatial-right table-panel glass-panel">
            <div className="table-scroll">
              <table className="compare-table compare-table--compact">
                <caption
                  style={{
                    position: 'absolute',
                    width: 1,
                    height: 1,
                    overflow: 'hidden',
                    clipPath: 'inset(50%)',
                  }}
                >
                  Gemini 4 Hydrogen, Neon, Carbon 모델 사양 및 단가 비교
                </caption>
                <thead>
                  <tr>
                    <th scope="col">비교 항목</th>
                    {LINEUP_COLUMNS.map((col) => (
                      <th
                        key={col.id}
                        scope="col"
                        className={col.id === 'neon' ? 'compare-col-neon' : undefined}
                      >
                        <div>{col.name.replace('Gemini 4 ', '')}</div>
                        <div className="compare-sub-id">{col.elementCode}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="tabular-nums">
                  {LINEUP_ROWS.map((row) => (
                    <tr key={row.label}>
                      <th scope="row">{row.label}</th>
                      <td>{row.hydrogen}</td>
                      <td className="compare-col-neon">{row.neon}</td>
                      <td>{row.carbon}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
