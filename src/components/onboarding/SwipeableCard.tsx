import { useState } from "react";
import { motion, PanInfo, useMotionValue, useTransform } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Heart, X, Star } from "lucide-react";

interface SwipeableCardProps {
  children: React.ReactNode;
  onSwipe: (direction: "left" | "right" | "up") => void;
  disabled?: boolean;
}

export function SwipeableCard({ children, onSwipe, disabled = false }: SwipeableCardProps) {
  const [exitX, setExitX] = useState(0);
  const [exitY, setExitY] = useState(0);
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const rotate = useTransform(x, [-200, 0, 200], [-25, 0, 25]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.5, 1, 1, 1, 0.5]);

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (disabled) return;

    const threshold = 100;
    const yThreshold = -150;
    
    if (info.offset.y < yThreshold) {
      // Swipe up - Must do
      setExitY(-500);
      onSwipe("up");
    } else if (info.offset.x > threshold) {
      // Swipe right - Like
      setExitX(500);
      onSwipe("right");
    } else if (info.offset.x < -threshold) {
      // Swipe left - Skip
      setExitX(-500);
      onSwipe("left");
    }
  };

  return (
    <motion.div
      style={{ x, y, rotate, opacity }}
      drag={!disabled}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={1}
      onDragEnd={handleDragEnd}
      animate={{ x: exitX, y: exitY }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="absolute w-full touch-none"
    >
      <Card className="relative p-6 cursor-grab active:cursor-grabbing shadow-xl hover:shadow-2xl transition-shadow">
        {children}
        
        {/* Swipe indicators */}
        <motion.div
          style={{ opacity: useTransform(x, [0, 100], [0, 1]) }}
          className="absolute top-4 right-4 p-2 bg-green-500 rounded-full"
        >
          <Heart className="w-6 h-6 text-white" />
        </motion.div>
        
        <motion.div
          style={{ opacity: useTransform(x, [-100, 0], [1, 0]) }}
          className="absolute top-4 left-4 p-2 bg-red-500 rounded-full"
        >
          <X className="w-6 h-6 text-white" />
        </motion.div>
        
        <motion.div
          style={{ opacity: useTransform(y, [-100, 0], [1, 0]) }}
          className="absolute top-4 left-1/2 -translate-x-1/2 p-2 bg-yellow-500 rounded-full"
        >
          <Star className="w-6 h-6 text-white" />
        </motion.div>
      </Card>
    </motion.div>
  );
}
