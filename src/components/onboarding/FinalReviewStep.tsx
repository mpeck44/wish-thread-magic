import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, CheckCircle2, Users, Heart, DollarSign, Calendar, Sparkles } from "lucide-react";

interface FinalReviewStepProps {
  profileName: string;
  selectedInterestsCount: number;
  familyMembersCount: number;
  budgetLevel: string;
  tripDuration: number;
  themeDaysEnabled: boolean;
  selectedThemesCount: number;
  additionalNotes: string;
  onAdditionalNotesChange: (notes: string) => void;
  onBack: () => void;
  onComplete: () => void;
}

export function FinalReviewStep({
  profileName,
  selectedInterestsCount,
  familyMembersCount,
  budgetLevel,
  tripDuration,
  themeDaysEnabled,
  selectedThemesCount,
  additionalNotes,
  onAdditionalNotesChange,
  onBack,
  onComplete,
}: FinalReviewStepProps) {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div className="text-center space-y-2">
        <div className="flex justify-center mb-4">
          <div className="p-4 bg-primary/10 rounded-full">
            <CheckCircle2 className="w-12 h-12 text-primary" />
          </div>
        </div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
          Almost Ready for the Magic!
        </h2>
        <p className="text-muted-foreground">
          Review your preferences and add any final notes
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="p-6 space-y-3">
          <div className="flex items-center gap-2 text-primary">
            <Users className="w-5 h-5" />
            <h3 className="font-semibold">Your Group</h3>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold">{familyMembersCount}</p>
            <p className="text-sm text-muted-foreground">Family Members</p>
          </div>
        </Card>

        <Card className="p-6 space-y-3">
          <div className="flex items-center gap-2 text-primary">
            <Heart className="w-5 h-5" />
            <h3 className="font-semibold">Your Interests</h3>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold">{selectedInterestsCount}</p>
            <p className="text-sm text-muted-foreground">Selected Interests</p>
          </div>
        </Card>

        <Card className="p-6 space-y-3">
          <div className="flex items-center gap-2 text-primary">
            <DollarSign className="w-5 h-5" />
            <h3 className="font-semibold">Budget Style</h3>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold capitalize">{budgetLevel || "Not set"}</p>
            <p className="text-sm text-muted-foreground">Budget Level</p>
          </div>
        </Card>

        <Card className="p-6 space-y-3">
          <div className="flex items-center gap-2 text-primary">
            <Calendar className="w-5 h-5" />
            <h3 className="font-semibold">Trip Length</h3>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold">{tripDuration} days</p>
            <p className="text-sm text-muted-foreground">At Disney</p>
          </div>
        </Card>

        <Card className="p-6 space-y-3">
          <div className="flex items-center gap-2 text-primary">
            <Sparkles className="w-5 h-5" />
            <h3 className="font-semibold">Theme Days</h3>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold">
              {themeDaysEnabled ? selectedThemesCount : "None"}
            </p>
            <p className="text-sm text-muted-foreground">
              {themeDaysEnabled ? "Days Themed" : "Not Using"}
            </p>
          </div>
        </Card>
      </div>

      {/* Additional Notes */}
      <Card className="p-6 space-y-4">
        <Label htmlFor="notes">Anything else we should know?</Label>
        <Textarea
          id="notes"
          value={additionalNotes}
          onChange={(e) => onAdditionalNotesChange(e.target.value)}
          placeholder="Special requests, concerns, or anything that would help us create your perfect itinerary..."
          className="min-h-[120px]"
        />
      </Card>

      {/* What's Next */}
      <Card className="p-6 bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5">
        <h3 className="font-semibold text-lg mb-3">What happens next?</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">✓</span>
            <span>We'll use AI to create a personalized 3-day itinerary based on your preferences</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">✓</span>
            <span>Get recommendations for restaurants, attractions, and experiences</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">✓</span>
            <span>Receive tips for Lightning Lane, dining reservations, and more</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">✓</span>
            <span>You can always refine and regenerate your itinerary anytime</span>
          </li>
        </ul>
      </Card>

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onBack} size="lg">
          <ArrowLeft className="mr-2 h-5 w-5" />
          Back
        </Button>
        <Button onClick={onComplete} size="lg" className="bg-gradient-to-r from-primary via-secondary to-accent">
          <Sparkles className="mr-2 h-5 w-5" />
          Start Planning My Trip!
        </Button>
      </div>
    </div>
  );
}
