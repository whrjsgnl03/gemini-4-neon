import { useEffect, useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { ThinkingLevelId } from '../data/neonData';
import {
  generateAllShapes,
  SHAPE_META,
  type ParticlePoint,
  type ShapeGeometry,
} from '../lib/particleShapes';

interface ParticleStageProps {
  thinkingLevel: ThinkingLevelId;
}

interface ProjectedPoint {
  sx: number;
  sy: number;
  z: number;
  scale: number;
  colorA: 0 | 1 | 2 | 3;
  colorB: 0 | 1 | 2 | 3;
  size: number;
  neuralGroup: number;
}

const THINKING_ENERGY: Record<ThinkingLevelId, { scale: number; spin: number; rank: number }> = {
  low: { scale: 0.88, spin: 0.78, rank: 1 },
  medium: { scale: 0.96, spin: 0.95, rank: 2 },
  high: { scale: 1.05, spin: 1.15, rank: 3 },
  xhigh: { scale: 1.15, spin: 1.48, rank: 4 },
};

const SPRITE_COLORS: readonly [string, string, string][] = [
  ['rgba(147, 197, 253, 1)', 'rgba(56, 189, 248, 0.55)', 'rgba(29, 107, 255, 0)'], // Electric azure
  ['rgba(207, 250, 254, 1)', 'rgba(34, 211, 238, 0.58)', 'rgba(6, 182, 212, 0)'], // Prism cyan
  ['rgba(255, 255, 255, 1)', 'rgba(224, 242, 254, 0.65)', 'rgba(255, 255, 255, 0)'], // Ice white
  ['rgba(255, 224, 214, 1)', 'rgba(255, 107, 74, 0.62)', 'rgba(255, 94, 58, 0)'], // Neon 640nm coral
];

// Shapes 2 (infinity), 5 (trio), 6 (chart) stay front-facing for silhouette readability.
const FRONT_FACING_SHAPES = new Set([2, 5, 6]);
const HOLD_PLATEAU = 0.24;

function createCrystalSprites(): HTMLCanvasElement[] {
  return SPRITE_COLORS.map(([core, mid, edge]) => {
    const off = document.createElement('canvas');
    off.width = 40;
    off.height = 40;
    const octx = off.getContext('2d');
    if (octx) {
      const grad = octx.createRadialGradient(20, 20, 0.8, 20, 20, 19);
      grad.addColorStop(0, core);
      grad.addColorStop(0.18, mid);
      grad.addColorStop(0.55, mid.replace(/0\.[0-9]+/, '0.16'));
      grad.addColorStop(1, edge);
      octx.fillStyle = grad;
      octx.fillRect(0, 0, 40, 40);
    }
    return off;
  });
}

function clamp01(t: number): number {
  return Math.max(0, Math.min(1, t));
}

function smoothstep(t: number): number {
  const c = clamp01(t);
  return c * c * (3 - 2 * c);
}

function smootherstep(t: number): number {
  const c = clamp01(t);
  return c * c * c * (c * (c * 6 - 15) + 10);
}

function wrapAngle(a: number): number {
  return Math.atan2(Math.sin(a), Math.cos(a));
}

export function ParticleStage({ thinkingLevel }: ParticleStageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const energyRef = useRef({ scale: 1.05, spin: 1.15, rank: 3 });

  useGSAP(() => {
    const target = THINKING_ENERGY[thinkingLevel];
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      energyRef.current.scale = target.scale;
      energyRef.current.spin = target.spin;
      energyRef.current.rank = target.rank;
      return;
    }
    gsap.to(energyRef.current, {
      scale: target.scale,
      spin: target.spin,
      rank: target.rank,
      duration: 0.72,
      ease: 'power3.out',
      overwrite: 'auto',
    });
  }, [thinkingLevel]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const sprites = createCrystalSprites();
    const isMobileInit = window.innerWidth < 768;
    const count = isMobileInit ? 220 : 520;
    const shapes = generateAllShapes(count);
    const shapeGeoms: ShapeGeometry[] = SHAPE_META.map((m) => shapes[m.id]);

    const phases = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      phases[i] = (i * 2.399963) % (Math.PI * 2);
    }

    const projected: ProjectedPoint[] = Array.from({ length: count }, () => ({
      sx: 0,
      sy: 0,
      z: 0,
      scale: 1,
      colorA: 0,
      colorB: 0,
      size: 1,
      neuralGroup: 1,
    }));
    const sortedIndices = Array.from({ length: count }, (_, i) => i);

    let vw = window.innerWidth;
    let vh = window.innerHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resizeCanvas = () => {
      vw = window.innerWidth;
      vh = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(vw * dpr);
      canvas.height = Math.round(vh * dpr);
      canvas.style.width = `${vw}px`;
      canvas.style.height = `${vh}px`;
    };
    resizeCanvas();

    let stops: number[] = [0, 900, 1650, 2400, 3400, 4400, 5400, 6400];

    const computeStops = () => {
      const getTop = (id: string) => {
        const el = document.getElementById(id);
        return el ? el.getBoundingClientRect().top + window.scrollY : 0;
      };

      const archEl = document.getElementById('architecture');
      const pinSpacer = archEl?.querySelector('.pin-spacer');
      let pinStart = getTop('architecture') - 96;
      let scrollDist = Math.max(400, (archEl ? archEl.getBoundingClientRect().height : 2000) * 0.66);

      if (pinSpacer) {
        const rect = pinSpacer.getBoundingClientRect();
        const pinInner = pinSpacer.firstElementChild as HTMLElement | null;
        const innerH = pinInner ? pinInner.getBoundingClientRect().height : 640;
        pinStart = rect.top + window.scrollY - 96;
        scrollDist = Math.max(400, rect.height - innerH);
      }

      const raw = [
        0,
        pinStart + scrollDist * 0.12,
        pinStart + scrollDist * 0.5,
        pinStart + scrollDist * 0.88,
        getTop('thinking') - 20,
        getTop('lineup') - 20,
        getTop('benchmarks') - 20,
        getTop('developer') - 20,
      ];

      for (let i = 1; i < raw.length; i++) {
        raw[i] = Math.max(raw[i - 1] + 80, raw[i]);
      }
      stops = raw;
    };

    computeStops();
    const rafStopId = window.requestAnimationFrame(() => computeStops());

    let targetScrollY = window.scrollY;
    const scrollProxy = { y: window.scrollY };
    const pointer = { nx: 0, ny: 0, active: false };
    let smoothPointerX = 0;
    let smoothPointerY = 0;
    let currentRotY = 0.28;
    let lastShapeIdx = -1;
    let elapsed = 0;

    const drawGeomEdges = (
      geom: ShapeGeometry,
      pts: ParticlePoint[],
      edgeAlpha: number,
      alphaMultiplier: number,
      isDesktop: boolean,
      neuralWeightForGeom: number,
      rank: number,
    ) => {
      if (edgeAlpha <= 0.015) return;
      ctx.lineWidth = isDesktop ? 1.05 : 0.78;
      for (let e = 0; e < geom.edges.length; e++) {
        const [ia, ib] = geom.edges[e];
        if (ia >= count || ib >= count) continue;
        const pa = projected[ia];
        const pb = projected[ib];

        let shellDim = 1;
        if (neuralWeightForGeom > 0.001) {
          const maxGroup = Math.max(pts[ia].group, pts[ib].group);
          const tierActive = clamp01(rank - (maxGroup - 1));
          const dim = 0.18 + 0.82 * tierActive;
          shellDim = 1 - neuralWeightForGeom * (1 - dim);
        }

        const alpha = 0.24 * edgeAlpha * alphaMultiplier * shellDim;
        if (alpha < 0.012) continue;

        const ca = pts[ia].colorIdx;
        const cb = pts[ib].colorIdx;
        ctx.strokeStyle =
          ca === 3 || cb === 3
            ? `rgba(255, 107, 74, ${alpha.toFixed(3)})`
            : ca === 2 || cb === 2
              ? `rgba(224, 242, 254, ${alpha.toFixed(3)})`
              : `rgba(56, 189, 248, ${alpha.toFixed(3)})`;
        ctx.beginPath();
        ctx.moveTo(pa.sx, pa.sy);
        ctx.lineTo(pb.sx, pb.sy);
        ctx.stroke();
      }
    };

    const drawScene = (isStatic: boolean, dt: number) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, vw, vh);

      const y = scrollProxy.y;
      let segIdx = 0;
      let localT = 0;

      if (!isStatic) {
        if (y >= stops[stops.length - 1]) {
          segIdx = stops.length - 2;
          localT = 1;
        } else {
          for (let i = 0; i < stops.length - 1; i++) {
            if (y >= stops[i] && y <= stops[i + 1]) {
              segIdx = i;
              const span = Math.max(1, stops[i + 1] - stops[i]);
              localT = clamp01((y - stops[i]) / span);
              break;
            }
          }
        }
      }

      const morphT =
        localT <= HOLD_PLATEAU
          ? 0
          : localT >= 1 - HOLD_PLATEAU
            ? 1
            : smootherstep((localT - HOLD_PLATEAU) / (1 - 2 * HOLD_PLATEAU));

      const activeHudIdx = morphT >= 0.5 ? segIdx + 1 : segIdx;
      if (activeHudIdx !== lastShapeIdx) {
        lastShapeIdx = activeHudIdx;
        const navLabel = document.getElementById('nav-particle-label');
        if (navLabel) {
          navLabel.textContent = SHAPE_META[activeHudIdx].label;
        }
      }

      const fromGeom = shapeGeoms[segIdx];
      const toGeom = shapeGeoms[segIdx + 1] || fromGeom;
      const fromPts = fromGeom.points;
      const toPts = toGeom.points;

      const isFrontA = FRONT_FACING_SHAPES.has(segIdx);
      const isFrontB = FRONT_FACING_SHAPES.has(segIdx + 1);
      const frontWeight = (isFrontA ? 1 - morphT : 0) + (isFrontB ? morphT : 0);

      if (!isStatic && dt > 0) {
        const ptrDamp = 1 - Math.exp(-dt * 6);
        smoothPointerX += ((pointer.active ? pointer.nx : 0) - smoothPointerX) * ptrDamp;
        smoothPointerY += ((pointer.active ? pointer.ny : 0) - smoothPointerY) * ptrDamp;

        const spinVel = 0.24 * energyRef.current.spin;
        const swayTarget = Math.sin(elapsed * 0.65) * 0.24;
        const swayPull = wrapAngle(swayTarget - currentRotY) * 3.4;
        currentRotY += (spinVel * (1 - frontWeight) + swayPull * frontWeight) * dt;
      }

      const neuralWeight = segIdx === 4 ? 1 - morphT : segIdx + 1 === 4 ? morphT : 0;
      const isDesktop = vw >= 1024;
      const energyScale = isDesktop ? 1 + (energyRef.current.scale - 1) * neuralWeight : 1;
      const centerShiftX = vw * 0.5;
      const centerShiftY = isDesktop ? vh * 0.52 : vh * 0.44;
      const radiusPx = isDesktop
        ? Math.min(vw * 0.175, vh * 0.28) * energyScale
        : Math.min(vw, vh) * 0.3;
      const alphaMultiplier = isDesktop ? 0.94 : 0.42;
      const spriteBaseSize = isDesktop ? 10.2 : 8.0;

      const rotY = isStatic
        ? isFrontA
          ? 0.14
          : 0.28
        : currentRotY + smoothPointerX * 0.22;
      const rotX = isStatic
        ? 0.12
        : Math.sin(elapsed * 0.38) * 0.12 + smoothPointerY * 0.16;
      const cy = Math.cos(rotY);
      const sy = Math.sin(rotY);
      const cx = Math.cos(rotX);
      const sx = Math.sin(rotX);

      // Continuous mid-morph arc envelope (strictly zero value and zero slope at 0 and 1)
      const arcEnv = isStatic ? 0 : Math.pow(Math.sin(Math.PI * morphT), 2);

      for (let i = 0; i < count; i++) {
        const a = fromPts[i];
        const b = toPts[i];
        const phase = phases[i];

        let px = a.x + (b.x - a.x) * morphT;
        let py = a.y + (b.y - a.y) * morphT;
        let pz = a.z + (b.z - a.z) * morphT;

        if (arcEnv > 0.0001) {
          const twist = arcEnv * (0.42 + Math.sin(phase) * 0.16);
          const ca = Math.cos(twist);
          const sa = Math.sin(twist);
          const lift = 1 + arcEnv * 0.07;
          const sxp = (px * ca - pz * sa) * lift;
          const szp = (px * sa + pz * ca) * lift;
          px = sxp;
          pz = szp;
          py = py * lift + Math.sin(phase + elapsed * 1.6) * arcEnv * 0.06;
        }

        if (!isStatic) {
          px += Math.sin(elapsed * 0.82 + phase) * 0.009;
          py += Math.cos(elapsed * 0.74 + phase * 1.3) * 0.011;
          pz += Math.sin(elapsed * 0.68 + phase * 0.7) * 0.009;
        }

        const x1 = px * cy + pz * sy;
        const z1 = -px * sy + pz * cy;
        const y2 = py * cx - z1 * sx;
        const z2 = py * sx + z1 * cx;

        const fov = 3.2;
        const persp = fov / Math.max(0.8, fov + z2);
        let screenX = centerShiftX + x1 * radiusPx * persp;
        let screenY = centerShiftY + y2 * radiusPx * persp;

        if (!isStatic && pointer.active && isDesktop) {
          const dx = screenX - (pointer.nx + 0.5) * vw;
          const dy = screenY - (pointer.ny + 0.5) * vh;
          const distSq = dx * dx + dy * dy;
          const repRadius = 115;
          if (distSq < repRadius * repRadius && distSq > 1) {
            const dist = Math.sqrt(distSq);
            const push = ((repRadius - dist) / repRadius) * 12;
            screenX += (dx / dist) * push;
            screenY += (dy / dist) * push;
          }
        }

        const out = projected[i];
        out.sx = screenX;
        out.sy = screenY;
        out.z = z2;
        out.scale = persp;
        out.colorA = a.colorIdx;
        out.colorB = b.colorIdx;
        out.size = a.size + (b.size - a.size) * morphT;
        out.neuralGroup = segIdx === 4 ? a.group : segIdx + 1 === 4 ? b.group : 1;
      }

      // Additive optical bloom over deep spatial midnight backdrop
      ctx.globalCompositeOperation = 'lighter';

      // Smooth dual edge crossfade (pure gliding particles between 0.36 and 0.64)
      const fromEdgeAlpha = smoothstep(1 - morphT / 0.36);
      const toEdgeAlpha = isStatic ? 0 : smoothstep((morphT - 0.64) / 0.36);
      const rank = energyRef.current.rank;

      drawGeomEdges(
        fromGeom,
        fromPts,
        fromEdgeAlpha,
        alphaMultiplier,
        isDesktop,
        segIdx === 4 ? 1 - morphT : 0,
        rank,
      );
      drawGeomEdges(
        toGeom,
        toPts,
        toEdgeAlpha,
        alphaMultiplier,
        isDesktop,
        segIdx + 1 === 4 ? morphT : 0,
        rank,
      );

      sortedIndices.sort((ia, ib) => projected[ib].z - projected[ia].z);

      for (let k = 0; k < count; k++) {
        const p = projected[sortedIndices[k]];
        const tierActive = clamp01(rank - (p.neuralGroup - 1));
        const neuralDim = 0.2 + 0.8 * tierActive;
        const shellScale = 1 - neuralWeight * (1 - neuralDim);

        const depthAlpha =
          Math.max(0.32, Math.min(1, 0.78 - p.z * 0.24)) * alphaMultiplier * shellScale;
        const drawSize = p.size * p.scale * spriteBaseSize;
        const dx = p.sx - drawSize * 0.5;
        const dy = p.sy - drawSize * 0.5;

        if (p.colorA === p.colorB || morphT <= 0.02) {
          ctx.globalAlpha = depthAlpha;
          ctx.drawImage(sprites[p.colorA], dx, dy, drawSize, drawSize);
        } else if (morphT >= 0.98) {
          ctx.globalAlpha = depthAlpha;
          ctx.drawImage(sprites[p.colorB], dx, dy, drawSize, drawSize);
        } else {
          ctx.globalAlpha = depthAlpha * (1 - morphT);
          ctx.drawImage(sprites[p.colorA], dx, dy, drawSize, drawSize);
          ctx.globalAlpha = depthAlpha * morphT;
          ctx.drawImage(sprites[p.colorB], dx, dy, drawSize, drawSize);
        }
      }

      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
    };

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      drawScene(true, 0);
      const onReducedResize = () => {
        resizeCanvas();
        drawScene(true, 0);
      };
      window.addEventListener('resize', onReducedResize);
      return () => {
        window.cancelAnimationFrame(rafStopId);
        window.removeEventListener('resize', onReducedResize);
      };
    }

    const masterTrigger = ScrollTrigger.create({
      start: 0,
      end: 'max',
      refreshPriority: -20,
      onUpdate: (self) => {
        targetScrollY = self.scroll();
      },
    });

    const onRefresh = () => {
      resizeCanvas();
      computeStops();
    };
    ScrollTrigger.addEventListener('refresh', onRefresh);

    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const onPointerMove = (e: PointerEvent) => {
      pointer.nx = e.clientX / vw - 0.5;
      pointer.ny = e.clientY / vh - 0.5;
      pointer.active = true;
    };
    const onPointerLeave = () => {
      pointer.active = false;
      pointer.nx = 0;
      pointer.ny = 0;
    };

    if (finePointer) {
      window.addEventListener('pointermove', onPointerMove, { passive: true });
      window.addEventListener('pointerleave', onPointerLeave);
    }

    const onResize = () => {
      resizeCanvas();
      computeStops();
    };
    window.addEventListener('resize', onResize);

    const renderFrame = (_time: number, deltaTime: number) => {
      const dt = Math.min(0.05, deltaTime / 1000);
      elapsed += dt;

      const scrollDiff = targetScrollY - scrollProxy.y;
      if (Math.abs(scrollDiff) < 0.25) {
        scrollProxy.y = targetScrollY;
      } else {
        scrollProxy.y += scrollDiff * (1 - Math.exp(-dt * 9));
      }

      drawScene(false, dt);
    };

    gsap.ticker.add(renderFrame);
    drawScene(false, 0);

    return () => {
      window.cancelAnimationFrame(rafStopId);
      gsap.ticker.remove(renderFrame);
      masterTrigger.kill();
      ScrollTrigger.removeEventListener('refresh', onRefresh);
      window.removeEventListener('resize', onResize);
      if (finePointer) {
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerleave', onPointerLeave);
      }
    };
  }, []);

  return <canvas ref={canvasRef} className="particle-canvas" aria-hidden="true" />;
}
