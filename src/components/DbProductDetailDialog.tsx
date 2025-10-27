import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, Globe, Calendar } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export interface DbProduct {
  id: string;
  user_id?: string;
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

interface DbProductDetailDialogProps {
  product: DbProduct | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DbProductDetailDialog = ({ product, open, onOpenChange }: DbProductDetailDialogProps) => {
  const [user, setUser] = useState<any>(null);
  const [contacting, setContacting] = useState(false);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setUser(session?.user || null);
  };

  const handleContactFounder = async () => {
    if (!user) {
      toast.error("Please sign in to contact founders");
      return;
    }

    if (!product) return;

    // Don't allow product owner to contact their own product
    if (product.user_id && user.id === product.user_id) {
      toast.error("You cannot contact your own product");
      return;
    }

    setContacting(true);

    try {
      // Track the contact in the database (only non-owner contacts count)
      const { error } = await supabase
        .from('product_contacts')
        .insert([{
          product_id: product.id,
          user_id: user.id,
        }]);

      if (error) {
        // If it's a duplicate (same user contacting same product in same month), ignore
        if (error.code === '23505') {
          toast.info("You've already contacted this founder this month");
        } else {
          throw error;
        }
      } else {
        toast.success("Contact request recorded! Check your email for next steps.");
      }

      // Open email client if contact email is available
      if (product.contact_email) {
        window.location.href = `mailto:${product.contact_email}?subject=Partnership Inquiry for ${product.name}`;
      }
    } catch (error: any) {
      console.error("Contact tracking error:", error);
      toast.error("Failed to record contact");
    } finally {
      setContacting(false);
    }
  };

  if (!product) return null;

  const partnershipTypes = [
    { key: 'partnership', label: 'General Partnership', value: product?.partnership },
    { key: 'co_marketing', label: 'Co-marketing', value: product?.co_marketing },
    { key: 'white_label', label: 'White Label', value: product?.white_label },
    { key: 'reseller', label: 'Reseller', value: product?.reseller },
    { key: 'acquisition', label: 'Acquisition', value: product?.acquisition },
  ].filter(type => type.value);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto border-0 shadow-2xl">
        <DialogHeader className="sr-only">
          <DialogTitle>Product Details</DialogTitle>
          <DialogDescription>View product information and contact the founder</DialogDescription>
        </DialogHeader>
        <div className="space-y-8 py-6">
          {/* Screenshot */}
          <div className="w-full h-64 bg-muted rounded-xl overflow-hidden">
            <img
              src={product?.screenshot_url || "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop"}
              alt={product?.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Header with Logo */}
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              {/* Logo */}
              <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                <img
                  src={product?.logo_url || "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=200&h=200&fit=crop"}
                  alt={`${product?.name} logo`}
                  className="w-full h-full object-contain"
                />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap mb-2">
                  <h2 className="text-3xl font-bold">{product?.name}</h2>
                  {product?.uses_ai && (
                    <Badge variant="secondary">Uses AI</Badge>
                  )}
                </div>

                <p className="text-muted-foreground leading-relaxed text-base">
                  {product?.description || "No description provided"}
                </p>
              </div>
            </div>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground">Category</h3>
              <p>{product?.category || "Not specified"}</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground">Target Audience</h3>
              <p>{product?.target_audience || "Not specified"}</p>
            </div>
          </div>

          {/* Tags */}
          {product?.tags && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {product.tags.split(',').map((tag, i) => (
                  <Badge key={i} variant="outline">{tag.trim()}</Badge>
                ))}
              </div>
            </div>
          )}

          {/* Tech Highlights */}
          {product?.tech_highlights && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                {product?.logo_url && (
                  <img
                    src={product.logo_url}
                    alt={`${product.name} logo`}
                    className="w-5 h-5 object-contain rounded"
                  />
                )}
                <h3 className="text-sm font-semibold text-muted-foreground">Technology Stack</h3>
              </div>
              <p className="text-sm">{product.tech_highlights}</p>
            </div>
          )}

          {/* Traction Metrics */}
          {(product?.users || product?.revenue || product?.growth_rate) && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                {product?.logo_url && (
                  <img
                    src={product.logo_url}
                    alt={`${product.name} logo`}
                    className="w-5 h-5 object-contain rounded"
                  />
                )}
                <h3 className="text-lg font-semibold">Traction</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Users/DAU/MAU</p>
                  <p className="font-medium">{product.users || "Not disclosed"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Revenue</p>
                  <p className="font-medium">{product.revenue || "Not disclosed"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Growth Rate</p>
                  <p className="font-medium">{product.growth_rate || "Not disclosed"}</p>
                </div>
              </div>
            </div>
          )}

          {/* Partnership Types */}
          {partnershipTypes.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground">Partnership Interests</h3>
              <div className="flex flex-wrap gap-2">
                {partnershipTypes.map((type) => (
                  <Badge key={type.key}>{type.label}</Badge>
                ))}
              </div>
            </div>
          )}

          {/* Website Link */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-muted-foreground">Website</h3>
            {product?.website_link ? (
              <a
                href={product.website_link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-primary hover:underline"
              >
                <Globe className="w-4 h-4" />
                {product.website_link}
              </a>
            ) : (
              <p className="text-muted-foreground">Not provided</p>
            )}
          </div>

          {/* Created Date */}
          {product?.created_at && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              Listed on {new Date(product.created_at).toLocaleDateString()}
            </div>
          )}

          {/* Contact Button */}
          <div className="space-y-4 pt-4 border-t border-border/30">
            <Button 
              className="w-full rounded-full shadow-lg hover:shadow-xl transition-all" 
              size="lg"
              onClick={handleContactFounder}
              disabled={contacting}
            >
              <Mail className="w-4 h-4 mr-2" />
              {contacting ? "Recording..." : "Contact Founder"}
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Your contact will be tracked for leaderboard rankings
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
