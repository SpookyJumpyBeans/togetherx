import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pin, Sparkles, ChevronLeft, ChevronRight, X } from "lucide-react";
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
          {/* Product Image */}
          <div className="w-full aspect-[4/3] overflow-hidden bg-muted/10 relative">
            <img
              src={coverImage}
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
            {/* Header: Logo + Name */}
            <div className="flex items-start gap-3 mb-2">
              <div className="w-10 h-10 rounded-md overflow-hidden bg-muted flex items-center justify-center">
                <img
                  src={product.logo_url || "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=100&h=100&fit=crop"}
                  alt={`${product.name} logo`}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-base leading-tight truncate">{product.name}</h3>
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-muted-foreground leading-relaxed">
              {product.description || "No description provided"}
            </p>

            {/* Basic Info */}
            {(product.category || product.target_audience) && (
              <div className="grid grid-cols-2 gap-3 text-xs mt-3">
                <div><span className="font-medium">Category:</span> {product.category || "N/A"}</div>
                <div><span className="font-medium">Audience:</span> {product.target_audience || "N/A"}</div>
              </div>
            )}

            {/* Technology Highlights */}
            {product.tech_highlights && (
              <div className="mt-3">
                <div className="text-xs font-medium mb-1">Technology Highlights</div>
                <p className="text-xs text-muted-foreground">{product.tech_highlights}</p>
              </div>
            )}

            {/* Traction Metrics */}
            {(product.users || product.revenue || product.growth_rate) && (
              <div className="mt-3">
                <div className="text-xs font-medium mb-1">Traction</div>
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div>
                    <div className="text-muted-foreground">Total Users</div>
                    <div className="font-medium">{product.users || "N/A"}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Monthly Active</div>
                    <div className="font-medium">{product.growth_rate || "N/A"}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Revenue</div>
                    <div className="font-medium">{product.revenue || "N/A"}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Partnership Opportunities */}
            {(product.partnership || product.co_marketing || product.white_label || product.reseller || product.acquisition) && (
              <div className="mt-3">
                <div className="text-xs font-medium mb-1">Partnership Opportunities</div>
                <div className="flex flex-wrap gap-1.5">
                  {product.partnership && <span className="px-2 py-0.5 bg-primary/10 text-primary rounded text-[10px]">General Partnership</span>}
                  {product.co_marketing && <span className="px-2 py-0.5 bg-primary/10 text-primary rounded text-[10px]">Co-marketing</span>}
                  {product.white_label && <span className="px-2 py-0.5 bg-primary/10 text-primary rounded text-[10px]">White Label</span>}
                  {product.reseller && <span className="px-2 py-0.5 bg-primary/10 text-primary rounded text-[10px]">Reseller</span>}
                  {product.acquisition && <span className="px-2 py-0.5 bg-primary/10 text-primary rounded text-[10px]">Acquisition</span>}
                </div>
              </div>
            )}

            {/* Acquisition Details */}
            {product.acquisition_details && (
              <div className="mt-3">
                <div className="text-xs font-medium mb-1">Acquisition Details</div>
                <p className="text-xs text-muted-foreground">{product.acquisition_details}</p>
              </div>
            )}

            {/* Tags */}
            {product.tags && (
              <div className="mt-3 text-xs">
                <span className="font-medium">Tags:</span> {product.tags}
              </div>
            )}
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
      {user && showUnpinButton && isPinned ? (
        <Button
          onClick={togglePin}
          disabled={loading}
          size="sm"
          variant="destructive"
          className="absolute top-3 right-3 rounded-md shadow-lg z-10 text-xs h-8 px-3"
        >
          Unpin
        </Button>
      ) : user && !showUnpinButton ? (
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