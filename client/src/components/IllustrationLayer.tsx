import { useMemo } from 'react';

// Place your renamed illustration PNGs in: client/public/images/illustrations/
// Rename: Untitled design (34).png → ill-1.png, (35)→ill-2.png ... (40)→ill-7.png

const ILLUSTRATIONS = [
  '/images/illustrations/ill-1.png',
  '/images/illustrations/ill-2.png',
  '/images/illustrations/ill-3.png',
  '/images/illustrations/ill-4.png',
  '/images/illustrations/ill-5.png',
  '/images/illustrations/ill-6.png',
  '/images/illustrations/ill-7.png',
];

export default function IllustrationLayer() {
  // Pick one illustration randomly per page load, stable across re-renders
  const src = useMemo(() => {
    return ILLUSTRATIONS[Math.floor(Math.random() * ILLUSTRATIONS.length)];
  }, []);

  return (
    <img
      src={src}
      alt=""
      aria-hidden="true"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        width: 'clamp(240px, 30vw, 480px)',
        height: 'auto',
        opacity: 0.80,
        zIndex: 1,
        pointerEvents: 'none',
        userSelect: 'none',
        // Fade in smoothly
        animation: 'ill-fadein 1.2s ease forwards',
      }}
    />
  );
}
