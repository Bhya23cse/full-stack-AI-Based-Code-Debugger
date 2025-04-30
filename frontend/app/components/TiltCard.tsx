'use client';

import { useRef, useEffect } from 'react';

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
}

const TiltCard = ({ children, className = '' }: TiltCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    let bounds: DOMRect;
    let mouseLeaveDelay: NodeJS.Timeout;

    const rotateElement = (e: MouseEvent) => {
      const mouseX = e.clientX;
      const mouseY = e.clientY;
      const leftX = mouseX - bounds.x;
      const topY = mouseY - bounds.y;
      const center = {
        x: leftX - bounds.width / 2,
        y: topY - bounds.height / 2
      };
      const distance = Math.sqrt(center.x ** 2 + center.y ** 2);

      card.style.transform = `
        scale3d(1.05, 1.05, 1.05)
        rotate3d(
          ${center.y / 150},
          ${-center.x / 150},
          0,
          ${Math.log(distance) * 1.5}deg
        )
      `;
      card.style.transition = 'transform 0.3s ease';
    };

    const handleMouseEnter = () => {
      bounds = card.getBoundingClientRect();
      document.addEventListener('mousemove', rotateElement);
    };

    const handleMouseLeave = () => {
      document.removeEventListener('mousemove', rotateElement);
      mouseLeaveDelay = setTimeout(() => {
        card.style.transform = '';
        card.style.transition = 'transform 0.7s ease';
      }, 150);
    };

    // Add event listeners
    card.addEventListener('mouseenter', handleMouseEnter);
    card.addEventListener('mouseleave', handleMouseLeave);

    // Cleanup
    return () => {
      card.removeEventListener('mouseenter', handleMouseEnter);
      card.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mousemove', rotateElement);
      if (mouseLeaveDelay) clearTimeout(mouseLeaveDelay);
    };
  }, []);

  return (
    <div ref={cardRef} className={`tilt-card ${className}`}>
      {children}
    </div>
  );
};

export default TiltCard; 