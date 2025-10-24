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
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

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
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

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
        .select("id, user_id, name, website_link, description, contact_email, approval_status")
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
      });
      setLoading(false);
    };
    init();
  }, [id, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = formSchema.safeParse(form);
    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) newErrors[issue.path[0].toString()] = issue.message;
      });
      setErrors(newErrors);
      return;
    }

    if (!userId) return;

    setSaving(true);
    const { error } = await supabase
      .from("products")
      .update({
        ...form,
        approval_status: "pending",
      })
      .eq("id", id as string)
      .eq("user_id", userId);

    if (error) {
      console.error("Update product error", error);
      toast.error(`Failed to update product: ${error.message || "Unknown error"}`);
    } else {
      toast.success("Changes saved. Your product will be re-reviewed.");
      navigate("/my-products");
    }
    setSaving(false);
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
            <form onSubmit={handleSubmit} className="space-y-6">
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

              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={saving} className="flex-1">Save and Resubmit</Button>
                <Button type="button" variant="outline" className="flex-1" onClick={() => navigate(-1)}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
