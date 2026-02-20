import { useRef, useMemo, useState, useEffect, useCallback, Component, type ReactNode } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

const STARS_KEY = "page-gallery-stars-visible";

export function useStarsVisible() {
  const [visible, setVisible] = useState(() => {
    try {
      const stored = localStorage.getItem(STARS_KEY);
      return stored === null ? true : stored === "true";
    } catch { return true; }
  });

  const toggle = useCallback(() => {
    setVisible(prev => {
      const next = !prev;
      try { localStorage.setItem(STARS_KEY, String(next)); } catch {}
      window.dispatchEvent(new CustomEvent("stars-toggle", { detail: next }));
      return next;
    });
  }, []);

  useEffect(() => {
    const handler = (e: Event) => setVisible((e as CustomEvent).detail);
    window.addEventListener("stars-toggle", handler);
    return () => window.removeEventListener("stars-toggle", handler);
  }, []);

  return { starsVisible: visible, toggleStars: toggle };
}

class WebGLErrorBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  render() { return this.state.hasError ? this.props.fallback : this.props.children; }
}

function StarField({ count = 1200 }) {
  const points = useRef<THREE.Points>(null!);

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 100;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 100;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 100;
    }
    return pos;
  }, [count]);

  useFrame((_, delta) => {
    if (points.current) {
      points.current.rotation.z += delta * 0.02;
      const positions = points.current.geometry.attributes.position.array as Float32Array;
      const speed = 5;
      for (let i = 0; i < count; i++) {
        positions[i * 3 + 2] += delta * speed;
        if (positions[i * 3 + 2] > 20) {
          positions[i * 3 + 2] = -80;
          positions[i * 3] = (Math.random() - 0.5) * 100;
          positions[i * 3 + 1] = (Math.random() - 0.5) * 100;
        }
      }
      points.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <Points ref={points} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#ede9e3"
        size={0.06}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.35}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
}

function CSSStarFallback() {
  const stars = useMemo(() => {
    return Array.from({ length: 80 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 0.5 + Math.random() * 2,
      opacity: 0.15 + Math.random() * 0.3,
      duration: 2 + Math.random() * 4,
      delay: Math.random() * 3,
    }));
  }, []);

  return (
    <div className="absolute inset-0">
      {stars.map((s) => (
        <div
          key={s.id}
          className="absolute rounded-full bg-[#ede9e3] animate-pulse"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            opacity: s.opacity,
            animationDuration: `${s.duration}s`,
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

function hasWebGL(): boolean {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

export default function StarBackground() {
  const { starsVisible } = useStarsVisible();
  const webgl = useMemo(() => hasWebGL(), []);
  const [contextLost, setContextLost] = useState(false);
  const [canvasReady, setCanvasReady] = useState(false);
  const [canvasKey, setCanvasKey] = useState(0);

  const handleCreated = useCallback(({ gl }: { gl: THREE.WebGLRenderer }) => {
    setCanvasReady(true);
    const canvas = gl.domElement;
    const onLost = (e: Event) => {
      e.preventDefault();
      setContextLost(true);
    };
    const onRestored = () => {
      setContextLost(false);
      setCanvasKey(k => k + 1);
    };
    canvas.addEventListener("webglcontextlost", onLost);
    canvas.addEventListener("webglcontextrestored", onRestored);
  }, []);

  useEffect(() => {
    if (contextLost) {
      const timer = setTimeout(() => {
        setContextLost(false);
        setCanvasKey(k => k + 1);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [contextLost]);

  if (!starsVisible) {
    return <div className="fixed inset-0 z-0 pointer-events-none bg-background" />;
  }

  return (
    <div className="fixed inset-0 z-0 pointer-events-none bg-background">
      {webgl && !contextLost && !canvasReady && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 rounded-full border border-white/10 border-t-white/40 animate-spin" />
              <div className="absolute inset-2 rounded-full border border-white/5 border-b-white/20 animate-spin" style={{animationDirection: 'reverse', animationDuration: '1.5s'}} />
            </div>
            <p className="font-mono text-[9px] tracking-[0.3em] uppercase text-white/30">Preparing the night sky...</p>
          </div>
        </div>
      )}
      {webgl && !contextLost ? (
        <WebGLErrorBoundary fallback={<CSSStarFallback />}>
          <Canvas
            key={canvasKey}
            camera={{ position: [0, 0, 10], fov: 60 }}
            gl={{ alpha: false, antialias: true, powerPreference: "low-power" }}
            className="bg-background"
            onCreated={handleCreated}
          >
            <fog attach="fog" args={['#0e141f', 20, 90]} />
            <StarField />
          </Canvas>
        </WebGLErrorBoundary>
      ) : (
        <CSSStarFallback />
      )}
    </div>
  );
}
