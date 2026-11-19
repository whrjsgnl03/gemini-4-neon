import { useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { STORY_CHAPTERS } from '../data/neonData';

function DiagramStage({ index }: { index: number }) {
  if (index === 0) {
    return (
      <div className="repo-stack">
        <div className="repo-file-row glass-well-solid">
          <div>
            <div className="repo-file-name">src/auth/tokenGuard.ts</div>
            <div className="repo-file-meta">경쟁 조건 분석 및 원자적 갱신 패치</div>
          </div>
          <span className="repo-badge">직접 패치</span>
        </div>
        <div className="repo-file-row glass-well-solid">
          <div>
            <div className="repo-file-name">src/db/connectionPool.ts</div>
            <div className="repo-file-meta">종속 모듈 14개 동시 참조 · 컨텍스트 압축</div>
          </div>
          <span className="repo-badge">의존성 추적</span>
        </div>
        <div className="repo-file-row glass-well-solid">
          <div>
            <div className="repo-file-name">tests/session.spec.ts</div>
            <div className="repo-file-meta">회귀 테스트 자동 생성 및 검증 완료</div>
          </div>
          <span className="repo-badge">중복 읽기 최소화</span>
        </div>
      </div>
    );
  }

  if (index === 1) {
    return (
      <div className="context-bar-wrap glass-well-solid">
        <div className="context-bar-track" aria-label="1M 통합 토큰 할당 비율">
          <div className="context-seg context-seg--input" style={{ transformOrigin: 'left center' }} />
          <div className="context-seg context-seg--think" style={{ transformOrigin: 'left center' }} />
          <div className="context-seg context-seg--output" style={{ transformOrigin: 'left center' }} />
        </div>
        <div className="context-legend context-legend--stacked">
          <div className="context-legend-item glass-well">
            <div className="context-legend-title">
              <span className="context-dot" style={{ background: '#38bdf8' }} />
              <span>입력 컨텍스트</span>
            </div>
            <div className="context-legend-sub">코드·이미지·오디오·영상 통합 처리</div>
          </div>
          <div className="context-legend-item glass-well">
            <div className="context-legend-title">
              <span className="context-dot" style={{ background: '#22d3ee' }} />
              <span>내부 사고 토큰</span>
            </div>
            <div className="context-legend-sub">low ~ xhigh 4단계 동적 할당</div>
          </div>
          <div className="context-legend-item glass-well">
            <div className="context-legend-title">
              <span className="context-dot" style={{ background: 'var(--accent-neon-line)' }} />
              <span>Long Decode</span>
            </div>
            <div className="context-legend-sub tabular-nums">기본 64K → 최대 1M 확장</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="orch-diagram glass-well-solid">
      <div className="orch-lead glass-well">
        <div>
          <div className="orch-worker-title">Orchestrator · Gemini 4 Neon</div>
          <div className="orch-worker-desc">
            시스템 아키텍처 설계, 단계별 계획 수립, 논리 검증 총괄
          </div>
        </div>
        <span className="repo-badge">총괄 오케스트레이터</span>
      </div>

      <svg width="100%" height="22" viewBox="0 0 360 22" fill="none" aria-hidden="true">
        <path
          className="orch-flow-path"
          d="M180 0 V11 M180 11 H60 V22 M180 11 V22 M180 11 H300 V22"
          stroke="rgba(56, 189, 248, 0.72)"
          strokeWidth="1.8"
          strokeDasharray="4 4"
        />
      </svg>

      <div className="orch-workers orch-workers--stacked">
        <div className="orch-worker glass-well">
          <div className="orch-worker-title">Hydrogen 워커 1</div>
          <div className="orch-worker-desc">단위 테스트 실행 및 실패 로그 1차 요약</div>
        </div>
        <div className="orch-worker glass-well">
          <div className="orch-worker-title">Hydrogen 워커 2</div>
          <div className="orch-worker-desc">반복적 코드 패치 및 타입 정리 병렬 처리</div>
        </div>
        <div className="orch-worker glass-well">
          <div className="orch-worker-title">Hydrogen 워커 3</div>
          <div className="orch-worker-desc">린트·프로덕션 빌드 검증 및 상태 보고</div>
        </div>
      </div>
    </div>
  );
}

export function ArchitectureStory() {
  const sectionRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const diagramRef = useRef<HTMLDivElement>(null);
  const progressBarsRef = useRef<(HTMLSpanElement | null)[]>([]);
  const stRef = useRef<ScrollTrigger | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
        if (!pinRef.current) return;

        const st = ScrollTrigger.create({
          trigger: pinRef.current,
          start: 'top 96px',
          end: '+=200%',
          pin: true,
          scrub: 0.45,
          onUpdate: (self) => {
            const p = self.progress;
            const next = Math.min(2, Math.floor(p * 3));
            setActiveIndex((prev) => (prev === next ? prev : next));

            progressBarsRef.current.forEach((bar, idx) => {
              if (!bar) return;
              const segScale =
                idx === next ? Math.max(0.08, Math.min(1, p * 3 - idx)) : idx < next ? 1 : 0;
              gsap.set(bar, { scaleX: segScale });
            });
          },
        });

        stRef.current = st;

        return () => {
          st.kill();
          stRef.current = null;
        };
      });

      mm.add('(max-width: 1023px) and (prefers-reduced-motion: no-preference)', () => {
        gsap.utils.toArray<HTMLElement>('.story-mobile-card').forEach((card) => {
          gsap.from(card, {
            opacity: 0,
            y: 26,
            scale: 0.96,
            duration: 0.65,
            ease: 'power3.out',
            clearProps: 'transform,opacity',
            scrollTrigger: {
              trigger: card,
              start: 'top 95%',
              once: true,
            },
          });
        });
      });
    },
    { scope: sectionRef },
  );

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      if (!diagramRef.current) return;

      gsap.fromTo(
        diagramRef.current,
        { opacity: 0.5, y: 10, scale: 0.98, rotateX: 2, transformPerspective: 900 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          rotateX: 0,
          duration: 0.38,
          ease: 'power3.out',
          overwrite: 'auto',
          clearProps: 'transform',
        },
      );

      if (activeIndex === 1) {
        gsap.fromTo(
          '.story-desktop-pin .context-seg',
          { scaleX: 0 },
          {
            scaleX: 1,
            duration: 0.6,
            stagger: 0.08,
            ease: 'power3.out',
            overwrite: 'auto',
          },
        );
      }

      if (activeIndex === 2) {
        gsap.fromTo(
          '.story-desktop-pin .orch-flow-path',
          { strokeDashoffset: 0 },
          {
            strokeDashoffset: -16,
            duration: 1.4,
            repeat: -1,
            ease: 'none',
          },
        );
      }
    },
    { scope: sectionRef, dependencies: [activeIndex] },
  );

  const handleSelectChapter = (idx: number) => {
    setActiveIndex(idx);
    const st = stRef.current;
    if (!st) return;
    const targetProgress = idx === 0 ? 0.08 : idx === 1 ? 0.48 : 0.88;
    const targetY = st.start + (st.end - st.start) * targetProgress;
    window.scrollTo({ top: targetY, behavior: 'smooth' });
  };

  const currentChapter = STORY_CHAPTERS[activeIndex];

  return (
    <section id="architecture" ref={sectionRef} className="section">
      <div className="container">
        <div ref={pinRef} className="story-pin-wrapper">
          <div className="story-desktop-pin">
            <div className="spatial-triptych story-triptych">
              <div className="spatial-left story-left-col">
                <div className="section-header story-section-header">
                  <h2 className="section-title">긴 호흡의 작업을 위한 아키텍처</h2>
                  <p className="section-desc">
                    대규모 저장소 탐색, 1M 메모리 관리, 멀티 에이전트 협업까지 일관된 안정성을
                    제공합니다.
                  </p>
                </div>

                <div className="story-chapters" role="tablist" aria-label="아키텍처 핵심 단계">
                  {STORY_CHAPTERS.map((chapter, idx) => {
                    const isActive = activeIndex === idx;
                    return (
                      <button
                        key={chapter.id}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        className={`story-chapter-btn tactile-press${isActive ? ' is-active' : ''}`}
                        onClick={() => handleSelectChapter(idx)}
                      >
                        <div className="story-chapter-head">
                          <span className="story-chapter-title">{chapter.title}</span>
                          <span className="story-chapter-pill">{chapter.pill}</span>
                        </div>
                        <p className="story-chapter-body">{chapter.description}</p>
                        <span
                          ref={(el) => {
                            progressBarsRef.current[idx] = el;
                          }}
                          className="story-chapter-progress"
                          aria-hidden="true"
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="spatial-center-stage" aria-hidden="true" />

              <div className="spatial-right story-vessel glass-panel">
                <div className="story-vessel-head">
                  <div>
                    <div className="story-vessel-kicker">{currentChapter.kicker}</div>
                    <h3 className="story-vessel-title">{currentChapter.title}</h3>
                  </div>
                  <div className="story-step-dots" aria-hidden="true">
                    {STORY_CHAPTERS.map((ch, idx) => (
                      <span
                        key={ch.id}
                        className={`story-step-dot${activeIndex === idx ? ' is-active' : ''}`}
                      />
                    ))}
                  </div>
                </div>

                <div ref={diagramRef} className="story-diagram-stage">
                  <DiagramStage index={activeIndex} />
                </div>
              </div>
            </div>
          </div>

          <div className="story-mobile-stack">
            <div className="section-header">
              <h2 className="section-title">긴 호흡의 작업을 위한 아키텍처</h2>
              <p className="section-desc">
                대규모 저장소 탐색, 1M 메모리 관리, 멀티 에이전트 협업까지 일관된 안정성을
                제공합니다.
              </p>
            </div>
            {STORY_CHAPTERS.map((chapter, idx) => (
              <article key={chapter.id} className="story-mobile-card glass-panel">
                <div className="story-chapter-head">
                  <h3 className="story-chapter-title">{chapter.title}</h3>
                  <span className="story-chapter-pill">{chapter.pill}</span>
                </div>
                <p className="story-chapter-body">{chapter.description}</p>
                <DiagramStage index={idx} />
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
