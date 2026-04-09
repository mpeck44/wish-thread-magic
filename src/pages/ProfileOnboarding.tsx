import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AvatarPicker } from "@/components/onboarding/AvatarPicker";
import { InterestsStep } from "@/components/onboarding/InterestsStep";
import { EnhancedFamilyBuilder, EnhancedFamilyMember } from "@/components/onboarding/EnhancedFamilyBuilder";
import { Sparkles, Users, Heart, Wand2 } from "lucide-react";
import { MagicalLoader } from "@/components/ui/magical-loader";

type Step = "profile" | "interests" | "family" | "complete";

export default function ProfileOnboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("profile");
  const [user, setUser] = useState<any>(null);

  const [name, setName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [familyRole, setFamilyRole] = useState<"mom" | "dad" | "grandparent" | "other">("other");

  const [interests, setInterests] = useState<Record<string, "like" | "must" | "none">>({});

  const [familyMembers, setFamilyMembers] = useState<EnhancedFamilyMember[]>([]);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }
      setUser(user);

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (profile) {
        setName(profile.name || "");
        setAvatarUrl(profile.avatar_url || "");
        if (profile.family_role && profile.family_role !== "kid") {
          setFamilyRole(profile.family_role);
        }
        if (profile.vibes && Array.isArray(profile.vibes)) {
          const interestsMap: Record<string, "like" | "must" | "none"> = {};
          profile.vibes.forEach((vibe: string) => {
            interestsMap[vibe] = "like";
          });
          setInterests(interestsMap);
        }
      }
    };
    checkAuth();
  }, [navigate]);

  const handleProfileSubmit = async () => {
    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          name: name.trim(),
          avatar_url: avatarUrl,
          family_role: familyRole,
        })
        .eq("user_id", user.id);
      if (error) throw error;
      setStep("interests");
    } catch (error: any) {
      if (import.meta.env.DEV) console.error("Error updating profile:", error);
      toast.error("Failed to save profile");
    }
  };

  const handleInterestsNext = async () => {
    try {
      const vibesArray = Object.entries(interests)
        .filter(([_, value]) => value !== "none")
        .map(([key, _]) => key);
      const { error } = await supabase
        .from("profiles")
        .update({ vibes: vibesArray })
        .eq("user_id", user.id);
      if (error) throw error;
      setStep("family");
    } catch (error: any) {
      if (import.meta.env.DEV) console.error("Error saving interests:", error);
      toast.error("Failed to save interests");
    }
  };

  const handleComplete = async () => {
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!profile) throw new Error("Profile not found");

      const { data: existingFamilies } = await supabase
        .from("families")
        .select("id")
        .eq("creator_id", profile.id)
        .order("created_at", { ascending: false })
        .limit(1);

      let resolvedFamilyId: string;

      if (existingFamilies && existingFamilies.length > 0) {
        resolvedFamilyId = existingFamilies[0].id;
        await supabase.from("family_members").delete().eq("family_id", resolvedFamilyId);
        if (familyMembers.length > 0) {
          const membersToInsert = familyMembers.map(member => ({
            family_id: resolvedFamilyId,
            name: member.name,
            age: member.age || null,
            vibes: member.vibes || [],
            is_child: member.age ? member.age < 18 : null,
          }));
          await supabase.from("family_members").insert(membersToInsert);
        }
      } else {
        const membersPayload = familyMembers.map(member => ({
          name: member.name,
          age: member.age || null,
          vibes: member.vibes || [],
        }));
        const { data: newFamilyId, error: rpcError } = await supabase
          .rpc("create_family_with_members", {
            _name: `${name}'s Family`,
            _members: membersPayload,
          });
        if (rpcError) throw rpcError;
        if (!newFamilyId) throw new Error("Failed to create family");
        resolvedFamilyId = newFamilyId;
      }

      const { error: completeError } = await supabase
        .from("profiles")
        .update({ profile_complete: true })
        .eq("user_id", user.id);
      if (completeError) throw completeError;

      toast.success("Profile saved! 🎉", {
        description: "Now let's plan your first magical trip!"
      });
      navigate(`/trip-planning?firstTime=true&familyId=${resolvedFamilyId}`);
    } catch (error: any) {
      if (import.meta.env.DEV) console.error("Error completing profile setup:", error);
      toast.error("Failed to complete setup");
    }
  };

  const totalSteps = 3;
  const currentStepNumber =
    step === "profile" ? 1 :
    step === "interests" ? 2 :
    step === "family" ? 3 : 3;
  const progress = (currentStepNumber / totalSteps) * 100;

  const stepIcons = [
    { icon: Wand2, label: "Profile" },
    { icon: Heart, label: "Interests" },
    { icon: Users, label: "Family" },
  ];

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[var(--gradient-hero)] sparkle-bg py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Progress Header */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-heading font-bold text-gradient-magic mb-2">Welcome to WishThread</h1>
          <p className="text-muted-foreground">Let's set up your magical profile</p>

          {/* Step Indicators */}
          <div className="flex items-center justify-center gap-3 mt-6 mb-4">
            {stepIcons.map((s, i) => {
              const Icon = s.icon;
              const isActive = i + 1 === currentStepNumber;
              const isDone = i + 1 < currentStepNumber;
              return (
                <div key={i} className="flex items-center gap-3">
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    isActive ? "bg-teal text-teal-foreground shadow-glow-teal" :
                    isDone ? "bg-teal/20 text-teal" :
                    "bg-muted text-muted-foreground"
                  }`}>
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{s.label}</span>
                  </div>
                  {i < stepIcons.length - 1 && (
                    <div className={`w-8 h-0.5 ${isDone ? "bg-teal" : "bg-muted"}`} />
                  )}
                </div>
              );
            })}
          </div>

          <Progress value={progress} className="h-2 max-w-md mx-auto" />
        </div>

        <Card className="p-8 animate-fade-in-up">
          {step === "profile" && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="p-4 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full inline-flex mb-4">
                  <Sparkles className="w-10 h-10 text-primary" />
                </div>
                <h2 className="text-2xl font-heading font-bold">Tell us about yourself</h2>
                <p className="text-muted-foreground mt-1">This information will be saved for all your future trips</p>
              </div>

              <div className="space-y-5">
                <div>
                  <Label htmlFor="name">Your Name</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your name" className="mt-1.5 h-12 bg-background/50" />
                </div>

                <div>
                  <Label>Choose Your Avatar</Label>
                  <AvatarPicker value={avatarUrl} onChange={setAvatarUrl} />
                </div>

                <div>
                  <Label htmlFor="role">Your Role</Label>
                  <Select value={familyRole} onValueChange={(value: any) => setFamilyRole(value)}>
                    <SelectTrigger id="role" className="mt-1.5 h-12 bg-background/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="glass-card border-border/50">
                      <SelectItem value="mom">Mom</SelectItem>
                      <SelectItem value="dad">Dad</SelectItem>
                      <SelectItem value="grandparent">Grandparent</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button onClick={handleProfileSubmit} size="lg" variant="teal">
                  Continue
                </Button>
              </div>
            </div>
          )}

          {step === "interests" && (
            <>
              <div className="text-center mb-6">
                <div className="p-4 bg-gradient-to-br from-secondary/10 to-primary/10 rounded-full inline-flex mb-4">
                  <Heart className="w-10 h-10 text-secondary" />
                </div>
                <h2 className="text-2xl font-heading font-bold">Your Interests</h2>
                <p className="text-muted-foreground mt-1">Help us understand what you love most</p>
              </div>
              <InterestsStep
                value={interests}
                onChange={setInterests}
                onBack={() => setStep("profile")}
                onNext={handleInterestsNext}
              />
            </>
          )}

          {step === "family" && (
            <>
              <div className="text-center mb-6">
                <div className="p-4 bg-gradient-to-br from-accent/10 to-primary/10 rounded-full inline-flex mb-4">
                  <Users className="w-10 h-10 text-accent" />
                </div>
                <h2 className="text-2xl font-heading font-bold">Your Travel Companions</h2>
                <p className="text-muted-foreground mt-1">Who will be joining you on your adventures?</p>
              </div>
              <EnhancedFamilyBuilder
                members={familyMembers}
                onChange={setFamilyMembers}
                onBack={() => setStep("interests")}
                onNext={handleComplete}
              />
            </>
          )}

          {step === "complete" && (
            <MagicalLoader message="Redirecting..." submessage="Taking you to trip planning!" />
          )}
        </Card>
      </div>
    </div>
  );
}
