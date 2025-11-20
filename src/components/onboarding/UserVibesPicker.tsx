import { Badge } from "@/components/ui/badge";

const VIBE_OPTIONS = [
  "Thrill Rides",
  "Character Meet & Greets",
  "Shows & Parades",
  "Princesses",
  "Star Wars",
  "Marvel",
  "Pixar",
  "Classic Disney",
  "Dining Experiences",
  "Shopping",
  "Photography",
  "Relaxing Pace"
];

interface UserVibesPickerProps {
  value: string[];
  onChange: (vibes: string[]) => void;
}

export function UserVibesPicker({ value, onChange }: UserVibesPickerProps) {
  const toggleVibe = (vibe: string) => {
    if (value.includes(vibe)) {
      onChange(value.filter(v => v !== vibe));
    } else {
      onChange([...value, vibe]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {VIBE_OPTIONS.map((vibe) => {
        const isSelected = value.includes(vibe);
        return (
          <Badge
            key={vibe}
            variant={isSelected ? "default" : "outline"}
            className="cursor-pointer hover:scale-105 transition-transform px-4 py-2 text-sm"
            onClick={() => toggleVibe(vibe)}
          >
            {vibe}
          </Badge>
        );
      })}
    </div>
  );
}
