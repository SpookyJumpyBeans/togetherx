import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pin, Sparkles } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export interface DbProduct {
  id: string;
  name: string;
  description?: string;
  website_link?: string;
  contact_email?: string;
  created_at?: string;
  screenshot_url?: string;
  logo_url?: string;
  target_audience?: string;
  category?: string;
  tags?: string;
  uses_ai?: boolean;
  tech_highlights?: string;
  users?: string;
  revenue?: string;
  growth_rate?: string;
  partnership?: boolean;
  co_marketing?: boolean;
  white_label?: boolean;
  reseller?: boolean;
  acquisition?: boolean;
}

interface Props {
  product: DbProduct;
  onClick?: () => void;
}

export const DbProductCardWithPin = ({ product, onClick }: Props) => {
  const [isPinned, setIsPinned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      setUser(session.user);
      checkIfPinned(session.user.id);
    }
  };

  const checkIfPinned = async (userId: string) => {
    const { data, error } = await supabase
      .from("pinned_products")
      .select("id")
      .eq("user_id", userId)
      .eq("product_id", product.id)
      .maybeSingle();
    setIsPinned(!!data && !error);
  };

  const togglePin = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      toast.error("Please sign in to pin products");
      return;
    }
    setLoading(true);

    if (isPinned) {
      const { error } = await supabase
        .from("pinned_products")
        .delete()
        .eq("user_id", user.id)
        .eq("product_id", product.id);
      if (error) {
        toast.error("Failed to unpin");
      } else {
        setIsPinned(false);
        toast.success("Product unpinned");
      }
    } else {
      const { error } = await supabase
        .from("pinned_products")
        .insert([{ user_id: user.id, product_id: product.id }]);
      if (error) {
        toast.error("Failed to pin");
      } else {
        setIsPinned(true);
        toast.success("Pinned to your profile");
      }
    }

    setLoading(false);
  };

  return (
    <div className="relative">
      <Card 
        className="group hover:shadow-xl transition-all duration-300 border border-border bg-card overflow-hidden cursor-pointer rounded-xl h-full flex flex-col"
        onClick={onClick}
      >
        <CardContent className="p-0 flex flex-col h-full">
          {/* Product Image */}
          <div className="w-full aspect-[4/3] overflow-hidden bg-muted/10 relative">
            <img
              src={product.screenshot_url || "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop"}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {/* Badges on Image */}
            <div className="absolute top-3 left-3 flex gap-2">
              {product.uses_ai && (
                <div className="bg-background/90 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span className="text-xs font-medium">AI</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="p-5 flex-1 flex flex-col">
            {/* Product Name */}
            <h3 className="font-semibold text-base leading-tight mb-2">
              {product.name}
            </h3>
            
            {/* Description */}
            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed flex-1">
              {product.description || "No description provided"}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Pin Button */}
      {user && (
        <Button
          onClick={togglePin}
          disabled={loading}
          size="sm"
          variant={isPinned ? "default" : "secondary"}
          className="absolute top-3 right-3 rounded-full shadow-lg z-10 h-9 w-9 p-0 bg-background/90 backdrop-blur-sm hover:bg-background"
        >
          <Pin className={`w-4 h-4 ${isPinned ? "fill-current" : ""}`} />
        </Button>
      )}
    </div>
  );
};