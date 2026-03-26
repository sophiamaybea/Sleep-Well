import { useMemo, useCallback, useState, useEffect, useRef } from 'react';
import { Canvas, useFrame, extend } from '@react-three/fiber';
import * as THREE from 'three';
import { shaderMaterial } from '@react-three/drei';

/* ─────────────────────────────────────────────
   Shared scroll-progress atom (plain ref so no
   React state overhead inside render loops)
   ───────────────────────────────────────────── */
const scrollProgress = { value: 0 };

/* ─────────────────────────────────────────────
   Stars-visible preference
   ───────────────────────────────────────────── */
const STARS_KEY = 'page-gallery-stars-visible';

export function useStarsVisible() {
  const [visible, setVisible] = useState(() => {
    try {
      const stored = localStorage.getItem(STARS_KEY);
      return stored === null ? true : stored === 'true';
    } catch {
      return true;
    }
  });

  const toggle = useCallback(() => {
    setVisible((prev) => {
      const next = !prev;
      try { localStorage.setItem(STARS_KEY, String(next)); } catch {}
      window.dispatchEvent(new CustomEvent('stars-toggle', { detail: next }));
      return next;
    });
  }, []);

  useEffect(() => {
    const handler = (e: Event) => setVisible((e as CustomEvent).detail);
    window.addEventListener('stars-toggle', handler);
    return () => window.removeEventListener('stars-toggle', handler);
  }, []);

  return { starsVisible: visible, toggleStars: toggle };
}

/* ─────────────────────────────────────────────
   Custom shader material – round, glowing,
   per-star twinkle (no square sprites!)
   ───────────────────────────────────────────── */
const StarMaterial = shaderMaterial(
  { uTime: 0, uOpacity: 0.85 },
  /* vertex */
  `
  attribute float aSize;
  attribute float aPhase;
  uniform float uTime;
  varying float vAlpha;
  varying float vPhase;

  void main() {
    vPhase = aPhase;
    // Gentle per-star twinkle: ±25% brightness oscillation
    vAlpha = 0.55 + 0.25 * sin(uTime * 1.4 + aPhase * 6.2831);

    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    // Size stays small – sizeAttenuation for perspective feel
    gl_PointSize = aSize * (300.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
  `,
  /* fragment */
  `
  uniform float uOpacity;
  varying float vAlpha;

  void main() {
    // Circular disc with soft radial falloff – no more squares
    vec2 uv = gl_PointCoord - 0.5;
    float r = length(uv);
    if (r > 0.5) discard;

    // Smooth soft glow edge
    float intensity = 1.0 - smoothstep(0.0, 0.5, r);
    intensity = pow(intensity, 1.6); // sharpen centre without hard edge

    gl_FragColor = vec4(
      mix(vec3(0.78, 0.75, 0.88), vec3(1.0, 0.97, 0.92), intensity),
      intensity * vAlpha * uOpacity
    );
  }
  `,
);

extend({ StarMaterial });

// TypeScript declaration so JSX can find the extended element
declare module '@react-three/fiber' {
  interface ThreeElements {
    starMaterial: React.PropsWithChildren<{
      uTime?: number;
      uOpacity?: number;
      attach?: string;
      transparent?: boolean;
      depthWrite?: boolean;
    }>;
  }
}

/* ─────────────────────────────────────────────
   3-D star field
   ───────────────────────────────────────────── */
function StarField() {
  const matRef = useRef<InstanceType<typeof StarMaterial>>(null);
  const count = 1600;

  const { positions, sizes, phases } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const phases = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * 90;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 70;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 70;
      // Vary star sizes – small range so nothing grows "huge"
      sizes[i]  = Math.random() * 2.8 + 1.2;
      phases[i] = Math.random();
    }
    return { positions, sizes, phases };
  }, []);

  useFrame(({ clock }) => {
    if (!matRef.current) return;
    (matRef.current as any).uTime = clock.getElapsedTime();
  });

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aSize"    args={[sizes, 1]} />
        <bufferAttribute attach="attributes-aPhase"   args={[phases, 1]} />
      </bufferGeometry>
      {/* @ts-ignore – extended material */}
      <starMaterial
        ref={matRef}
        attach="material"
        uTime={0}
        uOpacity={0.85}
        transparent
        depthWrite={false}
      />
    </points>
  );
}

/* ─────────────────────────────────────────────
   Weather layer – scroll-driven, CSS-only
   Cycles:  night/stars (0-0.15)
            → rain      (0.15-0.35)
            → clear     (0.35-0.45)
            → sunbeams  (0.45-0.65)
            → mist/fog  (0.65-0.85)
            → rain      (0.85-1.0)
   Each zone blends in/out with a short crossfade.
   ───────────────────────────────────────────── */
function lerp(a: number, b: number, t: number) {
  return a + (b - a) * Math.max(0, Math.min(1, t));
}

function weatherOpacity(progress: number, start: number, peak: number, end: number) {
  if (progress < start) return 0;
  if (progress < peak)  return lerp(0, 1, (progress - start) / (peak - start));
  if (progress < end)   return lerp(1, 0, (progress - peak)  / (end  - peak));
  return 0;
}

interface WeatherLayerProps { progress: number }

function WeatherLayer({ progress }: WeatherLayerProps) {
  // Rain: 0.15 → fade in 0.15-0.22, fade out 0.28-0.35  AND 0.85-1.0
  const rainOp   = Math.max(
    weatherOpacity(progress, 0.15, 0.22, 0.35),
    weatherOpacity(progress, 0.85, 0.90, 1.0),
  );
  // Sunbeams: 0.45 → fade in 0.45-0.52, fade out 0.58-0.65
  const sunOp    = weatherOpacity(progress, 0.45, 0.52, 0.65);
  // Mist: 0.65 → fade in 0.65-0.72, fade out 0.78-0.85
  const mistOp   = weatherOpacity(progress, 0.65, 0.72, 0.85);

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 2 }}
      aria-hidden="true"
    >
      {/* ── Rain ── */}
      <div
        style={{
          position: 'absolute', inset: 0,
          opacity: rainOp,
          transition: 'opacity 0.8s ease',
          pointerEvents: 'none',
        }}
      >
        {/* 3 rain layers at different speeds / angles for depth */}
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              position: 'absolute', inset: 0,
              backgroundImage: `repeating-linear-gradient(
                ${175 + i * 3}deg,
                transparent 0px,
                transparent ${18 + i * 4}px,
                rgba(174,209,230,${0.18 - i * 0.04}) ${18 + i * 4}px,
                rgba(174,209,230,${0.18 - i * 0.04}) ${18 + i * 4 + 1}px
              )`,
              backgroundSize: `${6 + i * 3}px 100%`,
              animation: `pgj-rain-${i} ${0.55 + i * 0.15}s linear infinite`,
            }}
          />
        ))}
      </div>

      {/* ── Sun beams ── */}
      <div
        style={{
          position: 'absolute', inset: 0,
          opacity: sunOp,
          transition: 'opacity 1.2s ease',
          background: `
            conic-gradient(
              from -5deg at 50% -20%,
              transparent 0deg,
              rgba(255,220,120,0.07) 4deg,
              transparent 9deg,
              transparent 14deg,
              rgba(255,215,100,0.06) 19deg,
              transparent 25deg,
              transparent 30deg,
              rgba(255,225,140,0.07) 35deg,
              transparent 40deg,
              transparent 180deg
            )
          `,
          mixBlendMode: 'screen',
        }}
      />
      {/* warm glow at top for sun */}
      <div
        style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '45vh',
          opacity: sunOp * 0.7,
          transition: 'opacity 1.2s ease',
          background: 'radial-gradient(ellipse at 50% -10%, rgba(255,210,80,0.22) 0%, transparent 65%)',
          pointerEvents: 'none',
        }}
      />

      {/* ── Mist ── */}
      <div
        style={{
          position: 'absolute', inset: 0,
          opacity: mistOp,
          transition: 'opacity 1.4s ease',
          background: `
            radial-gradient(ellipse at 20% 80%, rgba(200,220,240,0.15) 0%, transparent 55%),
            radial-gradient(ellipse at 80% 60%, rgba(210,225,245,0.12) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 100%, rgba(220,230,250,0.18) 0%, transparent 60%)
          `,
          backdropFilter: `blur(${mistOp * 2}px)`,
        }}
      />
    </div>
  );
}

/* ─────────────────────────────────────────────
   Main component
   ───────────────────────────────────────────── */
export default function StarBackground() {
  const { starsVisible } = useStarsVisible();
  const containerRef = useRef<HTMLDivElement>(null);
  const [weatherProgress, setWeatherProgress] = useState(0);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let rafId: number;
    const handleScroll = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const scrollY   = window.scrollY;
        const maxScroll = document.body.scrollHeight - window.innerHeight;
        const progress  = maxScroll > 0 ? Math.min(scrollY / maxScroll, 1) : 0;
        scrollProgress.value = progress;

        // Stars fade gently as you descend – no more jarring scale
        if (containerRef.current && !prefersReducedMotion) {
          const opacity = Math.max(0.15, 1 - progress * 0.80);
          containerRef.current.style.opacity = String(opacity);
        }

        setWeatherProgress(progress);
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  if (!starsVisible) return null;

  return (
    <>
      {/* Dark sky base — always present, full viewport, behind everything */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{ zIndex: -1, background: '#0b0c14' }}
        aria-hidden="true"
      />

      {/* Three.js star canvas */}
      <div
        ref={containerRef}
        className="fixed inset-0 pointer-events-none"
        style={{
          zIndex: 0,
          willChange: 'opacity',
          transition: 'opacity 0.15s ease-out',
        }}
      >
        <Canvas
          camera={{ position: [0, 0, 22], fov: 62 }}
          style={{ background: 'transparent' }}
          gl={{ alpha: true, antialias: true }}
          dpr={[1, 1.5]}
        >
          <StarField />
        </Canvas>
      </div>

      {/* Scroll-driven weather overlays */}
      <WeatherLayer progress={weatherProgress} />

      {/* CSS keyframes injected once */}
      <style>{`
        @keyframes pgj-rain-0 {
          from { background-position: 0 0; }
          to   { background-position: 0 100vh; }
        }
        @keyframes pgj-rain-1 {
          from { background-position: 0 0; }
          to   { background-position: 0 100vh; }
        }
        @keyframes pgj-rain-2 {
          from { background-position: 0 0; }
          to   { background-position: 0 100vh; }
        }
        @media (prefers-reduced-motion: reduce) {
          [style*="pgj-rain"] { animation: none !important; }
        }
      `}</style>
    </>
  );
}
