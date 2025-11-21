import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ThreadAnimation } from "@/components/ThreadAnimation";
import { WishForm } from "@/components/WishForm";
import { Button } from "@/components/ui/button";
import { Sparkles, User, Heart, Star, Smile, Sun, Moon, CloudRain } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

type AppState = "landing" | "form" | "processing";

const Index = () => {
  const [state, setState] = useState<AppState>("landing");
  const [userWish, setUserWish] = useState("");
  const [profile, setProfile] = useState<any>(null);
  const { user, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user!.id)
      .single();

    if (data) {
      console.log("Profile loaded:", data);
      setProfile(data);
      // Check if profile is complete
      if (!data.name || data.name === "New User") {
        navigate("/onboarding");
      }
    }
  };

  const handleThreadPull = () => {
    setState("form");
  };

  const handleWishSubmit = async (wish: string) => {
    setUserWish(wish);
    setState("processing");

    try {
      // Get or create family
      const { data: families } = await supabase
        .from("families")
        .select("id")
        .eq("creator_id", profile.id);

      let familyId = families?.[0]?.id;

      // Create family if doesn't exist using secure RPC function
      if (!familyId) {
        const { data: newFamilyId, error: familyError } = await supabase
          .rpc("create_family_with_members", {
            _name: "My Family",
            _members: [],
          });
        
        if (familyError) throw familyError;
        familyId = newFamilyId;
      }

      const { data: members } = await supabase
        .from("family_members")
        .select("*")
        .eq("family_id", familyId);

      // Get primary user profile with vibes
      const { data: profileData } = await supabase
        .from("profiles")
        .select("name, vibes")
        .eq("user_id", user!.id)
        .single();

      // Generate itinerary
      const { data, error } = await supabase.functions.invoke("generate-itinerary", {
        body: {
          wish,
          family_members: members || [],
          primary_user: profileData || null,
        },
      });

      if (error) {
        throw error;
      }

      // Save trip
      const { data: trip, error: tripError } = await supabase
        .from("trips")
        .insert({
          family_id: familyId,
          wish_text: wish,
          itinerary_json: data.itinerary,
        })
        .select()
        .single();

      if (tripError) throw tripError;

      navigate(`/itinerary/${trip.id}`);
    } catch (error: any) {
      console.error("Error generating itinerary:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate itinerary",
        variant: "destructive",
      });
      setState("landing");
    }
  };

  const getIconComponent = (avatarUrl: string) => {
    console.log("Getting icon for:", avatarUrl);
    if (!avatarUrl?.startsWith('icon-')) return null;
    
    const iconMap: Record<string, any> = {
      'icon-user': User,
      'icon-heart': Heart,
      'icon-star': Star,
      'icon-sparkles': Sparkles,
      'icon-smile': Smile,
      'icon-sun': Sun,
      'icon-moon': Moon,
      'icon-cloud': CloudRain,
    };
    
    const IconComponent = iconMap[avatarUrl];
    return IconComponent ? <IconComponent className="h-5 w-5 text-primary" /> : <User className="h-5 w-5" />;
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse-glow">
          <Sparkles className="h-12 w-12 text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Navigation */}
      {user && profile && (
        <nav className="fixed top-0 left-0 right-0 bg-background/80 backdrop-blur-sm border-b z-50">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              WishThread
            </h1>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar>
                    {profile.avatar_url?.startsWith('icon-') ? (
                      <AvatarFallback className="bg-primary/10">
                        {getIconComponent(profile.avatar_url)}
                      </AvatarFallback>
                    ) : (
                      <>
                        <AvatarImage src={profile.avatar_url} />
                        <AvatarFallback>
                          <User className="h-5 w-5" />
                        </AvatarFallback>
                      </>
                    )}
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate("/profile")}>
                  Profile & Family
                </DropdownMenuItem>
                <DropdownMenuItem onClick={signOut}>Sign Out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </nav>
      )}

      {/* Hero Section */}
      {state === "landing" && (
        <div className="relative flex flex-col items-center justify-center min-h-screen px-6">
          <div className="text-center space-y-8 max-w-3xl mx-auto mb-12 animate-fade-in-up">
            <div className="space-y-4">
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
                <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                  WishThread
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground font-light">
                One wish. One perfect Disney trip.
              </p>
            </div>

            <p className="text-base md:text-lg text-foreground/80 max-w-2xl mx-auto leading-relaxed">
              Pull the thread and make one simple wish for your family's trip.
              Watch as it weaves together into a magical day that makes everyone happy.
            </p>
          </div>

          <ThreadAnimation onPull={handleThreadPull} isPulling={false} />

          <p className="text-sm text-muted-foreground mt-8 animate-pulse">
            Pull the thread to begin ✨
          </p>

          {/* Early Access Banner */}
          <div className="absolute bottom-12 left-0 right-0 text-center px-6">
            <div className="inline-block bg-card/80 backdrop-blur-sm border border-border/50 rounded-full px-6 py-3 shadow-lg">
              <p className="text-sm font-medium text-foreground">
                🎁 First 1,000 families get{" "}
                <span className="text-primary font-bold">lifetime free access</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Wish Form */}
      {state === "form" && (
        <div className="flex flex-col items-center justify-center min-h-screen px-6 py-12">
          <WishForm onSubmit={handleWishSubmit} isVisible={true} />
        </div>
      )}

      {/* Processing State */}
      {state === "processing" && (
        <div className="flex flex-col items-center justify-center min-h-screen px-6">
          <div className="text-center space-y-8">
            <div className="relative w-32 h-32 mx-auto">
              <div className="absolute inset-0 animate-thread-explode">
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-full opacity-20 blur-xl" />
              </div>
              <Sparkles className="absolute inset-0 m-auto h-16 w-16 text-primary animate-pulse-glow" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-foreground">Weaving your threads...</h2>
              <p className="text-muted-foreground">Creating the perfect day for your family</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
