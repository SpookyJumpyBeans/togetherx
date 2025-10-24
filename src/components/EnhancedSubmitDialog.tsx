import { useState, useEffect } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
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
    description: "",
    contactEmail: "",
  });
  const [loading, setLoading] = useState(false);

  // Validation schema
  const formSchema = z.object({
    name: z.string().trim().min(1, "Product name is required").max(100, "Product name must be less than 100 characters"),
    websiteLink: z.string().trim().url({ message: "Valid website link required" }).max(500, "Website link must be less than 500 characters"),
    description: z.string().trim().min(1, "Description is required").max(1000, "Description must be less than 1000 characters"),
    contactEmail: z.string().trim().email("Valid contact email required").max(255, "Email must be less than 255 characters"),
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
    localStorage.setItem('submitProductFormData', JSON.stringify(formData));
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    const result = formSchema.safeParse(formData);
    if (!result.success) {
      toast.error(result.error.issues[0]?.message ?? "Please fill in all required fields.");
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
      const { error: insertError } = await supabase
        .from('products')
        .insert([{
          user_id: user.id,
          name: formData.name,
          website_link: formData.websiteLink,
          description: formData.description,
          contact_email: formData.contactEmail,
        }]);

      if (insertError) throw insertError;

      toast.success("Product submitted successfully!");
      
      clearSavedFormData();
      localStorage.removeItem('auto_submit_after_auth');
      onOpenChange(false);
      setFormData({
        name: "",
        websiteLink: "",
        description: "",
        contactEmail: "",
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

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Product Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-base">Product Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="TaskFlow AI"
              className="h-12 bg-muted/30 border-0"
            />
          </div>

          {/* Website Link */}
          <div className="space-y-2">
            <Label htmlFor="websiteLink" className="text-base">Website Link *</Label>
            <Input
              id="websiteLink"
              type="url"
              value={formData.websiteLink}
              onChange={(e) => setFormData({ ...formData, websiteLink: e.target.value })}
              placeholder="https://yourproduct.com"
              className="h-12 bg-muted/30 border-0"
            />
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
            />
          </div>

          {/* Contact Email */}
          <div className="space-y-2">
            <Label htmlFor="contactEmail" className="text-base">Contact Email *</Label>
            <Input
              id="contactEmail"
              type="email"
              value={formData.contactEmail}
              onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
              placeholder="your@email.com"
              className="h-12 bg-muted/30 border-0"
            />
          </div>

          <Button
            type="submit"
            className="w-full h-12 text-base mt-8"
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit Product"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
