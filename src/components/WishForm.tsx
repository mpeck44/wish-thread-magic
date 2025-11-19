import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles } from "lucide-react";

interface WishFormProps {
  onSubmit: (wish: string) => void;
  isVisible: boolean;
}

export const WishForm = ({ onSubmit, isVisible }: WishFormProps) => {
  const [wish, setWish] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (wish.trim()) {
      onSubmit(wish);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="w-full max-w-2xl mx-auto animate-fade-in-up">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="text-center space-y-3 mb-8">
          <h2 className="text-2xl font-semibold text-foreground">
            Make one wish for your trip
          </h2>
          <p className="text-muted-foreground">
            Tell us about your family and what would make everyone happy
          </p>
        </div>

        <Textarea
          value={wish}
          onChange={(e) => setWish(e.target.value)}
          placeholder="Mom wants princesses, Dad wants Star Wars, the kids want rides that go fast, and Grandma just wants to sit and people-watch..."
          className="min-h-[120px] text-base bg-card border-border resize-none focus:ring-2 focus:ring-primary/20 transition-all"
        />

        <Button
          type="submit"
          size="lg"
          className="w-full bg-gradient-to-r from-primary via-secondary to-accent text-primary-foreground font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
          disabled={!wish.trim()}
        >
          <Sparkles className="mr-2 h-5 w-5" />
          Pull the Thread
        </Button>
      </form>
    </div>
  );
};
