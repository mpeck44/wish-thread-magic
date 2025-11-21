import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  Heart,
  DollarSign,
  Calendar,
  Sparkles,
  MapPin,
  Edit,
  Plus,
  Home,
  Settings,
  LogOut,
  User,
  Star,
  Smile,
  Sun,
  Moon,
  CloudRain,
  ArrowRight,
  CalendarPlus,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Dashboard = () => {
  const [profile, setProfile] = useState<any>(null);
  const [familyMembers, setFamilyMembers] = useState<any[]>([]);
  const [tripPreferences, setTripPreferences] = useState<any>(null);
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    loadDashboardData();
  }, [user, navigate]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user!.id)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      // Load family
      const { data: familiesData } = await supabase
        .from("families")
        .select("id")
        .eq("creator_id", profileData.id);

      const familyId = familiesData?.[0]?.id;

      if (familyId) {
        // Load family members
        const { data: membersData } = await supabase
          .from("family_members")
          .select("*")
          .eq("family_id", familyId);

        setFamilyMembers(membersData || []);

        // Load most recent trip preferences from trips table
        const { data: latestTrip } = await supabase
          .from("trips")
          .select("*")
          .eq("family_id", familyId)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (latestTrip) {
          setTripPreferences({
            accommodation_preference: latestTrip.accommodation_preference,
            trip_duration: latestTrip.trip_duration,
            pace_preference: latestTrip.pace_preference,
            budget_level: latestTrip.budget_level,
            theme_days_enabled: latestTrip.theme_days_enabled,
            theme_day_preferences: latestTrip.theme_day_preferences,
          });
        }

        // Load trips
        const { data: tripsData } = await supabase
          .from("trips")
          .select("*")
          .eq("family_id", familyId)
          .order("created_at", { ascending: false })
          .limit(5);

        setTrips(tripsData || []);
      }
    } catch (error: any) {
      console.error("Error loading dashboard:", error);
      toast({
        title: "Error loading dashboard",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getIconComponent = (iconName: string) => {
    const icons: Record<string, any> = {
      "icon-user": User,
      "icon-star": Star,
      "icon-heart": Heart,
      "icon-smile": Smile,
      "icon-sun": Sun,
      "icon-moon": Moon,
      "icon-cloud": CloudRain,
    };
    return icons[iconName] || User;
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Skeleton className="h-12 w-64 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
        </div>
      </div>
    );
  }

  const IconComponent = profile?.avatar_url ? getIconComponent(profile.avatar_url) : User;
  const selectedInterests = profile?.vibes?.filter((v: string) => v && v !== "none") || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <Home className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              My Dashboard
            </h1>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-gradient-to-br from-primary to-secondary">
                    <IconComponent className="h-4 w-4 text-primary-foreground" />
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate("/profile")}>
                <Settings className="mr-2 h-4 w-4" />
                Profile Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome back, {profile?.name}! ✨</h2>
          <p className="text-muted-foreground">Here's your Disney trip planning overview</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                Family
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{familyMembers.length}</div>
              <p className="text-xs text-muted-foreground">Members</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Heart className="h-4 w-4 text-primary" />
                Interests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{selectedInterests.length}</div>
              <p className="text-xs text-muted-foreground">Selected</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Trips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{trips.length}</div>
              <p className="text-xs text-muted-foreground">Itineraries</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                Duration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tripPreferences?.trip_duration || "Not set"}</div>
              <p className="text-xs text-muted-foreground">Days</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Quick Actions
                  </CardTitle>
                  <CardDescription>Plan your next adventure</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                <Button 
                  size="lg"
                  onClick={() => navigate("/trip-planning")}
                  className="h-auto py-4 justify-start"
                >
                  <CalendarPlus className="w-5 h-5 mr-3" />
                  <div className="text-left flex-1">
                    <div className="font-bold">Plan New Trip</div>
                    <div className="text-xs opacity-90">Start planning your next adventure</div>
                  </div>
                  <ArrowRight className="w-4 h-4 opacity-50" />
                </Button>
                
                <Button 
                  size="lg"
                  variant="outline"
                  onClick={() => navigate("/profile-onboarding")}
                  className="h-auto py-4 justify-start"
                >
                  <Settings className="w-5 h-5 mr-3" />
                  <div className="text-left flex-1">
                    <div className="font-bold">Edit Profile</div>
                    <div className="text-xs opacity-90">Update your family & interests</div>
                  </div>
                  <ArrowRight className="w-4 h-4 opacity-50" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Family Members */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Family Members
                  </CardTitle>
                  <CardDescription>Your travel companions</CardDescription>
                </div>
                <Button variant="ghost" size="icon" onClick={() => navigate("/onboarding")}>
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {familyMembers.length > 0 ? (
                <div className="space-y-3">
                  {familyMembers.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-gradient-to-br from-primary to-secondary">
                            {member.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {member.age ? `${member.age} years old` : "Age not set"}
                            {member.energy_level && ` • ${member.energy_level} energy`}
                          </p>
                        </div>
                      </div>
                      {member.special_interests?.length > 0 && (
                        <Badge variant="secondary">{member.special_interests.length} interests</Badge>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No family members added yet</p>
                  <Button onClick={() => navigate("/onboarding")} variant="outline">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Family Members
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Your Interests */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-primary" />
                  Your Disney Interests
                </CardTitle>
                <CardDescription>What you love about Disney</CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={() => navigate("/onboarding")}>
                <Edit className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {selectedInterests.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {selectedInterests.map((interest: string) => {
                  const [name, priority] = interest.split(":");
                  return (
                    <Badge
                      key={interest}
                      variant={priority === "must" ? "default" : "secondary"}
                      className={priority === "must" ? "bg-gradient-to-r from-primary to-secondary" : ""}
                    >
                      {name}
                      {priority === "must" && " ⭐"}
                    </Badge>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No interests selected yet</p>
                <Button onClick={() => navigate("/onboarding")} variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Select Interests
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Past Itineraries */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Your Itineraries
                </CardTitle>
                <CardDescription>Past trip plans</CardDescription>
              </div>
              <Button onClick={() => navigate("/")} variant="outline" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Create New
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {trips.length > 0 ? (
              <div className="space-y-3">
                {trips.map((trip) => (
                  <div
                    key={trip.id}
                    className="flex items-center justify-between p-4 rounded-lg border hover:border-primary/50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/itinerary/${trip.id}`)}
                  >
                    <div className="flex-1">
                      <p className="font-medium mb-1">{trip.wish_text}</p>
                      <p className="text-xs text-muted-foreground">
                        Created {new Date(trip.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No itineraries yet</p>
                <p className="text-sm text-muted-foreground mb-6">
                  Start by making a wish and we'll create your perfect Disney itinerary!
                </p>
                <Button onClick={() => navigate("/")} className="bg-gradient-to-r from-primary via-secondary to-accent">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Make Your First Wish
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;
