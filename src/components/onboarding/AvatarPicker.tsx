import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const AVATAR_OPTIONS = [
  "adventurer",
  "avataaars",
  "big-smile",
  "bottts",
  "croodles",
  "fun-emoji",
  "lorelei",
  "micah",
  "miniavs",
  "open-peeps",
  "personas",
  "pixel-art",
];

interface AvatarPickerProps {
  value: string;
  onChange: (url: string) => void;
}

export function AvatarPicker({ value, onChange }: AvatarPickerProps) {
  return (
    <div className="grid grid-cols-4 sm:grid-cols-6 gap-4">
      {AVATAR_OPTIONS.map((style) => {
        const avatarUrl = `https://api.dicebear.com/7.x/${style}/svg?seed=${style}`;
        const isSelected = value === avatarUrl;

        return (
          <button
            key={style}
            type="button"
            onClick={() => onChange(avatarUrl)}
            className={`relative rounded-full transition-all ${
              isSelected
                ? "ring-4 ring-primary scale-110"
                : "hover:scale-105 opacity-70 hover:opacity-100"
            }`}
          >
            <Avatar className="w-16 h-16">
              <AvatarImage src={avatarUrl} alt={style} />
              <AvatarFallback>{style[0].toUpperCase()}</AvatarFallback>
            </Avatar>
          </button>
        );
      })}
    </div>
  );
}
