import { useMemo, useCallback, useState, useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
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

/* ---------- Three.js star field ---------- */
function StarField() {
  const ref = useRef<THREE.Points>(null);
  const count = 1400;

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 80;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 80;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 80;
    }
    return arr;
  }, []);

  const sizes = useMemo(() => {
    const arr = new Float32Array(count);
    for (let i = 0; i < count; i++) arr[i] = Math.random() * 0.12 + 0.03;
    return arr;
  }, []);

  useFrame((_state, delta) => {
    if (!ref.current) return;
    const geo = ref.current.geometry;
    const pos = geo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < count; i++) {
      let z = pos.getZ(i);
      z += delta * 0.5;
      if (z > 40) z = -40;
      pos.setZ(i, z);
    }
    pos.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-size" args={[sizes, 1]} />
      </bufferGeometry>
      <pointsMaterial
        color="#e8dcc8"
        size={0.12}
        sizeAttenuation
        transparent
        opacity={0.65}
        depthWrite={false}
      />
    </points>
  );
}

/* ---------- Main component with scroll fade ---------- */
export default function StarBackground() {
  const { starsVisible } = useStarsVisible();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    let rafId: number;
    const handleScroll = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        if (!containerRef.current) return;
        const scrollY = window.scrollY;
        const viewportHeight = window.innerHeight;
        const progress = Math.min(scrollY / (viewportHeight * 2.5), 1);
        const opacity = 1 - progress * 0.85;
        const scale = 1 + progress * 0.15;
        containerRef.current.style.opacity = String(opacity);
        containerRef.current.style.transform = `scale(${scale})`;
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
    <div
      ref={containerRef}
      className="fixed inset-0 z-0 pointer-events-none"
      style={{
        willChange: 'opacity, transform',
        transformOrigin: 'center center',
        transition: 'opacity 0.1s ease-out, transform 0.1s ease-out',
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 20], fov: 60 }}
        style={{ background: 'transparent' }}
        gl={{ alpha: true, antialias: false }}
        dpr={[1, 1.5]}
      >
        <StarField />
      </Canvas>
    </div>
  );
}
