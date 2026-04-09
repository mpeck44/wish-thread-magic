import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, ArrowRight, DollarSign, Home, Star, Crown } from "lucide-react";
import { cn } from "@/lib/utils";

interface BudgetAccommodationStepProps {
  budgetLevel: string;
  accommodationPreference: string;
  onBudgetChange: (budget: string) => void;
  onAccommodationChange: (accommodation: string) => void;
  onBack: () => void;
  onNext: () => void;
}

export function BudgetAccommodationStep({
  budgetLevel,
  accommodationPreference,
  onBudgetChange,
  onAccommodationChange,
  onBack,
  onNext,
}: BudgetAccommodationStepProps) {
  const budgetOptions = [
    { value: "value", label: "Value", icon: DollarSign, description: "Great experiences on a budget", priceRange: "$-$$" },
    { value: "moderate", label: "Moderate", icon: Home, description: "Balanced comfort and value", priceRange: "$$-$$$" },
    { value: "deluxe", label: "Deluxe", icon: Star, description: "Premium experiences", priceRange: "$$$-$$$$" },
    { value: "luxury", label: "Luxury", icon: Crown, description: "The finest Disney has to offer", priceRange: "$$$$+" },
  ];

  const accommodationOptions = [
    { value: "onproperty-value", label: "On-Property Value Resort" },
    { value: "onproperty-moderate", label: "On-Property Moderate Resort" },
    { value: "onproperty-deluxe", label: "On-Property Deluxe Resort" },
    { value: "offproperty", label: "Off-Property Hotel" },
    { value: "undecided", label: "Not Sure Yet" },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-fade-in-up">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-heading font-bold text-gradient-magic">
          Let's Talk Budget & Stay
        </h2>
        <p className="text-muted-foreground">
          This helps us recommend the best experiences for you
        </p>
      </div>

      {/* Budget Level */}
      <div className="space-y-4">
        <h3 className="text-xl font-heading font-semibold">What's your budget style?</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {budgetOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = budgetLevel === option.value;
            const isLuxury = option.value === "luxury";
            return (
              <Card
                key={option.value}
                className={cn(
                  "p-6 cursor-pointer transition-all duration-300 hover:scale-[1.03]",
                  isSelected && "border-primary shadow-glow-purple bg-primary/5",
                  isSelected && isLuxury && "border-[hsl(var(--gold))] shadow-glow-gold bg-[hsl(var(--gold)/0.05)]",
                  !isSelected && "hover:bg-muted/50"
                )}
                onClick={() => onBudgetChange(option.value)}
              >
                <div className="flex flex-col items-center text-center gap-3">
                  <div
                    className={cn(
                      "p-3 rounded-full transition-all duration-300",
                      isSelected && !isLuxury && "bg-primary text-primary-foreground shadow-md",
                      isSelected && isLuxury && "bg-[hsl(var(--gold))] text-gold-foreground shadow-md",
                      !isSelected && "bg-muted"
                    )}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-heading font-semibold">{option.label}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{option.description}</p>
                    <p className={cn(
                      "text-xs font-medium mt-2",
                      isSelected && isLuxury ? "text-[hsl(var(--gold))]" : "text-primary"
                    )}>
                      {option.priceRange}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Accommodation Preference */}
      <div className="space-y-4">
        <h3 className="text-xl font-heading font-semibold">Where would you like to stay?</h3>
        <RadioGroup value={accommodationPreference} onValueChange={onAccommodationChange}>
          <div className="space-y-3">
            {accommodationOptions.map((option) => (
              <Card
                key={option.value}
                className={cn(
                  "p-4 cursor-pointer transition-all duration-200",
                  accommodationPreference === option.value
                    ? "bg-primary/5 border-primary"
                    : "hover:bg-muted/50"
                )}
                onClick={() => onAccommodationChange(option.value)}
              >
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value={option.value} id={option.value} />
                  <Label htmlFor={option.value} className="flex-1 cursor-pointer font-medium">
                    {option.label}
                  </Label>
                </div>
              </Card>
            ))}
          </div>
        </RadioGroup>
      </div>

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onBack} size="lg">
          <ArrowLeft className="mr-2 h-5 w-5" />
          Back
        </Button>
        <Button onClick={onNext} size="lg" variant="premium">
          Continue
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
