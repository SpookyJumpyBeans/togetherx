import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pin } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export interface DbProduct {
  id: string;
  name: string;
  description?: string;
  website_link?: string;
  contact_email?: string;
  created_at?: string;
}

interface Props {
  product: DbProduct;
  onClick?: () => void;
}

export const DbProductCardWithPin = ({ product, onClick }: Props) => {
  const [isPinned, setIsPinned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      setUser(session.user);
      checkIfPinned(session.user.id);
    }
  };

  const checkIfPinned = async (userId: string) => {
    const { data, error } = await supabase
      .from("pinned_products")
      .select("id")
      .eq("user_id", userId)
      .eq("product_id", product.id)
      .maybeSingle();
    setIsPinned(!!data && !error);
  };

  const togglePin = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      toast.error("Please sign in to pin products");
      return;
    }
    setLoading(true);

    if (isPinned) {
      const { error } = await supabase
        .from("pinned_products")
        .delete()
        .eq("user_id", user.id)
        .eq("product_id", product.id);
      if (error) {
        toast.error("Failed to unpin");
      } else {
        setIsPinned(false);
        toast.success("Product unpinned");
      }
    } else {
      const { error } = await supabase
        .from("pinned_products")
        .insert([{ user_id: user.id, product_id: product.id }]);
      if (error) {
        toast.error("Failed to pin");
      } else {
        setIsPinned(true);
        toast.success("Pinned to your profile");
      }
    }

    setLoading(false);
  };

  return (
    <Card 
      className="h-full hover:shadow-2xl transition-all duration-500 group border-0 shadow-md hover:-translate-y-1 bg-card overflow-hidden cursor-pointer"
      onClick={onClick}
    >
      <CardContent className="p-8 space-y-5">
        {/* Header with Pin */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <h3 className="font-semibold text-xl group-hover:text-primary transition-colors line-clamp-1">
                {product.name}
              </h3>
            </div>
            {product.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                {product.description}
              </p>
            )}
          </div>
          {user && (
            <Button
              onClick={togglePin}
              disabled={loading}
              size="sm"
              variant={isPinned ? "default" : "ghost"}
              className="rounded-full h-9 w-9 p-0 flex-shrink-0"
              aria-label={isPinned ? "Unpin" : "Pin"}
            >
              <Pin className={`w-4 h-4 ${isPinned ? "fill-current" : ""}`} />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};