import { Badge } from "@/components/ui/badge";
import { TrendingUp } from "lucide-react";

interface TractionBadgeProps {
  traction: {
    users?: number;
    mau?: number;
    revenue?: string;
  };
}

export const TractionBadge = ({ traction }: TractionBadgeProps) => {
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return num.toString();
  };

  const getMainMetric = () => {
    if (traction.mau) return `${formatNumber(traction.mau)} MAU`;
    if (traction.users) return `${formatNumber(traction.users)} users`;
    if (traction.revenue) return traction.revenue;
    return "Early stage";
  };

  return (
    <Badge variant="success" className="gap-1">
      <TrendingUp className="w-3 h-3" />
      {getMainMetric()}
    </Badge>
  );
};
