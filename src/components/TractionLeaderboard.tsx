import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Mail, Trophy } from "lucide-react";

interface LeaderboardEntry {
  id: string;
  name: string;
  category?: string;
  monthly_contacts: number;
}

export const TractionLeaderboard = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    // Get current month's start date
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    // Count contacts per product for current month
    const { data: contactData, error: contactError } = await supabase
      .from('product_contacts')
      .select('product_id')
      .gte('contacted_at', monthStart);

    if (contactError) {
      console.error('Error loading contacts:', contactError);
      setLoading(false);
      return;
    }

    // Count contacts by product
    const contactCounts: Record<string, number> = {};
    contactData?.forEach((contact: any) => {
      contactCounts[contact.product_id] = (contactCounts[contact.product_id] || 0) + 1;
    });

    // Get product details for those with contacts
    const productIds = Object.keys(contactCounts);
    if (productIds.length === 0) {
      setLeaderboard([]);
      setLoading(false);
      return;
    }

    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, category')
      .eq('approval_status', 'approved')
      .in('id', productIds);

    if (!productsError && products) {
      // Combine and sort
      const combined = products
        .map(p => ({
          id: p.id,
          name: p.name,
          category: p.category,
          monthly_contacts: contactCounts[p.id] || 0,
        }))
        .sort((a, b) => b.monthly_contacts - a.monthly_contacts)
        .slice(0, 10);
      
      setLeaderboard(combined);
    }
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
        <p className="text-muted-foreground text-lg">No products contacted this month yet</p>
        <p className="text-sm text-muted-foreground mt-2">
          Be the first to reach out to founders!
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
                <h3 className="font-semibold text-xl mb-1 truncate">{product.name}</h3>
                {product.category && (
                  <Badge variant="secondary" className="text-xs rounded-full">
                    {product.category}
                  </Badge>
                )}
              </div>

              {/* Monthly Contacts Metric */}
              <div className="text-center">
                <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                  <Mail className="w-4 h-4" />
                  <span className="text-xs">Monthly Contacts</span>
                </div>
                <p className="text-3xl font-bold text-primary">
                  {product.monthly_contacts}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
