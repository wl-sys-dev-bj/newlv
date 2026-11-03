import React, { useEffect, useState } from 'react';

interface Petal {
  id: number;
  left: number;
  delay: number;
  duration: number;
  size: number;
  rotation: number;
}

export const FloralFloatingPetals: React.FC<{ enabled?: boolean }> = ({ enabled = true }) => {
  const [petals, setPetals] = useState<Petal[]>([]);

  useEffect(() => {
    if (!enabled) {
      setPetals([]);
      return;
    }

    // Generate ~14 gentle random petals
    const newPetals: Petal[] = Array.from({ length: 14 }).map((_, i) => ({
      id: i,
      left: Math.random() * 96 + 2, // 2% to 98%
      delay: Math.random() * 8,
      duration: 12 + Math.random() * 10, // 12-22s slow romantic drift
      size: 14 + Math.random() * 16,
      rotation: Math.random() * 360,
    }));

    setPetals(newPetals);
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-10">
      {petals.map((petal) => (
        <div
          key={petal.id}
          className="absolute -top-8 animate-petal opacity-60 transition-opacity"
          style={{
            left: `${petal.left}%`,
            animationDelay: `${petal.delay}s`,
            animationDuration: `${petal.duration}s`,
          }}
        >
          {/* SVG Rose Petal */}
          <svg
            width={petal.size}
            height={petal.size * 1.3}
            viewBox="0 0 30 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ transform: `rotate(${petal.rotation}deg)` }}
          >
            <path
              d="M15 2C8 2 2 10 2 20C2 31 10 38 15 38C20 38 28 31 28 20C28 10 22 2 15 2Z"
              fill="url(#petalGradient)"
              opacity="0.85"
            />
            <path
              d="M15 6C11 12 11 28 15 34"
              stroke="#F43F5E"
              strokeWidth="0.8"
              strokeOpacity="0.3"
            />
            <defs>
              <linearGradient id="petalGradient" x1="0" y1="0" x2="30" y2="40" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FDA4AF" />
                <stop offset="0.6" stopColor="#FB7185" />
                <stop offset="1" stopColor="#F43F5E" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      ))}
    </div>
  );
};

export const FloralCornerFlourish: React.FC<{ position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' }> = ({
  position,
}) => {
  const getTransform = () => {
    switch (position) {
      case 'top-left':
        return 'top-0 left-0';
      case 'top-right':
        return 'top-0 right-0 scale-x-[-1]';
      case 'bottom-left':
        return 'bottom-0 left-0 scale-y-[-1]';
      case 'bottom-right':
        return 'bottom-0 right-0 scale-[-1]';
    }
  };

  return (
    <div className={`pointer-events-none absolute ${getTransform()} opacity-25 p-4 z-0`}>
      <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M5 5C45 5 80 40 85 85C87 105 85 115 85 115"
          stroke="#9F1239"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M5 25C35 25 65 55 70 95"
          stroke="#BE123C"
          strokeWidth="1"
          strokeDasharray="2 3"
        />
        <circle cx="85" cy="85" r="4" fill="#E11D48" />
        <circle cx="65" cy="55" r="3" fill="#FDA4AF" />
        <circle cx="35" cy="25" r="2.5" fill="#E11D48" />
        {/* Rose bud motif */}
        <path
          d="M85 80C88 77 92 78 94 81C96 84 94 88 90 89C86 90 83 87 83 84C83 82 84 80 85 80Z"
          fill="#BE123C"
        />
      </svg>
    </div>
  );
};

export const FloralDivider: React.FC<{ label?: string }> = ({ label }) => {
  return (
    <div className="flex items-center justify-center gap-4 my-8 text-rose-900/40 select-none">
      <div className="h-[1px] w-16 md:w-28 bg-gradient-to-r from-transparent via-rose-300 to-rose-400" />
      <div className="flex items-center gap-2 text-xs font-serif italic text-rose-950/70 tracking-widest uppercase">
        <span>❦</span>
        {label && <span className="font-normal font-sans text-xs tracking-wider normal-case text-rose-900/80">{label}</span>}
        <span>❧</span>
      </div>
      <div className="h-[1px] w-16 md:w-28 bg-gradient-to-l from-transparent via-rose-300 to-rose-400" />
    </div>
  );
};
