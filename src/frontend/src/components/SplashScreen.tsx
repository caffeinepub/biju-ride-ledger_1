import { motion } from "motion/react";
import { useEffect, useState } from "react";

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onComplete, 400);
    }, 2500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-brand"
      initial={{ opacity: 1 }}
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-10"
          style={{ background: "oklch(0.58 0.21 264)" }}
        />
        <div
          className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full opacity-10"
          style={{ background: "oklch(0.72 0.19 47)" }}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-6 px-8">
        {/* Logo: fade-in + scale spring animation — natural shape, no circular clip */}
        <motion.div
          initial={{ scale: 0.3, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.7, ease: [0.34, 1.56, 0.64, 1] }}
          className="relative flex items-center justify-center"
        >
          {/* Soft glow behind logo */}
          <motion.div
            className="absolute inset-0 blur-2xl opacity-40"
            style={{ background: "oklch(0.72 0.19 47 / 0.5)" }}
            animate={{ scale: [1, 1.12, 1] }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          />
          <img
            src="/assets/uploads/file_00000000154071faaeaf583d8d2945a9-1.png"
            alt="Biju's RideBook Logo"
            className="relative w-40 h-40 object-contain drop-shadow-2xl"
            style={{ borderRadius: 0, background: "transparent" }}
          />
        </motion.div>

        <motion.div
          className="flex flex-col items-center gap-2"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <h1 className="text-3xl font-bold font-display text-white tracking-tight">
            Biju's RideBook
          </h1>
          <p className="text-sm text-white/70 text-center">
            Smart Earnings Tracker for Ride Drivers
          </p>
        </motion.div>

        <motion.div
          className="flex gap-1.5 mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 1.0 }}
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-white/60"
              animate={{ scale: [1, 1.4, 1] }}
              transition={{
                duration: 0.8,
                repeat: Number.POSITIVE_INFINITY,
                delay: i * 0.2,
              }}
            />
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}
