export type ShapeId =
  | 'atom'
  | 'code'
  | 'infinity'
  | 'orchestrator'
  | 'neural'
  | 'trio'
  | 'chart'
  | 'tesseract';

export interface ParticlePoint {
  x: number;
  y: number;
  z: number;
  colorIdx: 0 | 1 | 2 | 3;
  size: number;
  group: number;
}

export interface ShapeGeometry {
  points: ParticlePoint[];
  edges: [number, number][];
}

export interface ShapeMeta {
  id: ShapeId;
  label: string;
}

export const SHAPE_META: ShapeMeta[] = [
  { id: 'atom', label: 'Gemini 네온 스타' },
  { id: 'code', label: '코드 모듈 매트릭스' },
  { id: 'infinity', label: '1M 무한 컨텍스트 ∞' },
  { id: 'orchestrator', label: '오케스트레이터 네트워크' },
  { id: 'neural', label: '4단계 사고 코어' },
  { id: 'trio', label: 'H · Ne · C 스펙트럼' },
  { id: 'chart', label: '벤치마크 1위 그래프' },
  { id: 'tesseract', label: 'API 코어 엔진' },
];

const BENCH_WEIGHTS = [0.586, 0.61, 0.652, 0.709, 0.705, 0.84, 0.713, 0.462];

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function rotatePoint(
  x: number,
  y: number,
  z: number,
  rx: number,
  ry: number,
  rz: number,
): [number, number, number] {
  const cy = Math.cos(ry);
  const sy = Math.sin(ry);
  const x1 = x * cy + z * sy;
  const z1 = -x * sy + z * cy;

  const cx = Math.cos(rx);
  const sx = Math.sin(rx);
  const y2 = y * cx - z1 * sx;
  const z2 = y * sx + z1 * cx;

  const cz = Math.cos(rz);
  const sz = Math.sin(rz);
  const x3 = x1 * cz - y2 * sz;
  const y3 = x1 * sz + y2 * cz;

  return [x3, y3, z2];
}

function padPoints(pts: ParticlePoint[], count: number, rand: () => number): ParticlePoint[] {
  const baseLen = Math.max(1, pts.length);
  let idx = 0;
  while (pts.length < count) {
    const src = pts[idx % baseLen];
    pts.push({
      x: src.x + (rand() - 0.5) * 0.016,
      y: src.y + (rand() - 0.5) * 0.016,
      z: src.z + (rand() - 0.5) * 0.016,
      colorIdx: src.colorIdx,
      size: src.size * 0.72,
      group: src.group,
    });
    idx++;
  }
  return pts.slice(0, count);
}

function connectInterior(
  pts: ParticlePoint[],
  edges: [number, number][],
  idxA: number,
  idxB: number,
  stepsPerEdge: number,
  colorIdx: 0 | 1 | 2 | 3,
  size: number,
  group = 1,
) {
  const va = pts[idxA];
  const vb = pts[idxB];
  const interior = Math.max(0, stepsPerEdge - 1);
  if (interior === 0) {
    edges.push([idxA, idxB]);
    return;
  }
  let prevIdx = idxA;
  for (let s = 1; s <= interior; s++) {
    const t = s / (interior + 1);
    const curIdx = pts.length;
    pts.push({
      x: va.x + (vb.x - va.x) * t,
      y: va.y + (vb.y - va.y) * t,
      z: va.z + (vb.z - va.z) * t,
      colorIdx,
      size,
      group,
    });
    edges.push([prevIdx, curIdx]);
    prevIdx = curIdx;
  }
  edges.push([prevIdx, idxB]);
}

function addWireframe(
  pts: ParticlePoint[],
  edges: [number, number][],
  verts: [number, number, number][],
  pairs: [number, number][],
  stepsPerEdge: number,
  colorIdx: 0 | 1 | 2 | 3,
  size: number,
  group = 1,
  vertexSizeScale = 1.2,
  vertexColorIdx: 0 | 1 | 2 | 3 = colorIdx,
): number {
  const vBase = pts.length;
  for (const v of verts) {
    pts.push({
      x: v[0],
      y: v[1],
      z: v[2],
      colorIdx: vertexColorIdx,
      size: size * vertexSizeScale,
      group,
    });
  }
  for (const [ia, ib] of pairs) {
    connectInterior(pts, edges, vBase + ia, vBase + ib, stepsPerEdge, colorIdx, size, group);
  }
  return vBase;
}

function addRing(
  pts: ParticlePoint[],
  edges: [number, number][],
  center: [number, number, number],
  radius: number,
  n: number,
  rx: number,
  ry: number,
  rz: number,
  colorIdx: 0 | 1 | 2 | 3,
  size: number,
  group = 1,
  highlightStride = 0,
  highlightColor: 0 | 1 | 2 | 3 = colorIdx,
) {
  const rStart = pts.length;
  for (let i = 0; i < n; i++) {
    const t = (i / n) * Math.PI * 2;
    const isHi = highlightStride > 0 && i % highlightStride === 0;
    const [px, py, pz] = rotatePoint(radius * Math.cos(t), 0, radius * Math.sin(t), rx, ry, rz);
    pts.push({
      x: center[0] + px,
      y: center[1] + py,
      z: center[2] + pz,
      colorIdx: isHi ? highlightColor : colorIdx,
      size: isHi ? size * 2.1 : size,
      group,
    });
    edges.push([rStart + i, rStart + ((i + 1) % n)]);
  }
}

function spatialCanonicalize(geom: ShapeGeometry): ShapeGeometry {
  const { points, edges } = geom;
  const n = points.length;
  const order = Array.from({ length: n }, (_, i) => i);
  order.sort((ia, ib) => {
    const a = points[ia];
    const b = points[ib];
    const bandA = Math.floor((a.y + 1.1) * 3.6);
    const bandB = Math.floor((b.y + 1.1) * 3.6);
    if (bandA !== bandB) return bandA - bandB;
    const angA = Math.atan2(a.z, a.x);
    const angB = Math.atan2(b.z, b.x);
    if (angA !== angB) return angA - angB;
    return a.x * a.x + a.z * a.z - (b.x * b.x + b.z * b.z);
  });
  const inv = new Int32Array(n);
  const sortedPts: ParticlePoint[] = new Array(n);
  for (let newIdx = 0; newIdx < n; newIdx++) {
    const oldIdx = order[newIdx];
    inv[oldIdx] = newIdx;
    sortedPts[newIdx] = points[oldIdx];
  }
  const remappedEdges: [number, number][] = [];
  for (let i = 0; i < edges.length; i++) {
    const [ea, eb] = edges[i];
    if (ea < n && eb < n) {
      remappedEdges.push([inv[ea], inv[eb]]);
    }
  }
  return { points: sortedPts, edges: remappedEdges };
}

function buildAtom(count: number, rand: () => number): ShapeGeometry {
  const pts: ParticlePoint[] = [];
  const edges: [number, number][] = [];

  // 1. Central 3D Gemini 4-Pointed Star contour + extruded octahedral ridges
  const starContourSteps = Math.max(45, Math.floor(count * 0.24));
  const starR = 0.44;
  const frontStart = pts.length;
  for (let i = 0; i < starContourSteps; i++) {
    const t = (i / starContourSteps) * Math.PI * 2;
    const ct = Math.cos(t);
    const st = Math.sin(t);
    const sx = Math.sign(ct) * Math.pow(Math.abs(ct), 1.95) * starR;
    const sy = Math.sign(st) * Math.pow(Math.abs(st), 1.95) * starR;
    const zLayer = i % 3 === 0 ? 0.14 : i % 3 === 1 ? -0.14 : 0;
    pts.push({
      x: sx,
      y: sy,
      z: zLayer,
      colorIdx: Math.abs(sx) < 0.08 && Math.abs(sy) < 0.08 ? 3 : 2,
      size: zLayer === 0 ? 1.55 : 1.15,
      group: 1,
    });
    if (i > 0 && i % 3 === 0) {
      edges.push([frontStart + i - 3, frontStart + i]);
    }
  }

  const starApex: [number, number, number][] = [
    [0, 0, 0],
    [0, -starR, 0],
    [starR, 0, 0],
    [0, starR, 0],
    [-starR, 0, 0],
    [0, 0, 0.22],
    [0, 0, -0.22],
  ];
  const starPairs: [number, number][] = [
    [0, 1], [0, 2], [0, 3], [0, 4],
    [5, 1], [5, 2], [5, 3], [5, 4],
    [6, 1], [6, 2], [6, 3], [6, 4],
    [1, 2], [2, 3], [3, 4], [4, 1],
  ];
  const coreBase = addWireframe(pts, edges, starApex, starPairs, 1, 2, 1.45, 1, 1.2, 2);
  pts[coreBase].colorIdx = 3;
  pts[coreBase].size = 2.25;

  // 2. Inner 2-electron shell ring
  const innerN = Math.max(36, Math.floor(count * 0.2));
  addRing(
    pts,
    edges,
    [0, 0, 0],
    0.66,
    innerN,
    0.56,
    0.24,
    -0.4,
    1,
    0.95,
    2,
    Math.max(1, Math.floor(innerN / 2)),
    3,
  );

  // 3. Outer crossed 8-electron shell rings (twin rings, 4 beads each = 8 beads)
  const remaining = Math.max(40, count - pts.length);
  const halfOuter = Math.floor(remaining / 2);
  const ringConfigs: { n: number; rx: number; ry: number; rz: number; c: 0 | 1; eColor: 2 | 3 }[] = [
    { n: halfOuter, rx: 0.72, ry: 0.36, rz: 0.58, c: 0, eColor: 2 },
    { n: remaining - halfOuter, rx: -0.72, ry: -0.32, rz: -0.58, c: 1, eColor: 3 },
  ];

  for (const cfg of ringConfigs) {
    addRing(
      pts,
      edges,
      [0, 0, 0],
      0.92,
      cfg.n,
      cfg.rx,
      cfg.ry,
      cfg.rz,
      cfg.c,
      0.92,
      3,
      Math.max(1, Math.floor(cfg.n / 4)),
      cfg.eColor,
    );
  }

  return spatialCanonicalize({ points: padPoints(pts, count, rand), edges });
}

function buildCode(count: number, rand: () => number): ShapeGeometry {
  const pts: ParticlePoint[] = [];
  const edges: [number, number][] = [];

  // 3 suspended 3D repository architectural planes tilted gracefully
  const layerSpecs: { y: number; r: number; c: 0 | 1 | 2 | 3 }[] = [
    { y: -0.42, r: 0.44, c: 0 },
    { y: 0.0, r: 0.62, c: 1 },
    { y: 0.42, r: 0.44, c: 0 },
  ];

  const verts: [number, number, number][] = [];
  for (const layer of layerSpecs) {
    for (let k = 0; k < 4; k++) {
      const ang = (k * Math.PI) / 2;
      const [px, py, pz] = rotatePoint(
        layer.r * Math.cos(ang),
        layer.y,
        layer.r * Math.sin(ang),
        0.2,
        0.28,
        0,
      );
      verts.push([px, py, pz]);
    }
  }
  const [spTopX, spTopY, spTopZ] = rotatePoint(0, -0.62, 0, 0.2, 0.28, 0);
  const [spBotX, spBotY, spBotZ] = rotatePoint(0, 0.62, 0, 0.2, 0.28, 0);
  verts.push([spTopX, spTopY, spTopZ]); // idx 12
  verts.push([spBotX, spBotY, spBotZ]); // idx 13

  const vBase = pts.length;
  for (let i = 0; i < verts.length; i++) {
    const v = verts[i];
    const colorIdx: 0 | 1 | 2 | 3 = i >= 12 ? 3 : i >= 4 && i < 8 ? 2 : 1;
    pts.push({
      x: v[0],
      y: v[1],
      z: v[2],
      colorIdx,
      size: i >= 12 ? 1.85 : 1.35,
      group: 1,
    });
  }

  const hSteps = Math.max(4, Math.floor(count * 0.023));
  for (let l = 0; l < 3; l++) {
    const base = vBase + l * 4;
    const c = layerSpecs[l].c;
    for (let k = 0; k < 4; k++) {
      connectInterior(pts, edges, base + k, base + ((k + 1) % 4), hSteps, c, 1.05, l + 1);
    }
  }

  // Vertical dependency conduits linking L0->L1 and L1->L2
  const vSteps = Math.max(3, Math.floor(count * 0.015));
  for (let k = 0; k < 4; k++) {
    connectInterior(pts, edges, vBase + k, vBase + 4 + k, vSteps, 0, 1.0, 2);
    connectInterior(pts, edges, vBase + 4 + k, vBase + 8 + k, vSteps, 1, 1.0, 2);
  }

  // Central 640nm Neon Coral AST refactoring spine
  const spineSteps = Math.max(12, Math.floor(count * 0.065));
  connectInterior(pts, edges, vBase + 12, vBase + 13, spineSteps, 3, 1.35, 1);

  // 3 small glowing module core hub rings along the spine
  const hubN = Math.max(12, Math.floor(count * 0.06));
  for (const layer of layerSpecs) {
    const [cx, cy, cz] = rotatePoint(0, layer.y, 0, 0.2, 0.28, 0);
    addRing(pts, edges, [cx, cy, cz], 0.16, hubN, 0.2, 0.28, 0, 2, 1.05, 1);
  }

  // Outer sleek tilted scanner ring
  const remaining = Math.max(36, count - pts.length);
  addRing(
    pts,
    edges,
    [0, 0, 0],
    0.86,
    remaining,
    0.46,
    0.2,
    -0.28,
    0,
    0.95,
    3,
    Math.max(1, Math.floor(remaining / 4)),
    2,
  );

  return spatialCanonicalize({ points: padPoints(pts, count, rand), edges });
}

function buildInfinity(count: number, rand: () => number): ShapeGeometry {
  const pts: ParticlePoint[] = [];
  const edges: [number, number][] = [];
  const strands = 3;
  const stepsPerStrand = Math.max(36, Math.floor(count / strands));
  const a = 0.86;

  for (let s = 0; s < strands; s++) {
    const start = pts.length;
    const widthOffset = (s - 1) * 0.055;
    for (let i = 0; i < stepsPerStrand; i++) {
      const tNorm = i / stepsPerStrand;
      const t = tNorm * Math.PI * 2;
      const denom = 1 + Math.sin(t) * Math.sin(t);
      const bx = (a * Math.cos(t)) / denom;
      const by = (a * 1.32 * Math.sin(t) * Math.cos(t)) / denom;
      const twistZ = Math.sin(t * 2) * 0.22 + widthOffset * Math.cos(t);
      const py = by + widthOffset * Math.sin(t * 0.5 + 0.8);

      const [x, y, z] = rotatePoint(bx, py, twistZ, 0.22, -0.14, 0);
      let colorIdx: 0 | 1 | 2 | 3 = 0;
      if (tNorm > 0.78) colorIdx = 3;
      else if (tNorm > 0.54) colorIdx = 1;
      else if (s === 1) colorIdx = i % 6 === 0 ? 2 : 0;

      pts.push({
        x,
        y,
        z,
        colorIdx,
        size: colorIdx === 3 ? 1.35 : s === 1 ? 1.0 : 1.12,
        group: 1,
      });

      edges.push([start + i, start + ((i + 1) % stepsPerStrand)]);
    }
  }

  // Subtle ribbon cross-rungs between outer strands
  const rungStride = Math.max(4, Math.floor(stepsPerStrand / 16));
  for (let i = 0; i < stepsPerStrand; i += rungStride) {
    edges.push([i, stepsPerStrand * 2 + i]);
  }

  return spatialCanonicalize({ points: padPoints(pts, count, rand), edges });
}

function buildOrchestrator(count: number, rand: () => number): ShapeGeometry {
  const pts: ParticlePoint[] = [];
  const edges: [number, number][] = [];

  // Top Neon Orchestrator Crown (faceted octahedron + equatorial halo ring)
  const topY = -0.46;
  const dVerts: [number, number, number][] = [
    [0, topY - 0.25, 0], // top
    [0, topY + 0.25, 0], // bottom (idx = dBase + 1)
    [-0.24, topY, 0],
    [0, topY, 0.24],
    [0.24, topY, 0],
    [0, topY, -0.24],
  ];
  const dPairs: [number, number][] = [
    [0, 2], [0, 3], [0, 4], [0, 5],
    [1, 2], [1, 3], [1, 4], [1, 5],
    [2, 3], [3, 4], [4, 5], [5, 2],
  ];
  const crownSteps = Math.max(3, Math.floor(count * 0.012));
  const crownBase = addWireframe(pts, edges, dVerts, dPairs, crownSteps, 3, 1.25, 1, 1.25, 2);
  const hubBottomIdx = crownBase + 1;

  const haloN = Math.max(24, Math.floor(count * 0.12));
  addRing(pts, edges, [0, topY, 0], 0.38, haloN, 0.32, 0.2, -0.15, 2, 1.05, 1, Math.floor(haloN / 4), 3);

  // 3 equidistant Hydrogen satellite orbs arranged cleanly on XZ circle
  const workers: [number, number, number][] = [
    [0.56 * Math.cos(Math.PI / 6), 0.4, 0.56 * Math.sin(Math.PI / 6)],
    [0.56 * Math.cos((Math.PI * 5) / 6), 0.4, 0.56 * Math.sin((Math.PI * 5) / 6)],
    [0.56 * Math.cos(-Math.PI / 2), 0.4, 0.56 * Math.sin(-Math.PI / 2)],
  ];

  const orbRingN = Math.max(12, Math.floor(count * 0.052));
  const orbCentersIdx: number[] = [];

  for (let w = 0; w < workers.length; w++) {
    const wc = workers[w];
    const cIdx = pts.length;
    orbCentersIdx.push(cIdx);
    pts.push({
      x: wc[0],
      y: wc[1],
      z: wc[2],
      colorIdx: 2,
      size: 2.0,
      group: 3,
    });
    addRing(pts, edges, wc, 0.16, orbRingN, 0.42, w * 0.7, 0.18, 1, 1.0, 3);
    addRing(pts, edges, wc, 0.16, orbRingN, 1.28, w * 0.7 + 0.5, -0.6, 0, 0.95, 3);
  }

  // Subtle triangular sync mesh between the 3 workers
  const syncSteps = Math.max(5, Math.floor(count * 0.025));
  for (let w = 0; w < 3; w++) {
    connectInterior(
      pts,
      edges,
      orbCentersIdx[w],
      orbCentersIdx[(w + 1) % 3],
      syncSteps,
      1,
      0.95,
      3,
    );
  }

  // 3 graceful curved parabolic Bezier conduits from crown bottom to each orb
  const arcSteps = Math.max(8, Math.floor((count - pts.length) / 3) + 1);
  const startPt = pts[hubBottomIdx];
  for (let w = 0; w < workers.length; w++) {
    const wc = workers[w];
    const cIdx = orbCentersIdx[w];
    const ctrlX = wc[0] * 0.65;
    const ctrlY = -0.1;
    const ctrlZ = wc[2] * 0.65;
    let prev = hubBottomIdx;
    for (let s = 1; s < arcSteps; s++) {
      const t = s / arcSteps;
      const omt = 1 - t;
      const px = omt * omt * startPt.x + 2 * omt * t * ctrlX + t * t * wc[0];
      const py = omt * omt * startPt.y + 2 * omt * t * ctrlY + t * t * wc[1];
      const pz = omt * omt * startPt.z + 2 * omt * t * ctrlZ + t * t * wc[2];
      const cur = pts.length;
      pts.push({
        x: px,
        y: py,
        z: pz,
        colorIdx: s % 3 === 0 ? 3 : 0,
        size: 1.15,
        group: 2,
      });
      edges.push([prev, cur]);
      prev = cur;
    }
    edges.push([prev, cIdx]);
  }

  return spatialCanonicalize({ points: padPoints(pts, count, rand), edges });
}

function buildNeural(count: number, rand: () => number): ShapeGeometry {
  const pts: ParticlePoint[] = [];
  const edges: [number, number][] = [];

  // Group 1 (low, r=0.20): 640nm Coral faceted octahedron + inner ring
  const coreR = 0.19;
  const coreVerts: [number, number, number][] = [
    [0, -coreR, 0],
    [coreR, 0, 0],
    [0, coreR, 0],
    [-coreR, 0, 0],
    [0, 0, coreR],
    [0, 0, -coreR],
  ];
  const corePairs: [number, number][] = [
    [0, 1], [0, 3], [0, 4], [0, 5],
    [2, 1], [2, 3], [2, 4], [2, 5],
    [1, 4], [4, 3], [3, 5], [5, 1],
  ];
  addWireframe(
    pts,
    edges,
    coreVerts,
    corePairs,
    Math.max(2, Math.floor(count * 0.008)),
    3,
    1.35,
    1,
    1.25,
    2,
  );
  addRing(pts, edges, [0, 0, 0], 0.24, Math.max(16, Math.floor(count * 0.08)), 0.3, 0.2, -0.4, 3, 1.25, 1);

  // Group 2 (medium, r=0.44): Ice-white twin orthogonal tilted gimbal rings
  const g2N = Math.max(18, Math.floor(count * 0.095));
  addRing(pts, edges, [0, 0, 0], 0.44, g2N, 0.65, 0.3, -0.45, 2, 1.15, 2);
  addRing(pts, edges, [0, 0, 0], 0.44, g2N, -0.78, 0.15, 0.55, 2, 1.1, 2);

  // Group 3 (high, r=0.68): Prism-cyan twin intersecting great-circle rings
  const g3N = Math.max(24, Math.floor(count * 0.13));
  addRing(pts, edges, [0, 0, 0], 0.68, g3N, -0.58, 0.3, 0.52, 1, 1.05, 3, Math.floor(g3N / 4), 2);
  addRing(pts, edges, [0, 0, 0], 0.68, g3N, 0.92, -0.25, -0.34, 1, 1.0, 3);

  // Group 4 (xhigh, r=0.90): 6 cardinal coral beacons + twin outer celestial rings
  const r4 = 0.9;
  const beacons: [number, number, number][] = [
    [r4, 0, 0], [-r4, 0, 0],
    [0, r4, 0], [0, -r4, 0],
    [0, 0, r4], [0, 0, -r4],
  ];
  for (const b of beacons) {
    pts.push({ x: b[0], y: b[1], z: b[2], colorIdx: 3, size: 1.9, group: 4 });
  }
  const rem4 = Math.max(36, count - pts.length);
  const half4 = Math.floor(rem4 / 2);
  addRing(pts, edges, [0, 0, 0], r4, half4, 0.85, 0.3, 0.24, 0, 0.95, 4, Math.floor(half4 / 6), 3);
  addRing(pts, edges, [0, 0, 0], r4, rem4 - half4, -0.42, -0.5, 0.78, 0, 0.95, 4, Math.floor((rem4 - half4) / 6), 3);

  return spatialCanonicalize({ points: padPoints(pts, count, rand), edges });
}

function buildTrio(count: number, rand: () => number): ShapeGeometry {
  const pts: ParticlePoint[] = [];
  const edges: [number, number][] = [];

  // Subtle curved orbital base arc underneath
  const arcN = Math.max(28, Math.floor(count * 0.15));
  const arcStart = pts.length;
  for (let i = 0; i < arcN; i++) {
    const t = i / (arcN - 1);
    const nx = t * 2 - 1;
    const x = nx * 0.88;
    const y = 0.42 - 0.06 * Math.cos(nx * Math.PI * 0.5);
    const z = 0.12 * Math.sin(nx * Math.PI);
    pts.push({ x, y, z, colorIdx: 2, size: 0.95, group: 1 });
    if (i > 0) edges.push([arcStart + i - 1, arcStart + i]);
  }

  // Left: Nimble Hydrogen 2-ring micro-sphere (H-1)
  const hCenter: [number, number, number] = [-0.68, 0.04, 0];
  pts.push({ x: hCenter[0], y: hCenter[1], z: hCenter[2], colorIdx: 2, size: 1.8, group: 1 });
  const hRingN = Math.max(15, Math.floor(count * 0.08));
  addRing(pts, edges, hCenter, 0.19, hRingN, 0.38, 0.2, 0.15, 1, 1.05, 1);
  addRing(pts, edges, hCenter, 0.19, hRingN, 1.32, -0.35, 0.6, 1, 1.0, 1);

  // Right: Dense 3D Azure Wireframe Cube (Carbon C-6)
  const cCenter: [number, number, number] = [0.68, 0.02, 0];
  const cH = 0.21;
  const cVerts: [number, number, number][] = [];
  for (let xi = -1; xi <= 1; xi += 2) {
    for (let yi = -1; yi <= 1; yi += 2) {
      for (let zi = -1; zi <= 1; zi += 2) {
        const [rx, ry, rz] = rotatePoint(xi * cH, yi * cH, zi * cH, 0.35, 0.55, 0);
        cVerts.push([cCenter[0] + rx, cCenter[1] + ry, cCenter[2] + rz]);
      }
    }
  }
  const cubePairs: [number, number][] = [
    [0, 1], [2, 3], [4, 5], [6, 7],
    [0, 2], [1, 3], [4, 6], [5, 7],
    [0, 4], [1, 5], [2, 6], [3, 7],
  ];
  addWireframe(pts, edges, cVerts, cubePairs, Math.max(3, Math.floor(count * 0.015)), 0, 1.1, 3);

  // Center: Radiant Faceted Neon Octahedron (Ne-10)
  const nCenter: [number, number, number] = [0, -0.05, 0.08];
  const nR = 0.34;
  const nVerts: [number, number, number][] = [
    [nCenter[0], nCenter[1] - nR, nCenter[2]],
    [nCenter[0], nCenter[1] + nR, nCenter[2]],
    [nCenter[0] - nR * 0.78, nCenter[1], nCenter[2]],
    [nCenter[0], nCenter[1], nCenter[2] + nR * 0.78],
    [nCenter[0] + nR * 0.78, nCenter[1], nCenter[2]],
    [nCenter[0], nCenter[1], nCenter[2] - nR * 0.78],
  ];
  const nPairs: [number, number][] = [
    [0, 2], [0, 3], [0, 4], [0, 5],
    [1, 2], [1, 3], [1, 4], [1, 5],
    [2, 3], [3, 4], [4, 5], [5, 2],
  ];
  addWireframe(pts, edges, nVerts, nPairs, Math.max(3, Math.floor(count * 0.015)), 3, 1.3, 2, 1.25, 2);

  // Center twin gyroscopic 640nm coral rings using remaining budget
  const remN = Math.max(24, count - pts.length);
  const halfN = Math.floor(remN / 2);
  addRing(pts, edges, nCenter, 0.46, halfN, 0.42, 0.1, -0.25, 3, 1.15, 2, Math.floor(halfN / 4), 2);
  addRing(pts, edges, nCenter, 0.5, remN - halfN, -0.54, 0.3, 0.38, 1, 1.0, 2, Math.floor((remN - halfN) / 4), 3);

  return spatialCanonicalize({ points: padPoints(pts, count, rand), edges });
}

function buildChart(count: number, rand: () => number): ShapeGeometry {
  const pts: ParticlePoint[] = [];
  const edges: [number, number][] = [];
  const baseLine = 0.56;
  const cols = BENCH_WEIGHTS.length;

  // Baseline gentle curved arc
  const baseN = Math.max(24, Math.floor(count * 0.14));
  const baseStart = pts.length;
  for (let i = 0; i < baseN; i++) {
    const t = i / (baseN - 1);
    const nx = t * 2 - 1;
    const x = nx * 0.9;
    const z = 0.12 * Math.cos(nx * Math.PI * 0.5);
    pts.push({ x, y: baseLine, z, colorIdx: 2, size: 0.95, group: 1 });
    if (i > 0) edges.push([baseStart + i - 1, baseStart + i]);
  }

  // Floating #1 Gemini Crest Star above tallest bar (index 5 = 84.0%)
  const peak5X = -0.78 + (5 / (cols - 1)) * 1.56;
  const peak5Z = 0.12 * Math.cos((peak5X / 0.78) * Math.PI * 0.5);
  const peak5Y = baseLine - BENCH_WEIGHTS[5] * 1.24 - 0.22;
  const cr = 0.13;
  const starVerts: [number, number, number][] = [
    [peak5X, peak5Y, peak5Z],
    [peak5X, peak5Y - cr, peak5Z],
    [peak5X + cr * 0.85, peak5Y, peak5Z],
    [peak5X, peak5Y + cr, peak5Z],
    [peak5X - cr * 0.85, peak5Y, peak5Z],
  ];
  const starPairs: [number, number][] = [
    [0, 1], [0, 2], [0, 3], [0, 4],
    [1, 2], [2, 3], [3, 4], [4, 1],
  ];
  addWireframe(pts, edges, starVerts, starPairs, Math.max(2, Math.floor(count * 0.008)), 3, 1.45, 3, 1.25, 2);

  // Reserve space for trendline connecting the 8 peaks
  const trendSegSteps = Math.max(4, Math.floor(count * 0.017));
  const trendBudget = (cols - 1) * (trendSegSteps - 1);
  const remainingForBars = Math.max(8 * 10, count - pts.length - trendBudget);
  // Each bar: 4 vertices + 4 edge rails -> 4 + 2*(vSteps-1) + 2*1
  const vSteps = Math.max(3, Math.floor((remainingForBars / cols - 4) / 2) + 1);
  const peakAnchorIndices: number[] = [];

  for (let c = 0; c < cols; c++) {
    const x = -0.78 + (c / (cols - 1)) * 1.56;
    const zCenter = 0.12 * Math.cos((x / 0.78) * Math.PI * 0.5);
    const topY = baseLine - BENCH_WEIGHTS[c] * 1.24;
    const colColor: 0 | 1 = c % 2 === 0 ? 0 : 1;

    const barVerts: [number, number, number][] = [
      [x - 0.025, baseLine, zCenter + 0.035],
      [x + 0.025, baseLine, zCenter - 0.035],
      [x - 0.025, topY, zCenter + 0.035],
      [x + 0.025, topY, zCenter - 0.035],
    ];
    const barBase = pts.length;
    for (let v = 0; v < 4; v++) {
      const bv = barVerts[v];
      pts.push({
        x: bv[0],
        y: bv[1],
        z: bv[2],
        colorIdx: v >= 2 ? 3 : colColor,
        size: v >= 2 ? 1.55 : 1.05,
        group: v >= 2 ? 2 : 1,
      });
    }
    peakAnchorIndices.push(barBase + 2);
    // Vertical twin pillars
    connectInterior(pts, edges, barBase + 0, barBase + 2, vSteps, colColor, 1.05, 1);
    connectInterior(pts, edges, barBase + 1, barBase + 3, vSteps, colColor, 1.05, 1);
    // Crisp horizontal top & bottom cap edges
    edges.push([barBase + 2, barBase + 3]);
    edges.push([barBase + 0, barBase + 1]);
  }

  // Smooth glowing trendline linking the 8 peaks
  for (let c = 0; c < cols - 1; c++) {
    connectInterior(
      pts,
      edges,
      peakAnchorIndices[c],
      peakAnchorIndices[c + 1],
      trendSegSteps,
      3,
      1.3,
      2,
    );
  }

  return spatialCanonicalize({ points: padPoints(pts, count, rand), edges });
}

function buildTesseract(count: number, rand: () => number): ShapeGeometry {
  const pts: ParticlePoint[] = [];
  const edges: [number, number][] = [];

  const makeCubeVerts = (h: number): [number, number, number][] => {
    const verts: [number, number, number][] = [];
    for (let xi = -1; xi <= 1; xi += 2) {
      for (let yi = -1; yi <= 1; yi += 2) {
        for (let zi = -1; zi <= 1; zi += 2) {
          verts.push([xi * h, yi * h, zi * h]);
        }
      }
    }
    return verts;
  };

  const outer = makeCubeVerts(0.62);
  const inner = makeCubeVerts(0.3);
  const cubePairs: [number, number][] = [
    [0, 1], [2, 3], [4, 5], [6, 7],
    [0, 2], [1, 3], [4, 6], [5, 7],
    [0, 4], [1, 5], [2, 6], [3, 7],
  ];

  // Emit all 16 unique cube vertices ONCE
  const baseIdx = pts.length;
  for (const v of outer) {
    pts.push({ x: v[0], y: v[1], z: v[2], colorIdx: 2, size: 1.5, group: 1 });
  }
  for (const v of inner) {
    pts.push({ x: v[0], y: v[1], z: v[2], colorIdx: 3, size: 1.65, group: 2 });
  }

  const outerSteps = Math.max(5, Math.floor(count * 0.029));
  const innerSteps = Math.max(3, Math.floor(count * 0.019));
  const strutSteps = Math.max(3, Math.floor(count * 0.017));

  for (const [ia, ib] of cubePairs) {
    connectInterior(pts, edges, baseIdx + ia, baseIdx + ib, outerSteps, 0, 1.15, 1);
  }
  for (const [ia, ib] of cubePairs) {
    connectInterior(pts, edges, baseIdx + 8 + ia, baseIdx + 8 + ib, innerSteps, 3, 1.3, 2);
  }
  for (let k = 0; k < 8; k++) {
    connectInterior(
      pts,
      edges,
      baseIdx + 8 + k,
      baseIdx + k,
      strutSteps,
      k % 2 === 0 ? 1 : 2,
      1.1,
      3,
    );
  }

  // Clean outer equatorial halo rings using remaining particle budget
  const rem = Math.max(32, count - pts.length);
  if (count >= 400) {
    const h = Math.floor(rem / 2);
    addRing(pts, edges, [0, 0, 0], 0.9, h, 0.48, 0.18, -0.22, 1, 0.9, 3, Math.floor(h / 4), 2);
    addRing(
      pts,
      edges,
      [0, 0, 0],
      0.9,
      rem - h,
      -0.48,
      0.26,
      0.62,
      0,
      0.9,
      3,
      Math.floor((rem - h) / 4),
      3,
    );
  } else {
    addRing(pts, edges, [0, 0, 0], 0.9, rem, 0.48, 0.18, -0.22, 1, 0.9, 3, Math.floor(rem / 4), 2);
  }

  return spatialCanonicalize({ points: padPoints(pts, count, rand), edges });
}

export function generateAllShapes(count: number): Record<ShapeId, ShapeGeometry> {
  const rand = mulberry32(20261118);
  return {
    atom: buildAtom(count, rand),
    code: buildCode(count, rand),
    infinity: buildInfinity(count, rand),
    orchestrator: buildOrchestrator(count, rand),
    neural: buildNeural(count, rand),
    trio: buildTrio(count, rand),
    chart: buildChart(count, rand),
    tesseract: buildTesseract(count, rand),
  };
}
