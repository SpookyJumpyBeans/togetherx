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
}

interface Props {
  product: DbProduct;
}

export const DbProductCardWithPin = ({ product }: Props) => {
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

  const togglePin = async () => {
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
    <Card className="group hover:shadow-xl transition-all duration-300 border border-border bg-card overflow-hidden rounded-xl h-full">
      <CardContent className="p-5 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-4">
          <h3 className="font-semibold text-base leading-tight">{product.name}</h3>
          {user && (
            <Button
              onClick={togglePin}
              disabled={loading}
              size="sm"
              variant={isPinned ? "default" : "secondary"}
              className="rounded-full h-9 w-9 p-0"
              aria-label={isPinned ? "Unpin" : "Pin"}
            >
              <Pin className={`w-4 h-4 ${isPinned ? "fill-current" : ""}`} />
            </Button>
          )}
        </div>
        {product.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{product.description}</p>
        )}
        {product.website_link && (
          <a
            href={product.website_link}
            className="text-sm text-primary underline underline-offset-2"
            target="_blank"
            rel="noopener noreferrer"
          >
            Visit website
          </a>
        )}
      </CardContent>
    </Card>
  );
};