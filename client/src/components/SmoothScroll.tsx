import { useEffect } from 'react';

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Ensure smooth scroll via CSS as a lightweight alternative to Lenis
    document.documentElement.style.scrollBehavior = 'smooth';
    return () => {
      document.documentElement.style.scrollBehavior = '';
    };
  }, []);

  return <>{children}</>;
}
