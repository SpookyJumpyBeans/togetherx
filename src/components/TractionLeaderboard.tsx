import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Mail, Trophy } from "lucide-react";

interface LeaderboardEntry {
  id: string;
  name: string;
  category?: string;
  users?: string;
  revenue?: string;
  growth_rate?: string;
  total_score: number;
}

export const TractionLeaderboard = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    // Get all approved products with traction metrics
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, category, users, revenue, growth_rate')
      .eq('approval_status', 'approved');

    if (productsError) {
      console.error('Error loading products:', productsError);
      setLoading(false);
      return;
    }

    if (!products || products.length === 0) {
      setLeaderboard([]);
      setLoading(false);
      return;
    }

    // Calculate score for each product based on traction metrics
    const calculateScore = (product: any): number => {
      let score = 0;
      
      // Parse users count
      if (product.users) {
        const usersStr = product.users.toLowerCase().replace(/[^0-9kmb.]/g, '');
        let usersCount = 0;
        if (usersStr.includes('k')) {
          usersCount = parseFloat(usersStr) * 1000;
        } else if (usersStr.includes('m')) {
          usersCount = parseFloat(usersStr) * 1000000;
        } else if (usersStr.includes('b')) {
          usersCount = parseFloat(usersStr) * 1000000000;
        } else {
          usersCount = parseFloat(usersStr) || 0;
        }
        score += usersCount * 10; // Weight users heavily
      }

      // Parse revenue
      if (product.revenue) {
        const revenueStr = product.revenue.toLowerCase().replace(/[^0-9kmb.]/g, '');
        let revenueAmount = 0;
        if (revenueStr.includes('k')) {
          revenueAmount = parseFloat(revenueStr) * 1000;
        } else if (revenueStr.includes('m')) {
          revenueAmount = parseFloat(revenueStr) * 1000000;
        } else if (revenueStr.includes('b')) {
          revenueAmount = parseFloat(revenueStr) * 1000000000;
        } else {
          revenueAmount = parseFloat(revenueStr) || 0;
        }
        score += revenueAmount * 100; // Weight revenue very heavily
      }

      // Parse growth rate
      if (product.growth_rate) {
        const growthStr = product.growth_rate.toLowerCase().replace(/[^0-9.]/g, '');
        const growthRate = parseFloat(growthStr) || 0;
        score += growthRate * 1000; // Weight growth rate
      }

      return score;
    };

    // Calculate scores and sort
    const scored = products
      .map(p => ({
        id: p.id,
        name: p.name,
        category: p.category,
        users: p.users,
        revenue: p.revenue,
        growth_rate: p.growth_rate,
        total_score: calculateScore(p),
      }))
      .filter(p => p.total_score > 0) // Only show products with some traction
      .sort((a, b) => b.total_score - a.total_score)
      .slice(0, 10);

    setLeaderboard(scored);
    setLoading(false);
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
        <p className="text-muted-foreground text-lg">No products with traction metrics yet</p>
        <p className="text-sm text-muted-foreground mt-2">
          Submit your product with traction data to appear on the leaderboard!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {leaderboard.map((product, index) => (
        <Card
          key={product.id}
          className="border-0 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
        >
          <CardContent className="p-8">
            <div className="flex items-center gap-6">
              {/* Rank Badge */}
              <div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold flex-shrink-0 ${
                  index === 0
                    ? "bg-gradient-to-br from-yellow-400 to-yellow-600 text-white shadow-lg"
                    : index === 1
                    ? "bg-gradient-to-br from-gray-300 to-gray-500 text-white shadow-md"
                    : index === 2
                    ? "bg-gradient-to-br from-amber-600 to-amber-800 text-white shadow-md"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {index + 1}
              </div>

              {/* Product Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-xl mb-2 truncate">{product.name}</h3>
                {product.category && (
                  <Badge variant="secondary" className="text-xs rounded-full mb-2">
                    {product.category}
                  </Badge>
                )}
                <div className="flex gap-4 text-sm text-muted-foreground">
                  {product.users && (
                    <div>
                      <span className="font-medium text-foreground">{product.users}</span> users
                    </div>
                  )}
                  {product.revenue && (
                    <div>
                      <span className="font-medium text-foreground">{product.revenue}</span> revenue
                    </div>
                  )}
                  {product.growth_rate && (
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      <span className="font-medium text-foreground">{product.growth_rate}</span> growth
                    </div>
                  )}
                </div>
              </div>

              {/* Traction Score */}
              <div className="text-center">
                <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                  <Trophy className="w-4 h-4" />
                  <span className="text-xs">Traction Score</span>
                </div>
                <p className="text-3xl font-bold text-primary">
                  {Math.round(product.total_score / 1000)}k
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
