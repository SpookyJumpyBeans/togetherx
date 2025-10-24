import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Users, Activity } from "lucide-react";

interface LeaderboardEntry {
  id: string;
  name: string;
  logo: string;
  image?: string;
  category: string;
  users?: number;
  mau?: number;
  revenue?: string;
  growth_rate?: number;
}

export const TractionLeaderboard = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('status', 'approved')
      .eq('show_on_leaderboard', true)
      .order('users', { ascending: false })
      .limit(10);

    if (data) {
      setLeaderboard(data);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-muted/20 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (leaderboard.length === 0) {
    return (
      <div className="text-center py-12 border-2 border-dashed border-border/30 rounded-3xl">
        <TrendingUp className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground">No products on the leaderboard yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {leaderboard.map((product, index) => (
        <Card key={product.id} className="group hover:shadow-lg transition-all duration-300 border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-6">
              {/* Rank */}
              <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-gradient-primary flex items-center justify-center">
                <span className="text-2xl font-bold text-primary-foreground">
                  {index + 1}
                </span>
              </div>

              {/* Product Info */}
              <div className="flex-1 flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-muted/20 flex items-center justify-center overflow-hidden">
                  <img
                    src={product.logo}
                    alt={product.name}
                    className="w-10 h-10 object-contain"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
                  <Badge variant="secondary" className="text-xs">
                    {product.category}
                  </Badge>
                </div>
              </div>

              {/* Metrics */}
              <div className="hidden md:flex items-center gap-8">
                {product.users && (
                  <div className="text-center">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Users className="w-4 h-4" />
                      <span className="text-xs">Users</span>
                    </div>
                    <p className="text-xl font-bold">
                      {product.users >= 1000
                        ? `${(product.users / 1000).toFixed(1)}k`
                        : product.users}
                    </p>
                  </div>
                )}
                {product.mau && (
                  <div className="text-center">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Activity className="w-4 h-4" />
                      <span className="text-xs">MAU</span>
                    </div>
                    <p className="text-xl font-bold">
                      {product.mau >= 1000
                        ? `${(product.mau / 1000).toFixed(1)}k`
                        : product.mau}
                    </p>
                  </div>
                )}
                {product.growth_rate && (
                  <div className="text-center">
                    <div className="flex items-center gap-2 text-success mb-1">
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-xs">Growth</span>
                    </div>
                    <p className="text-xl font-bold text-success">
                      +{product.growth_rate}%
                    </p>
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
