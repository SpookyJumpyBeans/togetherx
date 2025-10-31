import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { CheckCircle, XCircle, Clock, AlertCircle, ExternalLink } from "lucide-react";
import { EnhancedSubmitDialog } from "@/components/EnhancedSubmitDialog";
import { SubscribeDialog } from "@/components/SubscribeDialog";
import { DbProductDetailDialog } from "@/components/DbProductDetailDialog";
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
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
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
              <div className="grid grid-cols-1 gap-6">
                {pendingProducts.map((product) => (
                <Card key={product.id} className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow" onClick={() => {
                  setSelectedProduct(product);
                  setDetailDialogOpen(true);
                }}>
                    <div className="grid md:grid-cols-[300px_1fr] gap-6">
                      <div className="h-48 md:h-full bg-muted">
                        <img
                          src={product.screenshot_url || "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop"}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-6 space-y-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3">
                            {/* Logo */}
                            <div className="w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                              <img
                                src={product.logo_url || "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=100&h=100&fit=crop"}
                                alt={`${product.name} logo`}
                                className="w-full h-full object-contain"
                              />
                            </div>
                            <div>
                              <CardTitle className="text-2xl mb-2 flex items-center gap-2">
                                {product.name}
                                {product.uses_ai && <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">AI</span>}
                              </CardTitle>
                              <CardDescription>{product.contact_email || "No email"}</CardDescription>
                            </div>
                          </div>
                          {product.website_link && (
                            <a 
                              href={product.website_link} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-primary hover:text-primary/80"
                            >
                              <ExternalLink className="w-5 h-5" />
                            </a>
                          )}
                        </div>

                        <p className="text-sm text-muted-foreground">{product.description || "No description"}</p>

                        <div className="space-y-4 pt-2 border-t">
                          {/* Basic Info */}
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-semibold">Category:</span> {product.category || "N/A"}
                            </div>
                            <div>
                              <span className="font-semibold">Audience:</span> {product.target_audience || "N/A"}
                            </div>
                          </div>

                          {/* Technology Highlights */}
                          {product.tech_highlights && (
                            <div className="text-sm">
                              <span className="font-semibold block mb-1">Technology Highlights:</span>
                              <p className="text-muted-foreground">{product.tech_highlights}</p>
                            </div>
                          )}

                          {/* Traction Metrics */}
                          {(product.users || product.revenue || product.growth_rate) && (
                            <div>
                              <span className="font-semibold block mb-2 text-sm">Traction Metrics:</span>
                              <div className="grid grid-cols-3 gap-4 text-sm">
                                <div>
                                  <span className="text-xs text-muted-foreground block">Total Users</span>
                                  <span className="font-medium">{product.users || "N/A"}</span>
                                </div>
                                <div>
                                  <span className="text-xs text-muted-foreground block">Monthly Active</span>
                                  <span className="font-medium">{product.growth_rate || "N/A"}</span>
                                </div>
                                <div>
                                  <span className="text-xs text-muted-foreground block">Revenue</span>
                                  <span className="font-medium">{product.revenue || "N/A"}</span>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Partnership Opportunities */}
                          {(product.partnership || product.co_marketing || product.white_label || product.reseller || product.acquisition) && (
                            <div className="text-sm">
                              <span className="font-semibold block mb-2">Partnership Opportunities:</span>
                              <div className="flex flex-wrap gap-2">
                                {product.partnership && <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs">General Partnership</span>}
                                {product.co_marketing && <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs">Co-marketing</span>}
                                {product.white_label && <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs">White Label</span>}
                                {product.reseller && <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs">Reseller</span>}
                                {product.acquisition && <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs">Acquisition</span>}
                              </div>
                            </div>
                          )}

                          {product.tags && (
                            <div className="text-sm">
                              <span className="font-semibold">Tags:</span> {product.tags}
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2 pt-4">
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleApprove(product.id);
                            }}
                            className="flex-1 bg-success hover:bg-success/90"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Approve
                          </Button>
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleReject(product.id);
                            }}
                            variant="destructive"
                            className="flex-1"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
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
              <div className="grid grid-cols-1 gap-6">
                {approvedProducts.map((product) => (
                  <Card key={product.id} className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow" onClick={() => {
                    setSelectedProduct(product);
                    setDetailDialogOpen(true);
                  }}>
                    <div className="grid md:grid-cols-[300px_1fr] gap-6">
                      <div className="h-48 md:h-full bg-muted">
                        <img
                          src={product.screenshot_url || "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop"}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-6 space-y-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3">
                            {/* Logo */}
                            <div className="w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                              <img
                                src={product.logo_url || "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=100&h=100&fit=crop"}
                                alt={`${product.name} logo`}
                                className="w-full h-full object-contain"
                              />
                            </div>
                            <div>
                              <CardTitle className="text-2xl mb-2 flex items-center gap-2">
                                {product.name}
                                {product.uses_ai && <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">AI</span>}
                              </CardTitle>
                              <CardDescription>{product.contact_email || "No email"}</CardDescription>
                            </div>
                          </div>
                          {product.website_link && (
                            <a 
                              href={product.website_link} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-primary hover:text-primary/80"
                            >
                              <ExternalLink className="w-5 h-5" />
                            </a>
                          )}
                        </div>

                        <p className="text-sm text-muted-foreground">{product.description || "No description"}</p>

                        <div className="space-y-4 pt-2 border-t">
                          {/* Basic Info */}
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-semibold">Category:</span> {product.category || "N/A"}
                            </div>
                            <div>
                              <span className="font-semibold">Audience:</span> {product.target_audience || "N/A"}
                            </div>
                          </div>

                          {/* Technology Highlights */}
                          {product.tech_highlights && (
                            <div className="text-sm">
                              <span className="font-semibold block mb-1">Technology Highlights:</span>
                              <p className="text-muted-foreground">{product.tech_highlights}</p>
                            </div>
                          )}

                          {/* Traction Metrics */}
                          {(product.users || product.revenue || product.growth_rate) && (
                            <div>
                              <span className="font-semibold block mb-2 text-sm">Traction Metrics:</span>
                              <div className="grid grid-cols-3 gap-4 text-sm">
                                <div>
                                  <span className="text-xs text-muted-foreground block">Total Users</span>
                                  <span className="font-medium">{product.users || "N/A"}</span>
                                </div>
                                <div>
                                  <span className="text-xs text-muted-foreground block">Monthly Active</span>
                                  <span className="font-medium">{product.growth_rate || "N/A"}</span>
                                </div>
                                <div>
                                  <span className="text-xs text-muted-foreground block">Revenue</span>
                                  <span className="font-medium">{product.revenue || "N/A"}</span>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Partnership Opportunities */}
                          {(product.partnership || product.co_marketing || product.white_label || product.reseller || product.acquisition) && (
                            <div className="text-sm">
                              <span className="font-semibold block mb-2">Partnership Opportunities:</span>
                              <div className="flex flex-wrap gap-2">
                                {product.partnership && <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs">General Partnership</span>}
                                {product.co_marketing && <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs">Co-marketing</span>}
                                {product.white_label && <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs">White Label</span>}
                                {product.reseller && <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs">Reseller</span>}
                                {product.acquisition && <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs">Acquisition</span>}
                              </div>
                            </div>
                          )}

                          {product.tags && (
                            <div className="text-sm">
                              <span className="font-semibold">Tags:</span> {product.tags}
                            </div>
                          )}
                        </div>

                        <div className="pt-4">
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleReject(product.id);
                            }}
                            variant="outline"
                            className="w-full"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Move to Rejected
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
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
                  <div key={product.id} className="opacity-60">
                    <Card className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow" onClick={() => {
                      setSelectedProduct(product);
                      setDetailDialogOpen(true);
                    }}>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          {product.name}
                          {product.website_link && (
                            <a 
                              href={product.website_link} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-primary hover:text-primary/80"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                        </CardTitle>
                        <CardDescription>{product.contact_email}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">{product.description}</p>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleApprove(product.id);
                          }}
                          className="w-full"
                          variant="outline"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Move to Approved
                        </Button>
                      </CardContent>
                    </Card>
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
      <DbProductDetailDialog 
        product={selectedProduct} 
        open={detailDialogOpen} 
        onOpenChange={setDetailDialogOpen}
        showProof={true}
      />
    </div>
  );
}
