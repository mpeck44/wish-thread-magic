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
import { Sparkles, Users, Heart } from "lucide-react";

type Step = "profile" | "interests" | "family" | "complete";

export default function ProfileOnboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("profile");
  const [user, setUser] = useState<any>(null);
  
  // Profile step
  const [name, setName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [familyRole, setFamilyRole] = useState<"mom" | "dad" | "grandparent" | "other">("other");
  
  // Interests step
  const [interests, setInterests] = useState<Record<string, "like" | "must" | "none">>({});
  
  // Family step
  const [familyMembers, setFamilyMembers] = useState<EnhancedFamilyMember[]>([]);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }
      setUser(user);
      
      // Load existing profile if any
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();
      
      if (profile) {
        setName(profile.name || "");
        setAvatarUrl(profile.avatar_url || "");
        // Filter out "kid" from family_role as it's not a valid role for the profile creator
        if (profile.family_role && profile.family_role !== "kid") {
          setFamilyRole(profile.family_role);
        }
        
        // Load interests from vibes
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
      if (import.meta.env.DEV) {
        console.error("Error updating profile:", error);
      }
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
      if (import.meta.env.DEV) {
        console.error("Error saving interests:", error);
      }
      toast.error("Failed to save interests");
    }
  };

  const handleComplete = async () => {
    try {
      // Check if user already has a family — reuse the newest one
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
        // Reuse existing family — delete old members and re-add
        resolvedFamilyId = existingFamilies[0].id;

        // Remove old members
        await supabase
          .from("family_members")
          .delete()
          .eq("family_id", resolvedFamilyId);

        // Insert new members
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
        // No family exists — create one via RPC
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

      // Mark profile as complete
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
      if (import.meta.env.DEV) {
        console.error("Error completing profile setup:", error);
      }
      toast.error("Failed to complete setup");
    }
  };

  const totalSteps = 3;
  const currentStepNumber = 
    step === "profile" ? 1 : 
    step === "interests" ? 2 : 
    step === "family" ? 3 : 3;
  const progress = (currentStepNumber / totalSteps) * 100;

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-purple-900 mb-2">Welcome to Disney Trip Planner</h1>
          <p className="text-gray-600">Let's set up your profile</p>
          <Progress value={progress} className="mt-4 h-2" />
          <p className="text-sm text-gray-500 mt-2">Step {currentStepNumber} of {totalSteps}</p>
        </div>

        <Card className="p-8">
          {step === "profile" && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <Sparkles className="w-12 h-12 text-purple-600 mx-auto mb-3" />
                <h2 className="text-2xl font-bold text-gray-900">Tell us about yourself</h2>
                <p className="text-gray-600">This information will be saved for all your future trips</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Your Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                  />
                </div>

                <div>
                  <Label>Choose Your Avatar</Label>
                  <AvatarPicker value={avatarUrl} onChange={setAvatarUrl} />
                </div>

                <div>
                  <Label htmlFor="role">Your Role</Label>
                  <Select value={familyRole} onValueChange={(value: any) => setFamilyRole(value)}>
                    <SelectTrigger id="role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mom">Mom</SelectItem>
                      <SelectItem value="dad">Dad</SelectItem>
                      <SelectItem value="grandparent">Grandparent</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleProfileSubmit} size="lg">
                  Continue
                </Button>
              </div>
            </div>
          )}

          {step === "interests" && (
            <>
              <div className="text-center mb-6">
                <Heart className="w-12 h-12 text-pink-600 mx-auto mb-3" />
                <h2 className="text-2xl font-bold text-gray-900">Your Disney Interests</h2>
                <p className="text-gray-600">Help us understand what you love most</p>
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
                <Users className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                <h2 className="text-2xl font-bold text-gray-900">Your Travel Companions</h2>
                <p className="text-gray-600">Who will be joining you on your Disney adventures?</p>
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
            <div className="text-center py-12">
              <div className="animate-bounce mb-4">
                <Sparkles className="w-16 h-16 text-purple-600 mx-auto" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Redirecting...</h2>
              <p className="text-gray-600">Taking you to trip planning!</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
