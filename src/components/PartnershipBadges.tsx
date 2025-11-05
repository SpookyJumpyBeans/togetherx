import { Badge } from "@/components/ui/badge";
import { Handshake, Package, DollarSign, Store } from "lucide-react";

interface PartnershipBadgesProps {
  partnerships: {
    coMarketing: boolean;
    whiteLabel: boolean;
    acquisition: boolean;
    reseller: boolean;
  };
}

export const PartnershipBadges = ({ partnerships }: PartnershipBadgesProps) => {
  const badges = [];

  if (partnerships.coMarketing) {
    badges.push(
      <Badge key="marketing" className="gap-1 text-xs bg-foreground text-background hover:bg-foreground/90 border-foreground">
        <Handshake className="w-3 h-3" />
        Co-Marketing
      </Badge>
    );
  }

  if (partnerships.whiteLabel) {
    badges.push(
      <Badge key="whitelabel" className="gap-1 text-xs bg-foreground text-background hover:bg-foreground/90 border-foreground">
        <Package className="w-3 h-3" />
        White Label
      </Badge>
    );
  }

  if (partnerships.acquisition) {
    badges.push(
      <Badge key="acquisition" className="gap-1 text-xs bg-foreground text-background hover:bg-foreground/90 border-foreground">
        <DollarSign className="w-3 h-3" />
        Open to Offers
      </Badge>
    );
  }

  if (partnerships.reseller) {
    badges.push(
      <Badge key="reseller" className="gap-1 text-xs bg-foreground text-background hover:bg-foreground/90 border-foreground">
        <Store className="w-3 h-3" />
        Reseller
      </Badge>
    );
  }

  if (badges.length === 0) return null;

  return <div className="flex flex-wrap gap-2">{badges}</div>;
};
