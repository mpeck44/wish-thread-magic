import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";

interface MagicalLoaderProps {
  message?: string;
  submessage?: string;
  className?: string;
}

export function MagicalLoader({ message = "Creating magic...", submessage, className }: MagicalLoaderProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-6 py-16", className)}>
      <div className="relative">
        {/* Outer glow ring */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary via-accent to-secondary opacity-30 blur-xl animate-glow-pulse scale-150" />
        
        {/* Spinning stars */}
        <div className="relative w-20 h-20 animate-spin-slow">
          <Sparkles className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 w-5 h-5 text-accent animate-sparkle" />
          <Sparkles className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1 w-4 h-4 text-primary animate-sparkle [animation-delay:0.5s]" />
          <Sparkles className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-4 h-4 text-secondary animate-sparkle [animation-delay:1s]" />
          <Sparkles className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 w-5 h-5 text-accent animate-sparkle [animation-delay:1.5s]" />
        </div>
        
        {/* Center icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Sparkles className="w-8 h-8 text-primary animate-pulse-glow" />
        </div>
      </div>
      
      <div className="text-center space-y-2">
        <h3 className="text-xl font-heading font-semibold text-gradient-magic">{message}</h3>
        {submessage && (
          <p className="text-muted-foreground text-sm">{submessage}</p>
        )}
      </div>
    </div>
  );
}
