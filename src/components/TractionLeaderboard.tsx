import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Trophy, TrendingUp, Users } from "lucide-react";
import { DbProduct } from "@/components/DbProductCardWithPin";

interface LeaderboardEntry extends DbProduct {
  monthly_contacts: number;
}

interface TractionLeaderboardProps {
  onProductClick?: (product: DbProduct) => void;
}

export const TractionLeaderboard = ({ onProductClick }: TractionLeaderboardProps) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    setLoading(true);
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    try {
      // Prefer a secure RPC that aggregates counts server-side (works even when signed out)
      const { data: rpcData, error: rpcError } = await supabase
        .rpc('get_monthly_contact_counts', { month_start_input: monthStart });

      let contactCounts: Record<string, number> = {};

      if (!rpcError && rpcData) {
        rpcData.forEach((row: any) => {
          contactCounts[row.product_id] = Number(row.contact_count) || 0;
        });
      } else {
        // Fallback to client-side counting if RPC isn't available
        const { data: contactData, error: contactError } = await supabase
          .from('product_contacts')
          .select('product_id')
          .gte('contacted_at', monthStart);

        if (contactError) {
          console.error('Error loading contacts:', contactError);
          setLeaderboard([]);
          setLoading(false);
          return;
        }

        contactData?.forEach((contact: any) => {
          contactCounts[contact.product_id] = (contactCounts[contact.product_id] || 0) + 1;
        });
      }

      const productIds = Object.keys(contactCounts);
      if (productIds.length === 0) {
        setLeaderboard([]);
        return;
      }

      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('approval_status', 'approved')
        .eq('show_on_leaderboard', true)
        .in('id', productIds);

      if (productsError) {
        console.error('Error loading products:', productsError);
        setLeaderboard([]);
        return;
      }

      const combined = (products || [])
        .map(p => ({
          ...p,
          monthly_contacts: contactCounts[p.id] || 0,
        }))
        .sort((a, b) => b.monthly_contacts - a.monthly_contacts)
        .slice(0, 50);

      setLeaderboard(combined);
    } catch (e) {
      console.error('Unexpected error loading leaderboard:', e);
      setLeaderboard([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-muted/20 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (leaderboard.length === 0) {
    return (
      <div className="text-center py-20 border-2 border-dashed border-border/30 rounded-3xl">
        <Trophy className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground text-lg">No products contacted this month yet</p>
        <p className="text-sm text-muted-foreground mt-2">
          Be the first to reach out to founders!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {leaderboard.map((product, index) => (
        <Card
          key={product.id}
          className="border border-border hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden"
          onClick={() => onProductClick?.(product)}
        >
          <CardContent className="p-6">
            <div className="flex items-center gap-6">
              {/* Rank Badge */}
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0 ${
                  index === 0
                    ? "bg-gradient-to-br from-yellow-400 to-yellow-600 text-white"
                    : index === 1
                    ? "bg-gradient-to-br from-gray-300 to-gray-500 text-white"
                    : index === 2
                    ? "bg-gradient-to-br from-amber-600 to-amber-800 text-white"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {index + 1}
              </div>

              {/* Product Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-lg truncate">{product.name}</h3>
                  {product.uses_ai && (
                    <Badge variant="secondary" className="text-xs rounded-full">
                      AI
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-1">
                  {product.description}
                </p>
              </div>

              {/* Metrics */}
              <div className="flex items-center gap-8 flex-shrink-0">
                {product.growth_rate && (
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-success" />
                    <span className="text-sm font-medium text-success">
                      {product.growth_rate}
                    </span>
                  </div>
                )}
                {product.users && (
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      {product.users}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
