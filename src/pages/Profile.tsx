import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ProductCard } from "@/components/ProductCard";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { User, Save, Pin } from "lucide-react";

export default function Profile() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState({ name: "", role: "", email: "" });
  const [pinnedProducts, setPinnedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/auth");
      return;
    }

    setUser(session.user);
    await loadProfile(session.user.id);
    await loadPinnedProducts(session.user.id);
  };

  const loadProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (data) {
      setProfile({
        name: data.name || "",
        role: data.role || "",
        email: data.email || "",
      });
    }
    setLoading(false);
  };

  const loadPinnedProducts = async (userId: string) => {
    const { data, error } = await supabase
      .from("pinned_products")
      .select(`
        product_id,
        products (*)
      `)
      .eq("user_id", userId);

    if (data) {
      setPinnedProducts(data.map((item: any) => item.products));
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        name: profile.name,
        role: profile.role,
        email: profile.email,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (error) {
      toast.error("Failed to save profile");
    } else {
      toast.success("Profile saved successfully");
    }
    setSaving(false);
  };

  const handleUnpin = async (productId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from("pinned_products")
      .delete()
      .eq("user_id", user.id)
      .eq("product_id", productId);

    if (!error) {
      setPinnedProducts(pinnedProducts.filter((p) => p.id !== productId));
      toast.success("Product unpinned");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="container mx-auto px-6 md:px-8 py-16 flex-1 max-w-7xl">
        {/* Profile Section */}
        <section className="mb-16">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center">
              <User className="w-8 h-8 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">My Profile</h1>
              <p className="text-muted-foreground">Manage your account information</p>
            </div>
          </div>

          <div className="space-y-6 max-w-2xl">
            <div>
              <Label htmlFor="name" className="text-sm font-medium mb-2 block">
                Name
              </Label>
              <Input
                id="name"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                placeholder="Your name"
                className="border-0 border-b-2 border-border/50 rounded-none focus:border-primary transition-colors bg-transparent shadow-none px-0"
              />
            </div>

            <div>
              <Label htmlFor="role" className="text-sm font-medium mb-2 block">
                Role
              </Label>
              <Input
                id="role"
                value={profile.role}
                onChange={(e) => setProfile({ ...profile, role: e.target.value })}
                placeholder="e.g., Founder, Developer, Product Manager"
                className="border-0 border-b-2 border-border/50 rounded-none focus:border-primary transition-colors bg-transparent shadow-none px-0"
              />
            </div>

            <div>
              <Label htmlFor="email" className="text-sm font-medium mb-2 block">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                placeholder="your@email.com"
                className="border-0 border-b-2 border-border/50 rounded-none focus:border-primary transition-colors bg-transparent shadow-none px-0"
              />
            </div>

            <Button
              onClick={handleSaveProfile}
              disabled={saving}
              className="rounded-full px-8"
              size="lg"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Saving..." : "Save Profile"}
            </Button>
          </div>
        </section>

        {/* Pin Board Section */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <Pin className="w-6 h-6 text-primary" />
            <h2 className="text-3xl font-bold">My Pin Board</h2>
          </div>

          {pinnedProducts.length === 0 ? (
            <div className="text-center py-20 border-2 border-dashed border-border/30 rounded-3xl">
              <Pin className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground text-lg">No pinned products yet</p>
              <p className="text-sm text-muted-foreground mt-2">
                Start pinning products from the main page
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {pinnedProducts.map((product) => (
                <div key={product.id} className="relative">
                  <ProductCard product={product} />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-4 right-4 rounded-full"
                    onClick={() => handleUnpin(product.id)}
                  >
                    Unpin
                  </Button>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
