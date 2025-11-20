import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Plus, X } from "lucide-react";

interface FamilyMember {
  name: string;
  age: number | null;
  vibes: string[];
}

interface FamilyMemberBuilderProps {
  members: FamilyMember[];
  onChange: (members: FamilyMember[]) => void;
}

const VIBE_OPTIONS = [
  "Thrill Rides",
  "Princesses",
  "Star Wars",
  "Marvel",
  "Relaxed Pace",
  "Food Explorer",
  "Photo Hunter",
  "Character Meets",
];

export function FamilyMemberBuilder({ members, onChange }: FamilyMemberBuilderProps) {
  const [newMember, setNewMember] = useState<FamilyMember>({
    name: "",
    age: null,
    vibes: [],
  });

  const addMember = () => {
    if (newMember.name.trim()) {
      onChange([...members, newMember]);
      setNewMember({ name: "", age: null, vibes: [] });
    }
  };

  const removeMember = (index: number) => {
    onChange(members.filter((_, i) => i !== index));
  };

  const toggleVibe = (vibe: string) => {
    setNewMember({
      ...newMember,
      vibes: newMember.vibes.includes(vibe)
        ? newMember.vibes.filter((v) => v !== vibe)
        : [...newMember.vibes, vibe],
    });
  };

  return (
    <div className="space-y-4">
      {members.length > 0 && (
        <div className="space-y-3">
          {members.map((member, index) => (
            <Card key={index} className="p-4 flex items-center justify-between">
              <div>
                <div className="font-medium">{member.name}</div>
                {member.age && <div className="text-sm text-muted-foreground">Age {member.age}</div>}
                {member.vibes.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {member.vibes.map((vibe) => (
                      <Badge key={vibe} variant="secondary" className="text-xs">
                        {vibe}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeMember(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </Card>
          ))}
        </div>
      )}

      <Card className="p-6 space-y-4 bg-muted/30">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="text-sm font-medium">Name</label>
            <Input
              value={newMember.name}
              onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
              placeholder="e.g., Sarah"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Age</label>
            <Input
              type="number"
              value={newMember.age || ""}
              onChange={(e) =>
                setNewMember({ ...newMember, age: parseInt(e.target.value) || null })
              }
              placeholder="e.g., 8"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Interests (optional)</label>
          <div className="flex flex-wrap gap-2">
            {VIBE_OPTIONS.map((vibe) => (
              <Badge
                key={vibe}
                variant={newMember.vibes.includes(vibe) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => toggleVibe(vibe)}
              >
                {vibe}
              </Badge>
            ))}
          </div>
        </div>

        <Button
          onClick={addMember}
          disabled={!newMember.name.trim()}
          variant="outline"
          className="w-full"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Family Member
        </Button>
      </Card>

      {members.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">
          You can add family members or skip this step
        </p>
      )}
    </div>
  );
}
