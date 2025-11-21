import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface InterestCardProps {
  icon: LucideIcon;
  label: string;
  description?: string;
  selected?: boolean;
  priority?: "none" | "like" | "must";
  onClick?: () => void;
  className?: string;
}

export function InterestCard({
  icon: Icon,
  label,
  description,
  selected = false,
  priority = "none",
  onClick,
  className,
}: InterestCardProps) {
  return (
    <Card
      onClick={onClick}
      className={cn(
        "p-6 cursor-pointer transition-all duration-300 hover:scale-105",
        "flex flex-col items-center text-center gap-3 min-h-[180px] justify-center",
        selected && priority === "like" && "bg-primary/10 border-primary shadow-lg",
        selected && priority === "must" && "bg-yellow-500/20 border-yellow-500 shadow-lg shadow-yellow-500/20",
        !selected && "hover:bg-accent",
        className
      )}
    >
      <div
        className={cn(
          "p-4 rounded-full transition-colors",
          selected && priority === "like" && "bg-primary text-primary-foreground",
          selected && priority === "must" && "bg-yellow-500 text-white",
          !selected && "bg-muted"
        )}
      >
        <Icon className="w-8 h-8" />
      </div>
      
      <div>
        <h3 className="font-semibold text-lg">{label}</h3>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      
      {selected && (
        <div className="text-xs font-medium">
          {priority === "must" ? "⭐ Must Do" : "❤️ Love It"}
        </div>
      )}
    </Card>
  );
}
