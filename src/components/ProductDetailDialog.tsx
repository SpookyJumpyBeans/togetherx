import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TractionBadge } from "@/components/TractionBadge";
import { PartnershipBadges } from "@/components/PartnershipBadges";
import { Mail, Building2, Code, TrendingUp, Sparkles } from "lucide-react";
import { Product } from "@/components/ProductCard";

interface ProductDetailDialogProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ProductDetailDialog = ({ product, open, onOpenChange }: ProductDetailDialogProps) => {
  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto border-0 shadow-2xl">
        <div className="space-y-8 py-6">
          {/* Product Image */}
          {product.image && (
            <div className="w-full h-64 -mx-6 -mt-6 overflow-hidden">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Header */}
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center flex-shrink-0 shadow-md">
              <img
                src={product.logo}
                alt={product.name}
                className="w-16 h-16 object-contain"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <h2 className="text-3xl font-bold">{product.name}</h2>
                {product.usesAI && (
                  <Badge variant="default" className="gap-1 rounded-full">
                    <Sparkles className="w-3 h-3" />
                    AI-Powered
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground mb-4">
                <Building2 className="w-4 h-4" />
                <span className="text-sm">{product.targetAudience}</span>
              </div>
              <p className="text-muted-foreground leading-relaxed text-base">
                {product.description}
              </p>
            </div>
          </div>

          {/* Technology Highlights */}
          <div className="space-y-4">
            <h3 className="flex items-center gap-2 text-lg font-semibold">
              <Code className="w-5 h-5 text-primary" />
              Technology Highlights
            </h3>
            <div className="flex flex-wrap gap-2">
              {product.techHighlights.map((tech) => (
                <Badge key={tech} variant="outline" className="rounded-full px-4 py-1.5">
                  {tech}
                </Badge>
              ))}
            </div>
          </div>

          {/* Traction Metrics */}
          <div className="space-y-4">
            <h3 className="flex items-center gap-2 text-lg font-semibold">
              <TrendingUp className="w-5 h-5 text-primary" />
              Traction Metrics
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {product.traction.users && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Total Users</p>
                  <p className="text-3xl font-bold">{product.traction.users.toLocaleString()}</p>
                </div>
              )}
              {product.traction.mau && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Monthly Active</p>
                  <p className="text-3xl font-bold">{product.traction.mau.toLocaleString()}</p>
                </div>
              )}
              {product.traction.revenue && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Revenue</p>
                  <p className="text-3xl font-bold">{product.traction.revenue}</p>
                </div>
              )}
            </div>
          </div>

          {/* Partnership Opportunities */}
          <div className="space-y-6 pt-4 border-t border-border/30">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Partnership Opportunities</h3>
              <p className="text-sm text-muted-foreground">Open to:</p>
              <PartnershipBadges partnerships={product.partnerships} />
            </div>

            <Button className="w-full rounded-full shadow-lg hover:shadow-xl transition-all" size="lg">
              <Mail className="w-4 h-4 mr-2" />
              Contact Founder
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Direct message to the project owner
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
