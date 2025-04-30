'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

// Animation pattern types
enum AnimationPattern {
  SPIRAL = 'spiral',
  WAVE = 'wave',
  ORBITAL = 'orbital',
  PULSE = 'pulse',
  CONVERGENCE = 'convergence'
}

const Background3D: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);
  const mousePosition = useRef({ x: 0, y: 0 });
  const frameId = useRef<number>(0);
  const particleScalesRef = useRef<Float32Array | null>(null);
  const particleStatesRef = useRef<Array<{ 
    expanding: boolean, 
    speed: number,
    patternTimer: number,
    currentPattern: AnimationPattern,
    nextPatternTime: number
  }> | null>(null);
  const lastBoomTimeRef = useRef<number>(Date.now());
  const initialPositionsRef = useRef<Float32Array | null>(null);
  const targetPositionsRef = useRef<Float32Array | null>(null);
  const lastPositionsRef = useRef<Float32Array | null>(null); // Store last valid positions
  const expansionStateRef = useRef<{ progress: number, active: boolean }>({ progress: 0, active: true });
  const globalAnimationTimer = useRef<number>(0);
  // Individual particle animation parameters
  const particleAnimParamsRef = useRef<Array<{
    directionX: number;
    directionY: number;
    directionZ: number;
    speed: number;
    amplitude: number;
    phase: number;
    containmentFactor: number;
    orbitRadius: number;
    orbitSpeed: number;
    pulseFrequency: number;
    convergenceTarget: { x: number, y: number, z: number };
  }> | null>(null);

  useEffect(() => {
    // Skip initialization on mobile devices to improve performance
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
      // Just return a simple background for mobile
      const container = containerRef.current;
      if (container) {
        container.style.background = 'linear-gradient(to bottom right, #000022, #111133)';
      }
      return;
    }

    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera setup with increased field of view for better visibility
    const camera = new THREE.PerspectiveCamera(
      85, // Wider field of view (was 75)
      window.innerWidth / window.innerHeight,
      0.1,
      2000 // Much larger far plane
    );
    camera.position.z = 30;
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Particles setup
    const particlesGeometry = new THREE.BufferGeometry();
    const particleCount = 2000;
    
    // Create both initial (centered) positions and target (expanded) positions
    const initialPositions = new Float32Array(particleCount * 3);
    const targetPositions = new Float32Array(particleCount * 3);
    const lastPositions = new Float32Array(particleCount * 3);
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    const scales = new Float32Array(particleCount);
    
    // Random shared convergence points (for convergence animation pattern)
    const convergencePoints = Array(5).fill(null).map(() => ({
      x: (Math.random() - 0.5) * 80,
      y: (Math.random() - 0.5) * 80,
      z: (Math.random() - 0.5) * 80
    }));
    
    // Create particle states for boom animation
    const particleStates = Array(particleCount).fill(null).map(() => ({
      expanding: false,
      speed: 0.005 + Math.random() * 0.015, // Slower expansion speed
      patternTimer: Math.random() * 100, // Random start time for each particle
      currentPattern: getRandomPattern(), // Start with a random pattern
      nextPatternTime: 30 + Math.random() * 60 // Time until next pattern change (30-90 seconds)
    }));
    
    // Helper function to get random animation pattern
    function getRandomPattern(): AnimationPattern {
      const patterns = [
        AnimationPattern.SPIRAL,
        AnimationPattern.WAVE,
        AnimationPattern.ORBITAL,
        AnimationPattern.PULSE,
        AnimationPattern.CONVERGENCE
      ];
      return patterns[Math.floor(Math.random() * patterns.length)];
    }
    
    // Create unique animation parameters for each particle
    const particleAnimParams = Array(particleCount).fill(null).map(() => ({
      directionX: Math.random() * 2 - 1, // Random direction vector
      directionY: Math.random() * 2 - 1,
      directionZ: Math.random() * 2 - 1,
      speed: 0.0001 + Math.random() * 0.0003, // Very slow, unique speed
      amplitude: 0.3 + Math.random() * 0.7, // Unique wave amplitude
      phase: Math.random() * Math.PI * 2, // Random starting phase
      containmentFactor: 0.01 + Math.random() * 0.02, // Force pulling back to visible area
      orbitRadius: 5 + Math.random() * 15, // For orbital pattern
      orbitSpeed: 0.0001 + Math.random() * 0.0003, // For orbital pattern
      pulseFrequency: 0.00005 + Math.random() * 0.0001, // For pulse pattern
      convergenceTarget: convergencePoints[Math.floor(Math.random() * convergencePoints.length)] // For convergence pattern
    }));
    
    particleScalesRef.current = scales;
    particleStatesRef.current = particleStates;
    initialPositionsRef.current = initialPositions;
    targetPositionsRef.current = targetPositions;
    lastPositionsRef.current = lastPositions;
    particleAnimParamsRef.current = particleAnimParams;

    // Define the boundary for keeping particles in view
    const viewBoundary = 120; // Larger than spread (100) to give room for movement
    const hardBoundary = 180; // Absolute limit beyond which particles are pulled back strongly

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      
      // Initial positions - all particles clustered near center
      // Small random offsets to prevent all particles being at exactly the same point
      initialPositions[i3] = (Math.random() - 0.5) * 10;     // Close to center X
      initialPositions[i3 + 1] = (Math.random() - 0.5) * 10; // Close to center Y
      initialPositions[i3 + 2] = (Math.random() - 0.5) * 10; // Close to center Z
      
      // Target positions - where particles will expand to, ensuring they're within view
      const radius = 30 + Math.random() * 70; // Random radius between 30 and 100
      const theta = Math.random() * Math.PI * 2; // Random angle around Y axis
      const phi = Math.acos(2 * Math.random() - 1); // Random angle from Y axis
      
      // Convert spherical to cartesian coordinates for more uniform distribution
      targetPositions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      targetPositions[i3 + 1] = radius * Math.cos(phi);
      targetPositions[i3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
      
      // Start with initial positions
      positions[i3] = initialPositions[i3];
      positions[i3 + 1] = initialPositions[i3 + 1];
      positions[i3 + 2] = initialPositions[i3 + 2];
      
      // Initialize last positions to match
      lastPositions[i3] = positions[i3];
      lastPositions[i3 + 1] = positions[i3 + 1];
      lastPositions[i3 + 2] = positions[i3 + 2];

      // Create a color palette with more variation but still cosmic feel
      // Use HSL-like approach for better color distribution
      const colorBase = Math.random(); // Base color value
      colors[i3] = 0.1 + colorBase * 0.3;         // R - varies with base
      colors[i3 + 1] = 0.1 + (1-colorBase) * 0.3; // G - inverse variation
      colors[i3 + 2] = 0.5 + Math.random() * 0.5; // B - always strong blues
      
      // Initial size and scale with more variation
      sizes[i] = 0.5 + Math.random() * Math.random() * 1.5; // More variation with quadratic distribution
      scales[i] = 1.0; // Initial scale factor
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    particlesGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.4, // Smaller default size
      vertexColors: true,
      transparent: true,
      opacity: 0.7, // More transparent
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true, // Size affected by distance from camera
    });

    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);
    particlesRef.current = particles;

    // Mouse move handler
    const handleMouseMove = (event: MouseEvent) => {
      mousePosition.current = {
        x: (event.clientX / window.innerWidth) * 2 - 1,
        y: -(event.clientY / window.innerHeight) * 2 + 1,
      };
    };
    
    // Click handler to trigger booms
    const handleClick = () => {
      triggerBoom();
    };
    
    // Function to trigger boom animation
    const triggerBoom = () => {
      const now = Date.now();
      // Only allow a new boom every 3 seconds
      if (now - lastBoomTimeRef.current < 3000) return;
      
      lastBoomTimeRef.current = now;
      
      if (!particleStatesRef.current) return;
      
      // Select 20% of particles randomly to expand (fewer for subtlety)
      for (let i = 0; i < particleStatesRef.current.length; i++) {
        if (Math.random() < 0.2) {
          particleStatesRef.current[i].expanding = true;
        }
      }
    };
    
    // Random booms
    const randomBoom = () => {
      if (Math.random() < 0.002) { // More rare random booms (1/500 chance per frame)
        triggerBoom();
      }
    };
    
    // Easing function for smooth transitions
    const easeOutCubic = (x: number): number => {
      return 1 - Math.pow(1 - x, 3);
    };
    
    // Function to keep particles within visible boundaries
    const keepInBounds = (position: number, boundary: number, hardBoundary: number, animParam: number): number => {
      // If approaching hard boundary, strong force to pull back
      if (Math.abs(position) > hardBoundary) {
        const direction = position > 0 ? -1 : 1;
        return position + (direction * 0.1 * (Math.abs(position) - hardBoundary));
      }
      // If outside normal boundary, gentle force to pull back
      else if (Math.abs(position) > boundary) {
        const direction = position > 0 ? -1 : 1;
        return position + (direction * animParam * (Math.abs(position) - boundary));
      }
      return position;
    };
    
    // Check if position is within safe bounds
    const isOutOfBounds = (x: number, y: number, z: number, boundary: number): boolean => {
      return Math.abs(x) > boundary || Math.abs(y) > boundary || Math.abs(z) > boundary;
    };
    
    // Animation patterns
    const animateParticle = (
      index: number, 
      x: number, y: number, z: number,
      time: number,
      animParams: any,
      state: any
    ): {x: number, y: number, z: number} => {
      // Update pattern timer and check for pattern change
      state.patternTimer += 0.016; // Approximately 16ms per frame
      
      if (state.patternTimer > state.nextPatternTime) {
        state.currentPattern = getRandomPattern();
        state.patternTimer = 0;
        state.nextPatternTime = 30 + Math.random() * 60; // 30-90 seconds
      }
      
      let newX = x;
      let newY = y;
      let newZ = z;
      
      // Apply the current animation pattern
      switch(state.currentPattern) {
        case AnimationPattern.SPIRAL:
          // Spiral pattern with unique parameters
          newX = x * Math.cos(time * 0.004 * animParams.speed) - 
                 z * Math.sin(time * 0.004 * animParams.speed);
          newZ = z * Math.cos(time * 0.004 * animParams.speed) + 
                 x * Math.sin(time * 0.004 * animParams.speed);
          newY = y + Math.sin(time * 0.003 + x * 0.01) * animParams.amplitude * 0.4;
          break;
          
        case AnimationPattern.WAVE:
          // Wave pattern with unique frequency and amplitude
          newX = x + Math.sin(time * 0.5 * animParams.speed + animParams.phase) * animParams.amplitude * 0.3;
          newY = y + Math.cos(time * 0.3 * animParams.speed + animParams.phase + x * 0.01) * animParams.amplitude * 0.6;
          newZ = z + Math.sin(time * 0.7 * animParams.speed + animParams.phase + y * 0.01) * animParams.amplitude * 0.4;
          break;
          
        case AnimationPattern.ORBITAL:
          // Orbital pattern - particles orbit around their base position
          const orbitAngle = time * animParams.orbitSpeed;
          const orbitX = animParams.orbitRadius * Math.cos(orbitAngle + animParams.phase);
          const orbitY = animParams.orbitRadius * Math.sin(orbitAngle + animParams.phase) * 0.5;
          const orbitZ = animParams.orbitRadius * Math.sin(orbitAngle * 0.7 + animParams.phase);
          
          newX = x + orbitX;
          newY = y + orbitY;
          newZ = z + orbitZ;
          break;
          
        case AnimationPattern.PULSE:
          // Pulse pattern - particles move in and out from their base position
          const pulse = Math.sin(time * animParams.pulseFrequency + animParams.phase);
          const pulseStrength = 0.3 + 0.7 * Math.abs(pulse);
          const direction = new THREE.Vector3(
            animParams.directionX,
            animParams.directionY,
            animParams.directionZ
          ).normalize();
          
          newX = x + direction.x * pulse * animParams.amplitude * 5;
          newY = y + direction.y * pulse * animParams.amplitude * 5;
          newZ = z + direction.z * pulse * animParams.amplitude * 5;
          
          // Adjust size based on pulse
          if (particleScalesRef.current) {
            particleScalesRef.current[index] = 0.5 + 0.5 * pulseStrength;
          }
          break;
          
        case AnimationPattern.CONVERGENCE:
          // Convergence pattern - particles slowly move toward a shared point
          const target = animParams.convergenceTarget;
          const moveSpeed = 0.0001;
          
          // Move slightly toward convergence target
          newX = x + (target.x - x) * moveSpeed;
          newY = y + (target.y - y) * moveSpeed;
          newZ = z + (target.z - z) * moveSpeed;
          
          // Add small wave motion
          newX += Math.sin(time * 0.2 + animParams.phase) * 0.1;
          newY += Math.cos(time * 0.3 + animParams.phase) * 0.1;
          newZ += Math.sin(time * 0.25 + animParams.phase) * 0.1;
          break;
          
        default:
          // Default movement as fallback
          newX = x + animParams.directionX * animParams.speed;
          newY = y + animParams.directionY * animParams.speed;
          newZ = z + animParams.directionZ * animParams.speed;
      }
      
      // Add subtle individual drift regardless of pattern
      newX += animParams.directionX * animParams.speed * 0.2;
      newY += animParams.directionY * animParams.speed * 0.2;
      newZ += animParams.directionZ * animParams.speed * 0.2;
      
      return { x: newX, y: newY, z: newZ };
    };

    // Animation
    const animate = () => {
      frameId.current = requestAnimationFrame(animate);
      
      // Update global animation timer - used for cycling patterns
      globalAnimationTimer.current += 0.016; // ~60fps -> ~16ms per frame

      if (particlesRef.current && particleScalesRef.current && particleStatesRef.current && 
          initialPositionsRef.current && targetPositionsRef.current && 
          lastPositionsRef.current && particleAnimParamsRef.current) {
        
        // Very slow global rotation for subtle group movement
        particlesRef.current.rotation.x += 0.00001; 
        particlesRef.current.rotation.y += 0.000005; 

        const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
        const sizes = particlesRef.current.geometry.attributes.size.array as Float32Array;
        const time = Date.now() * 0.00002; // Even slower time factor
        
        // Handle initial expansion animation
        if (expansionStateRef.current.active) {
          expansionStateRef.current.progress += 0.002; // Very slow expansion over ~8-10 seconds
          
          if (expansionStateRef.current.progress >= 1) {
            expansionStateRef.current.progress = 1;
            expansionStateRef.current.active = false;
          }
          
          // Apply easing to make the expansion more natural
          const easedProgress = easeOutCubic(expansionStateRef.current.progress);
          
          // Interpolate between initial and target positions
          for (let i = 0, i3 = 0; i < particleCount; i++, i3 += 3) {
            positions[i3] = initialPositionsRef.current[i3] + (targetPositionsRef.current[i3] - initialPositionsRef.current[i3]) * easedProgress;
            positions[i3 + 1] = initialPositionsRef.current[i3 + 1] + (targetPositionsRef.current[i3 + 1] - initialPositionsRef.current[i3 + 1]) * easedProgress;
            positions[i3 + 2] = initialPositionsRef.current[i3 + 2] + (targetPositionsRef.current[i3 + 2] - initialPositionsRef.current[i3 + 2]) * easedProgress;
            
            // Store valid positions
            lastPositionsRef.current[i3] = positions[i3];
            lastPositionsRef.current[i3 + 1] = positions[i3 + 1];
            lastPositionsRef.current[i3 + 2] = positions[i3 + 2];
          }
        }
        
        // Update each particle individually
        for (let i = 0, i3 = 0; i < particleScalesRef.current.length; i++, i3 += 3) {
          const x = positions[i3];
          const y = positions[i3 + 1];
          const z = positions[i3 + 2];
          
          // Get this particle's animation parameters
          const animParams = particleAnimParamsRef.current[i];
          const state = particleStatesRef.current[i];
          
          // Update particle scale for boom effect
          if (state.expanding) {
            particleScalesRef.current[i] += state.speed;
            
            // Reset after reaching max scale
            if (particleScalesRef.current[i] > 2.5) { // Reduced max size
              particleScalesRef.current[i] = 1.0;
              state.expanding = false;
            }
          }
          
          // Apply scale to size
          sizes[i] = (0.5 + Math.random() * Math.random() * 1.5) * particleScalesRef.current[i];

          // Only apply individual movement if the initial expansion is complete
          if (!expansionStateRef.current.active) {
            // Animate according to current pattern
            const newPos = animateParticle(i, x, y, z, time, animParams, state);
            
            // Keep record of last valid position before applying
            lastPositionsRef.current[i3] = positions[i3];
            lastPositionsRef.current[i3 + 1] = positions[i3 + 1];
            lastPositionsRef.current[i3 + 2] = positions[i3 + 2];
            
            // Apply movement and wave with boundary check
            positions[i3] = keepInBounds(newPos.x, viewBoundary, hardBoundary, animParams.containmentFactor);
            positions[i3 + 1] = keepInBounds(newPos.y, viewBoundary, hardBoundary, animParams.containmentFactor);
            positions[i3 + 2] = keepInBounds(newPos.z, viewBoundary, hardBoundary, animParams.containmentFactor);
            
            // Extra safety check - if somehow still outside hard boundary, reset to last valid position
            if (isOutOfBounds(positions[i3], positions[i3 + 1], positions[i3 + 2], hardBoundary * 1.5)) {
              positions[i3] = lastPositionsRef.current[i3];
              positions[i3 + 1] = lastPositionsRef.current[i3 + 1];
              positions[i3 + 2] = lastPositionsRef.current[i3 + 2];
            }
          }
        }

        particlesRef.current.geometry.attributes.position.needsUpdate = true;
        particlesRef.current.geometry.attributes.size.needsUpdate = true;

        // Very subtle mouse interaction for almost imperceptible responsiveness
        if (mousePosition.current) {
          particlesRef.current.rotation.x += mousePosition.current.y * 0.00001;
          particlesRef.current.rotation.y += mousePosition.current.x * 0.00001;
        }
        
        // Random booms - only after initial expansion
        if (!expansionStateRef.current.active) {
          randomBoom();
        }
      }

      renderer.render(scene, camera);
    };

    // Start animation
    animate();

    // Event listeners
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleClick);
    window.addEventListener('resize', handleResize);

    // Resize handler
    function handleResize() {
      if (!cameraRef.current || !rendererRef.current) return;
      
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(width, height);
    }

    // Cleanup
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameId.current);
      
      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
        background: 'linear-gradient(to bottom right, #000022, #111133)',
      }}
    />
  );
};

export default Background3D; 