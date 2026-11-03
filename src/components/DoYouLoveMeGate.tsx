import React, { useState, useRef, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Heart, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { romanticAudio } from '../utils/audio';

interface DoYouLoveMeGateProps {
  onUnlock: () => void;
  onGoToAnniversary: () => void;
}

const PLAYFUL_NO_PHRASES = [
  "No",
  "Are you sure? 🥺",
  "Nice try, Ambika! 🌸",
  "Oops, missed me!",
  "Error: 'No' is forbidden ❤️",
  "Try again! 🙈",
  "You know you love me 😉",
  "Can't click this! 🏃‍♀️💨",
  "My heart says Yes!",
  "Still not letting you click No!",
];

export const DoYouLoveMeGate: React.FC<DoYouLoveMeGateProps> = ({
  onUnlock,
  onGoToAnniversary,
}) => {
  const [noIndex, setNoIndex] = useState(0);
  const [dodgeCount, setDodgeCount] = useState(0);
  const [noPosition, setNoPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [hasDodged, setHasDodged] = useState(false);
  const [isAccepted, setIsAccepted] = useState(false);
  const playgroundRef = useRef<HTMLDivElement>(null);

  // Trigger dodge when mouse enters or touch starts on 'No'
  const handleDodge = (e?: React.MouseEvent | React.TouchEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    romanticAudio.playSoftClick();

    // Determine safe playground bounds
    const box = playgroundRef.current?.getBoundingClientRect();
    const maxX = box ? Math.min(box.width / 2 - 80, 160) : 120;
    const maxY = box ? Math.min(box.height / 2 - 60, 110) : 90;

    // Pick random positions away from center
    const randomAngle = Math.random() * Math.PI * 2;
    const randomDistance = 70 + Math.random() * 80;
    const nextX = Math.cos(randomAngle) * Math.min(randomDistance, maxX);
    const nextY = Math.sin(randomAngle) * Math.min(randomDistance, maxY);

    setNoPosition({ x: nextX, y: nextY });
    setHasDodged(true);
    setDodgeCount((prev) => prev + 1);
    setNoIndex((prev) => (prev + 1) % PLAYFUL_NO_PHRASES.length);
  };

  const handleYes = () => {
    romanticAudio.playLoveYesChime();
    setIsAccepted(true);

    // Launch multi-stage romantic confetti
    const count = 200;
    const defaults = {
      origin: { y: 0.65 },
      colors: ['#E11D48', '#FB7185', '#FDA4AF', '#F43F5E', '#FDE047', '#FFE4E6'],
    };

    function fire(particleRatio: number, opts: confetti.Options) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
    });
    fire(0.2, {
      spread: 60,
    });
    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 45,
    });
  };

  // Grow 'Yes' button proportionally to dodges
  const yesScale = Math.min(1 + dodgeCount * 0.08, 1.45);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative z-20">
      {/* Background soft backdrop card */}
      <div className="w-full max-w-xl mx-auto bg-white/90 backdrop-blur-md border border-rose-100 rounded-3xl p-8 md:p-12 shadow-2xl shadow-rose-900/10 text-center relative overflow-hidden">
        {/* Subtle decorative botanical top ornament */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-rose-200 via-rose-500 to-amber-200" />
        
        {/* Ambika Rimal Branding */}
        <div className="mb-6">
          <span className="text-xs uppercase tracking-[0.25em] font-sans font-medium text-rose-900/70 block mb-1">
            Dedicated Sanctuary For
          </span>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-rose-950 tracking-wide">
            AMBIKA RIMAL
          </h1>
          <div className="w-16 h-0.5 bg-rose-300 mx-auto mt-2" />
        </div>

        {!isAccepted ? (
          <div>
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-500 shadow-inner">
              <Heart className="w-8 h-8 fill-rose-500 stroke-rose-600 animate-pulse" />
            </div>

            <h2 className="text-2xl md:text-3xl font-serif text-slate-800 mb-3">
              Do you love me?
            </h2>
            <p className="text-slate-600 text-sm max-w-md mx-auto mb-8 font-sans">
              A private question before entering our sanctuary of shared daily memories, polaroid moments, and promises.
            </p>

            {/* Interactive button playground area */}
            <div
              ref={playgroundRef}
              className="relative min-h-[170px] flex items-center justify-center gap-6"
            >
              {/* YES BUTTON */}
              <button
                type="button"
                onClick={handleYes}
                style={{ transform: `scale(${yesScale})` }}
                className="transition-all duration-200 ease-out px-7 py-3.5 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-medium rounded-full shadow-lg shadow-rose-600/30 flex items-center gap-2 cursor-pointer z-20 group"
              >
                <Heart className="w-4 h-4 fill-white text-white group-hover:scale-125 transition-transform" />
                <span>Yes, with all my heart ❤️</span>
              </button>

              {/* NO BUTTON (Dodging Button) */}
              <div
                className="transition-transform duration-200 ease-out z-10"
                style={{
                  transform: hasDodged
                    ? `translate(${noPosition.x}px, ${noPosition.y}px)`
                    : 'none',
                }}
              >
                <button
                  type="button"
                  onMouseEnter={() => handleDodge()}
                  onTouchStart={(e) => handleDodge(e)}
                  onClick={(e) => handleDodge(e)}
                  className="px-5 py-3 text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-full text-xs font-medium cursor-not-allowed select-none transition-colors whitespace-nowrap shadow-sm"
                >
                  {PLAYFUL_NO_PHRASES[noIndex]}
                </button>
              </div>
            </div>

            {dodgeCount > 0 && (
              <p className="text-xs text-rose-700/80 italic mt-4 animate-fade-in">
                {dodgeCount > 3
                  ? "Resistance is futile, my love! Click 'Yes' already! 💕"
                  : "You didn't really think 'No' was an option, did you? 😊"}
              </p>
            )}
          </div>
        ) : (
          /* REVEALED CELEBRATION VIEW */
          <div className="py-4 animate-in fade-in zoom-in-95 duration-500">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-rose-100 border-2 border-rose-300 flex items-center justify-center text-rose-600 shadow-md">
              <Sparkles className="w-10 h-10 animate-spin text-rose-600" style={{ animationDuration: '6s' }} />
            </div>

            <span className="text-xs font-medium text-rose-800 tracking-wider uppercase block mb-1">
              Sanctuary Unlocked
            </span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-rose-950 mb-3">
              I Knew You Loved Me, Ambika!
            </h2>
            <p className="text-slate-700 text-sm md:text-base leading-relaxed max-w-lg mx-auto mb-8 font-sans">
              Your "Yes" is forever etched in this sanctuary. Here unfolds our live anniversary countdown, custom love messages, and our daily shared journal.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={onGoToAnniversary}
                className="w-full sm:w-auto px-6 py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-xl shadow-md shadow-rose-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>View Anniversary & Surprise</span>
                <Sparkles className="w-4 h-4 text-rose-200" />
              </button>

              <button
                type="button"
                onClick={onUnlock}
                className="w-full sm:w-auto px-6 py-3.5 bg-rose-50 hover:bg-rose-100 text-rose-900 border border-rose-200 font-medium rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Enter Daily Journal</span>
                <ArrowRight className="w-4 h-4 text-rose-700" />
              </button>
            </div>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-rose-100 flex items-center justify-center gap-2 text-xs text-rose-900/60 font-serif italic">
          <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
          <span>A private eternal love archive exclusively for Ambika Rimal</span>
        </div>
      </div>
    </div>
  );
};
