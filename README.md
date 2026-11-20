# Gemini 4 Neon Showcase

Google DeepMind의 **Gemini 4 Neon** (`gemini-4-neon`) 모델 사양, 아키텍처, 추론 깊이 제어 및 벤치마크 성과를 **Apple Spatial Liquid Glass** 글래스모피즘과 **GSAP + ScrollTrigger** 스크롤 연동 3D 입자 모핑 애니메이션으로 풀어낸 인터랙티브 웹 쇼케이스입니다.

- **GitHub Repository**: https://github.com/whrjsgnl03/gemini-4-neon

---

## 디자인 & 인터랙션 특징

- **Apple Spatial Liquid Glass**
  - 스크롤에 연동되는 광학 배경(`AmbientBackdrop` 4개 오브 + 라이트 빔) 위에 반투명 유리(`backdrop-filter`) · Fresnel 상단 스펙큘러 림 · 크로매틱 보더를 적용해 뒷배경의 빛과 중앙 입자 광채가 실제로 투과해 비치도록 구현했습니다.
- **중앙 입자 무대 & 좌·우 분리 회랑 (`.spatial-triptych`)**
  - 데스크톱(`1024px` 이상)에서는 왼쪽 설명 칼럼과 오른쪽 카드 칼럼 사이 중앙 공간을 비워 3D 입자 캔버스가 텍스트를 가리지 않도록 배치했고, 태블릿·모바일에서는 1열 카드로 자연스럽게 전환됩니다.
- **연속 스크롤 3D 입자 모핑 & 모션 배려**
  - 섹션 전환 구간마다 입자와 와이어프레임이 끊김 없이 연속 보간되며, 현재 형상 이름은 상단 내비게이션(`GlassNav`) 칩에 실시간으로 표시됩니다.
  - `prefers-reduced-motion: reduce` 환경에서는 정적 입자 렌더링으로 자동 전환됩니다.

---

## 섹션별 8가지 3D 입자 형상

| 섹션 / 단계 | 입자 형상 라벨 | 시각 모티프 |
| :--- | :--- | :--- |
| 개요 (Hero) | **Gemini 네온 스타** | 중앙 4각 스타 크리스탈 + 내·외곽 궤도 링 |
| 아키텍처 1단계 | **코드 모듈 매트릭스** | 3단 입체 격자 계층 + 640nm 코랄 AST 축 + 스캐너 링 |
| 아키텍처 2단계 | **1M 무한 컨텍스트 ∞** | 3가닥 3D 뫼비우스 렘니스케이트(`∞`) 리본 |
| 아키텍처 3단계 | **오케스트레이터 네트워크** | 상단 Neon 오케스트레이터 + 3개 Hydrogen 워커 위성 네트워크 |
| 추론 제어 | **4단계 사고 코어** | `low` ~ `xhigh` 4겹 자이로스코프 코어 (`thinkingLevel` 실시간 연동) |
| 라인업 비교 | **H · Ne · C 스펙트럼** | Hydrogen(구체) · Neon(다면체 링) · Carbon(3D 큐브) 스펙트럼 |
| 벤치마크 | **벤치마크 1위 그래프** | 8개 지표 3D 막대 기둥 + 성과 추세선 + 정상 스타 크레스트 |
| 개발자 연동 · 요금 | **API 코어 엔진** | 외곽 궤도 링이 감싸는 4D 테서랙트 하이퍼큐브 |

---

## 주요 섹션 및 인터랙티브 기능

- **개요 (`HeroSection`)**: 모델 식별 배지(`Ne · 10`), 1M 통합 컨텍스트, Coding Agent Index 전체 1위 등 핵심 지표 요약
- **아키텍처 스토리 (`ArchitectureStory`)**: 스크롤 핀(Pin) 연동 3단계 인터랙티브 챕터(저장소 단위 리팩터링 · 1M 통합 컨텍스트 & Long Decode · Orchestrator-Worker 협업 다이어그램)
- **4단계 추론 깊이 제어 (`ThinkingLab`)**: `Low` · `Medium` · `High` · `Xhigh` 선택에 따라 응답 속도·추론 깊이·비용 효율 게이지, 실시간 `thinkingConfig.thinkingLevel` JSON, 중앙 3D 사고 코어 활성도가 즉시 연동
- **패밀리 라인업 비교 (`LineupComparison`)**: Gemini 4 Hydrogen · Neon · Carbon 포지션 및 토큰 단가·컨텍스트·지능 지수 비교표
- **벤치마크 (`BenchmarkSection`)**: Artificial Analysis Coding Agent Index(58.6점), Intelligence Index(61점), Terminal-Bench, RiemannBench(84.0%) 등 8개 평가 카운터·바 애니메이션
- **개발자 연동 및 요금 (`DeveloperSection`)**: 1M 토큰 기준 API 단가, 지원 생태계, `TypeScript` / `Python` / `cURL` 스니펫 탭 전환 및 원클릭 클립보드 복사

---

## 기술 스택

- **Core**: React 19, TypeScript, Vite 8
- **Animation & 3D Particles**: GSAP 3, `@gsap/react`, `ScrollTrigger`, HTML5 Canvas 2D 투영·가산 블렌딩 엔진
- **Quality**: `oxlint`, TypeScript (`tsc -b`)

---

## 로컬 실행 및 검증

```bash
npm install
npm run dev      # Vite 개발 서버 실행
npm run lint     # oxlint 정적 검사
npm run build    # TypeScript 검사 및 프로덕션 빌드
npm run preview  # 프로덕션 빌드 로컬 미리보기
```

---

## 프로젝트 구조

```text
src/
├── components/   # HeroSection, ArchitectureStory, ThinkingLab, LineupComparison, BenchmarkSection, DeveloperSection, ParticleStage, GlassNav, AmbientBackdrop, Footer
├── data/         # Gemini 4 Neon 사양, 아키텍처 챕터, 추론 단계, 벤치마크, API 스니펫 데이터
├── lib/          # 8가지 3D 입자 형상 생성 및 공간 정규화 유틸리티 (particleShapes.ts)
└── styles/       # 디자인 토큰 (tokens.css), 글래스모피즘 스타일 (glass.css), 3단 회랑 및 반응형 레이아웃 (layout.css)
```
