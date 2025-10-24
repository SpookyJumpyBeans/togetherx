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
    const { data } = await supabase
      .from("pinned_products")
      .select("id")
      .eq("user_id", userId)
      .eq("product_id", product.id)
      .single();

    setIsPinned(!!data);
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
    <div className="relative break-inside-avoid mb-6">
      <Card 
        onClick={onClick}
        className="group hover:shadow-lg transition-all duration-300 border border-border/50 hover:border-border bg-card overflow-hidden cursor-pointer rounded-2xl"
      >
        <CardContent className="p-0">
          {/* Product Image */}
          {product.image && (
            <div className="w-full aspect-[4/3] overflow-hidden bg-muted/10">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          )}
          
          <div className="p-5 space-y-4">
            {/* Logo & Name */}
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-xl bg-muted/30 flex items-center justify-center flex-shrink-0">
                <img
                  src={product.logo}
                  alt={product.name}
                  className="w-8 h-8 object-contain"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-base leading-tight line-clamp-2">
                    {product.name}
                  </h3>
                  {product.usesAI && (
                    <Badge variant="secondary" className="text-xs px-2 py-0 h-5">
                      <Sparkles className="w-3 h-3 mr-1" />
                      AI
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 leading-snug mt-1">
                  {product.description}
                </p>
              </div>
            </div>
          
            {/* Traction - Simplified */}
            {(product.traction.users || product.traction.mau) && (
              <div className="flex items-center gap-4 text-sm">
                {product.traction.users && (
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Users className="w-3.5 h-3.5" />
                    <span>{product.traction.users >= 1000 ? `${(product.traction.users / 1000).toFixed(1)}k` : product.traction.users}</span>
                  </div>
                )}
                {product.traction.mau && (
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Activity className="w-3.5 h-3.5" />
                    <span>{product.traction.mau >= 1000 ? `${(product.traction.mau / 1000).toFixed(1)}k` : product.traction.mau} MAU</span>
                  </div>
                )}
              </div>
            )}
          
            {/* Partnership Badges - Minimal */}
            <div className="flex flex-wrap gap-1.5">
              {product.partnerships.coMarketing && (
                <Badge variant="outline" className="text-xs px-2 py-0 h-6 border-warning/20 text-warning">
                  Co-Marketing
                </Badge>
              )}
              {product.partnerships.whiteLabel && (
                <Badge variant="outline" className="text-xs px-2 py-0 h-6 border-whitelabel/20 text-whitelabel">
                  White Label
                </Badge>
              )}
              {product.partnerships.acquisition && (
                <Badge variant="outline" className="text-xs px-2 py-0 h-6 border-acquisition/20 text-acquisition">
                  Acquisition
                </Badge>
              )}
              {product.partnerships.reseller && (
                <Badge variant="outline" className="text-xs px-2 py-0 h-6 border-reseller/20 text-reseller">
                  Reseller
                </Badge>
              )}
            </div>
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
          className="absolute top-3 right-3 rounded-full shadow-md z-10 h-8 w-8 p-0"
        >
          <Pin className={`w-3.5 h-3.5 ${isPinned ? "fill-current" : ""}`} />
        </Button>
      )}
    </div>
  );
};
