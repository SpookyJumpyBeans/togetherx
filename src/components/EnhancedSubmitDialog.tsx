import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Upload, Image as ImageIcon, Shield } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface EnhancedSubmitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EnhancedSubmitDialog = ({ open, onOpenChange }: EnhancedSubmitDialogProps) => {
  const [formData, setFormData] = useState({
    name: "",
    websiteLink: "",
    screenshot: null as File | null,
    screenshotPreview: "",
    description: "",
    targetAudience: "",
    category: "",
    contactEmail: "",
    tags: "",
    usesAI: false,
    techHighlights: "",
    users: "",
    mau: "",
    revenue: "",
    verificationScreenshots: [] as File[],
    coMarketing: false,
    whiteLabel: false,
    acquisition: false,
    reseller: false,
  });
  const [loading, setLoading] = useState(false);

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

  const handleVerificationScreenshots = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData({ ...formData, verificationScreenshots: files });
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
    
    // Check if traction metrics require verification
    const hasTractionData = formData.users || formData.mau || formData.revenue;
    if (hasTractionData && formData.verificationScreenshots.length === 0) {
      toast.error("Please upload verification screenshots for traction metrics");
      return;
    }

    setLoading(true);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.error("Please sign in to submit a product");
      setLoading(false);
      return;
    }

    try {
      // Upload product screenshot
      let imageUrl = "";
      if (formData.screenshot) {
        const fileExt = formData.screenshot.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(fileName, formData.screenshot);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(fileName);
        
        imageUrl = publicUrl;
      }

      // Upload verification screenshots (private)
      const verificationUrls: string[] = [];
      for (const file of formData.verificationScreenshots) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${session.user.id}/${Math.random()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('verification-screenshots')
          .upload(fileName, file);

        if (uploadError) throw uploadError;
        verificationUrls.push(fileName);
      }

      // Insert product
      const { error: insertError } = await supabase
        .from('products')
        .insert([{
          user_id: session.user.id,
          name: formData.name,
          website_link: formData.websiteLink,
          image: imageUrl,
          description: formData.description,
          target_audience: formData.targetAudience,
          category: formData.category,
          contact_email: formData.contactEmail,
          tags: formData.tags.split(',').map(t => t.trim()),
          uses_ai: formData.usesAI,
          tech_highlights: formData.techHighlights.split(',').map(t => t.trim()),
          users: formData.users ? parseInt(formData.users) : null,
          mau: formData.mau ? parseInt(formData.mau) : null,
          revenue: formData.revenue,
          verification_screenshots: verificationUrls,
          co_marketing: formData.coMarketing,
          white_label: formData.whiteLabel,
          acquisition: formData.acquisition,
          reseller: formData.reseller,
        }]);

      if (insertError) throw insertError;

      toast.success("Product submitted successfully!", {
        description: "We'll review your submission and get back to you soon.",
      });
      
      onOpenChange(false);
      setFormData({
        name: "",
        websiteLink: "",
        screenshot: null,
        screenshotPreview: "",
        description: "",
        targetAudience: "",
        category: "",
        contactEmail: "",
        tags: "",
        usesAI: false,
        techHighlights: "",
        users: "",
        mau: "",
        revenue: "",
        verificationScreenshots: [],
        coMarketing: false,
        whiteLabel: false,
        acquisition: false,
        reseller: false,
      });
    } catch (error: any) {
      toast.error("Failed to submit product", {
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto border-0 shadow-2xl">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-3xl font-bold">Submit Your Product</DialogTitle>
          <DialogDescription className="text-base">
            Join the community and discover partnership opportunities
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-8 pt-4">
          {/* Basic Information */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
            </div>

            <div>
              <Label htmlFor="name" className="text-sm font-medium mb-2 block">Product Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., CodeFlow AI"
                className="border-0 border-b-2 border-border/50 rounded-none focus:border-primary transition-colors bg-transparent shadow-none px-0"
                required
              />
            </div>

            <div>
              <Label htmlFor="websiteLink" className="text-sm font-medium mb-2 block">Website Link *</Label>
              <Input
                id="websiteLink"
                type="url"
                value={formData.websiteLink}
                onChange={(e) => setFormData({ ...formData, websiteLink: e.target.value })}
                placeholder="https://yourproduct.com"
                className="border-0 border-b-2 border-border/50 rounded-none focus:border-primary transition-colors bg-transparent shadow-none px-0"
                required
              />
            </div>

            <div>
              <Label htmlFor="contactEmail" className="text-sm font-medium mb-2 block">Contact Email *</Label>
              <Input
                id="contactEmail"
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                placeholder="founder@yourproduct.com"
                className="border-0 border-b-2 border-border/50 rounded-none focus:border-primary transition-colors bg-transparent shadow-none px-0"
                required
              />
              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-2">
                <Shield className="w-3 h-3" />
                Your email remains private. Messages are forwarded securely to your inbox.
              </p>
            </div>

            <div>
              <Label className="text-sm font-medium mb-3 block">Product Screenshot *</Label>
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
                  required={!formData.screenshot}
                />
                <label
                  htmlFor="screenshot-upload"
                  className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-border/30 rounded-3xl hover:border-primary/50 transition-colors cursor-pointer bg-muted/10 overflow-hidden"
                >
                  {formData.screenshotPreview ? (
                    <img
                      src={formData.screenshotPreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center p-8">
                      <ImageIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-lg font-medium mb-2">
                        Drop your screenshot here or click to browse
                      </p>
                      <p className="text-sm text-muted-foreground">
                        PNG, JPG up to 10MB
                      </p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            <div>
              <Label htmlFor="description" className="text-sm font-medium mb-2 block">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="What does your product do and who does it serve?"
                rows={4}
                className="border-0 border-b-2 border-border/50 rounded-none focus:border-primary transition-colors bg-transparent shadow-none resize-none px-0"
                required
              />
            </div>
          </div>

          {/* Traction Metrics */}
          <div className="space-y-6 pt-6 border-t border-border/30">
            <div>
              <h3 className="text-lg font-semibold mb-2">Traction Metrics</h3>
              <p className="text-sm text-muted-foreground">Share your growth metrics (optional)</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Label htmlFor="users" className="text-sm font-medium mb-2 block">Total Users</Label>
                <Input
                  id="users"
                  type="number"
                  value={formData.users}
                  onChange={(e) => setFormData({ ...formData, users: e.target.value })}
                  placeholder="15000"
                  className="border-0 border-b-2 border-border/50 rounded-none focus:border-primary transition-colors bg-transparent shadow-none px-0"
                />
              </div>

              <div>
                <Label htmlFor="mau" className="text-sm font-medium mb-2 block">Monthly Active</Label>
                <Input
                  id="mau"
                  type="number"
                  value={formData.mau}
                  onChange={(e) => setFormData({ ...formData, mau: e.target.value })}
                  placeholder="8500"
                  className="border-0 border-b-2 border-border/50 rounded-none focus:border-primary transition-colors bg-transparent shadow-none px-0"
                />
              </div>

              <div>
                <Label htmlFor="revenue" className="text-sm font-medium mb-2 block">Revenue</Label>
                <Input
                  id="revenue"
                  value={formData.revenue}
                  onChange={(e) => setFormData({ ...formData, revenue: e.target.value })}
                  placeholder="$50k MRR"
                  className="border-0 border-b-2 border-border/50 rounded-none focus:border-primary transition-colors bg-transparent shadow-none px-0"
                />
              </div>
            </div>

            {(formData.users || formData.mau || formData.revenue) && (
              <div>
                <Label className="text-sm font-medium mb-3 block flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" />
                  Verification Screenshots (Required for Traction Metrics) *
                </Label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleVerificationScreenshots}
                  className="hidden"
                  id="verification-upload"
                  required={!!(formData.users || formData.mau || formData.revenue)}
                />
                <label
                  htmlFor="verification-upload"
                  className="flex items-center justify-center w-full h-32 border-2 border-dashed border-primary/30 rounded-2xl hover:border-primary/50 transition-colors cursor-pointer bg-primary/5"
                >
                  <div className="text-center">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-primary" />
                    <p className="text-sm font-medium">
                      {formData.verificationScreenshots.length > 0
                        ? `${formData.verificationScreenshots.length} file(s) selected`
                        : "Upload verification screenshots"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2 max-w-md">
                      Screenshots are confidential, used only for validation, and will not be visible publicly.
                    </p>
                  </div>
                </label>
              </div>
            )}
          </div>

          {/* Partnership Opportunities */}
          <div className="space-y-6 pt-6 border-t border-border/30">
            <div>
              <h3 className="text-lg font-semibold mb-4">Partnership Opportunities</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="coMarketing"
                  checked={formData.coMarketing}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, coMarketing: checked as boolean })
                  }
                />
                <Label htmlFor="coMarketing" className="cursor-pointer font-normal">
                  Co-Marketing / Cross-Promotion
                </Label>
              </div>

              <div className="flex items-center space-x-3">
                <Checkbox
                  id="whiteLabel"
                  checked={formData.whiteLabel}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, whiteLabel: checked as boolean })
                  }
                />
                <Label htmlFor="whiteLabel" className="cursor-pointer font-normal">
                  White-Label / Distribution Partnership
                </Label>
              </div>

              <div className="flex items-center space-x-3">
                <Checkbox
                  id="reseller"
                  checked={formData.reseller}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, reseller: checked as boolean })
                  }
                />
                <Label htmlFor="reseller" className="cursor-pointer font-normal">
                  Reseller / Channel Partnership
                </Label>
              </div>

              <div className="flex items-center space-x-3">
                <Checkbox
                  id="acquisition"
                  checked={formData.acquisition}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, acquisition: checked as boolean })
                  }
                />
                <Label htmlFor="acquisition" className="cursor-pointer font-normal">
                  Open to Acquisition Offers
                </Label>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            size="lg"
            className="w-full rounded-full shadow-lg hover:shadow-xl transition-all mt-8"
          >
            {loading ? "Submitting..." : "Submit Product"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
