import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Upload } from "lucide-react";
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

  useEffect(() => {
    checkUser();
    loadSavedFormData();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setUser(session?.user || null);
  };

  const saveFormData = () => {
    const dataToSave = {
      ...formData,
      screenshot: null,
      screenshotPreview: formData.screenshotPreview,
      usersFile: null,
      revenueFile: null,
      growthFile: null,
    };
    localStorage.setItem('submitProductFormData', JSON.stringify(dataToSave));
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

    if (!user) {
      saveFormData();
      toast.error("Please sign in to submit a product");
      onOpenChange(false);
      setTimeout(() => navigate("/auth"), 100);
      return;
    }
    
    setLoading(true);

    try {
      // Simulate submission (database would go here)
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast.success("Product submitted successfully!");
      
      clearSavedFormData();
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
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="TaskFlow AI"
              className="h-12 bg-muted/30 border-0"
              required
            />
          </div>

          {/* Website Link */}
          <div className="space-y-2">
            <Label htmlFor="websiteLink" className="text-base">Website Link</Label>
            <Input
              id="websiteLink"
              type="url"
              value={formData.websiteLink}
              onChange={(e) => setFormData({ ...formData, websiteLink: e.target.value })}
              placeholder="https://yourproduct.com"
              className="h-12 bg-muted/30 border-0"
            />
          </div>

          {/* Product Screenshot */}
          <div className="space-y-2">
            <Label className="text-base">Product Screenshot *</Label>
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
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="What does your product do? Who does it serve?"
              rows={4}
              className="bg-muted/30 border-0 resize-none"
              required
            />
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
              Screenshots are confidential, used only for validation, and will not be visible publicly. Without uploading a screenshot, traction fields cannot be completed.
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
                Opt in to be featured on the Traction Leaderboard
              </Label>
            </div>
          </div>

          {/* Open To */}
          <div className="space-y-4 pt-6 border-t">
            <h3 className="text-xl font-semibold">Open To</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Checkbox
                  id="partnership"
                  checked={formData.partnership}
                  onCheckedChange={(checked) => setFormData({ ...formData, partnership: checked as boolean })}
                />
                <Label htmlFor="partnership" className="text-base cursor-pointer">
                  Partnership
                </Label>
              </div>

              <div className="flex items-center gap-3">
                <Checkbox
                  id="coMarketing"
                  checked={formData.coMarketing}
                  onCheckedChange={(checked) => setFormData({ ...formData, coMarketing: checked as boolean })}
                />
                <Label htmlFor="coMarketing" className="text-base cursor-pointer">
                  Co-marketing
                </Label>
              </div>

              <div className="flex items-center gap-3">
                <Checkbox
                  id="whiteLabel"
                  checked={formData.whiteLabel}
                  onCheckedChange={(checked) => setFormData({ ...formData, whiteLabel: checked as boolean })}
                />
                <Label htmlFor="whiteLabel" className="text-base cursor-pointer">
                  White-label
                </Label>
              </div>

              <div className="flex items-center gap-3">
                <Checkbox
                  id="reseller"
                  checked={formData.reseller}
                  onCheckedChange={(checked) => setFormData({ ...formData, reseller: checked as boolean })}
                />
                <Label htmlFor="reseller" className="text-base cursor-pointer">
                  Reseller
                </Label>
              </div>

              <div className="flex items-center gap-3">
                <Checkbox
                  id="acquisition"
                  checked={formData.acquisition}
                  onCheckedChange={(checked) => setFormData({ ...formData, acquisition: checked as boolean })}
                />
                <Label htmlFor="acquisition" className="text-base cursor-pointer">
                  Acquisition
                </Label>
              </div>
            </div>
          </div>

          {/* Contact Email */}
          <div className="space-y-2 pt-6 border-t">
            <Label htmlFor="contactEmail" className="text-base">Contact Email *</Label>
            <Input
              id="contactEmail"
              type="email"
              value={formData.contactEmail}
              onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
              placeholder="founder@company.com"
              className="h-12 bg-muted/30 border-0"
              required
            />
            <p className="text-sm text-muted-foreground">
              Your email remains private. Other founders will not see it directly — messages are forwarded securely to your inbox.
            </p>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full h-14 text-base rounded-full bg-foreground text-background hover:bg-foreground/90"
          >
            {loading ? "Submitting..." : "Submit Product"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
