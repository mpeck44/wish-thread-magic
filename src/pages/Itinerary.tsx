import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Download, Calendar, ArrowLeft, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Itinerary = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [polling, setPolling] = useState(false);

  useEffect(() => {
    loadTrip();
  }, [id]);

  // Auto-polling when itinerary is not ready
  useEffect(() => {
    if (!trip || trip.itinerary_json) return;

    setPolling(true);
    const interval = setInterval(() => {
      if (import.meta.env.DEV) {
        console.log("Polling for itinerary...");
      }
      loadTrip();
    }, 3000); // Poll every 3 seconds

    return () => {
      clearInterval(interval);
      setPolling(false);
    };
  }, [trip]);

  const loadTrip = async () => {
    try {
      const { data, error } = await supabase
        .from("trips")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      
      setTrip(data);
      
      // If itinerary is ready, stop polling
      if (data.itinerary_json) {
        setPolling(false);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load itinerary",
        variant: "destructive",
      });
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    toast({
      title: "Coming soon!",
      description: "PDF export will be available soon",
    });
  };

  const handleExportCalendar = () => {
    toast({
      title: "Coming soon!",
      description: "Calendar export will be available soon",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse-glow">
          <Sparkles className="h-12 w-12 text-primary" />
        </div>
      </div>
    );
  }

  if (!trip) return null;

  const itinerary = trip.itinerary_json;

  // If no itinerary exists yet, show a message
  if (!itinerary || !itinerary.days || itinerary.days.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-center justify-center px-6">
        <Card className="max-w-2xl w-full p-12 text-center space-y-6">
          <div className="animate-bounce mx-auto">
            <Sparkles className="h-16 w-16 text-primary mx-auto" />
          </div>
          <h1 className="text-3xl font-bold">Creating Your Magical Itinerary!</h1>
          <p className="text-lg text-muted-foreground">
            Our Disney experts are crafting the perfect trip for you. This usually takes 10-30 seconds.
          </p>
          {polling && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
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
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 py-12 px-6">
      <div className="max-w-5xl mx-auto space-y-8 animate-fade-in-up">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => navigate("/")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportCalendar}>
              <Calendar className="mr-2 h-4 w-4" />
              Export Calendar
            </Button>
            <Button
              className="bg-gradient-to-r from-primary via-secondary to-accent"
              onClick={handleExportPDF}
            >
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
          </div>
        </div>

        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Your Magical Itinerary</h1>
          <p className="text-lg text-muted-foreground">{trip.wish_text}</p>
        </div>

        <Tabs defaultValue="day-0" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            {itinerary.days.map((day: any, index: number) => (
              <TabsTrigger key={index} value={`day-${index}`}>
                Day {day.day}
              </TabsTrigger>
            ))}
          </TabsList>

          {itinerary.days.map((day: any, dayIndex: number) => (
            <TabsContent key={dayIndex} value={`day-${dayIndex}`} className="space-y-6">
              <Card className="p-6 bg-gradient-to-br from-card to-card/50 border-primary/20">
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold">{day.park}</h2>
                  <p className="text-muted-foreground">{day.theme}</p>
                </div>
              </Card>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Attractions</h3>
                {day.attractions.map((attraction: any, index: number) => (
                  <Card key={index} className="p-4 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm text-muted-foreground">
                            {attraction.time}
                          </span>
                          <span className="font-semibold">{attraction.name}</span>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant="secondary">{attraction.wait}</Badge>
                          {attraction.for.map((person: string) => (
                            <Badge key={person} variant="outline">
                              {person}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Dining</h3>
                {day.dining.map((meal: any, index: number) => (
                  <Card key={index} className="p-4 bg-secondary/10">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm text-muted-foreground">
                        {meal.time}
                      </span>
                      <div className="flex-1">
                        <div className="font-semibold">{meal.name}</div>
                        <div className="text-sm text-muted-foreground">{meal.type}</div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {day.rest && (
                <Card className="p-4 bg-accent/10 border-accent/20">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm text-muted-foreground">
                      {day.rest.time}
                    </span>
                    <div>
                      <div className="font-semibold">Rest & Relax</div>
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
          <Button
            size="lg"
            className="bg-gradient-to-r from-primary via-secondary to-accent"
            onClick={() => navigate("/")}
          >
            <Sparkles className="mr-2 h-5 w-5" />
            Create Another Trip
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Itinerary;
