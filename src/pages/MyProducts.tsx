import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Edit, Save, Trash2, AlertCircle } from "lucide-react";
import { EnhancedSubmitDialog } from "@/components/EnhancedSubmitDialog";
import { SubscribeDialog } from "@/components/SubscribeDialog";

export default function MyProducts() {
  const [user, setUser] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    website_link: "",
    description: "",
    contact_email: "",
  });
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [subscribeDialogOpen, setSubscribeDialogOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/auth");
      return;
    }

    setUser(session.user);
    await loadProducts(session.user.id);
  };

  const loadProducts = async (userId: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load products");
      console.error(error);
    } else {
      setProducts(data || []);
    }
    setLoading(false);
  };

  const handleEdit = (product: any) => {
    setEditingId(product.id);
    setEditForm({
      name: product.name,
      website_link: product.website_link,
      description: product.description,
      contact_email: product.contact_email,
    });
  };

  const handleSave = async (productId: string) => {
    const { error } = await supabase
      .from("products")
      .update({
        ...editForm,
        approval_status: 'pending', // Reset to pending when edited
        updated_at: new Date().toISOString(),
      })
      .eq("id", productId);

    if (error) {
      console.error('Update product error', error);
      toast.error(`Failed to update product: ${error.message || 'Unknown error'}`);
    } else {
      toast.success("Product updated! It will be re-reviewed before going live.");
      setEditingId(null);
      if (user) await loadProducts(user.id);
    }
  };

  const handleDelete = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", productId);

    if (error) {
      toast.error("Failed to delete product");
      console.error(error);
    } else {
      toast.success("Product deleted");
      if (user) await loadProducts(user.id);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      approved: "bg-green-500/10 text-green-500 border-green-500/20",
      rejected: "bg-red-500/10 text-red-500 border-red-500/20",
    };
    return (
      <span className={`text-xs px-2 py-1 rounded-full border ${styles[status as keyof typeof styles]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
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

      <main className="container mx-auto px-6 md:px-8 py-16 flex-1 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">My Products</h1>
          <p className="text-muted-foreground">Manage your submitted products</p>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-border/30 rounded-3xl">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground text-lg">No products yet</p>
            <p className="text-sm text-muted-foreground mt-2">
              Submit your first product to get started
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {products.map((product) => (
              <Card key={product.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>
                      {editingId === product.id ? (
                        <Input
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          className="max-w-md"
                        />
                      ) : (
                        product.name
                      )}
                    </CardTitle>
                    {getStatusBadge(product.approval_status)}
                  </div>
                  <CardDescription>
                    {editingId === product.id ? (
                      <Input
                        value={editForm.contact_email}
                        onChange={(e) => setEditForm({ ...editForm, contact_email: e.target.value })}
                        className="max-w-md mt-2"
                      />
                    ) : (
                      product.contact_email
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Website</Label>
                      {editingId === product.id ? (
                        <Input
                          value={editForm.website_link}
                          onChange={(e) => setEditForm({ ...editForm, website_link: e.target.value })}
                        />
                      ) : (
                        <a href={product.website_link} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                          {product.website_link}
                        </a>
                      )}
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Description</Label>
                      {editingId === product.id ? (
                        <Textarea
                          value={editForm.description}
                          onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                          rows={4}
                        />
                      ) : (
                        <p className="text-muted-foreground">{product.description}</p>
                      )}
                    </div>

                    <div className="flex gap-2 pt-4">
                      {editingId === product.id ? (
                        <>
                          <Button onClick={() => handleSave(product.id)} className="flex-1">
                            <Save className="w-4 h-4 mr-2" />
                            Save Changes
                          </Button>
                          <Button onClick={() => setEditingId(null)} variant="outline" className="flex-1">
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button onClick={() => handleEdit(product)} variant="outline" className="flex-1">
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </Button>
                          <Button onClick={() => handleDelete(product.id)} variant="destructive" className="flex-1">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Footer />

      <EnhancedSubmitDialog open={submitDialogOpen} onOpenChange={setSubmitDialogOpen} />
      <SubscribeDialog open={subscribeDialogOpen} onOpenChange={setSubscribeDialogOpen} />
    </div>
  );
}
