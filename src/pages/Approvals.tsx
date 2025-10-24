import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/ProductCard";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";
import { EnhancedSubmitDialog } from "@/components/EnhancedSubmitDialog";
import { SubscribeDialog } from "@/components/SubscribeDialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

export default function Approvals() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [subscribeDialogOpen, setSubscribeDialogOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/auth");
      return;
    }

    // Check if user has admin role
    const { data: roleData, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (error || !roleData) {
      toast.error("Access denied. Admin privileges required.");
      navigate("/");
      return;
    }

    setIsAdmin(true);
    await loadProducts();
  };

  const loadProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load products");
      console.error(error);
    } else {
      setProducts(data || []);
    }
    setLoading(false);
  };

  const handleApprove = async (productId: string) => {
    const { error } = await supabase
      .from("products")
      .update({ approval_status: "approved" })
      .eq("id", productId);

    if (error) {
      toast.error("Failed to approve product");
      console.error(error);
    } else {
      toast.success("Product approved!");
      await loadProducts();
    }
  };

  const handleReject = async (productId: string) => {
    const { error } = await supabase
      .from("products")
      .update({ approval_status: "rejected" })
      .eq("id", productId);

    if (error) {
      toast.error("Failed to reject product");
      console.error(error);
    } else {
      toast.success("Product rejected");
      await loadProducts();
    }
  };

  const pendingProducts = products.filter(p => p.approval_status === "pending");
  const approvedProducts = products.filter(p => p.approval_status === "approved");
  const rejectedProducts = products.filter(p => p.approval_status === "rejected");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header 
        onSubmitClick={() => setSubmitDialogOpen(true)}
        onSubscribeClick={() => setSubscribeDialogOpen(true)}
      />

      <main className="container mx-auto px-6 md:px-8 py-16 flex-1 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Product Approvals</h1>
          <p className="text-muted-foreground">Review and approve submitted products</p>
        </div>

        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="pending" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Pending ({pendingProducts.length})
            </TabsTrigger>
            <TabsTrigger value="approved" className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Approved ({approvedProducts.length})
            </TabsTrigger>
            <TabsTrigger value="rejected" className="flex items-center gap-2">
              <XCircle className="w-4 h-4" />
              Rejected ({rejectedProducts.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="mt-8">
            {pendingProducts.length === 0 ? (
              <div className="text-center py-20 border-2 border-dashed border-border/30 rounded-3xl">
                <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground text-lg">No pending products</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pendingProducts.map((product) => (
                  <div key={product.id} className="relative">
                    <ProductCard product={product} />
                    <div className="flex gap-2 mt-4">
                      <Button
                        onClick={() => handleApprove(product.id)}
                        className="flex-1 bg-success hover:bg-success/90"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        onClick={() => handleReject(product.id)}
                        variant="destructive"
                        className="flex-1"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="approved" className="mt-8">
            {approvedProducts.length === 0 ? (
              <div className="text-center py-20 border-2 border-dashed border-border/30 rounded-3xl">
                <CheckCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground text-lg">No approved products</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {approvedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="rejected" className="mt-8">
            {rejectedProducts.length === 0 ? (
              <div className="text-center py-20 border-2 border-dashed border-border/30 rounded-3xl">
                <XCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground text-lg">No rejected products</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rejectedProducts.map((product) => (
                  <div key={product.id} className="relative opacity-60">
                    <ProductCard product={product} />
                    <div className="mt-4">
                      <Button
                        onClick={() => handleApprove(product.id)}
                        className="w-full"
                        variant="outline"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Move to Approved
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <Footer />

      <EnhancedSubmitDialog open={submitDialogOpen} onOpenChange={setSubmitDialogOpen} />
      <SubscribeDialog open={subscribeDialogOpen} onOpenChange={setSubscribeDialogOpen} />
    </div>
  );
}
