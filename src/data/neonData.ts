export type ThinkingLevelId = 'low' | 'medium' | 'high' | 'xhigh';

export type CodeLangId = 'typescript' | 'python' | 'curl';

export interface HeroMetric {
  value: string;
  label: string;
}

export interface StoryChapter {
  id: string;
  pill: string;
  title: string;
  kicker: string;
  description: string;
}

export interface ThinkingLevelSpec {
  id: ThinkingLevelId;
  label: string;
  badge: string;
  headline: string;
  summary: string;
  bestFor: string[];
  speedScore: number;
  depthScore: number;
  efficiencyScore: number;
  highlightNote: string;
}

export interface LineupColumn {
  id: 'hydrogen' | 'neon' | 'carbon';
  elementCode: string;
  name: string;
  modelId: string;
  role: string;
}

export interface LineupRow {
  label: string;
  hydrogen: string;
  neon: string;
  carbon: string;
}

export interface BenchmarkItem {
  name: string;
  score: number;
  decimals: number;
  suffix: string;
  note: string;
}

export interface AccessChannel {
  name: string;
  detail: string;
}

export const NAV_ITEMS = [
  { id: 'overview', label: '개요' },
  { id: 'architecture', label: '아키텍처' },
  { id: 'thinking', label: '추론 제어' },
  { id: 'lineup', label: '라인업 비교' },
  { id: 'benchmarks', label: '벤치마크' },
] as const;

export const HERO_METRICS: HeroMetric[] = [
  {
    value: '61점',
    label: 'Artificial Analysis 지능 지수 (xhigh)',
  },
  {
    value: '1M 토큰',
    label: '통합 컨텍스트 · Long Decode 최대 1M 출력',
  },
  {
    value: '$3 / $15',
    label: '1M 입력·출력 토큰 · 암묵적 캐시 $0.15 (95% 할인)',
  },
];

export const STORY_CHAPTERS: StoryChapter[] = [
  {
    id: 'repo-lens',
    pill: '다중 파일 엔지니어링',
    title: '저장소 단위의 코드 이해와 리팩터링',
    kicker: 'Repository-Scale Coding',
    description:
      '다중 파일 디버깅과 대규모 코드베이스 리팩터링에 최적화되었습니다. 불필요한 파일 재탐색을 줄이고 지능형 컨텍스트 압축으로 장시간 에이전트 세션에서도 일관된 판단력을 유지합니다.',
  },
  {
    id: 'unified-context',
    pill: '1,048,576 토큰',
    title: '1M 통합 컨텍스트와 Long Decode',
    kicker: 'Unified Working Memory',
    description:
      '입력 컨텍스트, 내부 사고(Thinking) 토큰, 최종 출력이 1M 통합 윈도우를 유연하게 공유합니다. 기본 65,536 동기 출력을 넘어 백그라운드 Continuation으로 최대 1M 출력까지 확장할 수 있습니다.',
  },
  {
    id: 'orchestrator',
    pill: '에이전트 협업',
    title: '에이전트 오케스트레이터 아키텍처',
    kicker: 'Orchestrator (Neon)',
    description:
      'Google Antigravity 환경의 Orchestrator 모드에서 Neon이 전체 설계와 논리 검증을 총괄하고, 반복적인 패치와 테스트 실행은 빠른 Gemini 4 Hydrogen 서브에이전트에 위임해 속도와 완성도를 모두 잡습니다.',
  },
];

export const THINKING_LEVELS: Record<ThinkingLevelId, ThinkingLevelSpec> = {
  low: {
    id: 'low',
    label: 'Low',
    badge: '최소 지연 시간',
    headline: '즉각적인 응답과 가벼운 작업 처리',
    summary:
      '내부 추론 토큰 사용을 최소화해 짧은 지연 시간과 낮은 토큰 비용으로 빠른 코드 스니펫, 요약, 1차 분류 작업을 처리합니다.',
    bestFor: ['실시간 자동완성 보조', '단순 API 스키마 변환', '로그 1차 분류 및 요약'],
    speedScore: 95,
    depthScore: 44,
    efficiencyScore: 94,
    highlightNote: '짧은 응답이 최우선인 대화형 인터페이스에 적합',
  },
  medium: {
    id: 'medium',
    label: 'Medium',
    badge: '균형 제어',
    headline: '일상 개발과 분석의 속도·정확도 균형',
    summary:
      '불필요한 장문 사고 없이 핵심 논리 단계만 밟아 단일 파일 수정, 테스트 코드 작성, 구조화된 데이터 추출을 빠르게 수행합니다.',
    bestFor: ['단일 모듈 기능 구현', '단위 테스트 생성', '구조화 JSON 추출 파이프라인'],
    speedScore: 80,
    depthScore: 68,
    efficiencyScore: 84,
    highlightNote: '일상적인 개발 파이프라인과 배치 처리에 유리',
  },
  high: {
    id: 'high',
    label: 'High',
    badge: '기본값',
    headline: '프로덕션 코딩과 복합 추론의 표준 설정',
    summary:
      'Gemini 4 Neon의 기본 추론 깊이입니다. 다중 파일 디버깅, 터미널 도구 호출, 과학·데이터 분석 워크플로우에서 높은 신뢰도와 속도를 동시에 발휘합니다.',
    bestFor: ['다중 파일 리팩터링', '에이전트 도구 호출 루프', 'FrontierCode 2.0 46.2% 기준'],
    speedScore: 64,
    depthScore: 88,
    efficiencyScore: 76,
    highlightNote: 'FrontierCode 2.0 46.2% 및 실전 코딩 에이전트 표준 기준',
  },
  xhigh: {
    id: 'xhigh',
    label: 'Xhigh',
    badge: '최대 추론 깊이',
    headline: '프론티어 급 사고력이 필요한 난제 해결',
    summary:
      '가용 사고 예산을 최대로 활용해 난해한 아키텍처 설계, 심층 STEM·수학 증명, 복잡한 저장소 버그의 근본 원인을 끝까지 파고듭니다.',
    bestFor: ['Artificial Analysis 61점 달성', '난해한 동시성·성능 디버깅', '대규모 시스템 설계 검증'],
    speedScore: 42,
    depthScore: 98,
    efficiencyScore: 62,
    highlightNote: 'Artificial Analysis Intelligence Index 61점 달성 설정',
  },
};

export const LINEUP_COLUMNS: LineupColumn[] = [
  {
    id: 'hydrogen',
    elementCode: 'H · 1',
    name: 'Gemini 4 Hydrogen',
    modelId: 'gemini-4-hydrogen',
    role: '고속 일상 실행 · 서브에이전트 작업',
  },
  {
    id: 'neon',
    elementCode: 'Ne · 10',
    name: 'Gemini 4 Neon',
    modelId: 'gemini-4-neon',
    role: '복합 코딩 · 분석 추론 · 프로덕션 표준',
  },
  {
    id: 'carbon',
    elementCode: 'C · 6',
    name: 'Gemini 4 Carbon',
    modelId: 'gemini-4-carbon',
    role: '장기 고난도 프로젝트 · 심층 사이버보안',
  },
];

export const LINEUP_ROWS: LineupRow[] = [
  {
    label: '핵심 포지션',
    hydrogen: '빠른 응답과 경량 에이전트 실행',
    neon: '깊이와 효율이 균형 잡힌 핵심 모델',
    carbon: '최상위 장기 추론 및 고난도 프로젝트',
  },
  {
    label: '입력 토큰 (1M당)',
    hydrogen: '$1.50',
    neon: '$3.00',
    carbon: '$4.00 (11/30까지 $2.00)',
  },
  {
    label: '출력 토큰 (1M당)',
    hydrogen: '$7.50',
    neon: '$15.00',
    carbon: '$20.00 (11/30까지 $10.00)',
  },
  {
    label: '캐시 입력 (95% 할인)',
    hydrogen: '$0.075',
    neon: '$0.15',
    carbon: '$0.20 ($0.10)',
  },
  {
    label: '컨텍스트 윈도우',
    hydrogen: '1M 통합 (Long Decode 1M)',
    neon: '1M 통합 (Long Decode 1M)',
    carbon: '1M 통합 (Long Decode 1M)',
  },
  {
    label: '추론 깊이 제어',
    hydrogen: '4단계 (low ~ xhigh)',
    neon: '4단계 (low ~ xhigh)',
    carbon: '3단계 (low ~ high)',
  },
  {
    label: 'AA 지능 지수',
    hydrogen: '51 – 54점',
    neon: '61점 (xhigh)',
    carbon: '~60점 (high)',
  },
];

export const BENCHMARKS: BenchmarkItem[] = [
  {
    name: 'Artificial Analysis Coding Agent Index',
    score: 58.6,
    decimals: 1,
    suffix: '점',
    note: '전체 1위 · 실제 CLI 및 도구 활용 코딩 에이전트 평가',
  },
  {
    name: 'Artificial Analysis Intelligence Index',
    score: 61,
    decimals: 0,
    suffix: '점',
    note: 'xhigh 추론 설정 기준 · 글로벌 상위 3위권 종합 지능',
  },
  {
    name: 'Terminal-Bench 4.1',
    score: 65.2,
    decimals: 1,
    suffix: '%',
    note: '실제 개발 환경의 터미널 명령·빌드·디버깅 수행률',
  },
  {
    name: 'Vals Index',
    score: 70.9,
    decimals: 1,
    suffix: '%',
    note: '전체 2위 · 법률 리서치 및 세무 에이전트 등 전문 도메인',
  },
  {
    name: 'Terminal-Bench Science',
    score: 70.5,
    decimals: 1,
    suffix: '%',
    note: '과학 워크플로우 및 실험 데이터 엔지니어링 과제',
  },
  {
    name: 'RiemannBench',
    score: 84.0,
    decimals: 1,
    suffix: '%',
    note: '고난도 수학적 증명 및 정량 추론 정확도',
  },
  {
    name: 'HLE-Diamond',
    score: 71.3,
    decimals: 1,
    suffix: '%',
    note: '멀티모달·복합 학문 영역 프론티어 난제 평가',
  },
  {
    name: 'FrontierCode 2.0',
    score: 46.2,
    decimals: 1,
    suffix: '%',
    note: '기본 high 추론 설정 기준 프론티어 코딩 테스트',
  },
];

export const ACCESS_CHANNELS: AccessChannel[] = [
  { name: 'Gemini API & Google AI Studio', detail: '모델 ID: gemini-4-neon (GA 정식 출시)' },
  { name: 'Vertex AI', detail: '엔터프라이즈 배포 · Batch/Flex 약 50% 할인' },
  { name: 'Google Antigravity & CLI', detail: 'Orchestrator (Neon) 모드 기본 지원' },
  { name: 'GitHub Copilot', detail: '에이전트 코딩 및 리팩터링 모델 선택' },
  { name: 'Gemini 앱 (Pro / Ultra)', detail: '더 깊은 분석(Deeper analysis) 구동 엔진' },
];

export const CODE_SNIPPETS: Record<CodeLangId, { label: string; code: string }> = {
  typescript: {
    label: 'TypeScript',
    code: `import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI();

const res = await ai.models.generateContent({
  model: "gemini-4-neon",
  contents: [
    "인증 미들웨어의 경쟁 조건을 분석하고",
    "안전한 수정 패치를 작성해줘.",
  ].join(" "),
  config: {
    thinkingConfig: {
      thinkingLevel: "high", // low | medium | high | xhigh
    },
  },
});

console.log(res.text);`,
  },
  python: {
    label: 'Python',
    code: `from google import genai
from google.genai import types

client = genai.Client()

response = client.models.generate_content(
    model="gemini-4-neon",
    contents=(
        "저장소 전체의 비동기 DB 풀 누수를 "
        "추적하고 패치를 생성해줘."
    ),
    config=types.GenerateContentConfig(
        thinking_config=types.ThinkingConfig(
            thinking_level="xhigh"  # 프론티어 추론
        )
    ),
)

print(response.text)`,
  },
  curl: {
    label: 'cURL',
    code: `curl -X POST \\
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-4-neon:generateContent" \\
  -H "x-goog-api-key: $GEMINI_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "contents": [{
      "parts": [{
        "text": "빌드 실패 원인을 요약해줘."
      }]
    }],
    "generationConfig": {
      "thinkingConfig": {
        "thinkingLevel": "high"
      }
    }
  }'`,
  },
};
