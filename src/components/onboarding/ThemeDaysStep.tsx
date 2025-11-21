import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, Crown, Swords, Sparkles, Shield, Drama, Plane } from "lucide-react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";

interface ThemeDaysStepProps {
  themeDaysEnabled: boolean;
  selectedThemes: string[];
  onThemeDaysEnabledChange: (enabled: boolean) => void;
  onSelectedThemesChange: (themes: string[]) => void;
  onBack: () => void;
  onNext: () => void;
}

const THEME_OPTIONS = [
  { id: "princess", label: "Princess Day", icon: Crown, description: "Royal encounters and magical moments" },
  { id: "starwars", label: "Star Wars Day", icon: Swords, description: "Galaxy far, far away adventures" },
  { id: "pixar", label: "Pixar Day", icon: Sparkles, description: "Animated favorites come to life" },
  { id: "marvel", label: "Marvel Day", icon: Shield, description: "Super hero adventures" },
  { id: "villain", label: "Villain Day", icon: Drama, description: "Embrace the darker side" },
  { id: "epcot", label: "Around the World", icon: Plane, description: "EPCOT cultural journey" },
];

export function ThemeDaysStep({
  themeDaysEnabled,
  selectedThemes,
  onThemeDaysEnabledChange,
  onSelectedThemesChange,
  onBack,
  onNext,
}: ThemeDaysStepProps) {
  const toggleTheme = (themeId: string) => {
    if (selectedThemes.includes(themeId)) {
      onSelectedThemesChange(selectedThemes.filter((t) => t !== themeId));
    } else {
      onSelectedThemesChange([...selectedThemes, themeId]);
    }
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(selectedThemes);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    onSelectedThemesChange(items);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
          Theme Days (Optional)
        </h2>
        <p className="text-muted-foreground">
          Create themed days to make your trip extra magical
        </p>
      </div>

      {/* Enable Theme Days */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="theme-days" className="text-lg font-semibold">
              Enable Theme Days
            </Label>
            <p className="text-sm text-muted-foreground mt-1">
              Plan specific days around themes like Princess Day or Star Wars Day
            </p>
          </div>
          <Switch
            id="theme-days"
            checked={themeDaysEnabled}
            onCheckedChange={onThemeDaysEnabledChange}
          />
        </div>
      </Card>

      {themeDaysEnabled && (
        <>
          {/* Theme Selection */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Choose your themes</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {THEME_OPTIONS.map((theme) => {
                const Icon = theme.icon;
                return (
                  <Card
                    key={theme.id}
                    className={`p-6 cursor-pointer transition-all hover:scale-105 ${
                      selectedThemes.includes(theme.id)
                        ? "bg-primary/10 border-primary shadow-lg"
                        : "hover:bg-accent"
                    }`}
                    onClick={() => toggleTheme(theme.id)}
                  >
                    <div className="flex flex-col items-center text-center gap-3">
                      <div
                        className={`p-3 rounded-full ${
                          selectedThemes.includes(theme.id)
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{theme.label}</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {theme.description}
                        </p>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Theme Order (Drag to Reorder) */}
          {selectedThemes.length > 0 && (
            <Card className="p-6 space-y-4">
              <div>
                <h3 className="text-lg font-semibold">Theme Day Order</h3>
                <p className="text-sm text-muted-foreground">
                  Drag to reorder your preferred sequence
                </p>
              </div>
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="themes">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="space-y-2"
                    >
                      {selectedThemes.map((themeId, index) => {
                        const theme = THEME_OPTIONS.find((t) => t.id === themeId);
                        if (!theme) return null;
                        const Icon = theme.icon;
                        
                        return (
                          <Draggable key={themeId} draggableId={themeId} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`p-4 bg-card border rounded-lg flex items-center gap-3 ${
                                  snapshot.isDragging ? "shadow-lg" : ""
                                }`}
                              >
                                <Badge variant="secondary">Day {index + 1}</Badge>
                                <Icon className="w-5 h-5" />
                                <span className="font-medium">{theme.label}</span>
                              </div>
                            )}
                          </Draggable>
                        );
                      })}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </Card>
          )}
        </>
      )}

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onBack} size="lg">
          <ArrowLeft className="mr-2 h-5 w-5" />
          Back
        </Button>
        <Button onClick={onNext} size="lg">
          {themeDaysEnabled && selectedThemes.length > 0 ? "Continue" : "Skip"}
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
