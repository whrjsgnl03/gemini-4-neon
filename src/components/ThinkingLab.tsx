import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { THINKING_LEVELS, type ThinkingLevelId } from '../data/neonData';

const LEVEL_ORDER: ThinkingLevelId[] = ['low', 'medium', 'high', 'xhigh'];

interface ThinkingLabProps {
  level: ThinkingLevelId;
  onLevelChange: (next: ThinkingLevelId) => void;
}

export function ThinkingLab({ level, onLevelChange }: ThinkingLabProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLDivElement>(null);
  const readoutRef = useRef<HTMLDivElement>(null);
  const codePanelRef = useRef<HTMLDivElement>(null);
  const speedFillRef = useRef<HTMLDivElement>(null);
  const depthFillRef = useRef<HTMLDivElement>(null);
  const effFillRef = useRef<HTMLDivElement>(null);
  const hasMountedRef = useRef(false);
  const tabRefs = useRef<Record<ThinkingLevelId, HTMLButtonElement | null>>({
    low: null,
    medium: null,
    high: null,
    xhigh: null,
  });

  const current = THINKING_LEVELS[level];

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      gsap.from('.thinking-panel-anim', {
        opacity: 0,
        y: 32,
        rotateX: 6,
        scale: 0.96,
        transformPerspective: 1000,
        duration: 0.78,
        stagger: 0.1,
        ease: 'power3.out',
        clearProps: 'transform,opacity',
        scrollTrigger: {
          trigger: '.thinking-triptych',
          start: 'top 90%',
          once: true,
        },
      });
    },
    { scope: sectionRef },
  );

  useGSAP(
    () => {
      const btn = tabRefs.current[level];
      const pill = pillRef.current;
      const spec = THINKING_LEVELS[level];
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const isInitial = !hasMountedRef.current;
      hasMountedRef.current = true;

      if (btn && pill) {
        const x = btn.offsetLeft;
        const width = btn.offsetWidth;
        if (isInitial || reduceMotion) {
          gsap.set(pill, { x, width });
        } else {
          gsap.to(pill, { x, width, duration: 0.34, ease: 'power3.out', overwrite: 'auto' });
        }
      }

      if (isInitial || reduceMotion) {
        gsap.set(speedFillRef.current, { scaleX: spec.speedScore / 100 });
        gsap.set(depthFillRef.current, { scaleX: spec.depthScore / 100 });
        gsap.set(effFillRef.current, { scaleX: spec.efficiencyScore / 100 });
      } else {
        gsap.to(speedFillRef.current, {
          scaleX: spec.speedScore / 100,
          duration: 0.45,
          ease: 'power3.out',
          overwrite: 'auto',
        });
        gsap.to(depthFillRef.current, {
          scaleX: spec.depthScore / 100,
          duration: 0.45,
          ease: 'power3.out',
          overwrite: 'auto',
        });
        gsap.to(effFillRef.current, {
          scaleX: spec.efficiencyScore / 100,
          duration: 0.45,
          ease: 'power3.out',
          overwrite: 'auto',
        });

        if (readoutRef.current) {
          gsap.fromTo(
            readoutRef.current,
            { opacity: 0.45, y: 10 },
            {
              opacity: 1,
              y: 0,
              duration: 0.32,
              ease: 'power3.out',
              overwrite: 'auto',
              clearProps: 'transform',
            },
          );
        }

        if (codePanelRef.current) {
          gsap.fromTo(
            codePanelRef.current,
            { opacity: 0.72, scale: 0.985 },
            {
              opacity: 1,
              scale: 1,
              duration: 0.32,
              ease: 'power3.out',
              overwrite: 'auto',
              clearProps: 'transform',
            },
          );
        }
      }

      const onResize = () => {
        const activeBtn = tabRefs.current[level];
        if (activeBtn && pillRef.current) {
          gsap.set(pillRef.current, { x: activeBtn.offsetLeft, width: activeBtn.offsetWidth });
        }
      };

      window.addEventListener('resize', onResize);
      return () => window.removeEventListener('resize', onResize);
    },
    { scope: sectionRef, dependencies: [level] },
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, idx: number) => {
    let nextIdx = idx;
    if (e.key === 'ArrowRight') nextIdx = (idx + 1) % LEVEL_ORDER.length;
    else if (e.key === 'ArrowLeft') nextIdx = (idx - 1 + LEVEL_ORDER.length) % LEVEL_ORDER.length;
    else if (e.key === 'Home') nextIdx = 0;
    else if (e.key === 'End') nextIdx = LEVEL_ORDER.length - 1;
    else return;

    e.preventDefault();
    const nextLevel = LEVEL_ORDER[nextIdx];
    tabRefs.current[nextLevel]?.focus();
    onLevelChange(nextLevel);
  };

  const configSnippet = `{
  "model": "gemini-4-neon",
  "config": {
    "thinkingConfig": {
      "thinkingLevel": "${level}"
    }
  }
}`;

  return (
    <section id="thinking" ref={sectionRef} className="section">
      <div className="container">
        <div className="spatial-triptych thinking-triptych">
          <div className="spatial-left thinking-left-col">
            <div className="section-header" style={{ marginBottom: '22px' }}>
              <h2 className="section-title">작업 난도에 맞춘 4단계 추론 깊이 제어</h2>
              <p className="section-desc">
                단일 모델에서 low부터 xhigh까지 사고 예산을 조절하면 중앙의 추론 코어가 단계별로
                활성화됩니다.
              </p>
            </div>

            <div className="thinking-studio-left glass-panel thinking-panel-anim">
              <div className="thinking-tabs-wrap" style={{ justifyContent: 'flex-start' }}>
                <div
                  ref={trackRef}
                  className="segmented-track"
                  role="tablist"
                  aria-label="Gemini 4 Neon 추론 깊이 선택"
                >
                  <div ref={pillRef} className="segmented-pill" aria-hidden="true" />
                  {LEVEL_ORDER.map((id, idx) => {
                    const spec = THINKING_LEVELS[id];
                    const isSelected = level === id;
                    return (
                      <button
                        key={id}
                        ref={(el) => {
                          tabRefs.current[id] = el;
                        }}
                        type="button"
                        role="tab"
                        aria-selected={isSelected}
                        tabIndex={isSelected ? 0 : -1}
                        className="segmented-tab tactile-press"
                        onClick={() => onLevelChange(id)}
                        onKeyDown={(e) => handleKeyDown(e, idx)}
                      >
                        {spec.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div ref={readoutRef} className="thinking-readout glass-well" role="tabpanel">
                <div className="thinking-readout-top">
                  <div className="thinking-head-row">
                    <h3 className="thinking-tier-title">{current.headline}</h3>
                    <span className="thinking-badge">{current.badge}</span>
                  </div>
                  <p className="story-chapter-body">{current.summary}</p>
                </div>

                <div className="thinking-usecases">
                  {current.bestFor.map((item) => (
                    <span key={item} className="usecase-chip">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="spatial-center-stage" aria-hidden="true" />

          <div className="spatial-right thinking-studio-right glass-panel thinking-panel-anim">
            <div className="thinking-gauges glass-well" style={{ padding: '18px' }}>
              <div className="gauge-row">
                <div className="gauge-label-row">
                  <span>응답 속도</span>
                  <span className="tabular-nums">{current.speedScore}%</span>
                </div>
                <div className="gauge-track">
                  <div ref={speedFillRef} className="gauge-fill" />
                </div>
              </div>
              <div className="gauge-row">
                <div className="gauge-label-row">
                  <span>추론 깊이</span>
                  <span className="tabular-nums">{current.depthScore}%</span>
                </div>
                <div className="gauge-track">
                  <div ref={depthFillRef} className="gauge-fill" />
                </div>
              </div>
              <div className="gauge-row">
                <div className="gauge-label-row">
                  <span>토큰 비용 효율</span>
                  <span className="tabular-nums">{current.efficiencyScore}%</span>
                </div>
                <div className="gauge-track">
                  <div ref={effFillRef} className="gauge-fill" />
                </div>
              </div>
            </div>

            <div ref={codePanelRef} className="thinking-code-panel glass-obsidian">
              <div>
                <div className="prism-spec-k" style={{ color: 'var(--obsidian-muted)' }}>
                  실시간 요청 설정 미리보기
                </div>
                <h3
                  style={{
                    marginTop: '4px',
                    fontSize: '1.0625rem',
                    fontWeight: 600,
                    color: '#ffffff',
                  }}
                >
                  thinkingConfig.thinkingLevel
                </h3>
              </div>

              <pre className="thinking-code-pre">
                <code>{configSnippet}</code>
              </pre>

              <p style={{ fontSize: '0.84375rem', color: 'var(--obsidian-muted)' }}>
                {current.highlightNote}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
