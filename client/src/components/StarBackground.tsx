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

/** Enhanced 3D star field: more stars, brighter, faster tunnel effect */
function StarField({ count = 2500 }) {
  const points = useRef<THREE.Points>(null!);

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // Spread stars in a wide sphere around camera
      pos[i * 3]     = (Math.random() - 0.5) * 120;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 120;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 120;
    }
    return pos;
  }, [count]);

  useFrame((_, delta) => {
    if (points.current) {
      // Slow drift rotation for depth
      points.current.rotation.y += delta * 0.015;
      points.current.rotation.x += delta * 0.008;

      // Fly-through: stars rush toward camera
      const pos = points.current.geometry.attributes.position.array as Float32Array;
      const speed = 8;
      for (let i = 0; i < count; i++) {
        pos[i * 3 + 2] += delta * speed;
        // Recycle stars that pass the camera
        if (pos[i * 3 + 2] > 25) {
          pos[i * 3 + 2] = -95;
          pos[i * 3]     = (Math.random() - 0.5) * 120;
          pos[i * 3 + 1] = (Math.random() - 0.5) * 120;
        }
      }
      points.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <Points ref={points} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#ffffff"
        size={0.12}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.85}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
}

/** CSS fallback for devices without WebGL */
function CSSStarFallback() {
  const stars = useMemo(() => {
    return Array.from({ length: 150 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 0.8 + Math.random() * 2.5,
      opacity: 0.4 + Math.random() * 0.6,
      duration: 2 + Math.random() * 5,
      delay: Math.random() * 4,
    }));
  }, []);

  return (
    <div className="absolute inset-0">
      {stars.map((s) => (
        <div
          key={s.id}
          className="absolute rounded-full bg-white animate-pulse"
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
    return <div className="fixed inset-0 z-0 pointer-events-none" style={{ background: '#060b14' }} />;
  }

  return (
    <div className="fixed inset-0 z-0 pointer-events-none" style={{ background: '#060b14' }}>
      {webgl && !contextLost && !canvasReady && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="font-mono text-[9px] tracking-[0.3em] uppercase text-white/20">Preparing the night sky...</p>
        </div>
      )}
      {webgl && !contextLost ? (
        <WebGLErrorBoundary fallback={<CSSStarFallback />}>
          <Canvas
            key={canvasKey}
            camera={{ position: [0, 0, 15], fov: 75 }}
            gl={{ alpha: true, antialias: false, powerPreference: "high-performance" }}
            style={{ background: 'transparent' }}
            onCreated={handleCreated}
          >
            <fog attach="fog" args={['#060b14', 30, 100]} />
            <StarField />
          </Canvas>
        </WebGLErrorBoundary>
      ) : (
        <CSSStarFallback />
      )}
    </div>
  );
}
