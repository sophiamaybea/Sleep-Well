import { useMemo } from 'react';
import ill1 from '@/assets/upload 1.png';
import ill2 from '@/assets/upload 2.png';
import ill3 from '@/assets/upload 3.png';
import ill4 from '@/assets/upload 4.png';
import ill5 from '@/assets/upload 5.png';
import ill6 from '@/assets/upload 6.png';
import ill7 from '@/assets/upload 7.png';
import ill8 from '@/assets/upload 8.png';

const ILLUSTRATIONS = [ill1, ill2, ill3, ill4, ill5, ill6, ill7, ill8];

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
