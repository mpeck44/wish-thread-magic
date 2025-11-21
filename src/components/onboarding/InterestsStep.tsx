import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InterestCard } from "./InterestCard";
import { ALL_INTERESTS, INTEREST_CATEGORIES } from "@/data/interests";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface InterestsStepProps {
  value: Record<string, "like" | "must" | "none">;
  onChange: (interests: Record<string, "like" | "must" | "none">) => void;
  onBack: () => void;
  onNext: () => void;
}

export function InterestsStep({ value, onChange, onBack, onNext }: InterestsStepProps) {
  const [activeCategory, setActiveCategory] = useState(INTEREST_CATEGORIES[0].id);

  const toggleInterest = (interestId: string) => {
    const current = value[interestId] || "none";
    const next = current === "none" ? "like" : current === "like" ? "must" : "none";
    onChange({ ...value, [interestId]: next });
  };

  const currentCategoryInterests = ALL_INTERESTS.filter(
    (interest) => interest.category === activeCategory
  );

  const selectedCount = Object.values(value).filter((v) => v !== "none").length;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 animate-fade-in">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
          What Makes Your Disney Day Perfect?
        </h2>
        <p className="text-muted-foreground text-lg">
          Tap once to like, twice for must-do, or three times to skip
        </p>
        <p className="text-sm text-primary font-medium">
          {selectedCount} interests selected
        </p>
      </div>

      <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7 gap-2 h-auto p-2">
          {INTEREST_CATEGORIES.map((category) => (
            <TabsTrigger
              key={category.id}
              value={category.id}
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs sm:text-sm py-2"
            >
              <span className="mr-1">{category.emoji}</span>
              <span className="hidden sm:inline">{category.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {INTEREST_CATEGORIES.map((category) => (
          <TabsContent key={category.id} value={category.id} className="mt-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {currentCategoryInterests.map((interest) => (
                <InterestCard
                  key={interest.id}
                  icon={interest.icon}
                  label={interest.label}
                  description={interest.description}
                  selected={value[interest.id] !== "none" && value[interest.id] !== undefined}
                  priority={value[interest.id] || "none"}
                  onClick={() => toggleInterest(interest.id)}
                />
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onBack} size="lg">
          <ArrowLeft className="mr-2 h-5 w-5" />
          Back
        </Button>
        <Button onClick={onNext} size="lg" disabled={selectedCount === 0}>
          Continue
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
