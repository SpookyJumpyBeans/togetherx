import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Upload } from "lucide-react";

interface SubmitProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SubmitProductDialog = ({ open, onOpenChange }: SubmitProductDialogProps) => {
  const [formData, setFormData] = useState({
    name: "",
    logo: "",
    screenshot: null as File | null,
    description: "",
    targetAudience: "",
    category: "",
    tags: "",
    usesAI: false,
    techHighlights: "",
    users: "",
    mau: "",
    revenue: "",
    coMarketing: false,
    whiteLabel: false,
    acquisition: false,
    reseller: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Product submitted successfully!", {
      description: "We'll review your submission and get back to you soon.",
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Submit Your Product</DialogTitle>
          <DialogDescription>
            Join the community and discover partnership opportunities
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
              <CardDescription>Tell us about your product</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Product Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., CodeFlow AI"
                  required
                />
              </div>

              <div>
                <Label htmlFor="screenshot">Product Screenshot</Label>
                <div className="mt-2">
                  <label
                    htmlFor="screenshot"
                    className="flex items-center justify-center w-full h-32 border-2 border-dashed border-border/50 rounded-2xl hover:border-primary/50 transition-colors cursor-pointer bg-muted/20"
                  >
                    <div className="text-center">
                      <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        {formData.screenshot ? formData.screenshot.name : "Click to upload screenshot"}
                      </p>
                    </div>
                    <input
                      id="screenshot"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => setFormData({ ...formData, screenshot: e.target.files?.[0] || null })}
                    />
                  </label>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="What does your product do and who does it serve?"
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="targetAudience">Target Audience</Label>
                  <Input
                    id="targetAudience"
                    value={formData.targetAudience}
                    onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                    placeholder="e.g., B2B SaaS, B2C"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g., MarTech, FinTech"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="tags">Keywords / Tags</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="Separate with commas: AI, SEO, Marketing"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="usesAI"
                  checked={formData.usesAI}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, usesAI: checked as boolean })
                  }
                />
                <Label htmlFor="usesAI" className="cursor-pointer">
                  This product uses AI technology
                </Label>
              </div>

              <div>
                <Label htmlFor="techHighlights">Technology Highlights</Label>
                <Input
                  id="techHighlights"
                  value={formData.techHighlights}
                  onChange={(e) => setFormData({ ...formData, techHighlights: e.target.value })}
                  placeholder="Separate with commas: REST API, WebSocket, Blockchain"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Traction Data</CardTitle>
              <CardDescription>Share your growth metrics (optional)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="users">Total Users</Label>
                  <Input
                    id="users"
                    type="number"
                    value={formData.users}
                    onChange={(e) => setFormData({ ...formData, users: e.target.value })}
                    placeholder="15000"
                  />
                </div>

                <div>
                  <Label htmlFor="mau">Monthly Active Users</Label>
                  <Input
                    id="mau"
                    type="number"
                    value={formData.mau}
                    onChange={(e) => setFormData({ ...formData, mau: e.target.value })}
                    placeholder="8500"
                  />
                </div>

                <div>
                  <Label htmlFor="revenue">Revenue Range</Label>
                  <Input
                    id="revenue"
                    value={formData.revenue}
                    onChange={(e) => setFormData({ ...formData, revenue: e.target.value })}
                    placeholder="$50k MRR"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Partnership Opportunities</CardTitle>
              <CardDescription>What types of partnerships are you open to?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="coMarketing"
                  checked={formData.coMarketing}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, coMarketing: checked as boolean })
                  }
                />
                <Label htmlFor="coMarketing" className="cursor-pointer">
                  Co-Marketing / Cross-Promotion
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="whiteLabel"
                  checked={formData.whiteLabel}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, whiteLabel: checked as boolean })
                  }
                />
                <Label htmlFor="whiteLabel" className="cursor-pointer">
                  White-Label / Distribution Partnership
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="reseller"
                  checked={formData.reseller}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, reseller: checked as boolean })
                  }
                />
                <Label htmlFor="reseller" className="cursor-pointer">
                  Reseller / Channel Partnership
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="acquisition"
                  checked={formData.acquisition}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, acquisition: checked as boolean })
                  }
                />
                <Label htmlFor="acquisition" className="cursor-pointer">
                  Open to Acquisition Offers
                </Label>
              </div>
            </CardContent>
          </Card>

          <Button type="submit" size="lg" className="w-full rounded-full">
            Submit Product
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
