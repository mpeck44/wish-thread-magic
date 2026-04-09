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
        "p-6 cursor-pointer transition-all duration-300 hover:scale-[1.03]",
        "flex flex-col items-center text-center gap-3 min-h-[180px] justify-center",
        selected && priority === "like" && "bg-primary/5 border-primary shadow-glow-purple",
        selected && priority === "must" && "bg-[hsl(var(--gold)/0.08)] border-[hsl(var(--gold))] shadow-glow-gold",
        !selected && "hover:bg-muted/50",
        className
      )}
    >
      <div
        className={cn(
          "p-4 rounded-full transition-all duration-300",
          selected && priority === "like" && "bg-primary text-primary-foreground shadow-md",
          selected && priority === "must" && "bg-[hsl(var(--gold))] text-gold-foreground shadow-md",
          !selected && "bg-muted"
        )}
      >
        <Icon className="w-8 h-8" />
      </div>

      <div>
        <h3 className="font-heading font-semibold text-lg">{label}</h3>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>

      {selected && (
        <div className={cn(
          "text-xs font-medium px-3 py-1 rounded-full",
          priority === "must" ? "bg-[hsl(var(--gold)/0.15)] text-[hsl(var(--gold))]" : "bg-primary/10 text-primary"
        )}>
          {priority === "must" ? "⭐ Must Do" : "❤️ Love It"}
        </div>
      )}
    </Card>
  );
}
