import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TractionBadge } from "./TractionBadge";
import { PartnershipBadges } from "./PartnershipBadges";
import { Sparkles } from "lucide-react";

export interface Product {
  id: string;
  name: string;
  logo: string;
  image?: string;
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
    <Card className="h-full hover:shadow-2xl transition-all duration-500 group border-0 shadow-md hover:-translate-y-1 bg-card overflow-hidden cursor-pointer">
      <CardContent className="p-0">
        {/* Product Image */}
        {product.image && (
          <div className="w-full h-48 overflow-hidden bg-muted/20">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          </div>
        )}
        
        <div className="p-8 space-y-5">
          {/* Logo & Name */}
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center flex-shrink-0 shadow-sm group-hover:shadow-md transition-all">
              <img
                src={product.logo}
                alt={product.name}
                className="w-12 h-12 object-contain"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-xl group-hover:text-primary transition-colors line-clamp-1">
                  {product.name}
                </h3>
                {product.usesAI && (
                  <Badge variant="default" className="gap-1 text-xs rounded-full px-2.5 py-0.5 shadow-sm">
                    <Sparkles className="w-3 h-3" />
                    AI
                  </Badge>
                )}
              </div>
              <Badge variant="secondary" className="rounded-full text-xs mb-3">{product.category}</Badge>
              <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                {product.description}
              </p>
            </div>
          </div>
        
          {/* Traction */}
          <div className="pt-4 border-t border-border/30">
            <TractionBadge traction={product.traction} />
          </div>
        
          {/* Partnership Badges */}
          <PartnershipBadges partnerships={product.partnerships} />
        </div>
      </CardContent>
    </Card>
  );
};
