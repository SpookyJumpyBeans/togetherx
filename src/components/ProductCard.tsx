import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TractionBadge } from "./TractionBadge";
import { PartnershipBadges } from "./PartnershipBadges";
import { Building2, Users } from "lucide-react";

export interface Product {
  id: string;
  name: string;
  logo: string;
  description: string;
  targetAudience: string;
  category: string;
  tags: string[];
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
    <Link to={`/product/${product.id}`}>
      <Card className="h-full hover:shadow-lg transition-all duration-300 group border border-border hover:border-primary/50">
        <CardHeader className="pb-4">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center flex-shrink-0 group-hover:shadow-md transition-all">
              <img
                src={product.logo}
                alt={product.name}
                className="w-12 h-12 object-contain"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-lg group-hover:text-primary transition-colors">
                {product.name}
              </h3>
              <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                <Building2 className="w-3 h-3" />
                <span className="truncate">{product.targetAudience}</span>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {product.description}
          </p>
          
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{product.category}</Badge>
            {product.tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <Users className="w-4 h-4 text-muted-foreground" />
            <TractionBadge traction={product.traction} />
          </div>
          
          <PartnershipBadges partnerships={product.partnerships} />
        </CardContent>
      </Card>
    </Link>
  );
};
