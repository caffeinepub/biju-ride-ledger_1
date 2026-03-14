import { AnimatePresence, motion } from "motion/react";
import { useEffect } from "react";
import { useSound } from "../utils/useSound";

interface TargetCelebrationProps {
  onClose: () => void;
}

const STAR_PARTICLES = [
  { id: "s1", left: 8, top: 12, emoji: "⭐", delay: 0 },
  { id: "s2", left: 22, top: 5, emoji: "🌟", delay: 0.12 },
  { id: "s3", left: 35, top: 18, emoji: "✨", delay: 0.24 },
  { id: "s4", left: 50, top: 8, emoji: "🎉", delay: 0.36 },
  { id: "s5", left: 65, top: 15, emoji: "⭐", delay: 0.48 },
  { id: "s6", left: 78, top: 6, emoji: "🌟", delay: 0.6 },
  { id: "s7", left: 90, top: 20, emoji: "✨", delay: 0.72 },
  { id: "s8", left: 15, top: 75, emoji: "🎉", delay: 0.84 },
  { id: "s9", left: 28, top: 85, emoji: "⭐", delay: 0.96 },
  { id: "s10", left: 45, top: 78, emoji: "🌟", delay: 1.08 },
  { id: "s11", left: 60, top: 88, emoji: "✨", delay: 1.2 },
  { id: "s12", left: 75, top: 80, emoji: "🎉", delay: 1.32 },
  { id: "s13", left: 88, top: 72, emoji: "⭐", delay: 1.44 },
  { id: "s14", left: 5, top: 45, emoji: "🌟", delay: 1.56 },
  { id: "s15", left: 92, top: 50, emoji: "✨", delay: 1.68 },
  { id: "s16", left: 50, top: 45, emoji: "🎉", delay: 1.8 },
];

export default function TargetCelebration({ onClose }: TargetCelebrationProps) {
  const { playCelebration } = useSound();

  useEffect(() => {
    playCelebration();
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [playCelebration, onClose]);

  return (
    <AnimatePresence>
      <motion.div
        data-ocid="celebration.modal"
        className="fixed inset-0 z-50 flex flex-col items-center justify-center cursor-pointer"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.35 0.21 264 / 0.97), oklch(0.55 0.22 47 / 0.97))",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        {/* Stars burst */}
        <div
          className="absolute inset-0 overflow-hidden pointer-events-none"
          aria-hidden="true"
        >
          {STAR_PARTICLES.map((p) => (
            <motion.div
              key={p.id}
              className="absolute text-2xl"
              style={{ left: `${p.left}%`, top: `${p.top}%` }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1.5, 0],
                y: [-20, -60],
              }}
              transition={{
                duration: 1.5,
                delay: p.delay,
                ease: "easeOut",
              }}
            >
              {p.emoji}
            </motion.div>
          ))}
        </div>

        {/* Main content */}
        <motion.div
          className="text-center px-8 relative z-10"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 20,
            delay: 0.1,
          }}
        >
          <motion.div
            className="text-8xl mb-4"
            animate={{ rotate: [0, -10, 10, -10, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 0.6, delay: 0.3, repeat: 2 }}
          >
            🏆
          </motion.div>

          <motion.h1
            className="text-3xl font-bold text-white mb-3 leading-tight"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Daily Target
            <br />
            Achieved! 🎉
          </motion.h1>

          <motion.p
            className="text-white/80 text-base"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            Great work today, keep it up!
          </motion.p>

          <motion.button
            data-ocid="celebration.close_button"
            type="button"
            className="mt-8 px-6 py-3 rounded-full bg-white/20 text-white text-sm font-semibold backdrop-blur-sm border border-white/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            onClick={onClose}
          >
            Tap anywhere to close
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
