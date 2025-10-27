import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DbProductCardWithPin } from "@/components/DbProductCardWithPin";
import { SuccessStoryDialog } from "@/components/SuccessStoryDialog";
import { SuccessStoryDetailDialog } from "@/components/SuccessStoryDetailDialog";
import { EnhancedSubmitDialog } from "@/components/EnhancedSubmitDialog";
import { SubscribeDialog } from "@/components/SubscribeDialog";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { User, Save, Pin, Trophy, Linkedin, Github, Globe, Twitter, Edit, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

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
  const [successStories, setSuccessStories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [storyDialogOpen, setStoryDialogOpen] = useState(false);
  const [storyDetailOpen, setStoryDetailOpen] = useState(false);
  const [selectedStory, setSelectedStory] = useState<any>(null);
  const [editingStory, setEditingStory] = useState<any>(null);
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [subscribeDialogOpen, setSubscribeDialogOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
      await loadProfile(session.user.id);
      await loadPinnedProducts(session.user.id);
      await loadSuccessStories(session.user.id);
    } catch (err) {
      console.error("Profile init error:", err);
      toast.error("Unable to load your profile");
    } finally {
      setLoading(false);
    }
  };

  const loadProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      console.error("Profile load error:", error);
      toast.error("Failed to load profile");
    }

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
    try {
      const { data, error } = await supabase
        .from("pinned_products")
        .select(`
          product_id,
          products (*)
        `)
        .eq("user_id", userId);
      if (error) {
        throw error;
      }
      setPinnedProducts((data ?? []).map((item: any) => item.products).filter(Boolean));
    } catch (err) {
      console.error("Pinned products load error:", err);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .upsert(
          {
            id: user.id,
            name: profile.name,
            role: profile.role,
            email: profile.email,
            linkedin: profile.linkedin,
            twitter: profile.twitter,
            website: profile.website,
            github: profile.github,
          },
          { onConflict: "id" }
        );
      if (error) {
        throw error;
      }
      toast.success("Profile saved successfully");
    } catch (error: any) {
      console.error("Profile save error:", error);
      toast.error(`Failed to save profile: ${error.message ?? "Unknown error"}`);
    } finally {
      setSaving(false);
    }
  };

  const loadSuccessStories = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("success_stories")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      setSuccessStories(data || []);
    } catch (err) {
      console.error("Success stories load error:", err);
    }
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

  const handleDeleteStory = async (storyId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("success_stories")
        .delete()
        .eq("id", storyId)
        .eq("user_id", user.id);

      if (error) throw error;
      
      // Update local state immediately
      setSuccessStories(successStories.filter((s) => s.id !== storyId));
      toast.success("Success story deleted");
    } catch (error: any) {
      console.error("Delete story error:", error);
      toast.error("Failed to delete story: " + error.message);
    }
  };

  const handleEditStory = (story: any) => {
    setEditingStory(story);
    setStoryDialogOpen(true);
  };

  const handleStoryDialogClose = (open: boolean) => {
    setStoryDialogOpen(open);
    if (!open) {
      setEditingStory(null);
    }
  };

  const handleStoryClick = (story: any) => {
    setSelectedStory(story);
    setStoryDetailOpen(true);
  };

  const handleStorySuccess = async () => {
    // Wait a bit for database to commit
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Reload stories from database
    if (user) {
      await loadSuccessStories(user.id);
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

            {/* Social Links Section */}
            <div className="pt-6 border-t border-border/30">
              <h3 className="text-lg font-semibold mb-4">Social Links</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="linkedin" className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Linkedin className="w-4 h-4" />
                    LinkedIn
                  </Label>
                  <Input
                    id="linkedin"
                    value={profile.linkedin}
                    onChange={(e) => setProfile({ ...profile, linkedin: e.target.value })}
                    placeholder="https://linkedin.com/in/yourprofile"
                    className="border-0 border-b-2 border-border/50 rounded-none focus:border-primary transition-colors bg-transparent shadow-none px-0"
                  />
                </div>

                <div>
                  <Label htmlFor="github" className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Github className="w-4 h-4" />
                    GitHub
                  </Label>
                  <Input
                    id="github"
                    value={profile.github}
                    onChange={(e) => setProfile({ ...profile, github: e.target.value })}
                    placeholder="https://github.com/yourusername"
                    className="border-0 border-b-2 border-border/50 rounded-none focus:border-primary transition-colors bg-transparent shadow-none px-0"
                  />
                </div>

                <div>
                  <Label htmlFor="website" className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Website
                  </Label>
                  <Input
                    id="website"
                    value={profile.website}
                    onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                    placeholder="https://yourwebsite.com"
                    className="border-0 border-b-2 border-border/50 rounded-none focus:border-primary transition-colors bg-transparent shadow-none px-0"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
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

        {/* Success Stories Section */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <Trophy className="w-6 h-6" />
            <h2 className="text-3xl font-bold">My Success Stories</h2>
          </div>

          {successStories.length === 0 ? (
            <div className="text-center py-20 border-2 border-dashed border-border/30 rounded-3xl">
              <Trophy className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground text-lg">No success stories yet</p>
              <p className="text-sm text-muted-foreground mt-2">
                Share your partnership success stories
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {successStories.map((story) => (
                <Card 
                  key={story.id} 
                  className="border-border/30 bg-card/50 backdrop-blur-sm cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => handleStoryClick(story)}
                >
                  <CardContent className="p-6">
                    {story.screenshot && (
                      <img 
                        src={story.screenshot} 
                        alt={story.title}
                        className="w-full h-48 object-cover rounded-lg mb-4"
                      />
                    )}
                    <h3 className="text-xl font-bold mb-2">{story.title}</h3>
                    <p className="text-muted-foreground mb-4 line-clamp-3">{story.story}</p>
                    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditStory(story)}
                        className="rounded-full"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteStory(story.id)}
                        className="rounded-full text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
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
                  <DbProductCardWithPin product={product} />
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />

      <SuccessStoryDetailDialog
        open={storyDetailOpen}
        onOpenChange={setStoryDetailOpen}
        story={selectedStory}
      />
      <SuccessStoryDialog 
        open={storyDialogOpen} 
        onOpenChange={handleStoryDialogClose}
        editingStory={editingStory}
        onSuccess={handleStorySuccess}
      />
      <EnhancedSubmitDialog open={submitDialogOpen} onOpenChange={setSubmitDialogOpen} />
      <SubscribeDialog open={subscribeDialogOpen} onOpenChange={setSubscribeDialogOpen} />
    </div>
  );
}
