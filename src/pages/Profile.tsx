import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, User, Clock, Camera, Heart, Star, Sparkles, Smile, Sun, Moon, CloudRain } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { AvatarPicker } from "@/components/onboarding/AvatarPicker";

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [family, setFamily] = useState<any>(null);
  const [familyMembers, setFamilyMembers] = useState<any[]>([]);
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingAvatar, setEditingAvatar] = useState(false);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      // Load profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user!.id)
        .single();

      setProfile(profileData);

      // Load family
      const { data: familyData } = await supabase
        .from("families")
        .select("*")
        .eq("creator_id", profileData?.id)
        .limit(1)
        .single();

      setFamily(familyData);

      if (familyData) {
        // Load family members
        const { data: membersData } = await supabase
          .from("family_members")
          .select("*")
          .eq("family_id", familyData.id);

        setFamilyMembers(membersData || []);

        // Load trips
        const { data: tripsData } = await supabase
          .from("trips")
          .select("*")
          .eq("family_id", familyData.id)
          .order("created_at", { ascending: false });

        setTrips(tripsData || []);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async (newAvatarUrl: string) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ avatar_url: newAvatarUrl })
        .eq("user_id", user!.id);

      if (error) throw error;

      setProfile({ ...profile, avatar_url: newAvatarUrl });
      setEditingAvatar(false);
      toast({
        title: "Success",
        description: "Profile picture updated",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update profile picture",
        variant: "destructive",
      });
    }
  };

  const getIconComponent = (avatarUrl: string) => {
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
    return IconComponent ? <IconComponent className="h-12 w-12 text-primary" /> : <User className="h-12 w-12" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 py-12 px-6">
      <div className="max-w-5xl mx-auto space-y-8">
        <Button variant="ghost" onClick={() => navigate("/")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="text-center space-y-4">
          <div className="relative inline-block">
            <Avatar className="w-24 h-24 mx-auto">
              {profile?.avatar_url?.startsWith('icon-') ? (
                <AvatarFallback className="bg-primary/10">
                  {getIconComponent(profile.avatar_url)}
                </AvatarFallback>
              ) : (
                <>
                  <AvatarImage src={profile?.avatar_url} />
                  <AvatarFallback>
                    <User className="h-12 w-12" />
                  </AvatarFallback>
                </>
              )}
            </Avatar>
            <Button
              size="sm"
              variant="secondary"
              className="absolute bottom-0 right-0 rounded-full w-8 h-8 p-0"
              onClick={() => setEditingAvatar(!editingAvatar)}
            >
              <Camera className="h-4 w-4" />
            </Button>
          </div>
          
          {editingAvatar && (
            <Card className="p-6 max-w-md mx-auto">
              <AvatarPicker 
                value={profile?.avatar_url || ''} 
                onChange={handleAvatarChange}
              />
            </Card>
          )}
          
          <div>
            <h1 className="text-3xl font-bold">{profile?.name}</h1>
            <p className="text-muted-foreground capitalize">{profile?.family_role}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Family Members</h2>
              <Button size="sm" variant="outline" onClick={() => navigate("/onboarding")}>
                <Plus className="mr-2 h-4 w-4" />
                Add
              </Button>
            </div>
            {familyMembers.length > 0 ? (
              <div className="space-y-3">
                {familyMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                  >
                    <div>
                      <div className="font-medium">{member.name}</div>
                      {member.age && (
                        <div className="text-sm text-muted-foreground">Age {member.age}</div>
                      )}
                    </div>
                    {member.vibes.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {member.vibes.slice(0, 2).map((vibe: string) => (
                          <Badge key={vibe} variant="secondary" className="text-xs">
                            {vibe}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                No family members added yet
              </p>
            )}
          </Card>

          <Card className="p-6 space-y-4">
            <h2 className="text-xl font-semibold">Past Trips</h2>
            {trips.length > 0 ? (
              <div className="space-y-3">
                {trips.map((trip) => (
                  <button
                    key={trip.id}
                    onClick={() => navigate(`/itinerary/${trip.id}`)}
                    className="w-full text-left p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="font-medium line-clamp-1">{trip.wish_text}</div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {format(new Date(trip.created_at), "MMM d, yyyy")}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                No trips created yet
              </p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
