import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pin, Sparkles, ChevronLeft, ChevronRight, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export interface DbProduct {
  id: string;
  name: string;
  description?: string;
  website_link?: string;
  contact_email?: string;
  created_at?: string;
  screenshot_url?: string;
  screenshot_urls?: string[];
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
  acquisition_details?: string;
}

interface Props {
  product: DbProduct;
  onClick?: () => void;
  onUnpin?: (productId: string) => void;
  showUnpinButton?: boolean;
  isAdmin?: boolean;
  onReject?: (productId: string) => void;
}

export const DbProductCardWithPin = ({ product, onClick, onUnpin, showUnpinButton, isAdmin, onReject }: Props) => {
  const [isPinned, setIsPinned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [rejectLoading, setRejectLoading] = useState(false);
  const navigate = useNavigate();

  // Get the first image for the card cover
  const coverImage = product.screenshot_urls && product.screenshot_urls.length > 0 
    ? product.screenshot_urls[0]
    : product.screenshot_url 
    ? product.screenshot_url
    : "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop";

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
      navigate("/auth");
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
        if (onUnpin) {
          onUnpin(product.id);
        }
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

  const handleReject = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onReject) return;
    
    setRejectLoading(true);
    await onReject(product.id);
    setRejectLoading(false);
  };

  return (
    <div className="relative">
      <Card 
        className="group hover:shadow-xl transition-all duration-300 border border-border bg-card overflow-hidden cursor-pointer rounded-xl h-full flex flex-col"
        onClick={onClick}
      >
        <CardContent className="p-0 flex flex-col h-full">
          {/* Product Screenshot */}
          <div className="w-full aspect-[4/3] overflow-hidden bg-muted/10 relative">
            <img
              src={coverImage}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="p-5 flex flex-col gap-4 flex-1">
            {/* Logo + Name */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex items-center justify-center flex-shrink-0">
                <img
                  src={product.logo_url || "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=100&h=100&fit=crop"}
                  alt={`${product.name} logo`}
                  className="w-full h-full object-contain"
                />
              </div>
              <h3 className="font-semibold text-base leading-tight">{product.name}</h3>
            </div>

            {/* Description */}
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 flex-1">
              {product.description || "No description provided"}
            </p>

            {/* Traction Metrics */}
            {(product.users || product.revenue) && (
              <div className="flex items-center gap-4 text-sm">
                {product.users && (
                  <div>
                    <span className="font-medium">{product.users}</span>
                    <span className="text-muted-foreground ml-1">users</span>
                  </div>
                )}
                {product.revenue && (
                  <div>
                    <span className="font-medium">{product.revenue}</span>
                  </div>
                )}
              </div>
            )}

            {/* Category & Partnership Tags */}
            <div className="flex flex-wrap gap-1.5">
              {product.category && (
                <span className="px-2.5 py-1 bg-secondary text-secondary-foreground rounded-full text-xs font-medium">
                  {product.category.split(',')[0].trim()}
                </span>
              )}
              {product.white_label && (
                <span className="px-2.5 py-1 bg-purple-500/10 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium">
                  White-label
                </span>
              )}
              {product.reseller && (
                <span className="px-2.5 py-1 bg-green-500/10 text-green-700 dark:text-green-300 rounded-full text-xs font-medium">
                  Reseller
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Admin Reject Button */}
      {isAdmin && onReject && (
        <Button
          onClick={handleReject}
          disabled={rejectLoading}
          size="sm"
          variant="destructive"
          className="absolute top-3 left-3 rounded-md shadow-lg z-10 text-xs h-8 px-3"
        >
          <X className="w-3 h-3 mr-1" />
          Reject
        </Button>
      )}

      {/* Pin/Unpin Button */}
      {showUnpinButton && isPinned ? (
        <Button
          onClick={togglePin}
          disabled={loading}
          size="sm"
          variant="destructive"
          className="absolute top-3 right-3 rounded-md shadow-lg z-10 text-xs h-8 px-3"
        >
          Unpin
        </Button>
      ) : !showUnpinButton ? (
        <Button
          onClick={togglePin}
          disabled={loading}
          size="sm"
          variant="secondary"
          className="absolute top-3 right-3 rounded-full shadow-lg z-10 h-9 w-9 p-0 bg-background/90 backdrop-blur-sm hover:bg-background"
        >
          <Pin className={`w-4 h-4 text-foreground ${isPinned ? "fill-current" : ""}`} />
        </Button>
      ) : null}
    </div>
  );
};