import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { BudgetAccommodationStep } from "@/components/onboarding/BudgetAccommodationStep";
import { TripVisionStep } from "@/components/onboarding/TripVisionStep";
import { ThemeDaysStep } from "@/components/onboarding/ThemeDaysStep";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calendar, Sparkles, DollarSign, MapPin, Palette, ClipboardCheck } from "lucide-react";
import { DateRange } from "react-day-picker";
import { MagicalLoader } from "@/components/ui/magical-loader";

type Step = "budget" | "vision" | "themes" | "review" | "generating";

export default function TripPlanning() {
  const navigate = useNavigate();
  const { tripId } = useParams();
  const [searchParams] = useSearchParams();
  const isFirstTime = searchParams.get("firstTime") === "true";
  const [step, setStep] = useState<Step>("budget");
  const [user, setUser] = useState<any>(null);
  const [familyId, setFamilyId] = useState<string>("");

  const [budgetLevel, setBudgetLevel] = useState("moderate");
  const [accommodationPreference, setAccommodationPreference] = useState("value-resort");

  const [tripDuration, setTripDuration] = useState(4);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [pacePreference, setPacePreference] = useState("moderate");
  const [specialOccasions, setSpecialOccasions] = useState<string[]>([]);
  const [mustDoExperiences, setMustDoExperiences] = useState("");

  const [themeDaysEnabled, setThemeDaysEnabled] = useState(false);
  const [selectedThemes, setSelectedThemes] = useState<string[]>([]);

  const [additionalNotes, setAdditionalNotes] = useState("");

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/auth"); return; }
      setUser(user);

      const { data: profile } = await supabase
        .from("profiles").select("*").eq("user_id", user.id).single();

      if (!profile) { toast.error("Profile not found"); navigate("/profile-onboarding"); return; }
      if (!profile.profile_complete) { toast.error("Please complete your profile first"); navigate("/profile-onboarding"); return; }

      const urlFamilyId = searchParams.get("familyId");
      let resolvedFamilyId: string | null = null;
      if (urlFamilyId) {
        resolvedFamilyId = urlFamilyId;
      } else {
        const { data: families } = await supabase
          .from("families").select("id").eq("creator_id", profile.id)
          .order("created_at", { ascending: false }).limit(1);
        resolvedFamilyId = families?.[0]?.id || null;
      }
      if (!resolvedFamilyId) { toast.error("Family not found. Please complete your profile."); navigate("/profile-onboarding"); return; }
      setFamilyId(resolvedFamilyId);
      if (tripId) loadTripData(tripId);
    };
    checkAuth();
  }, [navigate, tripId]);

  const loadTripData = async (id: string) => {
    try {
      const { data: trip, error } = await supabase.from("trips").select("*").eq("id", id).single();
      if (error) throw error;
      if (trip) {
        setBudgetLevel(trip.budget_level || "moderate");
        setAccommodationPreference(trip.accommodation_preference || "value-resort");
        setTripDuration(trip.trip_duration || 4);
        if (trip.visit_dates_start && trip.visit_dates_end) {
          setDateRange({ from: new Date(trip.visit_dates_start), to: new Date(trip.visit_dates_end) });
        }
        setPacePreference(trip.pace_preference || "moderate");
        setSpecialOccasions(trip.special_occasions || []);
        setMustDoExperiences(trip.must_do_experiences || "");
        setThemeDaysEnabled(trip.theme_days_enabled || false);
        let themePrefs: string[] = [];
        if (Array.isArray(trip.theme_day_preferences)) {
          themePrefs = trip.theme_day_preferences.map(t => String(t));
        }
        setSelectedThemes(themePrefs);
        setAdditionalNotes(trip.additional_notes || "");
      }
    } catch (error: any) {
      if (import.meta.env.DEV) console.error("Error loading trip:", error);
      toast.error("Failed to load trip data");
    }
  };

  const handleComplete = async () => {
    if (!familyId) { toast.error("Family not found"); return; }
    setStep("generating");
    try {
      const tripData = {
        family_id: familyId,
        wish_text: `Trip from ${dateRange?.from?.toLocaleDateString() || 'TBD'} to ${dateRange?.to?.toLocaleDateString() || 'TBD'}`,
        budget_level: budgetLevel,
        accommodation_preference: accommodationPreference,
        trip_duration: tripDuration,
        visit_dates_start: dateRange?.from?.toISOString().split('T')[0],
        visit_dates_end: dateRange?.to?.toISOString().split('T')[0],
        pace_preference: pacePreference,
        special_occasions: specialOccasions,
        must_do_experiences: mustDoExperiences,
        theme_days_enabled: themeDaysEnabled,
        theme_day_preferences: selectedThemes as any,
        additional_notes: additionalNotes,
      };

      let savedTripId: string;
      if (tripId) {
        const { error } = await supabase.from("trips").update(tripData).eq("id", tripId);
        if (error) throw error;
        savedTripId = tripId;
        toast.success("Trip updated successfully!");
      } else {
        const { data: newTrip, error } = await supabase.from("trips").insert([tripData]).select().single();
        if (error) throw error;
        savedTripId = newTrip.id;
        toast.success("Trip created!");
      }

      const generatingToast = toast.loading("Creating your magical itinerary...");

      const { data: familyMembers } = await supabase.from("family_members").select("*").eq("family_id", familyId);
      const { data: profile } = await supabase.from("profiles").select("*").eq("user_id", user.id).single();

      const { data: generatedData, error: genError } = await supabase.functions.invoke("generate-itinerary", {
        body: { tripId: savedTripId, tripData, familyMembers: familyMembers || [], profile },
      });

      toast.dismiss(generatingToast);
      if (genError) {
        if (import.meta.env.DEV) console.error("Error generating itinerary:", genError);
        toast.error("Failed to generate itinerary. You can try again from the itinerary page.");
      } else {
        toast.success("Itinerary is being created!");
      }

      if (isFirstTime) {
        toast.success("Your profile and first trip are ready! 🎉");
        navigate("/");
      } else {
        navigate(`/itinerary/${savedTripId}?generating=true`);
      }
    } catch (error: any) {
      if (import.meta.env.DEV) console.error("Error saving trip:", error);
      toast.error("Failed to save trip");
      setStep("review");
    }
  };

  const stepIcons = [
    { icon: DollarSign, label: "Budget" },
    { icon: MapPin, label: "Vision" },
    { icon: Palette, label: "Themes" },
    { icon: ClipboardCheck, label: "Review" },
  ];

  const totalSteps = 4;
  const currentStepNumber =
    step === "budget" ? 1 : step === "vision" ? 2 : step === "themes" ? 3 : step === "review" ? 4 : 4;
  const progress = (currentStepNumber / totalSteps) * 100;

  if (!user || !familyId) return null;

  return (
    <div className="min-h-screen bg-[var(--gradient-hero)] sparkle-bg py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-heading font-bold text-gradient-magic mb-2">
            {tripId ? "Edit Your Trip" : isFirstTime ? "Plan Your First Trip! 🎉" : "Plan Your Disney Adventure"}
          </h1>
          <p className="text-muted-foreground">
            {isFirstTime ? "Almost there! Let's plan your magical Disney trip" : "Let's plan the perfect vacation"}
          </p>

          {/* Step Indicators */}
          <div className="flex items-center justify-center gap-3 mt-6 mb-4">
            {stepIcons.map((s, i) => {
              const Icon = s.icon;
              const isActive = i + 1 === currentStepNumber;
              const isDone = i + 1 < currentStepNumber;
              return (
                <div key={i} className="flex items-center gap-3">
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    isActive ? "bg-primary text-primary-foreground shadow-glow-purple" :
                    isDone ? "bg-primary/20 text-primary" :
                    "bg-muted text-muted-foreground"
                  }`}>
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{s.label}</span>
                  </div>
                  {i < stepIcons.length - 1 && (
                    <div className={`w-6 h-0.5 ${isDone ? "bg-primary" : "bg-muted"}`} />
                  )}
                </div>
              );
            })}
          </div>

          <Progress value={progress} className="h-2 max-w-md mx-auto" />
        </div>

        <Card className="p-8 animate-fade-in-up">
          {step === "budget" && (
            <BudgetAccommodationStep
              budgetLevel={budgetLevel}
              accommodationPreference={accommodationPreference}
              onBudgetChange={setBudgetLevel}
              onAccommodationChange={setAccommodationPreference}
              onBack={() => navigate("/")}
              onNext={() => setStep("vision")}
            />
          )}

          {step === "vision" && (
            <TripVisionStep
              tripDuration={tripDuration}
              dateRange={dateRange}
              pacePreference={pacePreference}
              specialOccasions={specialOccasions}
              mustDoExperiences={mustDoExperiences}
              onTripDurationChange={setTripDuration}
              onDateRangeChange={setDateRange}
              onPaceChange={setPacePreference}
              onSpecialOccasionsChange={setSpecialOccasions}
              onMustDoChange={setMustDoExperiences}
              onBack={() => setStep("budget")}
              onNext={() => setStep("themes")}
            />
          )}

          {step === "themes" && (
            <ThemeDaysStep
              themeDaysEnabled={themeDaysEnabled}
              selectedThemes={selectedThemes}
              onThemeDaysEnabledChange={setThemeDaysEnabled}
              onSelectedThemesChange={setSelectedThemes}
              onBack={() => setStep("vision")}
              onNext={() => setStep("review")}
            />
          )}

          {step === "review" && (
            <div className="space-y-6 animate-fade-in-up">
              <div className="text-center mb-6">
                <div className="p-4 bg-gradient-to-br from-accent/10 to-primary/10 rounded-full inline-flex mb-4">
                  <Calendar className="w-10 h-10 text-accent" />
                </div>
                <h2 className="text-2xl font-heading font-bold">Review Your Trip</h2>
                <p className="text-muted-foreground mt-1">Everything looks good? Let's create your itinerary!</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Card className="p-5 bg-gradient-to-br from-card to-muted/20">
                  <p className="text-sm text-muted-foreground">Budget Level</p>
                  <p className="text-lg font-heading font-semibold capitalize">{budgetLevel}</p>
                </Card>
                <Card className="p-5 bg-gradient-to-br from-card to-muted/20">
                  <p className="text-sm text-muted-foreground">Accommodation</p>
                  <p className="text-lg font-heading font-semibold capitalize">{accommodationPreference.replace('-', ' ')}</p>
                </Card>
                <Card className="p-5 bg-gradient-to-br from-card to-muted/20">
                  <p className="text-sm text-muted-foreground">Trip Duration</p>
                  <p className="text-lg font-heading font-semibold">{tripDuration} days</p>
                </Card>
                <Card className="p-5 bg-gradient-to-br from-card to-muted/20">
                  <p className="text-sm text-muted-foreground">Pace</p>
                  <p className="text-lg font-heading font-semibold capitalize">{pacePreference}</p>
                </Card>
              </div>

              {dateRange?.from && dateRange?.to && (
                <Card className="p-5 bg-gradient-to-br from-card to-muted/20">
                  <p className="text-sm text-muted-foreground">Dates</p>
                  <p className="text-lg font-heading font-semibold">
                    {dateRange.from.toLocaleDateString()} - {dateRange.to.toLocaleDateString()}
                  </p>
                </Card>
              )}

              {specialOccasions.length > 0 && (
                <Card className="p-5 bg-gradient-to-br from-card to-muted/20">
                  <p className="text-sm text-muted-foreground mb-2">Special Occasions</p>
                  <div className="flex flex-wrap gap-2">
                    {specialOccasions.map((occasion) => (
                      <Badge key={occasion} variant="premium">
                        {occasion}
                      </Badge>
                    ))}
                  </div>
                </Card>
              )}

              <div>
                <Label htmlFor="notes">Additional Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  placeholder="Any special requests or notes for your trip..."
                  rows={4}
                  className="mt-1.5"
                />
              </div>

              <div className="flex gap-4">
                <Button variant="outline" onClick={() => setStep("themes")} className="flex-1">
                  Back
                </Button>
                <Button onClick={handleComplete} size="lg" variant="premium" className="flex-1">
                  <Sparkles className="w-4 h-4 mr-2" />
                  {tripId ? "Update Trip" : "Create Trip & Generate Itinerary"}
                </Button>
              </div>
            </div>
          )}

          {step === "generating" && (
            <MagicalLoader
              message="Creating Your Magical Trip..."
              submessage="Hold tight, we're crafting the perfect itinerary for you!"
            />
          )}
        </Card>
      </div>
    </div>
  );
}
