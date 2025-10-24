import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ProductCard } from "@/components/ProductCard";
import { SuccessStoryDialog } from "@/components/SuccessStoryDialog";
import { EnhancedSubmitDialog } from "@/components/EnhancedSubmitDialog";
import { SubscribeDialog } from "@/components/SubscribeDialog";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { User, Save, Pin, Trophy, Linkedin, Github, Globe, Twitter } from "lucide-react";

export default function Profile() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState({
    name: "",
    role: "",
    email: "",
    linkedin: "",
    twitter: "",
    website: "",
    github: "",
  });
  const [pinnedProducts, setPinnedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [storyDialogOpen, setStoryDialogOpen] = useState(false);
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [subscribeDialogOpen, setSubscribeDialogOpen] = useState(false);
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
        linkedin: data.linkedin || "",
        twitter: data.twitter || "",
        website: data.website || "",
        github: data.github || "",
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
        linkedin: profile.linkedin,
        twitter: profile.twitter,
        website: profile.website,
        github: profile.github,
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
      <Header 
        onSubmitClick={() => setSubmitDialogOpen(true)}
        onSubscribeClick={() => setSubscribeDialogOpen(true)}
      />

      <main className="container mx-auto px-6 md:px-8 py-16 flex-1 max-w-7xl">
        {/* Profile Section */}
        <section className="mb-16">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center">
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

            <div className="flex gap-4">
              <Button
                onClick={handleSaveProfile}
                disabled={saving}
                className="rounded-full px-8 bg-foreground text-background hover:bg-foreground/90"
                size="lg"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? "Saving..." : "Save Profile"}
              </Button>

              <Button
                onClick={() => setStoryDialogOpen(true)}
                variant="outline"
                className="rounded-full px-8"
                size="lg"
              >
                <Trophy className="w-4 h-4 mr-2" />
                Share Success Story
              </Button>
            </div>
          </div>
        </section>

        {/* Pin Board Section */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <Pin className="w-6 h-6" />
            <h2 className="text-3xl font-bold">Saved Products</h2>
          </div>

          {pinnedProducts.length === 0 ? (
            <div className="text-center py-20 border-2 border-dashed border-border/30 rounded-3xl">
              <Pin className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground text-lg">No saved products yet</p>
              <p className="text-sm text-muted-foreground mt-2">
                Save products to your board from the main page
              </p>
            </div>
          ) : (
            <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
              {pinnedProducts.map((product) => (
                <div key={product.id} className="relative break-inside-avoid mb-6">
                  <ProductCard product={product} />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-3 right-3 rounded-full z-10 h-8 w-8 p-0"
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

      <SuccessStoryDialog open={storyDialogOpen} onOpenChange={setStoryDialogOpen} />
      <EnhancedSubmitDialog open={submitDialogOpen} onOpenChange={setSubmitDialogOpen} />
      <SubscribeDialog open={subscribeDialogOpen} onOpenChange={setSubscribeDialogOpen} />
    </div>
  );
}
