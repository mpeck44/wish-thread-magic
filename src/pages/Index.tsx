import { useState } from "react";
import { ThreadAnimation } from "@/components/ThreadAnimation";
import { WishForm } from "@/components/WishForm";
import { MagicalItinerary } from "@/components/MagicalItinerary";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

type AppState = "landing" | "form" | "processing" | "itinerary";

const Index = () => {
  const [state, setState] = useState<AppState>("landing");
  const [userWish, setUserWish] = useState("");

  const handleThreadPull = () => {
    setState("form");
  };

  const handleWishSubmit = (wish: string) => {
    setUserWish(wish);
    setState("processing");
    // Simulate processing time
    setTimeout(() => {
      setState("itinerary");
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
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
              {/* Animated threads weaving */}
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

      {/* Itinerary Display */}
      {state === "itinerary" && (
        <div className="px-6 py-12 min-h-screen">
          <MagicalItinerary />

          <div className="max-w-4xl mx-auto mt-12 text-center">
            <Button
              size="lg"
              className="bg-gradient-to-r from-primary via-secondary to-accent text-primary-foreground font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Save My Perfect Day
            </Button>
            <p className="text-sm text-muted-foreground mt-4">
              Join the waitlist for early access and get lifetime free planning
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
