import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Download, Calendar, ArrowLeft, Sparkles, Clock, Utensils, Coffee } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { MagicalLoader } from "@/components/ui/magical-loader";

const Itinerary = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [polling, setPolling] = useState(false);

  useEffect(() => { loadTrip(); }, [id]);

  useEffect(() => {
    if (!trip || trip.itinerary_json) return;
    setPolling(true);
    const interval = setInterval(() => { loadTrip(); }, 3000);
    return () => { clearInterval(interval); setPolling(false); };
  }, [trip]);

  const loadTrip = async () => {
    try {
      const { data, error } = await supabase.from("trips").select("*").eq("id", id).single();
      if (error) throw error;
      setTrip(data);
      if (data.itinerary_json) setPolling(false);
    } catch (error: any) {
      toast({ title: "Error", description: "Failed to load itinerary", variant: "destructive" });
      navigate("/");
    } finally { setLoading(false); }
  };

  const handleExportPDF = () => {
    toast({ title: "Coming soon!", description: "PDF export will be available soon" });
  };

  const handleExportCalendar = () => {
    toast({ title: "Coming soon!", description: "Calendar export will be available soon" });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--gradient-hero)] flex items-center justify-center">
        <MagicalLoader message="Loading your itinerary..." />
      </div>
    );
  }

  if (!trip) return null;
  const itinerary = trip.itinerary_json;

  if (!itinerary || !itinerary.days || itinerary.days.length === 0) {
    return (
      <div className="min-h-screen bg-[var(--gradient-hero)] sparkle-bg flex items-center justify-center px-6">
        <Card className="max-w-2xl w-full p-12 text-center space-y-6">
          <MagicalLoader
            message="Creating Your Magical Itinerary!"
            submessage="Our experts are crafting the perfect trip for you. This usually takes 10-30 seconds."
          />
          {polling && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-teal"></div>
              <span>Checking for updates...</span>
            </div>
          )}
          <div className="pt-4">
            <Button variant="ghost" onClick={() => navigate("/")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--gradient-hero)] py-12 px-6">
      <div className="max-w-5xl mx-auto space-y-8 animate-fade-in-up">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate("/")} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportCalendar} className="gap-2">
              <Calendar className="h-4 w-4" />
              Export Calendar
            </Button>
            <Button variant="teal" onClick={handleExportPDF} className="gap-2">
              <Download className="h-4 w-4" />
              Download PDF
            </Button>
          </div>
        </div>

        <div className="text-center space-y-4">
          <h1 className="text-4xl font-heading font-bold text-gradient-magic">Your Magical Itinerary</h1>
          <p className="text-lg text-muted-foreground">{trip.wish_text}</p>
        </div>

        <Tabs defaultValue="day-0" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 h-12 glass-card-light">
            {itinerary.days.map((day: any, index: number) => (
              <TabsTrigger key={index} value={`day-${index}`} className="text-sm font-heading">
                Day {day.day}
              </TabsTrigger>
            ))}
          </TabsList>

          {itinerary.days.map((day: any, dayIndex: number) => (
            <TabsContent key={dayIndex} value={`day-${dayIndex}`} className="space-y-6">
              <Card className="p-7" variant="glass">
                <div className="space-y-2">
                  <h2 className="text-2xl font-heading font-bold">{day.park}</h2>
                  <p className="text-muted-foreground">{day.theme}</p>
                </div>
              </Card>

              <div className="space-y-4">
                <h3 className="text-xl font-heading font-semibold flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Attractions
                </h3>
                {day.attractions.map((attraction: any, index: number) => (
                  <Card key={index} className="p-5 hover:scale-[1.01] transition-all" variant="glass-light">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Clock className="w-3.5 h-3.5" />
                            <span className="font-mono text-sm">{attraction.time}</span>
                          </div>
                          <span className="font-heading font-semibold">{attraction.name}</span>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          <Badge variant="secondary">{attraction.wait}</Badge>
                          {attraction.for.map((person: string) => (
                            <Badge key={person} variant="outline">{person}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-heading font-semibold flex items-center gap-2">
                  <Utensils className="w-5 h-5 text-accent" />
                  Dining
                </h3>
                {day.dining.map((meal: any, index: number) => (
                  <Card key={index} className="p-5 border-accent/20" variant="glass-light">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Clock className="w-3.5 h-3.5" />
                        <span className="font-mono text-sm">{meal.time}</span>
                      </div>
                      <div className="flex-1">
                        <div className="font-heading font-semibold">{meal.name}</div>
                        <div className="text-sm text-muted-foreground">{meal.type}</div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {day.rest && (
                <Card className="p-5 border-secondary/20" variant="glass-light">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Coffee className="w-3.5 h-3.5" />
                      <span className="font-mono text-sm">{day.rest.time}</span>
                    </div>
                    <div>
                      <div className="font-heading font-semibold">Rest & Relax</div>
                      <div className="text-sm text-muted-foreground">
                        {day.rest.location} ({day.rest.duration})
                      </div>
                    </div>
                  </div>
                </Card>
              )}
            </TabsContent>
          ))}
        </Tabs>

        <div className="text-center pt-8">
          <Button size="lg" variant="teal" onClick={() => navigate("/")}>
            <Sparkles className="mr-2 h-5 w-5" />
            Create Another Trip
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Itinerary;
