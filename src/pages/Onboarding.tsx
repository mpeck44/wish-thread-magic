import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Sparkles, ChevronLeft, ChevronRight, Heart } from "lucide-react";
import { AvatarPicker } from "@/components/onboarding/AvatarPicker";
import { FamilyRolePicker } from "@/components/onboarding/FamilyRolePicker";
import { FamilyMemberBuilder } from "@/components/onboarding/FamilyMemberBuilder";
import { UserVibesPicker } from "@/components/onboarding/UserVibesPicker";

type Step = "profile" | "vibes" | "family" | "complete";

const Onboarding = () => {
  const [step, setStep] = useState<Step>("profile");
  const [name, setName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("icon-user");
  const [familyRole, setFamilyRole] = useState<"mom" | "dad" | "grandparent" | "kid" | "other">("other");
  const [userVibes, setUserVibes] = useState<string[]>([]);
  const [familyMembers, setFamilyMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  const handleProfileSubmit = async () => {
    if (!name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter your name",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          name,
          avatar_url: avatarUrl,
          family_role: familyRole,
        })
        .eq("user_id", user!.id);

      if (error) throw error;

      setStep("vibes");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVibesSubmit = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          vibes: userVibes,
        })
        .eq("user_id", user!.id);

      if (error) throw error;

      setStep("family");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFamilySubmit = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.rpc("create_family_with_members", {
        _name: "My Family",
        _members: familyMembers,
      });

      if (error) throw error;

      setStep("complete");
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (step === "complete") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-center justify-center px-6">
        <div className="text-center space-y-6 animate-fade-in-up">
          <div className="w-32 h-32 mx-auto relative">
            <div className="absolute inset-0 animate-pulse-glow">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-full opacity-20 blur-xl" />
            </div>
            <Sparkles className="absolute inset-0 m-auto h-16 w-16 text-primary animate-pulse" />
          </div>
          <h2 className="text-3xl font-bold">You're all set!</h2>
          <p className="text-muted-foreground">Let's start weaving your perfect trip...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-center justify-center px-6 py-12">
      <div className="max-w-2xl w-full space-y-8 animate-fade-in-up">
        {step === "profile" && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold">Welcome to WishThread</h1>
              <p className="text-muted-foreground">Let's get to know you</p>
            </div>

            <div className="space-y-6 bg-card p-8 rounded-lg border">
              <div className="space-y-2">
                <label className="text-sm font-medium">What do people call you?</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="bg-background"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Pick your avatar</label>
                <AvatarPicker value={avatarUrl} onChange={setAvatarUrl} />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Your role in the family</label>
                <FamilyRolePicker value={familyRole} onChange={setFamilyRole} />
              </div>

              <Button
                onClick={handleProfileSubmit}
                disabled={loading}
                className="w-full bg-gradient-to-r from-primary via-secondary to-accent"
              >
                Continue
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        )}

        {step === "vibes" && (
          <div className="space-y-6">
            <Button
              variant="ghost"
              onClick={() => setStep("profile")}
              className="mb-4"
            >
              <ChevronLeft className="mr-2 h-5 w-5" />
              Back
            </Button>

            <div className="text-center space-y-2">
              <Heart className="w-12 h-12 mx-auto text-primary animate-pulse" />
              <h1 className="text-3xl font-bold">What's YOUR Perfect Disney Day?</h1>
              <p className="text-muted-foreground">Pick what makes your heart sing ✨</p>
            </div>

            <div className="bg-card p-8 rounded-lg border space-y-6">
              <div className="space-y-4">
                <label className="text-sm font-medium">Your Disney Vibes</label>
                <UserVibesPicker value={userVibes} onChange={setUserVibes} />
              </div>

              <Button
                onClick={handleVibesSubmit}
                disabled={loading}
                className="w-full bg-gradient-to-r from-primary via-secondary to-accent"
              >
                Continue
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        )}

        {step === "family" && (
          <div className="space-y-6">
            <Button
              variant="ghost"
              onClick={() => setStep("vibes")}
              className="mb-4"
            >
              <ChevronLeft className="mr-2 h-5 w-5" />
              Back
            </Button>

            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold">Who's Coming With You?</h1>
              <p className="text-muted-foreground">Add your travel companions (optional)</p>
            </div>

            <div className="bg-card p-8 rounded-lg border space-y-6">
              <FamilyMemberBuilder
                members={familyMembers}
                onChange={setFamilyMembers}
              />

              <Button
                onClick={handleFamilySubmit}
                disabled={loading}
                className="w-full bg-gradient-to-r from-primary via-secondary to-accent"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Start Planning
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
