import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TractionBadge } from "./TractionBadge";
import { PartnershipBadges } from "./PartnershipBadges";
import { Sparkles } from "lucide-react";

export interface Product {
  id: string;
  name: string;
  logo: string;
  description: string;
  targetAudience: string;
  category: string;
  tags: string[];
  usesAI: boolean;
  techHighlights: string[];
  traction: {
    users?: number;
    mau?: number;
    revenue?: string;
  };
  partnerships: {
    coMarketing: boolean;
    whiteLabel: boolean;
    acquisition: boolean;
    reseller: boolean;
  };
}

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  return (
    <Card className="h-full hover:shadow-xl transition-all duration-300 group border border-border/50 hover:border-primary/30 bg-card/50 backdrop-blur-sm overflow-hidden cursor-pointer">
      <CardContent className="p-6 space-y-4">
        {/* Logo & Name */}
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform">
            <img
              src={product.logo}
              alt={product.name}
              className="w-10 h-10 object-contain"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-lg group-hover:text-primary transition-colors line-clamp-1">
                {product.name}
              </h3>
              {product.usesAI && (
                <Badge variant="default" className="gap-1 text-xs rounded-full px-2 py-0">
                  <Sparkles className="w-3 h-3" />
                  AI
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {product.description}
            </p>
          </div>
        </div>
        
        {/* Category */}
        <div>
          <Badge variant="secondary" className="rounded-full">{product.category}</Badge>
        </div>
        
        {/* Traction */}
        <div className="pt-2 border-t border-border/50">
          <TractionBadge traction={product.traction} />
        </div>
        
        {/* Partnership Badges */}
        <PartnershipBadges partnerships={product.partnerships} />
      </CardContent>
    </Card>
  );
};
