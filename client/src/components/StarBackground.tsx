import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

function StarField({ count = 3000 }) {
  const points = useRef<THREE.Points>(null!);

  // Generate random points in a deep field
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 100; // Wide spread X
      const y = (Math.random() - 0.5) * 100; // Wide spread Y
      const z = (Math.random() - 0.5) * 100; // Deep spread Z
      
      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;
    }
    return pos;
  }, [count]);

  useFrame((state, delta) => {
    if (points.current) {
      // Rotate the whole system slightly for disorientation/floating feel
      points.current.rotation.z += delta * 0.02;
      
      // Move stars towards camera (Warp effect)
      const positions = points.current.geometry.attributes.position.array as Float32Array;
      const speed = 5; 
      
      for(let i = 0; i < count; i++) {
         // Move Z towards camera (positive direction)
         positions[i * 3 + 2] += delta * speed; 
         
         // If star passes camera (z > 20), reset it far back (z = -80)
         if(positions[i * 3 + 2] > 20) {
            positions[i * 3 + 2] = -80;
            // Re-randomize X and Y to prevent "tunnel patterns" from repeating exactly
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
        color="#ede9e3" // Paper white
        size={0.08}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.6}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
}

export default function StarBackground() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none bg-background">
      <Canvas
        camera={{ position: [0, 0, 10], fov: 60 }}
        gl={{ alpha: false, antialias: true }} // alpha: false for solid background color performance
        className="bg-background"
      >
        {/* Fog to hide stars appearing in the distance */}
        <fog attach="fog" args={['#0e141f', 20, 90]} /> 
        <StarField />
      </Canvas>
    </div>
  );
}
