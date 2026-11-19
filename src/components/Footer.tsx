export function Footer() {
  const scrollToTop = () => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  };

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-panel glass-panel">
          <div className="footer-meta">
            <div className="footer-brand">Gemini 4 Neon · Ne 10</div>
            <div className="footer-source">
              2026년 11월 18일 Google DeepMind 공식 사양 및 Artificial Analysis · Terminal-Bench ·
              Vals Index 공개 지표 기반 안내 페이지
            </div>
          </div>

          <button type="button" className="glass-btn-secondary" onClick={scrollToTop}>
            맨 위로
          </button>
        </div>
      </div>
    </footer>
  );
}
