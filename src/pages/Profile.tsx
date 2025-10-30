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
import { User, Save, Pin, Trophy, Linkedin, Github, Globe, Twitter, Edit, Trash2, Upload } from "lucide-react";
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

      <main className="container mx-auto px-4 md:px-6 py-12 flex-1 max-w-6xl">
        {/* Profile Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <User className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold">My Profile</h1>
                <p className="text-sm text-muted-foreground">Manage your information and saved products</p>
              </div>
            </div>
            <Button
              onClick={handleSaveProfile}
              disabled={saving}
              variant="outline"
              size="sm"
              className="rounded-md"
            >
              {saving ? "Saving..." : "Edit Profile"}
            </Button>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name" className="text-sm font-medium mb-2 block">
                  Name
                </Label>
                <Input
                  id="name"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  placeholder="Your name"
                  className="bg-background"
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
                  placeholder="e.g., Founder, Product Manager"
                  className="bg-background"
                />
              </div>
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
                className="bg-background"
              />
            </div>

            {/* Social Links Section */}
            <div className="pt-6 space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Globe className="w-5 h-5 text-muted-foreground" />
                <h3 className="text-base font-semibold">Social Links</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    className="bg-background"
                  />
                </div>

                <div>
                  <Label htmlFor="twitter" className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Twitter className="w-4 h-4" />
                    Twitter/X
                  </Label>
                  <Input
                    id="twitter"
                    value={profile.twitter}
                    onChange={(e) => setProfile({ ...profile, twitter: e.target.value })}
                    placeholder="https://twitter.com/yourusername"
                    className="bg-background"
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
                    className="bg-background"
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
                    className="bg-background"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pin Board Section */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
              <Pin className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold">Pin Board</h2>
              <p className="text-sm text-muted-foreground">Products you've saved for later ({pinnedProducts.length})</p>
            </div>
          </div>

          {pinnedProducts.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed border-border/30 rounded-xl bg-muted/20">
              <Pin className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground">No saved products yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Save products to your board from the main page
              </p>
            </div>
          ) : (
            <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
              {pinnedProducts.map((product) => (
                <div key={product.id} className="relative break-inside-avoid mb-6">
                  <DbProductCardWithPin 
                    product={product} 
                    showUnpinButton={true}
                    onUnpin={handleUnpin}
                  />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Success Stories Section */}
        <section className="mb-12">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Share Your Success Story</h2>
            <p className="text-sm text-muted-foreground">Have a partnership success story? Share it with the community!</p>
          </div>

          <div className="space-y-4 bg-card border border-border rounded-xl p-6">
            <div>
              <Label htmlFor="story-title" className="text-sm font-medium mb-2 block">
                Title
              </Label>
              <Input
                id="story-title"
                placeholder="E.g., Found the perfect co-marketing partner"
                className="bg-background"
              />
            </div>

            <div>
              <Label htmlFor="story-text" className="text-sm font-medium mb-2 block">
                Your Story
              </Label>
              <div className="relative">
                <textarea
                  id="story-text"
                  placeholder="Share your experience and the outcome..."
                  className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                />
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium mb-2 block">
                Screenshot (Optional)
              </Label>
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center bg-muted/20 hover:bg-muted/30 transition-colors cursor-pointer">
                <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Click to upload an image</p>
              </div>
            </div>

            <Button
              onClick={() => setStoryDialogOpen(true)}
              className="w-full rounded-md bg-foreground text-background hover:bg-foreground/90"
            >
              Submit Story
            </Button>
          </div>

          {successStories.length > 0 && (
            <div className="mt-8 space-y-4">
              <h3 className="text-lg font-semibold">Your Stories</h3>
              <div className="grid grid-cols-1 gap-4">
                {successStories.map((story) => (
                  <Card 
                    key={story.id} 
                    className="border-border/30 bg-card/50 backdrop-blur-sm cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => handleStoryClick(story)}
                  >
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        {story.screenshot && (
                          <img 
                            src={story.screenshot} 
                            alt={story.title}
                            className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold mb-1">{story.title}</h4>
                          <p className="text-sm text-muted-foreground line-clamp-2">{story.story}</p>
                          <div className="flex gap-2 mt-3" onClick={(e) => e.stopPropagation()}>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditStory(story)}
                              className="h-8 text-xs"
                            >
                              <Edit className="w-3 h-3 mr-1" />
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteStory(story.id)}
                              className="h-8 text-xs text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-3 h-3 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
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
