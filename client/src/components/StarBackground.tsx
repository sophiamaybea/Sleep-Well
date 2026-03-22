import { useMemo, useCallback, useState, useEffect } from 'react';

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

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  duration: number;
  delay: number;
}

function generateStars(count: number): Star[] {
  const stars: Star[] = [];
  for (let i = 0; i < count; i++) {
    stars.push({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 0.8 + Math.random() * 2.2,
      opacity: 0.4 + Math.random() * 0.6,
      duration: 2 + Math.random() * 4,
      delay: Math.random() * 6,
    });
  }
  return stars;
}

export default function StarBackground() {
  const { starsVisible } = useStarsVisible();
  const stars = useMemo(() => generateStars(250), []);

  if (!starsVisible) {
    return (
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{ background: '#060b14' }}
      />
    );
  }

  return (
    <div
      className="fixed inset-0 z-0 pointer-events-none overflow-hidden"
      style={{ background: '#060b14' }}
      aria-hidden="true"
    >
      <style>{`
        @keyframes star-twinkle {
          0%, 100% { opacity: var(--star-opacity); transform: scale(1); }
          50% { opacity: calc(var(--star-opacity) * 0.3); transform: scale(0.7); }
        }
      `}</style>
      {stars.map((star) => (
        <div
          key={star.id}
          style={{
            position: 'absolute',
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            borderRadius: '50%',
            backgroundColor: '#ffffff',
            '--star-opacity': star.opacity,
            opacity: star.opacity,
            boxShadow: star.size > 2 ? `0 0 ${star.size * 2}px rgba(255,255,255,0.6)` : 'none',
            animation: `star-twinkle ${star.duration}s ease-in-out ${star.delay}s infinite`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}
