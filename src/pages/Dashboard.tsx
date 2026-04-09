import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import FamilyMemberEditor from "@/components/dashboard/FamilyMemberEditor";
import {
  Users,
  Heart,
  Compass,
  Calendar,
  Sparkles,
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
  Wand2,
  Ticket,
  MapPin,
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
  const [familyId, setFamilyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [editorOpen, setEditorOpen] = useState(false);
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
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user!.id)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      const { data: familiesData } = await supabase
        .from("families")
        .select("id")
        .eq("creator_id", profileData.id);

      const familyId = familiesData?.[0]?.id;
      setFamilyId(familyId || null);

      if (familyId) {
        const { data: membersData } = await supabase
          .from("family_members")
          .select("*")
          .eq("family_id", familyId);
        setFamilyMembers(membersData || []);

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

        const { data: tripsData } = await supabase
          .from("trips")
          .select("*")
          .eq("family_id", familyId)
          .order("created_at", { ascending: false })
          .limit(5);
        setTrips(tripsData || []);
      }
    } catch (error: any) {
      if (import.meta.env.DEV) {
        console.error("Error loading dashboard:", error);
      }
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
      <div className="min-h-screen bg-[var(--gradient-hero)] sparkle-bg">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Skeleton className="h-14 w-80 mb-4 rounded-lg bg-muted/30" />
          <Skeleton className="h-6 w-60 mb-8 rounded-md bg-muted/30" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <Skeleton className="h-36 rounded-lg bg-muted/30" />
            <Skeleton className="h-36 rounded-lg bg-muted/30" />
            <Skeleton className="h-36 rounded-lg bg-muted/30" />
            <Skeleton className="h-36 rounded-lg bg-muted/30" />
          </div>
        </div>
      </div>
    );
  }

  const IconComponent = profile?.avatar_url ? getIconComponent(profile.avatar_url) : User;
  const selectedInterests = profile?.vibes?.filter((v: string) => v && v !== "none") || [];

  const statCards = [
    { icon: Users, label: "Family", value: familyMembers.length, sub: "Members", color: "from-primary/20 to-primary/5" },
    { icon: Heart, label: "Interests", value: selectedInterests.length, sub: "Selected", color: "from-secondary/20 to-secondary/5" },
    { icon: Sparkles, label: "Trips", value: trips.length, sub: "Itineraries", color: "from-accent/20 to-accent/5" },
    { icon: Calendar, label: "Duration", value: tripPreferences?.trip_duration || "—", sub: "Days", color: "from-primary/20 to-secondary/5" },
  ];

  return (
    <div className="min-h-screen bg-[var(--gradient-hero)]">
      {/* Header */}
      <header className="border-b border-border/50 glass-card-light sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="hover:bg-primary/10">
              <Home className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-heading font-bold text-gradient-magic">
              My Dashboard
            </h1>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-9 w-9 ring-2 ring-primary/20">
                  <AvatarFallback className="bg-gradient-to-br from-primary to-secondary">
                    <IconComponent className="h-4 w-4 text-primary-foreground" />
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 glass-card border-border/50">
              <DropdownMenuItem onClick={() => navigate("/profile")} className="gap-2 cursor-pointer">
                <Settings className="h-4 w-4" />
                Profile Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleSignOut} className="gap-2 cursor-pointer">
                <LogOut className="h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-10">
        {/* Hero Welcome Section */}
        <div className="mb-10 relative">
          <div className="sparkle-bg rounded-2xl p-8 glass-card border-primary/10">
            {/* Golden ambient glow */}
            <div className="absolute -top-8 right-16 w-40 h-40 bg-[hsl(var(--gold)/0.08)] rounded-full blur-3xl pointer-events-none" />
            <div className="flex items-center gap-4 mb-3 relative">
              <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-secondary shadow-glow-purple">
                <Wand2 className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-3xl font-heading font-bold animate-slide-fade-in">
                  Welcome back, {profile?.name}! ✨
                </h2>
                <p className="text-muted-foreground mt-1">Ready to plan your next magical getaway?</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {statCards.map((stat, index) => {
            const StatIcon = stat.icon;
            return (
              <Card key={stat.label} className="group hover-lift overflow-hidden animate-fade-in-up" style={{ animationDelay: `${index * 75}ms`, animationFillMode: 'backwards' }}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2.5">
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.color} group-hover:shadow-md transition-shadow`}>
                      <StatIcon className="h-4 w-4 text-primary" />
                    </div>
                    {stat.label}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-heading font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground mt-0.5">{stat.sub}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
          {/* Quick Actions */}
          <Card className="overflow-hidden">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2.5">
                    <Compass className="h-5 w-5 text-primary" />
                    Quick Actions
                  </CardTitle>
                  <CardDescription>Plan your next adventure</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                size="lg"
                variant="teal"
                onClick={() => navigate("/trip-planning")}
                className="w-full h-auto py-5 justify-start"
              >
                <CalendarPlus className="w-5 h-5 mr-3" />
                <div className="text-left flex-1">
                  <div className="font-bold font-heading">Plan New Trip</div>
                  <div className="text-xs opacity-90">Start planning your next adventure</div>
                </div>
                <ArrowRight className="w-4 h-4 opacity-60" />
              </Button>

              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("/profile-onboarding")}
                className="w-full h-auto py-5 justify-start"
              >
                <Settings className="w-5 h-5 mr-3 text-muted-foreground" />
                <div className="text-left flex-1">
                  <div className="font-bold font-heading">Edit Profile</div>
                  <div className="text-xs text-muted-foreground">Update your family & interests</div>
                </div>
                <ArrowRight className="w-4 h-4 opacity-40" />
              </Button>
            </CardContent>
          </Card>

          {/* Family Members */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2.5">
                    <Users className="h-5 w-5 text-primary" />
                    Family Members
                  </CardTitle>
                  <CardDescription>Your travel companions</CardDescription>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setEditorOpen(true)} className="hover:bg-primary/10">
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {familyMembers.length > 0 ? (
                <div className="space-y-3">
                  {familyMembers.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-4 rounded-lg glass-card-light hover:shadow-md transition-all duration-200 group"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 ring-2 ring-primary/10 group-hover:ring-primary/30 transition-all">
                          <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground font-heading">
                            {member.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium font-heading">{member.name}</p>
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
                <div className="text-center py-10 sparkle-bg rounded-lg">
                  <Users className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                  <p className="text-muted-foreground mb-4">No family members added yet</p>
                  <Button onClick={() => setEditorOpen(true)} variant="outline">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Family Members
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Your Interests */}
        <Card className="mb-10">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2.5">
                  <Heart className="h-5 w-5 text-primary" />
                  Your Interests
                </CardTitle>
                <CardDescription>What you love most</CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={() => navigate("/profile-onboarding?mode=edit")} className="hover:bg-primary/10">
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
                      variant={priority === "must" ? "premium" : "secondary"}
                      className="px-4 py-1.5 text-sm"
                    >
                      {priority === "must" && <Star className="w-3 h-3 mr-1" />}
                      {name}
                    </Badge>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-10 sparkle-bg rounded-lg">
                <Heart className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-muted-foreground mb-4">No interests selected yet</p>
                <Button onClick={() => navigate("/profile-onboarding?mode=edit")} variant="outline">
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
                <CardTitle className="flex items-center gap-2.5">
                  <Ticket className="h-5 w-5 text-primary" />
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
                    className="flex items-center justify-between p-5 rounded-lg glass-card-light hover:border-primary/40 hover:shadow-md transition-all duration-200 cursor-pointer group"
                    onClick={() => navigate(`/itinerary/${trip.id}`)}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="p-2.5 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 group-hover:from-primary/20 group-hover:to-accent/20 transition-colors">
                        <MapPin className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium font-heading mb-1">{trip.wish_text}</p>
                        <div className="flex items-center gap-2">
                          {trip.budget_level && (
                            <Badge variant="secondary" className="text-xs">{trip.budget_level}</Badge>
                          )}
                          {trip.trip_duration && (
                            <span className="text-xs text-muted-foreground">
                              {trip.trip_duration} days
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 sparkle-bg rounded-lg">
                <Ticket className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-muted-foreground mb-4">No itineraries yet</p>
                <Button onClick={() => navigate("/trip-planning")} variant="teal">
                  <CalendarPlus className="mr-2 h-4 w-4" />
                  Plan Your First Trip
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {familyId && (
        <FamilyMemberEditor
          familyId={familyId}
          open={editorOpen}
          onOpenChange={setEditorOpen}
          onSaved={loadDashboardData}
        />
      )}
    </div>
  );
};

export default Dashboard;
