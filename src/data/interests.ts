import {
  Zap,
  Ghost,
  Waves,
  Loader,
  Home,
  Crown,
  Swords,
  Shield,
  Sparkles,
  Drama,
  Music,
  Flame,
  PartyPopper,
  Camera,
  TreePine,
  Building,
  Eye,
  ShoppingBag,
  UtensilsCrossed,
  Coffee,
  ChefHat,
  Globe,
  Cookie,
  Clock,
  Moon,
  Sun,
  Sunrise,
  Route,
  LucideIcon,
} from "lucide-react";

export interface Interest {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  category: string;
}

export const INTEREST_CATEGORIES = [
  { id: "rides", label: "Rides & Thrills", emoji: "🎢" },
  { id: "characters", label: "Characters & Magic", emoji: "✨" },
  { id: "entertainment", label: "Shows & Entertainment", emoji: "🎭" },
  { id: "experiences", label: "Special Experiences", emoji: "🎪" },
  { id: "atmosphere", label: "Atmosphere & Vibes", emoji: "📸" },
  { id: "dining", label: "Food & Dining", emoji: "🍽️" },
  { id: "pace", label: "Your Style", emoji: "⏰" },
];

export const ALL_INTERESTS: Interest[] = [
  // Rides & Thrills
  { id: "rollercoasters", label: "Roller Coasters", description: "Fast, thrilling rides", icon: Zap, category: "rides" },
  { id: "darkrides", label: "Dark Rides", description: "Indoor story experiences", icon: Ghost, category: "rides" },
  { id: "waterrides", label: "Water Rides", description: "Splashy fun", icon: Waves, category: "rides" },
  { id: "spinning", label: "Spinning Rides", description: "Teacups and more", icon: Loader, category: "rides" },
  { id: "gentle", label: "Gentle Rides", description: "Calm and relaxing", icon: Home, category: "rides" },

  // Characters & Magic
  { id: "princesses", label: "Princesses", description: "Royal encounters", icon: Crown, category: "characters" },
  { id: "starwars", label: "Star Wars", description: "Galaxy far, far away", icon: Swords, category: "characters" },
  { id: "marvel", label: "Marvel Heroes", description: "Super hero adventures", icon: Shield, category: "characters" },
  { id: "pixar", label: "Pixar Pals", description: "Animated favorites", icon: Sparkles, category: "characters" },
  { id: "classic", label: "Classic Disney", description: "Mickey, Minnie & friends", icon: Sparkles, category: "characters" },
  { id: "villains", label: "Villains", description: "The darker side", icon: Drama, category: "characters" },

  // Entertainment
  { id: "shows", label: "Stage Shows", description: "Live performances", icon: Drama, category: "entertainment" },
  { id: "parades", label: "Parades", description: "Street spectaculars", icon: PartyPopper, category: "entertainment" },
  { id: "fireworks", label: "Fireworks", description: "Nighttime magic", icon: Flame, category: "entertainment" },
  { id: "streetperformers", label: "Street Performers", description: "Spontaneous encounters", icon: Music, category: "entertainment" },
  { id: "livemusic", label: "Live Music", description: "Bands and musicians", icon: Music, category: "entertainment" },

  // Experiences
  { id: "characterdining", label: "Character Dining", description: "Meals with characters", icon: UtensilsCrossed, category: "experiences" },
  { id: "meetgreets", label: "Meet & Greets", description: "Photo opportunities", icon: Camera, category: "experiences" },
  { id: "tours", label: "Behind-the-Scenes", description: "Special tours", icon: Eye, category: "experiences" },
  { id: "seasonal", label: "Seasonal Events", description: "Holidays & festivals", icon: PartyPopper, category: "experiences" },

  // Atmosphere
  { id: "photography", label: "Photography", description: "Perfect photo spots", icon: Camera, category: "atmosphere" },
  { id: "architecture", label: "Architecture", description: "Beautiful buildings", icon: Building, category: "atmosphere" },
  { id: "gardens", label: "Gardens & Nature", description: "Peaceful landscapes", icon: TreePine, category: "atmosphere" },
  { id: "peoplewatching", label: "People Watching", description: "Relaxed observation", icon: Eye, category: "atmosphere" },
  { id: "shopping", label: "Shopping", description: "Unique merchandise", icon: ShoppingBag, category: "atmosphere" },

  // Dining
  { id: "finedining", label: "Fine Dining", description: "Signature restaurants", icon: ChefHat, category: "dining" },
  { id: "quickservice", label: "Quick Service", description: "Fast & convenient", icon: Coffee, category: "dining" },
  { id: "international", label: "World Cuisine", description: "Global flavors", icon: Globe, category: "dining" },
  { id: "snacks", label: "Snacks & Treats", description: "Sweet indulgences", icon: Cookie, category: "dining" },

  // Pace & Style
  { id: "earlybird", label: "Early Bird", description: "First one there", icon: Sunrise, category: "pace" },
  { id: "nightowl", label: "Night Owl", description: "Stay til close", icon: Moon, category: "pace" },
  { id: "ropedrop", label: "Rope Drop", description: "Maximum efficiency", icon: Clock, category: "pace" },
  { id: "middaybreak", label: "Midday Break", description: "Pool & nap time", icon: Sun, category: "pace" },
  { id: "parkhopper", label: "Park Hopper", description: "Visit multiple parks", icon: Route, category: "pace" },
];
