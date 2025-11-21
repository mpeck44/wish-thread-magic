import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { X, Plus, Users, ArrowLeft, ArrowRight } from "lucide-react";
import { ALL_INTERESTS } from "@/data/interests";

export interface EnhancedFamilyMember {
  name: string;
  age?: number;
  vibes: string[];
  height?: number;
  energyLevel?: string;
  napNeeds?: boolean;
  dietaryRestrictions?: string[];
  mobilityNeeds?: string;
  specialInterests?: string[];
}

interface EnhancedFamilyBuilderProps {
  members: EnhancedFamilyMember[];
  onChange: (members: EnhancedFamilyMember[]) => void;
  onBack: () => void;
  onNext: () => void;
}

export function EnhancedFamilyBuilder({ members, onChange, onBack, onNext }: EnhancedFamilyBuilderProps) {
  const [newMember, setNewMember] = useState<EnhancedFamilyMember>({
    name: "",
    vibes: [],
    energyLevel: "medium",
  });
  const [showAdvanced, setShowAdvanced] = useState(false);

  const addMember = () => {
    if (newMember.name.trim()) {
      onChange([...members, { ...newMember }]);
      setNewMember({
        name: "",
        vibes: [],
        energyLevel: "medium",
      });
      setShowAdvanced(false);
    }
  };

  const removeMember = (index: number) => {
    onChange(members.filter((_, i) => i !== index));
  };

  const DIETARY_OPTIONS = ["Vegetarian", "Vegan", "Gluten-Free", "Dairy-Free", "Nut Allergy", "Other"];
  const MOBILITY_OPTIONS = ["Wheelchair", "ECV", "Stroller", "Limited Walking", "None"];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
          Who's Going to Disney?
        </h2>
        <p className="text-muted-foreground">
          Tell us about your travel companions so we can personalize your experience
        </p>
      </div>

      {/* Existing Members */}
      {members.length > 0 && (
        <div className="space-y-3">
          {members.map((member, index) => (
            <Card key={index} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg">{member.name}</h3>
                    {member.age && <Badge variant="secondary">{member.age} years old</Badge>}
                    {member.height && <Badge variant="outline">{member.height}" tall</Badge>}
                  </div>
                  {member.energyLevel && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Energy: {member.energyLevel} {member.napNeeds && "• Needs naps"}
                    </p>
                  )}
                  {member.dietaryRestrictions && member.dietaryRestrictions.length > 0 && (
                    <p className="text-sm text-muted-foreground">
                      Dietary: {member.dietaryRestrictions.join(", ")}
                    </p>
                  )}
                </div>
                <Button variant="ghost" size="icon" onClick={() => removeMember(index)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add New Member */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <Users className="h-5 w-5" />
          <span>Add Family Member</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={newMember.name}
              onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
              placeholder="Name"
            />
          </div>
          
          <div>
            <Label htmlFor="age">Age (optional)</Label>
            <Input
              id="age"
              type="number"
              value={newMember.age || ""}
              onChange={(e) => setNewMember({ ...newMember, age: e.target.value ? parseInt(e.target.value) : undefined })}
              placeholder="Age"
            />
          </div>
        </div>

        {/* Advanced Options Toggle */}
        <div className="flex items-center justify-between py-2">
          <Label htmlFor="advanced">Add more details</Label>
          <Switch
            id="advanced"
            checked={showAdvanced}
            onCheckedChange={setShowAdvanced}
          />
        </div>

        {showAdvanced && (
          <div className="space-y-4 pt-2 border-t">
            <div>
              <Label>Height (inches) - For ride restrictions</Label>
              <Input
                type="number"
                value={newMember.height || ""}
                onChange={(e) => setNewMember({ ...newMember, height: e.target.value ? parseInt(e.target.value) : undefined })}
                placeholder="48"
              />
            </div>

            <div>
              <Label>Energy Level</Label>
              <div className="flex gap-2 mt-2">
                {["low", "medium", "high"].map((level) => (
                  <Badge
                    key={level}
                    variant={newMember.energyLevel === level ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setNewMember({ ...newMember, energyLevel: level })}
                  >
                    {level}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label>Needs Naps?</Label>
              <Switch
                checked={newMember.napNeeds}
                onCheckedChange={(checked) => setNewMember({ ...newMember, napNeeds: checked })}
              />
            </div>

            <div>
              <Label>Dietary Restrictions</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {DIETARY_OPTIONS.map((option) => (
                  <Badge
                    key={option}
                    variant={newMember.dietaryRestrictions?.includes(option) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => {
                      const current = newMember.dietaryRestrictions || [];
                      const updated = current.includes(option)
                        ? current.filter(d => d !== option)
                        : [...current, option];
                      setNewMember({ ...newMember, dietaryRestrictions: updated });
                    }}
                  >
                    {option}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <Label>Mobility Needs</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {MOBILITY_OPTIONS.map((option) => (
                  <Badge
                    key={option}
                    variant={newMember.mobilityNeeds === option ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setNewMember({ ...newMember, mobilityNeeds: option })}
                  >
                    {option}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}

        <Button onClick={addMember} disabled={!newMember.name.trim()} className="w-full">
          <Plus className="mr-2 h-4 w-4" />
          Add Family Member
        </Button>
      </Card>

      {members.length === 0 && (
        <p className="text-center text-muted-foreground">
          Add at least one family member to continue
        </p>
      )}

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onBack} size="lg">
          <ArrowLeft className="mr-2 h-5 w-5" />
          Back
        </Button>
        <Button onClick={onNext} size="lg" disabled={members.length === 0}>
          Continue
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
