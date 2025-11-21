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
import { Calendar, Sparkles } from "lucide-react";
import { DateRange } from "react-day-picker";

type Step = "budget" | "vision" | "themes" | "review" | "generating";

export default function TripPlanning() {
  const navigate = useNavigate();
  const { tripId } = useParams();
  const [searchParams] = useSearchParams();
  const isFirstTime = searchParams.get("firstTime") === "true";
  const [step, setStep] = useState<Step>("budget");
  const [user, setUser] = useState<any>(null);
  const [familyId, setFamilyId] = useState<string>("");
  
  // Budget & Accommodation
  const [budgetLevel, setBudgetLevel] = useState("moderate");
  const [accommodationPreference, setAccommodationPreference] = useState("value-resort");
  
  // Trip Vision
  const [tripDuration, setTripDuration] = useState(4);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [pacePreference, setPacePreference] = useState("moderate");
  const [specialOccasions, setSpecialOccasions] = useState<string[]>([]);
  const [mustDoExperiences, setMustDoExperiences] = useState("");
  
  // Theme Days
  const [themeDaysEnabled, setThemeDaysEnabled] = useState(false);
  const [selectedThemes, setSelectedThemes] = useState<string[]>([]);
  
  // Review
  const [additionalNotes, setAdditionalNotes] = useState("");

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }
      setUser(user);
      
      // Get profile and check if completed
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();
      
      if (!profile) {
        toast.error("Profile not found");
        navigate("/profile-onboarding");
        return;
      }
      
      if (!profile.profile_complete) {
        toast.error("Please complete your profile first");
        navigate("/profile-onboarding");
        return;
      }
      
      // Get the family for this profile
      const { data: family } = await supabase
        .from("families")
        .select("id")
        .eq("creator_id", profile.id)
        .maybeSingle();
      
      if (!family) {
        toast.error("Family not found. Please complete your profile.");
        navigate("/profile-onboarding");
        return;
      }
      
      setFamilyId(family.id);
      
      // If editing existing trip, load data
      if (tripId) {
        loadTripData(tripId);
      }
    };
    checkAuth();
  }, [navigate, tripId]);

  const loadTripData = async (id: string) => {
    try {
      const { data: trip, error } = await supabase
        .from("trips")
        .select("*")
        .eq("id", id)
        .single();
      
      if (error) throw error;
      
      if (trip) {
        setBudgetLevel(trip.budget_level || "moderate");
        setAccommodationPreference(trip.accommodation_preference || "value-resort");
        setTripDuration(trip.trip_duration || 4);
        if (trip.visit_dates_start && trip.visit_dates_end) {
          setDateRange({
            from: new Date(trip.visit_dates_start),
            to: new Date(trip.visit_dates_end)
          });
        }
        setPacePreference(trip.pace_preference || "moderate");
        setSpecialOccasions(trip.special_occasions || []);
        setMustDoExperiences(trip.must_do_experiences || "");
        setThemeDaysEnabled(trip.theme_days_enabled || false);
        
        // Safely parse theme_day_preferences
        let themePrefs: string[] = [];
        if (Array.isArray(trip.theme_day_preferences)) {
          themePrefs = trip.theme_day_preferences.map(t => String(t));
        }
        setSelectedThemes(themePrefs);
        setAdditionalNotes(trip.additional_notes || "");
      }
    } catch (error: any) {
      console.error("Error loading trip:", error);
      toast.error("Failed to load trip data");
    }
  };

  const handleComplete = async () => {
    if (!familyId) {
      toast.error("Family not found");
      return;
    }

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
        // Update existing trip
        const { error } = await supabase
          .from("trips")
          .update(tripData)
          .eq("id", tripId);
        
        if (error) throw error;
        savedTripId = tripId;
        toast.success("Trip updated successfully!");
      } else {
        // Create new trip
        const { data: newTrip, error } = await supabase
          .from("trips")
          .insert([tripData])
          .select()
          .single();
        
        if (error) throw error;
        savedTripId = newTrip.id;
        toast.success("Trip created!");
      }

      // Generate the itinerary
      const generatingToast = toast.loading("Creating your magical itinerary...");
      
      // Get family members and profile for context
      const { data: familyMembers } = await supabase
        .from("family_members")
        .select("*")
        .eq("family_id", familyId);
      
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      const { data: generatedData, error: genError } = await supabase.functions.invoke(
        "generate-itinerary",
        {
          body: {
            tripId: savedTripId,
            tripData: tripData,
            familyMembers: familyMembers || [],
            profile: profile,
          },
        }
      );

      toast.dismiss(generatingToast);

      if (genError) {
        console.error("Error generating itinerary:", genError);
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
      console.error("Error saving trip:", error);
      toast.error("Failed to save trip: " + error.message);
      setStep("review");
    }
  };

  const totalSteps = 4;
  const currentStepNumber = 
    step === "budget" ? 1 : 
    step === "vision" ? 2 : 
    step === "themes" ? 3 : 
    step === "review" ? 4 : 4;
  const progress = (currentStepNumber / totalSteps) * 100;

  if (!user || !familyId) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-purple-900 mb-2">
            {tripId ? "Edit Your Trip" : isFirstTime ? "Plan Your First Trip! 🎉" : "Plan Your Disney Adventure"}
          </h1>
          <p className="text-gray-600">
            {isFirstTime ? "Almost there! Let's plan your magical Disney trip" : "Let's plan the perfect vacation"}
          </p>
          <Progress value={progress} className="mt-4 h-2" />
          <p className="text-sm text-gray-500 mt-2">
            {isFirstTime ? `Step ${currentStepNumber + 3} of 7` : `Step ${currentStepNumber} of ${totalSteps}`}
          </p>
        </div>

        <Card className="p-8">
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
            <div className="space-y-6">
              <div className="text-center mb-6">
                <Calendar className="w-12 h-12 text-purple-600 mx-auto mb-3" />
                <h2 className="text-2xl font-bold text-gray-900">Review Your Trip</h2>
                <p className="text-gray-600">Everything looks good? Let's create your itinerary!</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Card className="p-4">
                  <p className="text-sm text-gray-500">Budget Level</p>
                  <p className="text-lg font-semibold capitalize">{budgetLevel}</p>
                </Card>
                <Card className="p-4">
                  <p className="text-sm text-gray-500">Accommodation</p>
                  <p className="text-lg font-semibold capitalize">{accommodationPreference.replace('-', ' ')}</p>
                </Card>
                <Card className="p-4">
                  <p className="text-sm text-gray-500">Trip Duration</p>
                  <p className="text-lg font-semibold">{tripDuration} days</p>
                </Card>
                <Card className="p-4">
                  <p className="text-sm text-gray-500">Pace</p>
                  <p className="text-lg font-semibold capitalize">{pacePreference}</p>
                </Card>
              </div>

              {dateRange?.from && dateRange?.to && (
                <Card className="p-4">
                  <p className="text-sm text-gray-500">Dates</p>
                  <p className="text-lg font-semibold">
                    {dateRange.from.toLocaleDateString()} - {dateRange.to.toLocaleDateString()}
                  </p>
                </Card>
              )}

              {specialOccasions.length > 0 && (
                <Card className="p-4">
                  <p className="text-sm text-gray-500 mb-2">Special Occasions</p>
                  <div className="flex flex-wrap gap-2">
                    {specialOccasions.map((occasion) => (
                      <span key={occasion} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                        {occasion}
                      </span>
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
                />
              </div>

              <div className="flex gap-4">
                <Button variant="outline" onClick={() => setStep("themes")} className="flex-1">
                  Back
                </Button>
                <Button onClick={handleComplete} size="lg" className="flex-1">
                  <Sparkles className="w-4 h-4 mr-2" />
                  {tripId ? "Update Trip" : "Create Trip & Generate Itinerary"}
                </Button>
              </div>
            </div>
          )}

          {step === "generating" && (
            <div className="text-center py-12">
              <div className="animate-bounce mb-4">
                <Sparkles className="w-16 h-16 text-purple-600 mx-auto" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Creating Your Trip...</h2>
              <p className="text-gray-600">Hold tight, we're setting everything up!</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
