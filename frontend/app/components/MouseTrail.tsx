'use client';

import { useEffect, useRef } from 'react';

const MouseTrail = () => {
  const dotRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dot = dotRef.current;
    const trail = trailRef.current;
    
    if (!dot || !trail) return;

    let mouseX = 0;
    let mouseY = 0;
    let dotX = 0;
    let dotY = 0;
    let trailX = 0;
    let trailY = 0;

    const animate = () => {
      // Smooth follow for dot (not too slow)
      dotX += (mouseX - dotX) * 0.3;
      dotY += (mouseY - dotY) * 0.3;
      
      // Delayed follow for trail (not too slow)
      trailX += (mouseX - trailX) * 0.15;
      trailY += (mouseY - trailY) * 0.15;

      dot.style.transform = `translate(${dotX}px, ${dotY}px)`;
      trail.style.transform = `translate(${trailX}px, ${trailY}px)`;

      requestAnimationFrame(animate);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const handleMouseEnter = () => {
      dot.style.opacity = '1';
      trail.style.opacity = '1';
    };

    // Keep elements visible
    const handleMouseLeave = () => {
      // Elements remain visible when mouse leaves
    };

    // Add event listeners
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('mouseleave', handleMouseLeave);

    // Start animation
    animate();

    // Cleanup
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <>
      <div 
        ref={dotRef} 
        className="cursor-dot" 
        style={{ opacity: 1 }} 
      />
      <div 
        ref={trailRef} 
        className="cursor-trail" 
        style={{ opacity: 0.8 }} 
      />
    </>
  );
};

export default MouseTrail; 