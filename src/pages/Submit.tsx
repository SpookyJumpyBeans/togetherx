import { useState } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Rocket } from "lucide-react";

const Submit = () => {
  const [formData, setFormData] = useState({
    name: "",
    logo: "",
    description: "",
    targetAudience: "",
    category: "",
    tags: "",
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
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-primary rounded-2xl mb-4 shadow-glow">
              <Rocket className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Submit Your Product</h1>
            <p className="text-lg text-muted-foreground">
              Join the marketplace and discover partnership opportunities
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Card className="border-border">
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
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
                  <Label htmlFor="logo">Logo URL</Label>
                  <Input
                    id="logo"
                    value={formData.logo}
                    onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                    placeholder="https://..."
                    type="url"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="What does your product do and who does it serve?"
                    rows={4}
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
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <CardTitle>Traction Data</CardTitle>
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

            <Card className="border-border">
              <CardHeader>
                <CardTitle>Partnership Opportunities</CardTitle>
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

            <Button type="submit" variant="hero" size="lg" className="w-full">
              Submit Product
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Submit;
