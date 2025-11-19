import { useState } from "react";
import { motion } from "framer-motion";

interface ThreadAnimationProps {
  onPull: () => void;
  isPulling: boolean;
}

export const ThreadAnimation = ({ onPull, isPulling }: ThreadAnimationProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="relative w-full h-64 flex items-center justify-center">
      <motion.div
        className="relative cursor-pointer"
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        onClick={onPull}
        animate={
          isPulling
            ? {
                y: -200,
                scale: 0,
                rotate: 360,
                opacity: 0,
              }
            : isHovered
            ? { scale: 1.1 }
            : { y: [0, -10, 0] }
        }
        transition={
          isPulling
            ? { duration: 1, ease: [0.68, -0.55, 0.265, 1.55] }
            : {
                y: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                scale: { duration: 0.2 },
              }
        }
      >
        {/* Glow effect */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: "var(--gradient-glow)",
            filter: "blur(40px)",
          }}
          animate={{ opacity: [0.6, 1, 0.6], scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Main thread */}
        <div className="relative w-16 h-40 flex flex-col items-center justify-center">
          <svg
            width="64"
            height="160"
            viewBox="0 0 64 160"
            className="drop-shadow-[0_0_30px_rgba(139,92,246,0.6)]"
          >
            {/* Thread strand */}
            <motion.path
              d="M32 10 Q32 80 32 150"
              stroke="url(#thread-gradient)"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              animate={{ pathLength: [0.8, 1, 0.8] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
            {/* Thread end glow */}
            <motion.circle
              cx="32"
              cy="150"
              r="6"
              fill="url(#thread-gradient)"
              animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            />
            <defs>
              <linearGradient id="thread-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="hsl(265, 75%, 65%)" />
                <stop offset="50%" stopColor="hsl(200, 80%, 70%)" />
                <stop offset="100%" stopColor="hsl(45, 90%, 75%)" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </motion.div>
    </div>
  );
};
