import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../../lib/utils';

export const CursorGlow = ({
  children,
  className,
  color = 'indigo',
  borderWidth = '2px',
  borderRadius = '16px',
  glowSize = '300px', // Increased glow size
  glowIntensity = '1', // Full intensity by default
  ...props
}) => {
  // State for tracking mouse position
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const ref = useRef(null);

  // Track mouse position for interactive glow
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      setPosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    };

    const element = ref.current;
    if (element) {
      element.addEventListener('mousemove', handleMouseMove);
      return () => element.removeEventListener('mousemove', handleMouseMove);
    }
  }, []);

  // Define colors with high opacities for stronger visibility
  const colors = {
    indigo: {
      light: 'rgba(79, 70, 229, 1.0)', // Full opacity
      dark: 'rgba(129, 120, 255, 1.0)',
      shadow: 'rgba(79, 70, 229, 0.8)' // More visible shadow
    },
    purple: {
      light: 'rgba(147, 51, 234, 1.0)',
      dark: 'rgba(192, 132, 252, 1.0)',
      shadow: 'rgba(147, 51, 234, 0.8)'
    },
    blue: {
      light: 'rgba(59, 130, 246, 1.0)',
      dark: 'rgba(96, 165, 250, 1.0)',
      shadow: 'rgba(59, 130, 246, 0.8)'
    },
    cyan: {
      light: 'rgba(34, 211, 238, 1.0)',
      dark: 'rgba(103, 232, 249, 1.0)',
      shadow: 'rgba(34, 211, 238, 0.8)'
    },
    pink: {
      light: 'rgba(236, 72, 153, 1.0)',
      dark: 'rgba(249, 168, 212, 1.0)',
      shadow: 'rgba(236, 72, 153, 0.8)'
    }
  };

  // Get the appropriate color values
  const colorObj = colors[color] || colors.indigo;

  // Stronger box shadow for light and dark modes with multiple layers
  const boxShadowLight = `0 0 0 ${borderWidth} ${colorObj.light}, 0 0 15px ${colorObj.shadow}, 0 0 25px ${colorObj.shadow}`;
  const boxShadowDark = `0 0 0 ${borderWidth} ${colorObj.dark}, 0 0 20px ${colorObj.shadow}, 0 0 35px ${colorObj.shadow}`;

  return (
    <div
      ref={ref}
      className={cn(
        'relative cursor-pointer',
        className
      )}
      {...props}
    >
      {/* Always-active strong glowing border */}
      <div
        className="absolute inset-0 pointer-events-none rounded-[inherit] z-[1]"
        style={{
          borderRadius,
          border: `${borderWidth} solid ${colorObj.light}`,
          boxShadow: `0 0 15px ${colorObj.shadow}, 0 0 25px ${colorObj.shadow}`,
          opacity: 1, // Always fully visible
          transition: 'box-shadow 0.3s ease',
        }}
      />

      {/* Interactive glow effect that follows cursor */}
      <div 
        className="absolute inset-0 pointer-events-none rounded-[inherit] overflow-hidden z-[0]"
        style={{
          borderRadius,
        }}
      >
        <div
          className="absolute pointer-events-none z-[0] transform -translate-x-1/2 -translate-y-1/2 opacity-100 transition-opacity"
          style={{
            width: glowSize,
            height: glowSize,
            background: `radial-gradient(circle, ${colorObj.light} 0%, transparent 70%)`,
            left: position.x,
            top: position.y,
            opacity: glowIntensity,
            filter: 'blur(8px)',
          }}
        />
      </div>
      
      {/* Dark mode specific enhanced glow */}
      <div
        className="absolute inset-0 pointer-events-none rounded-[inherit] z-[0] dark:opacity-100 opacity-0"
        style={{
          borderRadius,
          border: `${borderWidth} solid ${colorObj.dark}`,
          boxShadow: boxShadowDark,
        }}
      />

      {/* Child Content */}
      <div className="relative z-10 h-full rounded-[inherit]">{children}</div>
    </div>
  );
};

export default CursorGlow;
