import { useEffect, useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ACCESS_CHANNELS, CODE_SNIPPETS, type CodeLangId } from '../data/neonData';

const LANG_ORDER: CodeLangId[] = ['typescript', 'python', 'curl'];

export function DeveloperSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const preRef = useRef<HTMLPreElement>(null);
  const copyTimerRef = useRef<number | null>(null);
  const hasMountedRef = useRef(false);

  const [lang, setLang] = useState<CodeLangId>('typescript');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current !== null) {
        window.clearTimeout(copyTimerRef.current);
      }
    };
  }, []);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: '.dev-triptych',
            start: 'top 90%',
            once: true,
          },
        });

        tl.from(
          '.dev-info-panel',
          {
            opacity: 0,
            x: -28,
            rotateY: 4,
            transformPerspective: 1000,
            duration: 0.78,
            ease: 'power3.out',
            clearProps: 'transform,opacity',
          },
          0,
        ).from(
          '.dev-terminal',
          {
            opacity: 0,
            x: 28,
            rotateY: -4,
            transformPerspective: 1000,
            duration: 0.78,
            ease: 'power3.out',
            clearProps: 'transform,opacity',
          },
          0.08,
        );
      });

      mm.add('(max-width: 1023px) and (prefers-reduced-motion: no-preference)', () => {
        gsap.from('.dev-info-panel, .dev-terminal', {
          opacity: 0,
          y: 26,
          scale: 0.97,
          duration: 0.68,
          stagger: 0.1,
          ease: 'power3.out',
          clearProps: 'transform,opacity',
          scrollTrigger: {
            trigger: '.dev-triptych',
            start: 'top 92%',
            once: true,
          },
        });
      });
    },
    { scope: sectionRef },
  );

  useGSAP(
    () => {
      const isInitial = !hasMountedRef.current;
      hasMountedRef.current = true;
      if (isInitial) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      if (!preRef.current) return;

      gsap.fromTo(
        preRef.current,
        { opacity: 0.45, y: 6 },
        {
          opacity: 1,
          y: 0,
          duration: 0.26,
          ease: 'power3.out',
          overwrite: 'auto',
          clearProps: 'transform',
        },
      );
    },
    { scope: sectionRef, dependencies: [lang] },
  );

  const handleLangChange = (nextLang: CodeLangId) => {
    if (nextLang === lang) return;
    setLang(nextLang);
    setCopied(false);
  };

  const handleCopy = async () => {
    const text = CODE_SNIPPETS[lang].code;
    let ok = false;
    try {
      await navigator.clipboard.writeText(text);
      ok = true;
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.top = '0';
      ta.style.left = '0';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.focus({ preventScroll: true });
      ta.select();
      ok = document.execCommand('copy');
      document.body.removeChild(ta);
    }

    if (ok) {
      setCopied(true);
      if (copyTimerRef.current !== null) {
        window.clearTimeout(copyTimerRef.current);
      }
      copyTimerRef.current = window.setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <section id="developer" ref={sectionRef} className="section">
      <div className="container">
        <div className="spatial-triptych dev-triptych">
          <div className="spatial-left dev-left-col">
            <div className="section-header" style={{ marginBottom: '18px' }}>
              <h2 className="section-title">개발자 연동 및 투명한 요금 체계</h2>
              <p className="section-desc">
                정식 GA 모델 <code className="prism-id-chip">gemini-4-neon</code>을 Gemini API,
                Vertex AI, Antigravity에서 즉시 호출할 수 있습니다.
              </p>
            </div>

            <div className="dev-info-panel glass-panel">
              <div>
                <h3 className="story-chapter-title" style={{ marginBottom: '10px' }}>
                  API 단가 (100만 토큰 기준)
                </h3>
                <div className="dev-price-grid tabular-nums">
                  <div className="dev-price-box glass-well">
                    <div className="dev-price-val">$3.00</div>
                    <div className="dev-price-lbl">표준 입력 토큰</div>
                  </div>
                  <div className="dev-price-box glass-well">
                    <div className="dev-price-val">$15.00</div>
                    <div className="dev-price-lbl">출력 (사고 포함)</div>
                  </div>
                  <div className="dev-price-box glass-well">
                    <div className="dev-price-val">$0.15</div>
                    <div className="dev-price-lbl">암묵적 캐시 (95%↓)</div>
                  </div>
                  <div className="dev-price-box glass-well">
                    <div className="dev-price-val">~50%↓</div>
                    <div className="dev-price-lbl">Batch/Flex · 유료 전용</div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="story-chapter-title" style={{ marginBottom: '8px' }}>
                  지원 플랫폼 및 생태계
                </h3>
                <div className="dev-channels">
                  {ACCESS_CHANNELS.map((ch) => (
                    <div key={ch.name} className="dev-channel-item glass-well">
                      <span className="dev-channel-name">{ch.name}</span>
                      <span className="dev-channel-detail">{ch.detail}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="spatial-center-stage" aria-hidden="true" />

          <div className="spatial-right dev-terminal glass-obsidian">
            <div className="dev-terminal-bar">
              <div className="dev-lang-tabs" role="tablist" aria-label="코드 예제 언어 선택">
                {LANG_ORDER.map((id) => {
                  const isSelected = lang === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      role="tab"
                      aria-selected={isSelected}
                      className="dev-lang-btn tactile-press"
                      onClick={() => handleLangChange(id)}
                    >
                      {CODE_SNIPPETS[id].label}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                className="dev-copy-btn tactile-press"
                onClick={handleCopy}
                aria-live="polite"
              >
                {copied ? '복사됨' : '코드 복사'}
              </button>
            </div>

            <pre ref={preRef} className="dev-code-pre">
              <code>{CODE_SNIPPETS[lang].code}</code>
            </pre>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '8px',
                fontSize: '0.8125rem',
                color: 'var(--obsidian-muted)',
              }}
            >
              <span>동기 기본 출력: 65,536 토큰</span>
              <span>Long Decode: 최대 1,048,576 토큰</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
