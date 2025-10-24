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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="space-y-6 py-4">
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
                <h2 className="text-2xl font-semibold">{product.name}</h2>
                {product.usesAI && (
                  <Badge variant="default" className="gap-1 rounded-full">
                    <Sparkles className="w-3 h-3" />
                    AI-Powered
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground mb-3">
                <Building2 className="w-4 h-4" />
                <span className="text-sm">{product.targetAudience}</span>
              </div>
              <p className="text-muted-foreground">
                {product.description}
              </p>
            </div>
          </div>

          {/* Technology Highlights */}
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Code className="w-5 h-5" />
                Technology Highlights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {product.techHighlights.map((tech) => (
                  <Badge key={tech} variant="outline" className="rounded-full">
                    {tech}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Traction Metrics */}
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="w-5 h-5" />
                Traction Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {product.traction.users && (
                  <div className="bg-muted/50 rounded-2xl p-4">
                    <p className="text-sm text-muted-foreground mb-1">Total Users</p>
                    <p className="text-2xl font-semibold">{product.traction.users.toLocaleString()}</p>
                  </div>
                )}
                {product.traction.mau && (
                  <div className="bg-muted/50 rounded-2xl p-4">
                    <p className="text-sm text-muted-foreground mb-1">Monthly Active</p>
                    <p className="text-2xl font-semibold">{product.traction.mau.toLocaleString()}</p>
                  </div>
                )}
                {product.traction.revenue && (
                  <div className="bg-muted/50 rounded-2xl p-4">
                    <p className="text-sm text-muted-foreground mb-1">Revenue</p>
                    <p className="text-2xl font-semibold">{product.traction.revenue}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Partnership Opportunities */}
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg">Partnership Opportunities</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-3">Open to:</p>
                <PartnershipBadges partnerships={product.partnerships} />
              </div>

              <Button className="w-full rounded-full shadow-lg" size="lg">
                <Mail className="w-4 h-4 mr-2" />
                Contact Founder
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Direct message to the project owner
              </p>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
