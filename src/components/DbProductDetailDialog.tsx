import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, Globe, Calendar } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export interface DbProduct {
  id: string;
  name: string;
  description?: string;
  website_link?: string;
  contact_email?: string;
  created_at?: string;
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

    setContacting(true);

    try {
      // Track the contact in the database
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto border-0 shadow-2xl">
        <div className="space-y-8 py-6">
          {/* Header */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-3xl font-bold">{product.name}</h2>
            </div>

            {product.description && (
              <p className="text-muted-foreground leading-relaxed text-base">
                {product.description}
              </p>
            )}
          </div>

          {/* Website Link */}
          {product.website_link && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Website</h3>
              <a
                href={product.website_link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-primary hover:underline"
              >
                <Globe className="w-4 h-4" />
                {product.website_link}
              </a>
            </div>
          )}

          {/* Created Date */}
          {product.created_at && (
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
