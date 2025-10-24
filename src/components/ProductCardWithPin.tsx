import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, Pin, Users, Activity } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Product } from "./ProductCard";

interface ProductCardWithPinProps {
  product: Product;
  onClick?: () => void;
}

export const ProductCardWithPin = ({ product, onClick }: ProductCardWithPinProps) => {
  const [isPinned, setIsPinned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkUser();
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

  const handlePin = async (e: React.MouseEvent) => {
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

      if (!error) {
        setIsPinned(false);
        toast.success("Product unpinned");
      }
    } else {
      const { error } = await supabase
        .from("pinned_products")
        .insert([{
          user_id: user.id,
          product_id: product.id,
        }]);

      if (!error) {
        setIsPinned(true);
        toast.success("Product pinned to your board");
      }
    }

    setLoading(false);
  };

  return (
    <div className="relative">
      <Card 
        onClick={onClick}
        className="group hover:shadow-xl transition-all duration-300 border border-border bg-card overflow-hidden cursor-pointer rounded-xl h-full flex flex-col"
      >
        <CardContent className="p-0 flex flex-col h-full">
          {/* Product Image */}
          {product.image && (
            <div className="w-full aspect-[4/3] overflow-hidden bg-muted/10 relative">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {/* Badges on Image */}
              <div className="absolute top-3 left-3 flex gap-2">
                {product.usesAI && (
                  <div className="bg-background/90 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span className="text-xs font-medium">AI</span>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <div className="p-5 flex-1 flex flex-col">
            {/* Product Name */}
            <h3 className="font-semibold text-base leading-tight mb-2">
              {product.name}
            </h3>
            
            {/* Description */}
            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed flex-1">
              {product.description}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Pin Button */}
      {user && (
        <Button
          onClick={handlePin}
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
