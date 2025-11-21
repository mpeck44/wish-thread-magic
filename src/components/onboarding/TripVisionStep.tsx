import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ArrowLeft, ArrowRight, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";

interface TripVisionStepProps {
  tripDuration: number;
  dateRange?: DateRange;
  pacePreference: string;
  specialOccasions: string[];
  mustDoExperiences: string;
  onTripDurationChange: (duration: number) => void;
  onDateRangeChange: (range?: DateRange) => void;
  onPaceChange: (pace: string) => void;
  onSpecialOccasionsChange: (occasions: string[]) => void;
  onMustDoChange: (experiences: string) => void;
  onBack: () => void;
  onNext: () => void;
}

export function TripVisionStep({
  tripDuration,
  dateRange,
  pacePreference,
  specialOccasions,
  mustDoExperiences,
  onTripDurationChange,
  onDateRangeChange,
  onPaceChange,
  onSpecialOccasionsChange,
  onMustDoChange,
  onBack,
  onNext,
}: TripVisionStepProps) {
  const SPECIAL_OCCASIONS = [
    "Birthday",
    "Anniversary",
    "First Visit",
    "Honeymoon",
    "Family Reunion",
    "Graduation",
    "Retirement",
  ];

  const toggleOccasion = (occasion: string) => {
    if (specialOccasions.includes(occasion)) {
      onSpecialOccasionsChange(specialOccasions.filter((o) => o !== occasion));
    } else {
      onSpecialOccasionsChange([...specialOccasions, occasion]);
    }
  };

  const paceLabels: Record<string, string> = {
    relaxed: "Relaxed",
    moderate: "Moderate",
    intense: "Intense",
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
          Your Dream Disney Trip
        </h2>
        <p className="text-muted-foreground">
          Tell us about your perfect vacation
        </p>
      </div>

      {/* Trip Duration */}
      <Card className="p-6 space-y-4">
        <Label>How many days will you be at Disney? ({tripDuration} days)</Label>
        <Slider
          value={[tripDuration]}
          onValueChange={(value) => onTripDurationChange(value[0])}
          min={1}
          max={14}
          step={1}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>1 day</span>
          <span>14 days</span>
        </div>
      </Card>

      {/* Date Range */}
      <Card className="p-6 space-y-4">
        <Label>Do you have dates in mind? (Optional)</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !dateRange && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange?.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, "LLL dd, y")} -{" "}
                    {format(dateRange.to, "LLL dd, y")}
                  </>
                ) : (
                  format(dateRange.from, "LLL dd, y")
                )
              ) : (
                <span>Pick a date range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange?.from}
              selected={dateRange}
              onSelect={onDateRangeChange}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
      </Card>

      {/* Pace Preference */}
      <Card className="p-6 space-y-4">
        <Label>What's your preferred pace?</Label>
        <div className="grid grid-cols-3 gap-3">
          {Object.entries(paceLabels).map(([value, label]) => (
            <Button
              key={value}
              variant={pacePreference === value ? "default" : "outline"}
              onClick={() => onPaceChange(value)}
              className="h-auto py-4 flex flex-col gap-2"
            >
              <span className="font-semibold">{label}</span>
              <span className="text-xs opacity-80">
                {value === "relaxed" && "Take it easy"}
                {value === "moderate" && "Balanced fun"}
                {value === "intense" && "Do it all!"}
              </span>
            </Button>
          ))}
        </div>
      </Card>

      {/* Special Occasions */}
      <Card className="p-6 space-y-4">
        <Label>Any special occasions?</Label>
        <div className="flex flex-wrap gap-2">
          {SPECIAL_OCCASIONS.map((occasion) => (
            <Badge
              key={occasion}
              variant={specialOccasions.includes(occasion) ? "default" : "outline"}
              className="cursor-pointer hover:scale-105 transition-transform"
              onClick={() => toggleOccasion(occasion)}
            >
              {occasion}
            </Badge>
          ))}
        </div>
      </Card>

      {/* Must-Do Experiences */}
      <Card className="p-6 space-y-4">
        <Label htmlFor="mustdo">What are your must-do experiences?</Label>
        <Textarea
          id="mustdo"
          value={mustDoExperiences}
          onChange={(e) => onMustDoChange(e.target.value)}
          placeholder="E.g., Meet Mickey, ride Space Mountain, watch the fireworks..."
          className="min-h-[100px]"
        />
      </Card>

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onBack} size="lg">
          <ArrowLeft className="mr-2 h-5 w-5" />
          Back
        </Button>
        <Button onClick={onNext} size="lg">
          Continue
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
