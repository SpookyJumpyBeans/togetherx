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
      <Badge key="marketing" variant="warning" className="gap-1 text-xs">
        <Handshake className="w-3 h-3" />
        Co-Marketing
      </Badge>
    );
  }

  if (partnerships.whiteLabel) {
    badges.push(
      <Badge key="whitelabel" variant="warning" className="gap-1 text-xs">
        <Package className="w-3 h-3" />
        White Label
      </Badge>
    );
  }

  if (partnerships.acquisition) {
    badges.push(
      <Badge key="acquisition" variant="warning" className="gap-1 text-xs">
        <DollarSign className="w-3 h-3" />
        Open to Offers
      </Badge>
    );
  }

  if (partnerships.reseller) {
    badges.push(
      <Badge key="reseller" variant="warning" className="gap-1 text-xs">
        <Store className="w-3 h-3" />
        Reseller
      </Badge>
    );
  }

  if (badges.length === 0) return null;

  return <div className="flex flex-wrap gap-2">{badges}</div>;
};
