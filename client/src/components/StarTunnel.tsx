import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

function Stars({ count = 2000 }) {
  const points = useRef<THREE.Points>(null!);

  // Generate random points in a tunnel/cylinder shape
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // Random angle
      const theta = THREE.MathUtils.randFloatSpread(360); 
      // Random distance from center (inner radius to outer radius)
      const r = THREE.MathUtils.randFloat(2, 15);
      
      const x = r * Math.cos(theta);
      const y = r * Math.sin(theta);
      // Spread along Z axis (depth)
      const z = THREE.MathUtils.randFloatSpread(100);

      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;
    }
    return pos;
  }, [count]);

  useFrame((state, delta) => {
    // Rotate the tunnel slightly
    if (points.current) {
      points.current.rotation.z += delta * 0.05;
      
      // Move particles towards camera to create tunnel effect
      const positions = points.current.geometry.attributes.position.array as Float32Array;
      for(let i = 0; i < count; i++) {
         // Move Z towards camera
         positions[i * 3 + 2] += delta * 5; 
         
         // Reset if too close
         if(positions[i * 3 + 2] > 20) {
            positions[i * 3 + 2] = -80;
         }
      }
      points.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={points} positions={positions} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#FDF2D6" // The cream color from the theme
          size={0.03}
          sizeAttenuation={true}
          depthWrite={false}
          opacity={0.6}
        />
      </Points>
    </group>
  );
}

export default function StarTunnel() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none mix-blend-screen opacity-60">
      <Canvas
        camera={{ position: [0, 0, 10], fov: 60 }}
        gl={{ alpha: true, antialias: true }}
      >
        <Stars />
      </Canvas>
    </div>
  );
}
