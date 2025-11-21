import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Sparkles } from "lucide-react";
import { AvatarPicker } from "@/components/onboarding/AvatarPicker";
import { FamilyRolePicker } from "@/components/onboarding/FamilyRolePicker";
import { InterestsStep } from "@/components/onboarding/InterestsStep";
import { EnhancedFamilyBuilder, EnhancedFamilyMember } from "@/components/onboarding/EnhancedFamilyBuilder";
import { BudgetAccommodationStep } from "@/components/onboarding/BudgetAccommodationStep";
import { TripVisionStep } from "@/components/onboarding/TripVisionStep";
import { ThemeDaysStep } from "@/components/onboarding/ThemeDaysStep";
import { FinalReviewStep } from "@/components/onboarding/FinalReviewStep";
import { Progress } from "@/components/ui/progress";
import { DateRange } from "react-day-picker";

type Step = "profile" | "interests" | "family" | "budget" | "vision" | "themes" | "review" | "complete";

const Onboarding = () => {
  const [step, setStep] = useState<Step>("profile");
  
  const [name, setName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("icon-user");
  const [familyRole, setFamilyRole] = useState<"mom" | "dad" | "grandparent" | "kid" | "other">("other");
  const [interests, setInterests] = useState<Record<string, "like" | "must" | "none">>({});
  const [familyMembers, setFamilyMembers] = useState<EnhancedFamilyMember[]>([]);
  const [budgetLevel, setBudgetLevel] = useState("moderate");
  const [accommodationPreference, setAccommodationPreference] = useState("undecided");
  const [tripDuration, setTripDuration] = useState(4);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [pacePreference, setPacePreference] = useState("moderate");
  const [specialOccasions, setSpecialOccasions] = useState<string[]>([]);
  const [mustDoExperiences, setMustDoExperiences] = useState("");
  const [themeDaysEnabled, setThemeDaysEnabled] = useState(false);
  const [selectedThemes, setSelectedThemes] = useState<string[]>([]);
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [loading, setLoading] = useState(false);
  
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) navigate("/auth");
  }, [user, navigate]);

  const handleProfileSubmit = async () => {
    if (!name.trim()) {
      toast({ title: "Name required", description: "Please enter your name", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.from("profiles").update({
        name, avatar_url: avatarUrl, family_role: familyRole
      }).eq("user_id", user!.id);
      if (error) throw error;
      setStep("interests");
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      const selectedInterests = Object.entries(interests)
        .filter(([_, priority]) => priority !== "none")
        .map(([id, priority]) => `${id}:${priority}`);

      // Update profile with all onboarding data
      const { error: profileError } = await supabase.from("profiles").update({
        vibes: selectedInterests,
        budget_level: budgetLevel,
        trip_planning_complete: true,
      }).eq("user_id", user!.id);

      if (profileError) throw profileError;

      // Create family and members
      const { data: familyId, error: familyError } = await supabase.rpc("create_family_with_members", {
        _name: "My Family",
        _members: familyMembers.map(m => ({ name: m.name, age: m.age?.toString(), vibes: m.specialInterests || [] }))
      });

      if (familyError) throw familyError;

      if (familyId) {
        const { data: members, error: membersError } = await supabase.from("family_members").select("*")
          .eq("family_id", familyId).order("created_at", { ascending: true });

        if (membersError) throw membersError;

        // Update enhanced family member details
        if (members) {
          for (let i = 0; i < members.length && i < familyMembers.length; i++) {
            const e = familyMembers[i];
            const { error: updateError } = await supabase.from("family_members").update({
              dietary_restrictions: e.dietaryRestrictions || [],
              mobility_needs: e.mobilityNeeds,
              height_restrictions: (e.height || 0) < 40,
              nap_schedule: e.napNeeds,
              energy_level: e.energyLevel,
              special_interests: e.specialInterests || []
            }).eq("id", members[i].id);

            if (updateError) throw updateError;
          }
        }

        // Create initial trip with preferences (profile_complete flow will skip this)
        const { error: tripError } = await supabase.from("trips").insert([{
          family_id: familyId,
          wish_text: "Initial setup from onboarding",
          accommodation_preference: accommodationPreference,
          trip_duration: tripDuration,
          visit_dates_start: dateRange?.from?.toISOString().split('T')[0],
          visit_dates_end: dateRange?.to?.toISOString().split('T')[0],
          pace_preference: pacePreference,
          theme_days_enabled: themeDaysEnabled,
          theme_day_preferences: selectedThemes as any,
          special_occasions: specialOccasions,
          must_do_experiences: mustDoExperiences,
          additional_notes: additionalNotes
        }]);

        if (tripError) throw tripError;
      }

      console.log("Onboarding complete, all data saved successfully");
      
      setStep("complete");
      // Redirect to index with a flag to show the wish form directly
      setTimeout(() => navigate("/?showWishForm=true"), 2000);
    } catch (error: any) {
      console.error("Onboarding completion error:", error);
      toast({ 
        title: "Error saving your preferences", 
        description: error.message || "Please try again", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  const getStepNumber = () => {
    const steps: Step[] = ["profile", "interests", "family", "budget", "vision", "themes", "review", "complete"];
    return steps.indexOf(step) + 1;
  };

  const progressPercentage = (getStepNumber() / 8) * 100;

  if (step === "complete") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-center justify-center">
        <div className="text-center space-y-6 animate-fade-in">
          <div className="w-32 h-32 mx-auto relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-full opacity-20 blur-xl animate-pulse" />
            <Sparkles className="absolute inset-0 m-auto h-16 w-16 text-primary animate-pulse" />
          </div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            You're All Set!
          </h2>
          <p className="text-muted-foreground text-lg">Let's start weaving your perfect Disney adventure...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30 px-4 py-8">
      <div className="max-w-5xl mx-auto mb-8">
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Step {getStepNumber()} of 8</span>
            <span>{Math.round(progressPercentage)}% Complete</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
      </div>

      <div className="max-w-5xl mx-auto">
        {step === "profile" && (
          <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
            <div className="text-center space-y-2">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Welcome to WishThread
              </h1>
              <p className="text-muted-foreground text-lg">Let's create your perfect Disney experience</p>
            </div>
            <div className="space-y-6 bg-card p-8 rounded-lg border shadow-xl">
              <div className="space-y-2">
                <label className="text-sm font-medium">What do people call you?</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Pick your avatar</label>
                <AvatarPicker value={avatarUrl} onChange={setAvatarUrl} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Your role in the family</label>
                <FamilyRolePicker value={familyRole} onChange={setFamilyRole} />
              </div>
              <Button onClick={handleProfileSubmit} disabled={loading} size="lg" 
                className="w-full bg-gradient-to-r from-primary via-secondary to-accent">
                Continue
              </Button>
            </div>
          </div>
        )}

        {step === "interests" && (
          <InterestsStep value={interests} onChange={setInterests}
            onBack={() => setStep("profile")} onNext={() => setStep("family")} />
        )}

        {step === "family" && (
          <EnhancedFamilyBuilder members={familyMembers} onChange={setFamilyMembers}
            onBack={() => setStep("interests")} onNext={() => setStep("budget")} />
        )}

        {step === "budget" && (
          <BudgetAccommodationStep budgetLevel={budgetLevel} accommodationPreference={accommodationPreference}
            onBudgetChange={setBudgetLevel} onAccommodationChange={setAccommodationPreference}
            onBack={() => setStep("family")} onNext={() => setStep("vision")} />
        )}

        {step === "vision" && (
          <TripVisionStep tripDuration={tripDuration} dateRange={dateRange} pacePreference={pacePreference}
            specialOccasions={specialOccasions} mustDoExperiences={mustDoExperiences}
            onTripDurationChange={setTripDuration} onDateRangeChange={setDateRange}
            onPaceChange={setPacePreference} onSpecialOccasionsChange={setSpecialOccasions}
            onMustDoChange={setMustDoExperiences}
            onBack={() => setStep("budget")} onNext={() => setStep("themes")} />
        )}

        {step === "themes" && (
          <ThemeDaysStep themeDaysEnabled={themeDaysEnabled} selectedThemes={selectedThemes}
            onThemeDaysEnabledChange={setThemeDaysEnabled} onSelectedThemesChange={setSelectedThemes}
            onBack={() => setStep("vision")} onNext={() => setStep("review")} />
        )}

        {step === "review" && (
          <FinalReviewStep profileName={name}
            selectedInterestsCount={Object.values(interests).filter(v => v !== "none").length}
            familyMembersCount={familyMembers.length} budgetLevel={budgetLevel}
            tripDuration={tripDuration} themeDaysEnabled={themeDaysEnabled}
            selectedThemesCount={selectedThemes.length} additionalNotes={additionalNotes}
            onAdditionalNotesChange={setAdditionalNotes}
            onBack={() => setStep("themes")} onComplete={handleComplete} />
        )}
      </div>
    </div>
  );
};

export default Onboarding;
