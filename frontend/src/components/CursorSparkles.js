import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

const CursorSparkles = () => {
  const [sparkles, setSparkles] = useState([]);
  const lastPositions = useRef([]);
  const maxSparkles = 8;
  const sparkleLifetime = 1500; // ms

  useEffect(() => {
    const handleMouseMove = (e) => {
      const { clientX, clientY } = e;
      
      // Add new sparkle at current position
      const newSparkle = {
        id: Date.now() + Math.random(),
        x: clientX,
        y: clientY,
        size: Math.random() * 6 + 4, // 4-10px
        color: Math.random() > 0.5 ? 'cyan' : 'magenta',
        opacity: 1,
        scale: 0,
      };

      setSparkles(prev => {
        // Remove old sparkles
        const filtered = prev.filter(s => Date.now() - s.id < sparkleLifetime);
        
        // Add new sparkle if we have room
        if (filtered.length < maxSparkles) {
          return [...filtered, newSparkle];
        }
        
        return filtered;
      });

      // Store positions for trail effect
      lastPositions.current = [clientX, clientY, ...lastPositions.current].slice(0, 4);
    };

    const cleanup = () => {
      const interval = setInterval(() => {
        setSparkles(prev => prev.filter(s => Date.now() - s.id < sparkleLifetime));
      }, 100);

      return () => {
        clearInterval(interval);
      };
    };

    window.addEventListener('mousemove', handleMouseMove);
    const cleanupInterval = cleanup();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cleanupInterval();
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-[1]">
      {sparkles.map((sparkle) => (
        <motion.div
          key={sparkle.id}
          className="absolute rounded-full"
          style={{
            left: sparkle.x - sparkle.size / 2,
            top: sparkle.y - sparkle.size / 2,
            width: sparkle.size,
            height: sparkle.size,
          }}
          initial={{
            opacity: 0,
            scale: 0,
          }}
          animate={{
            opacity: [0, sparkle.opacity, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: sparkleLifetime / 1000,
            ease: "easeOut",
          }}
        >
          <div 
            className={`w-full h-full rounded-full ${
              sparkle.color === 'cyan' 
                ? 'bg-gradient-to-r from-cyan-400 to-blue-500' 
                : 'bg-gradient-to-r from-pink-400 to-purple-500'
            }`}
            style={{
              boxShadow: `0 0 ${sparkle.size}px ${
                sparkle.color === 'cyan' 
                  ? 'rgba(34, 211, 238, 0.6)' 
                  : 'rgba(236, 72, 153, 0.6)'
              }`,
            }}
          />
        </motion.div>
      ))}
    </div>
  );
};

export default CursorSparkles;
