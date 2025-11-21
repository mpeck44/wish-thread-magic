import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { User, Heart, Star, Sparkles, Camera, Smile, Sun, Moon, CloudRain, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const ICON_OPTIONS = [
  { icon: User, name: "user", color: "hsl(var(--primary))" },
  { icon: Heart, name: "heart", color: "hsl(var(--secondary))" },
  { icon: Star, name: "star", color: "hsl(var(--accent))" },
  { icon: Sparkles, name: "sparkles", color: "hsl(var(--primary))" },
  { icon: Smile, name: "smile", color: "hsl(var(--secondary))" },
  { icon: Sun, name: "sun", color: "hsl(var(--accent))" },
  { icon: Moon, name: "moon", color: "hsl(var(--primary))" },
  { icon: CloudRain, name: "cloud", color: "hsl(var(--secondary))" },
];

interface AvatarPickerProps {
  value: string;
  onChange: (url: string) => void;
}

export function AvatarPicker({ value, onChange }: AvatarPickerProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      const file = event.target.files?.[0];
      if (!file) return;

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file",
          description: "Please upload an image file",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload an image smaller than 2MB",
          variant: "destructive",
        });
        return;
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${user!.id}-${Math.random()}.${fileExt}`;

      const { error: uploadError, data } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      onChange(publicUrl);
      toast({
        title: "Success",
        description: "Profile picture uploaded successfully",
      });
    } catch (error: any) {
      console.error("Error uploading file:", error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 sm:grid-cols-5 gap-4">
        {ICON_OPTIONS.map(({ icon: Icon, name, color }) => {
          const iconUrl = `icon-${name}`;
          const isSelected = value === iconUrl;

          return (
            <button
              key={name}
              type="button"
              onClick={() => onChange(iconUrl)}
              className={`relative rounded-full p-4 transition-all border-2 ${
                isSelected
                  ? "ring-4 ring-primary scale-110 border-primary bg-primary/10"
                  : "hover:scale-105 border-border/50 hover:border-primary/50"
              }`}
            >
              <Icon className="w-8 h-8" style={{ color }} />
            </button>
          );
        })}
        
        {/* Custom Upload Button */}
        <label
          className={`relative rounded-full p-4 transition-all border-2 cursor-pointer ${
            value.startsWith('http')
              ? "ring-4 ring-primary scale-110 border-primary bg-primary/10"
              : "hover:scale-105 border-border/50 hover:border-primary/50"
          } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
            disabled={uploading}
          />
          {value.startsWith('http') && !value.includes('dicebear') ? (
            <Avatar className="w-8 h-8">
              <AvatarImage src={value} />
              <AvatarFallback><Camera className="w-4 h-4" /></AvatarFallback>
            </Avatar>
          ) : (
            <Upload className="w-8 h-8 text-muted-foreground" />
          )}
        </label>
      </div>
      
      <p className="text-sm text-muted-foreground text-center">
        Choose an icon or upload your own picture (max 2MB)
      </p>
    </div>
  );
}
