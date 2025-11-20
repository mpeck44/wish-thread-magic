import { Button } from "@/components/ui/button";

const ROLES = [
  { value: "mom", label: "Mom", emoji: "👩" },
  { value: "dad", label: "Dad", emoji: "👨" },
  { value: "grandparent", label: "Grandparent", emoji: "👵" },
  { value: "kid", label: "Kid", emoji: "🧒" },
  { value: "other", label: "Other", emoji: "✨" },
] as const;

interface FamilyRolePickerProps {
  value: "mom" | "dad" | "grandparent" | "kid" | "other";
  onChange: (role: "mom" | "dad" | "grandparent" | "kid" | "other") => void;
}

export function FamilyRolePicker({ value, onChange }: FamilyRolePickerProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {ROLES.map((role) => (
        <Button
          key={role.value}
          type="button"
          variant={value === role.value ? "default" : "outline"}
          onClick={() => onChange(role.value)}
          className="h-auto py-4 flex flex-col gap-2"
        >
          <span className="text-2xl">{role.emoji}</span>
          <span>{role.label}</span>
        </Button>
      ))}
    </div>
  );
}
