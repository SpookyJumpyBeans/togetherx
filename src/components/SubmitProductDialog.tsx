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
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto border-0 shadow-2xl">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-3xl font-bold">Submit Your Product</DialogTitle>
          <DialogDescription className="text-base">
            Join the community and discover partnership opportunities
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-8 pt-4">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
              <p className="text-sm text-muted-foreground mb-6">Tell us about your product</p>
            </div>
            <div className="space-y-6">
              <div>
                <Label htmlFor="name" className="text-sm font-medium mb-2 block">Product Name</Label>
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
                <Label htmlFor="screenshot" className="text-sm font-medium mb-2 block">Product Screenshot</Label>
                <div className="mt-2">
                  <label
                    htmlFor="screenshot"
                    className="flex items-center justify-center w-full h-32 border-2 border-dashed border-border/30 rounded-2xl hover:border-primary/50 transition-colors cursor-pointer bg-muted/10"
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
                <Label htmlFor="description" className="text-sm font-medium mb-2 block">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="What does your product do and who does it serve?"
                  rows={3}
                  className="border-0 border-b-2 border-border/50 rounded-none focus:border-primary transition-colors bg-transparent shadow-none resize-none px-0"
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-6 pt-6 border-t border-border/30">
            <div>
              <h3 className="text-lg font-semibold mb-4">Traction Data</h3>
              <p className="text-sm text-muted-foreground mb-6">Share your growth metrics (optional)</p>
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
                <Label htmlFor="mau" className="text-sm font-medium mb-2 block">Monthly Active Users</Label>
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
                <Label htmlFor="revenue" className="text-sm font-medium mb-2 block">Revenue Range</Label>
                <Input
                  id="revenue"
                  value={formData.revenue}
                  onChange={(e) => setFormData({ ...formData, revenue: e.target.value })}
                  placeholder="$50k MRR"
                  className="border-0 border-b-2 border-border/50 rounded-none focus:border-primary transition-colors bg-transparent shadow-none px-0"
                />
              </div>
            </div>
          </div>

          <div className="space-y-6 pt-6 border-t border-border/30">
            <div>
              <h3 className="text-lg font-semibold mb-4">Partnership Opportunities</h3>
              <p className="text-sm text-muted-foreground mb-6">What types of partnerships are you open to?</p>
            </div>
            <div className="space-y-4">
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
            </div>
          </div>

          <Button type="submit" size="lg" className="w-full rounded-full shadow-lg hover:shadow-xl transition-all mt-8">
            Submit Product
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
