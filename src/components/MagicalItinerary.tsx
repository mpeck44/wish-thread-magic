import { motion } from "framer-motion";
import { Clock, MapPin, Users, Sparkles, Star } from "lucide-react";
import { Card } from "@/components/ui/card";

interface ItineraryItem {
  time: string;
  activity: string;
  location: string;
  who: string;
  description: string;
  icon: "princess" | "starwars" | "rides" | "relax";
}

const mockItinerary: ItineraryItem[] = [
  {
    time: "8:30 AM",
    activity: "Royal Breakfast",
    location: "Cinderella's Royal Table",
    who: "Mom & Kids",
    description: "Anna and Elsa meet & greet while enjoying a magical breakfast",
    icon: "princess",
  },
  {
    time: "10:00 AM",
    activity: "Rise of the Resistance",
    location: "Galaxy's Edge",
    who: "Dad's Choice",
    description: "Lightning Lane reserved - perfect timing, minimal wait",
    icon: "starwars",
  },
  {
    time: "12:30 PM",
    activity: "Fast & Fun",
    location: "Tomorrowland",
    who: "The Kids",
    description: "Space Mountain, Buzz Lightyear - back to back thrills",
    icon: "rides",
  },
  {
    time: "2:00 PM",
    activity: "Grandma's Oasis",
    location: "Hidden Garden Spot",
    who: "Whole Family",
    description: "Rocking chairs, Dole Whip, and the best people-watching spot",
    icon: "relax",
  },
  {
    time: "4:00 PM",
    activity: "Hidden Mickey Hunt",
    location: "Park-wide Adventure",
    who: "Kids Lead",
    description: "Scavenger hunt that secretly guides everyone to the next ride",
    icon: "rides",
  },
];

const getIconColor = (icon: string) => {
  switch (icon) {
    case "princess":
      return "text-accent";
    case "starwars":
      return "text-primary";
    case "rides":
      return "text-secondary";
    default:
      return "text-muted-foreground";
  }
};

const getIcon = (iconType: string) => {
  switch (iconType) {
    case "relax":
      return <Star className="h-5 w-5" />;
    default:
      return <Sparkles className="h-5 w-5" />;
  }
};

export const MagicalItinerary = () => {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-center space-y-3 mb-12"
      >
        <h2 className="text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
          Your Perfect Day
        </h2>
        <p className="text-lg text-muted-foreground">
          Woven together from every wish in your family
        </p>
      </motion.div>

      <div className="space-y-4">
        {mockItinerary.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + index * 0.1 }}
          >
            <Card className="p-6 hover:shadow-xl transition-all duration-300 border-border/50 bg-card/80 backdrop-blur-sm">
              <div className="flex gap-6">
                <div className="flex flex-col items-center min-w-[80px]">
                  <div className={`${getIconColor(item.icon)} mb-2`}>
                    {getIcon(item.icon)}
                  </div>
                  <div className="text-sm font-semibold text-foreground">{item.time}</div>
                </div>

                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between">
                    <h3 className="text-xl font-semibold text-foreground">{item.activity}</h3>
                    <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-medium">
                      {item.who}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {item.location}
                    </div>
                  </div>

                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="text-center pt-8"
      >
        <p className="text-sm text-muted-foreground italic">
          ✨ This plan makes everyone happy - no compromises, just magic ✨
        </p>
      </motion.div>
    </div>
  );
};
