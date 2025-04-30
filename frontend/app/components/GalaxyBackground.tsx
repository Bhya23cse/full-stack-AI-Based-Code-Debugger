'use client';

import { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { random } from 'maath';

function Galaxy() {
  const ref = useRef<THREE.Points>(null);
  const count = 5000;
  
  const positions = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const radius = 15;
    const branches = 3;
    const spin = 1;
    const randomness = 0.2;
    const randomnessPower = 3;
    const insideColor = new THREE.Color('#ff6030');
    const outsideColor = new THREE.Color('#1b3984');

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const radius = Math.random() * 15;
      const spinAngle = radius * spin;
      const branchAngle = ((i % branches) / branches) * Math.PI * 2;

      const randomX = Math.pow(Math.random(), randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * randomness * radius;
      const randomY = Math.pow(Math.random(), randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * randomness * radius;
      const randomZ = Math.pow(Math.random(), randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * randomness * radius;

      positions[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX;
      positions[i3 + 1] = randomY;
      positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;

      // Color
      const mixedColor = insideColor.clone();
      mixedColor.lerp(outsideColor, radius / 15);
    }

    return positions;
  }, [count]);

  // Add floating animation
  useFrame((state, delta) => {
    if (ref.current) {
      // Rotation
      ref.current.rotation.x += delta * 0.05;
      ref.current.rotation.y += delta * 0.075;
      
      // Floating effect
      const time = state.clock.getElapsedTime();
      ref.current.position.y = Math.sin(time * 0.5) * 0.2;
      ref.current.position.x = Math.cos(time * 0.3) * 0.2;
    }
  });

  return (
    <group rotation={[0, 0, Math.PI * 0.25]}>
      <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#ffffff"
          size={0.01}
          sizeAttenuation={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          vertexColors={true}
        />
      </Points>
    </group>
  );
}

// Add a new component for floating stars
function FloatingStars() {
  const starsRef = useRef<THREE.Points>(null);
  const count = 200;
  
  const positions = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 50;
      positions[i3 + 1] = (Math.random() - 0.5) * 50;
      positions[i3 + 2] = (Math.random() - 0.5) * 50;
    }
    return positions;
  }, []);

  useFrame((state) => {
    if (starsRef.current) {
      const time = state.clock.getElapsedTime();
      starsRef.current.rotation.y = time * 0.1;
      starsRef.current.rotation.x = time * 0.05;
    }
  });

  return (
    <Points ref={starsRef} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#ffffff"
        size={0.05}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
}

export default function GalaxyBackground() {
  return (
    <div className="fixed inset-0 -z-10">
      <Suspense fallback={null}>
        <Canvas camera={{ position: [0, 0, 5] }}>
          <Galaxy />
          <FloatingStars />
        </Canvas>
      </Suspense>
    </div>
  );
} 