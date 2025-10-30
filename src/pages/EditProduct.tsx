import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { z } from "zod";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TagSelector } from "@/components/ui/tag-selector";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { Upload, X } from "lucide-react";
import {
  TARGET_AUDIENCE_SUGGESTIONS,
  CATEGORY_SUGGESTIONS,
  KEYWORD_SUGGESTIONS,
  TECH_HIGHLIGHTS_SUGGESTIONS,
  USER_RANGES,
  REVENUE_RANGES,
  GROWTH_RATE_RANGES,
} from "@/data/tagSuggestions";

const formSchema = z.object({
  name: z.string().trim().min(1, "Product name is required").max(100),
  website_link: z.string().trim().url({ message: "Valid website URL required" }).max(500),
  description: z.string().trim().min(1, "Description is required").max(1000),
  contact_email: z.string().trim().email("Valid email required").max(255),
});

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    website_link: "",
    description: "",
    contact_email: "",
    targetAudience: [] as string[],
    category: [] as string[],
    tags: [] as string[],
    techHighlights: [] as string[],
    users: "",
    revenue: "",
    growthRate: "",
    coMarketing: false,
    whiteLabel: false,
    acquisition: false,
    reseller: false,
    acquisitionDetails: "",
    show_on_leaderboard: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [screenshots, setScreenshots] = useState<File[]>([]);
  const [logo, setLogo] = useState<File | null>(null);
  const [existingScreenshots, setExistingScreenshots] = useState<string[]>([]);
  const [existingLogo, setExistingLogo] = useState<string>("");

  useEffect(() => {
    document.title = "Edit Product | Marketplace";
  }, []);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setUserId(session.user.id);

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error || !data) {
        toast.error("Product not found");
        navigate("/my-products");
        return;
      }

      if (data.user_id !== session.user.id) {
        toast.error("You do not have permission to edit this product");
        navigate("/my-products");
        return;
      }

      setForm({
        name: data.name || "",
        website_link: data.website_link || "",
        description: data.description || "",
        contact_email: data.contact_email || "",
        targetAudience: data.target_audience ? data.target_audience.split(', ').filter(Boolean) : [],
        category: data.category ? data.category.split(', ').filter(Boolean) : [],
        tags: data.tags ? data.tags.split(', ').filter(Boolean) : [],
        techHighlights: data.tech_highlights ? data.tech_highlights.split(', ').filter(Boolean) : [],
        users: data.users || "",
        revenue: data.revenue || "",
        growthRate: data.growth_rate || "",
        coMarketing: data.co_marketing || false,
        whiteLabel: data.white_label || false,
        acquisition: data.acquisition || false,
        reseller: data.reseller || false,
        acquisitionDetails: data.acquisition_details || "",
        show_on_leaderboard: data.show_on_leaderboard || false,
      });
      
      if (data.screenshot_urls && Array.isArray(data.screenshot_urls)) {
        setExistingScreenshots(data.screenshot_urls);
      }
      if (data.logo_url) {
        setExistingLogo(data.logo_url);
      }
      
      setLoading(false);
    };
    init();
  }, [id, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = formSchema.safeParse({
      name: form.name,
      website_link: form.website_link,
      description: form.description,
      contact_email: form.contact_email,
    });
    
    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) newErrors[issue.path[0].toString()] = issue.message;
      });
      setErrors(newErrors);
      return;
    }

    // Validate proof images for traction metrics - require at least one screenshot for proof
    const hasProofImages = existingScreenshots.length > 0 || screenshots.length > 0;
    const hasTractionMetrics = form.users || form.revenue || form.growthRate;
    
    if (hasTractionMetrics && !hasProofImages) {
      toast.error("Please upload at least one screenshot as proof for traction metrics");
      return;
    }

    if (!userId) return;

    setSaving(true);
    
    try {
      let screenshotUrls = [...existingScreenshots];
      let logoUrl = existingLogo;

      // Upload new screenshots
      if (screenshots.length > 0) {
        const uploadPromises = screenshots.map(async (file) => {
          const fileExt = file.name.split('.').pop();
          const fileName = `${userId}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
          const { error: uploadError, data } = await supabase.storage
            .from('product-assets')
            .upload(fileName, file);
          
          if (uploadError) throw uploadError;
          
          const { data: { publicUrl } } = supabase.storage
            .from('product-assets')
            .getPublicUrl(fileName);
          
          return publicUrl;
        });
        
        const newUrls = await Promise.all(uploadPromises);
        screenshotUrls = [...screenshotUrls, ...newUrls];
      }

      // Upload new logo
      if (logo) {
        const fileExt = logo.name.split('.').pop();
        const fileName = `${userId}/logo_${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('product-assets')
          .upload(fileName, logo);
        
        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('product-assets')
          .getPublicUrl(fileName);
        
        logoUrl = publicUrl;
      }

      const { error } = await supabase
        .from("products")
        .update({
          name: form.name,
          website_link: form.website_link,
          description: form.description,
          contact_email: form.contact_email,
          target_audience: form.targetAudience.join(', '),
          category: form.category.join(', '),
          tags: form.tags.join(', '),
          tech_highlights: form.techHighlights.join(', '),
          users: form.users || null,
          revenue: form.revenue || null,
          growth_rate: form.growthRate || null,
          co_marketing: form.coMarketing,
          white_label: form.whiteLabel,
          acquisition: form.acquisition,
          reseller: form.reseller,
          acquisition_details: form.acquisitionDetails || null,
          show_on_leaderboard: form.show_on_leaderboard,
          screenshot_urls: screenshotUrls,
          logo_url: logoUrl || null,
          approval_status: "pending",
        })
        .eq("id", id as string)
        .eq("user_id", userId);

      if (error) throw error;
      
      toast.success("Changes saved. Your product will be re-reviewed.");
      navigate("/my-products");
    } catch (error: any) {
      console.error("Update product error", error);
      toast.error(`Failed to update product: ${error.message || "Unknown error"}`);
    }
    
    setSaving(false);
  };

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setScreenshots((prev) => [...prev, ...files]);
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setLogo(file);
  };

  const removeScreenshot = (index: number) => {
    setScreenshots((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingScreenshot = (url: string) => {
    setExistingScreenshots((prev) => prev.filter((u) => u !== url));
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
      <main className="container mx-auto px-6 md:px-8 py-16 flex-1 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Edit Product</h1>
          <p className="text-muted-foreground">Update your submission and resubmit for approval</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Product Details</CardTitle>
            <CardDescription>Fields marked with * are required</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Basic Information</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="h-12"
                  />
                  {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website_link">Website Link *</Label>
                  <Input
                    id="website_link"
                    type="url"
                    value={form.website_link}
                    onChange={(e) => setForm({ ...form, website_link: e.target.value })}
                    placeholder="https://yourproduct.com"
                    className="h-12"
                  />
                  {errors.website_link && <p className="text-sm text-destructive">{errors.website_link}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    rows={4}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="resize-none"
                  />
                  {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact_email">Contact Email *</Label>
                  <Input
                    id="contact_email"
                    type="email"
                    value={form.contact_email}
                    onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
                    className="h-12"
                  />
                  {errors.contact_email && <p className="text-sm text-destructive">{errors.contact_email}</p>}
                </div>

                <div className="space-y-3">
                  <Label>Product Screenshots</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {existingScreenshots.map((url, idx) => (
                      <div key={idx} className="relative aspect-video rounded-lg overflow-hidden border">
                        <img src={url} alt={`Screenshot ${idx + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeExistingScreenshot(url)}
                          className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    {screenshots.map((file, idx) => (
                      <div key={`new-${idx}`} className="relative aspect-video rounded-lg overflow-hidden border">
                        <img src={URL.createObjectURL(file)} alt={`New screenshot ${idx + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeScreenshot(idx)}
                          className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent/50">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Click to upload screenshots</p>
                      </div>
                      <input type="file" className="hidden" accept="image/*" multiple onChange={handleScreenshotChange} />
                    </label>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Product Logo</Label>
                  {(existingLogo || logo) && (
                    <div className="relative w-32 h-32 rounded-lg overflow-hidden border">
                      <img
                        src={logo ? URL.createObjectURL(logo) : existingLogo}
                        alt="Logo"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setLogo(null);
                          setExistingLogo("");
                        }}
                        className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent/50">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Click to upload logo</p>
                      </div>
                      <input type="file" className="hidden" accept="image/*" onChange={handleLogoChange} />
                    </label>
                  </div>
                </div>

                <TagSelector
                  label="Target Audience"
                  value={form.targetAudience}
                  onChange={(tags) => setForm({ ...form, targetAudience: tags })}
                  suggestions={TARGET_AUDIENCE_SUGGESTIONS}
                  placeholder="Search or add custom audience..."
                />

                <TagSelector
                  label="Category/Vertical"
                  value={form.category}
                  onChange={(tags) => setForm({ ...form, category: tags })}
                  suggestions={CATEGORY_SUGGESTIONS}
                  placeholder="Search or add custom category..."
                />

                <TagSelector
                  label="Keywords/Tags"
                  value={form.tags}
                  onChange={(tags) => setForm({ ...form, tags: tags })}
                  suggestions={KEYWORD_SUGGESTIONS}
                  placeholder="Search or add custom keywords..."
                />

                <TagSelector
                  label="Technology Highlights"
                  value={form.techHighlights}
                  onChange={(tags) => setForm({ ...form, techHighlights: tags })}
                  suggestions={TECH_HIGHLIGHTS_SUGGESTIONS}
                  placeholder="Search or add technologies..."
                />
              </div>

              {/* Traction Metrics */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Traction Metrics</h3>

                <div className="space-y-2">
                  <Label htmlFor="users">Users</Label>
                  <Select value={form.users} onValueChange={(value) => setForm({ ...form, users: value })}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select user range" />
                    </SelectTrigger>
                    <SelectContent>
                      {USER_RANGES.map((range) => (
                        <SelectItem key={range} value={range}>
                          {range}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="revenue">Revenue Range</Label>
                  <Select value={form.revenue} onValueChange={(value) => setForm({ ...form, revenue: value })}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select revenue range" />
                    </SelectTrigger>
                    <SelectContent>
                      {REVENUE_RANGES.map((range) => (
                        <SelectItem key={range} value={range}>
                          {range}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="growthRate">Growth Rate</Label>
                  <Select value={form.growthRate} onValueChange={(value) => setForm({ ...form, growthRate: value })}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select growth rate" />
                    </SelectTrigger>
                    <SelectContent>
                      {GROWTH_RATE_RANGES.map((range) => (
                        <SelectItem key={range} value={range}>
                          {range}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Partnership Opportunities */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Partnership Opportunities</h3>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-0.5">
                    <Label htmlFor="coMarketing">Co-Marketing</Label>
                    <p className="text-sm text-muted-foreground">Collaborate on marketing initiatives</p>
                  </div>
                  <Switch
                    id="coMarketing"
                    checked={form.coMarketing}
                    onCheckedChange={(checked) => setForm({ ...form, coMarketing: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-0.5">
                    <Label htmlFor="whiteLabel">White Label</Label>
                    <p className="text-sm text-muted-foreground">Available for white labeling</p>
                  </div>
                  <Switch
                    id="whiteLabel"
                    checked={form.whiteLabel}
                    onCheckedChange={(checked) => setForm({ ...form, whiteLabel: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-0.5">
                    <Label htmlFor="acquisition">Open to Acquisition</Label>
                    <p className="text-sm text-muted-foreground">Considering acquisition offers</p>
                  </div>
                  <Switch
                    id="acquisition"
                    checked={form.acquisition}
                    onCheckedChange={(checked) => setForm({ ...form, acquisition: checked })}
                  />
                </div>

                {form.acquisition && (
                  <div className="space-y-2 ml-4">
                    <Label htmlFor="acquisitionDetails">Acquisition Details</Label>
                    <Textarea
                      id="acquisitionDetails"
                      rows={3}
                      value={form.acquisitionDetails}
                      onChange={(e) => setForm({ ...form, acquisitionDetails: e.target.value })}
                      placeholder="Provide details about your acquisition preferences..."
                      className="resize-none"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-0.5">
                    <Label htmlFor="reseller">Reseller Program</Label>
                    <p className="text-sm text-muted-foreground">Offer reseller opportunities</p>
                  </div>
                  <Switch
                    id="reseller"
                    checked={form.reseller}
                    onCheckedChange={(checked) => setForm({ ...form, reseller: checked })}
                  />
                </div>
              </div>

              {/* Leaderboard Opt-in */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-0.5">
                    <Label htmlFor="show_on_leaderboard">Show on Leaderboard</Label>
                    <p className="text-sm text-muted-foreground">Display this product on the monthly leaderboard</p>
                  </div>
                  <Switch
                    id="show_on_leaderboard"
                    checked={form.show_on_leaderboard}
                    onCheckedChange={(checked) => setForm({ ...form, show_on_leaderboard: checked })}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={saving} className="flex-1">
                  {saving ? "Saving..." : "Save and Resubmit"}
                </Button>
                <Button type="button" variant="outline" className="flex-1" onClick={() => navigate(-1)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
