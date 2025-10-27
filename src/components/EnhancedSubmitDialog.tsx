import { useState, useEffect } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";

interface EnhancedSubmitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EnhancedSubmitDialog = ({ open, onOpenChange }: EnhancedSubmitDialogProps) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    websiteLink: "",
    screenshot: null as File | null,
    screenshotPreview: "",
    logo: null as File | null,
    logoPreview: "",
    description: "",
    targetAudience: "",
    category: "",
    contactEmail: "",
    tags: "",
    usesAI: false,
    techHighlights: "",
    users: "",
    revenue: "",
    growthRate: "",
    usersFile: null as File | null,
    revenueFile: null as File | null,
    growthFile: null as File | null,
    showOnLeaderboard: false,
    partnership: false,
    coMarketing: false,
    whiteLabel: false,
    reseller: false,
    acquisition: false,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Validation schema - only 4 required fields
  const formSchema = z.object({
    name: z.string().trim().min(1, "Product name is required").max(100, "Must be less than 100 characters"),
    websiteLink: z.string().trim().url({ message: "Valid website URL required" }).max(500, "Must be less than 500 characters"),
    description: z.string().trim().min(1, "Description is required").max(1000, "Must be less than 1000 characters"),
    contactEmail: z.string().trim().email("Valid email required").max(255, "Must be less than 255 characters"),
  });

  useEffect(() => {
    checkUser();
    loadSavedFormData();
  }, [open]);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setUser(session?.user || null);
  };

  const saveFormData = () => {
    const dataToSave = {
      ...formData,
      screenshot: null,
      screenshotPreview: formData.screenshotPreview,
      logo: null,
      logoPreview: formData.logoPreview,
      usersFile: null,
      revenueFile: null,
      growthFile: null,
    };
    localStorage.setItem('submitProductFormData', JSON.stringify(dataToSave));
    localStorage.setItem('auto_submit_after_auth', 'true');
  };

  const loadSavedFormData = () => {
    const savedData = localStorage.getItem('submitProductFormData');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setFormData(prev => ({ ...prev, ...parsed }));
      } catch (e) {
        console.error('Failed to load saved form data');
      }
    }
  };

  const clearSavedFormData = () => {
    localStorage.removeItem('submitProductFormData');
  };

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, screenshot: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, screenshotPreview: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, logo: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, logoPreview: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'usersFile' | 'revenueFile' | 'growthFile') => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, [field]: file }));
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setFormData({ ...formData, screenshot: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, screenshotPreview: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate only required fields
    const result = formSchema.safeParse({
      name: formData.name,
      websiteLink: formData.websiteLink,
      description: formData.description,
      contactEmail: formData.contactEmail,
    });
    
    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          newErrors[issue.path[0].toString()] = issue.message;
        }
      });
      setErrors(newErrors);
      return;
    }

    // Check if user is authenticated after validation
    if (!user) {
      saveFormData();
      toast.info("Please sign in to submit your product");
      onOpenChange(false);
      
      const currentPath = window.location.pathname;
      localStorage.setItem('auth_return_to', currentPath);
      localStorage.setItem('auth_open_submit', 'true');
      setTimeout(() => {
        navigate(`/auth?returnTo=${encodeURIComponent(currentPath)}&openSubmit=true`);
      }, 100);
      return;
    }

    setLoading(true);

    try {
      let screenshotUrl = null;
      let logoUrl = null;

      // Upload screenshot if provided
      if (formData.screenshot) {
        const screenshotExt = formData.screenshot.name.split('.').pop();
        const screenshotPath = `${user.id}/${Date.now()}-screenshot.${screenshotExt}`;
        const { error: screenshotUploadError } = await supabase.storage
          .from('product-images')
          .upload(screenshotPath, formData.screenshot);
        
        if (!screenshotUploadError) {
          const { data: { publicUrl } } = supabase.storage
            .from('product-images')
            .getPublicUrl(screenshotPath);
          screenshotUrl = publicUrl;
        }
      }

      // Upload logo if provided
      if (formData.logo) {
        const logoExt = formData.logo.name.split('.').pop();
        const logoPath = `${user.id}/${Date.now()}-logo.${logoExt}`;
        const { error: logoUploadError } = await supabase.storage
          .from('product-images')
          .upload(logoPath, formData.logo);
        
        if (!logoUploadError) {
          const { data: { publicUrl } } = supabase.storage
            .from('product-images')
            .getPublicUrl(logoPath);
          logoUrl = publicUrl;
        }
      }

      const { error: insertError } = await supabase
        .from('products')
        .insert([{
          user_id: user.id,
          name: formData.name,
          website_link: formData.websiteLink,
          description: formData.description,
          contact_email: formData.contactEmail,
          screenshot_url: screenshotUrl,
          logo_url: logoUrl,
          target_audience: formData.targetAudience || null,
          category: formData.category || null,
          tags: formData.tags || null,
          uses_ai: formData.usesAI,
          tech_highlights: formData.techHighlights || null,
          users: formData.users || null,
          revenue: formData.revenue || null,
          growth_rate: formData.growthRate || null,
          partnership: formData.partnership,
          co_marketing: formData.coMarketing,
          white_label: formData.whiteLabel,
          reseller: formData.reseller,
          acquisition: formData.acquisition,
        }]);

      if (insertError) throw insertError;

      toast.success("Product submitted successfully! It will be reviewed before going live.");
      
      clearSavedFormData();
      localStorage.removeItem('auto_submit_after_auth');
      onOpenChange(false);
      setFormData({
        name: "",
        websiteLink: "",
        screenshot: null,
        screenshotPreview: "",
        logo: null,
        logoPreview: "",
        description: "",
        targetAudience: "",
        category: "",
        contactEmail: "",
        tags: "",
        usesAI: false,
        techHighlights: "",
        users: "",
        revenue: "",
        growthRate: "",
        usersFile: null,
        revenueFile: null,
        growthFile: null,
        showOnLeaderboard: false,
        partnership: false,
        coMarketing: false,
        whiteLabel: false,
        reseller: false,
        acquisition: false,
      });
    } catch (error: any) {
      toast.error("Failed to submit product: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-2 pb-6">
          <DialogTitle className="text-3xl font-bold">Submit Your Product</DialogTitle>
          <DialogDescription className="text-base text-muted-foreground">
            Join the marketplace and connect with potential partners
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Product Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-base">Product Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                if (errors.name) setErrors({ ...errors, name: "" });
              }}
              placeholder="TaskFlow AI"
              className={`h-12 bg-muted/30 border-0 ${errors.name ? 'border-2 border-destructive' : ''}`}
            />
            {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
          </div>

          {/* Website Link */}
          <div className="space-y-2">
            <Label htmlFor="websiteLink" className="text-base">Website Link *</Label>
            <Input
              id="websiteLink"
              type="url"
              value={formData.websiteLink}
              onChange={(e) => {
                setFormData({ ...formData, websiteLink: e.target.value });
                if (errors.websiteLink) setErrors({ ...errors, websiteLink: "" });
              }}
              placeholder="https://yourproduct.com"
              className={`h-12 bg-muted/30 border-0 ${errors.websiteLink ? 'border-2 border-destructive' : ''}`}
            />
            {errors.websiteLink && <p className="text-sm text-destructive">{errors.websiteLink}</p>}
          </div>

          {/* Product Logo */}
          <div className="space-y-2">
            <Label className="text-base">Product Logo</Label>
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className="hidden"
                id="logo-upload"
              />
              <label
                htmlFor="logo-upload"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-xl hover:border-foreground/20 transition-colors cursor-pointer bg-muted/10"
              >
                {formData.logoPreview ? (
                  <img
                    src={formData.logoPreview}
                    alt="Logo Preview"
                    className="h-full object-contain p-4"
                  />
                ) : (
                  <div className="text-center p-4">
                    <p className="text-sm font-medium mb-1">
                      Upload your logo
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PNG, JPG or SVG
                    </p>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Product Screenshot */}
          <div className="space-y-2">
            <Label className="text-base">Product Screenshot</Label>
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className="relative"
            >
              <input
                type="file"
                accept="image/*"
                onChange={handleScreenshotChange}
                className="hidden"
                id="screenshot-upload"
              />
              <label
                htmlFor="screenshot-upload"
                className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-border rounded-xl hover:border-foreground/20 transition-colors cursor-pointer bg-muted/10"
              >
                {formData.screenshotPreview ? (
                  <img
                    src={formData.screenshotPreview}
                    alt="Preview"
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  <div className="text-center p-8">
                    <p className="text-base font-medium mb-1">
                      Drag & drop your screenshot here
                    </p>
                    <p className="text-sm text-muted-foreground">
                      or click to browse
                    </p>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-base">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => {
                setFormData({ ...formData, description: e.target.value });
                if (errors.description) setErrors({ ...errors, description: "" });
              }}
              placeholder="What does your product do? Who does it serve?"
              rows={4}
              className={`bg-muted/30 border-0 resize-none ${errors.description ? 'border-2 border-destructive' : ''}`}
            />
            {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
          </div>

          {/* Target Audience and Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="targetAudience" className="text-base">Target Audience</Label>
              <Input
                id="targetAudience"
                value={formData.targetAudience}
                onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                placeholder="B2B SaaS, B2C, etc."
                className="h-12 bg-muted/30 border-0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category" className="text-base">Category/Vertical</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="MarTech, EdTech, etc."
                className="h-12 bg-muted/30 border-0"
              />
            </div>
          </div>

          {/* Keywords/Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags" className="text-base">Keywords/Tags</Label>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="AI, SaaS, Automation (comma-separated)"
              className="h-12 bg-muted/30 border-0"
            />
          </div>

          {/* Technology Highlights */}
          <div className="space-y-2">
            <Label htmlFor="techHighlights" className="text-base">Technology Highlights</Label>
            <Input
              id="techHighlights"
              value={formData.techHighlights}
              onChange={(e) => setFormData({ ...formData, techHighlights: e.target.value })}
              placeholder="React, Node.js, OpenAI API (comma-separated)"
              className="h-12 bg-muted/30 border-0"
            />
          </div>

          {/* AI Toggle */}
          <div className="flex items-center gap-3">
            <Switch
              id="usesAI"
              checked={formData.usesAI}
              onCheckedChange={(checked) => setFormData({ ...formData, usesAI: checked })}
            />
            <Label htmlFor="usesAI" className="text-base cursor-pointer">
              This product uses AI
            </Label>
          </div>

          {/* Traction Metrics */}
          <div className="space-y-4 pt-6 border-t">
            <h3 className="text-xl font-semibold">Traction Metrics</h3>
            <p className="text-sm text-muted-foreground">
              Screenshots are confidential, used only for validation, and will not be visible publicly.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Users */}
              <div className="space-y-2">
                <Label htmlFor="users" className="text-base">Users/DAU/MAU</Label>
                <Input
                  id="users"
                  value={formData.users}
                  onChange={(e) => setFormData({ ...formData, users: e.target.value })}
                  placeholder="10k+ users"
                  className="h-12 bg-muted/30 border-0"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'usersFile')}
                  className="hidden"
                  id="users-file"
                />
                <Label
                  htmlFor="users-file"
                  className="flex items-center justify-center h-10 px-4 rounded-lg bg-muted hover:bg-muted/80 cursor-pointer text-sm"
                >
                  Choose File {formData.usersFile && '✓'}
                </Label>
              </div>

              {/* Revenue */}
              <div className="space-y-2">
                <Label htmlFor="revenue" className="text-base">Revenue Range</Label>
                <Input
                  id="revenue"
                  value={formData.revenue}
                  onChange={(e) => setFormData({ ...formData, revenue: e.target.value })}
                  placeholder="$50k MRR"
                  className="h-12 bg-muted/30 border-0"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'revenueFile')}
                  className="hidden"
                  id="revenue-file"
                />
                <Label
                  htmlFor="revenue-file"
                  className="flex items-center justify-center h-10 px-4 rounded-lg bg-muted hover:bg-muted/80 cursor-pointer text-sm"
                >
                  Choose File {formData.revenueFile && '✓'}
                </Label>
              </div>

              {/* Growth Rate */}
              <div className="space-y-2">
                <Label htmlFor="growthRate" className="text-base">Growth Rate</Label>
                <Input
                  id="growthRate"
                  value={formData.growthRate}
                  onChange={(e) => setFormData({ ...formData, growthRate: e.target.value })}
                  placeholder="+120% MoM"
                  className="h-12 bg-muted/30 border-0"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'growthFile')}
                  className="hidden"
                  id="growth-file"
                />
                <Label
                  htmlFor="growth-file"
                  className="flex items-center justify-center h-10 px-4 rounded-lg bg-muted hover:bg-muted/80 cursor-pointer text-sm"
                >
                  Choose File {formData.growthFile && '✓'}
                </Label>
              </div>
            </div>

            {/* Leaderboard Opt-in */}
            <div className="flex items-center gap-3 pt-2">
              <Switch
                id="showOnLeaderboard"
                checked={formData.showOnLeaderboard}
                onCheckedChange={(checked) => setFormData({ ...formData, showOnLeaderboard: checked })}
              />
              <Label htmlFor="showOnLeaderboard" className="text-base cursor-pointer">
                Show on leaderboard (opt-in)
              </Label>
            </div>
          </div>

          {/* Contact Email */}
          <div className="space-y-2">
            <Label htmlFor="contactEmail" className="text-base">Contact Email *</Label>
            <Input
              id="contactEmail"
              type="email"
              value={formData.contactEmail}
              onChange={(e) => {
                setFormData({ ...formData, contactEmail: e.target.value });
                if (errors.contactEmail) setErrors({ ...errors, contactEmail: "" });
              }}
              placeholder="your@email.com"
              className={`h-12 bg-muted/30 border-0 ${errors.contactEmail ? 'border-2 border-destructive' : ''}`}
            />
            {errors.contactEmail && <p className="text-sm text-destructive">{errors.contactEmail}</p>}
          </div>

          {/* Partnership Opportunities */}
          <div className="space-y-4 pt-6 border-t">
            <div>
              <h3 className="text-xl font-semibold mb-1">Open To</h3>
              <p className="text-sm text-muted-foreground">
                Select the opportunities you're interested in (optional)
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { id: 'partnership', label: 'Partnership', description: 'Collaborate on mutual growth initiatives' },
                { id: 'coMarketing', label: 'Co-Marketing', description: 'Joint marketing campaigns and content' },
                { id: 'whiteLabel', label: 'White Label', description: 'License your product to other brands' },
                { id: 'reseller', label: 'Reseller', description: 'Partner with resellers and distributors' },
                { id: 'acquisition', label: 'Acquisition', description: 'Open to acquisition discussions' },
              ].map((option) => (
                <label
                  key={option.id}
                  className="flex items-start gap-3 p-4 rounded-lg bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
                >
                  <Checkbox
                    checked={formData[option.id as keyof typeof formData] as boolean}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, [option.id]: checked })
                    }
                    className="mt-1"
                  />
                  <div className="space-y-1">
                    <div className="font-medium">{option.label}</div>
                    <p className="text-sm text-muted-foreground">{option.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-12 text-base"
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit Product"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
