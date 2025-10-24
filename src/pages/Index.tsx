import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/ProductCard";
import { mockProducts } from "@/data/mockProducts";
import { SubmitProductDialog } from "@/components/SubmitProductDialog";
import { ProductDetailDialog } from "@/components/ProductDetailDialog";
import { Rocket, Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useMemo } from "react";
import { Product } from "@/components/ProductCard";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [audienceFilter, setAudienceFilter] = useState<string>("all");
  const [userFilter, setUserFilter] = useState<string>("all");
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  const categories = useMemo(() => Array.from(new Set(mockProducts.map((p) => p.category))), []);
  const audiences = useMemo(() => Array.from(new Set(mockProducts.map((p) => p.targetAudience))), []);

  const filteredProducts = useMemo(() => {
    return mockProducts
      .filter((product) => {
        const matchesSearch =
          searchQuery === "" ||
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.category.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
        const matchesAudience = audienceFilter === "all" || product.targetAudience === audienceFilter;
        
        const matchesUsers = (() => {
          if (userFilter === "all") return true;
          if (!product.traction.users) return false;
          if (userFilter === "0-1k") return product.traction.users < 1000;
          if (userFilter === "1k-10k") return product.traction.users >= 1000 && product.traction.users < 10000;
          if (userFilter === "10k-50k") return product.traction.users >= 10000 && product.traction.users < 50000;
          if (userFilter === "50k+") return product.traction.users >= 50000;
          return true;
        })();

        return matchesSearch && matchesCategory && matchesAudience && matchesUsers;
      })
      .slice(0, 20);
  }, [searchQuery, categoryFilter, audienceFilter, userFilter]);

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setDetailDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex flex-col">
      <Header onSubmitClick={() => setSubmitDialogOpen(true)} />
      
      {/* Hero Section */}
      <section className="container mx-auto px-4 md:px-6 pt-12 md:pt-16 pb-8 md:pb-12">
        <div className="max-w-3xl mx-auto text-center space-y-5">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight leading-tight">
            A community where founders{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              scale each other
            </span>
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto">
            Discover partnership opportunities — co-marketing, white-label, acquisitions, and more.
          </p>
          <Button 
            size="lg" 
            className="gap-2 rounded-full shadow-lg hover:shadow-xl transition-shadow"
            onClick={() => setSubmitDialogOpen(true)}
          >
            <Rocket className="w-4 h-4" />
            Submit Your Product
          </Button>
        </div>
      </section>

      {/* Filters Section */}
      <section className="container mx-auto px-4 md:px-6 py-6 md:py-8">
        <div className="max-w-6xl mx-auto space-y-4">
          {/* Search and Filters Row */}
          <div className="flex flex-col md:flex-row gap-3 items-center">
            <div className="flex gap-3 flex-wrap md:flex-nowrap w-full md:w-auto">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full md:w-[180px] rounded-full border-border/50 bg-background/50 backdrop-blur-sm">
                  <SlidersHorizontal className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={audienceFilter} onValueChange={setAudienceFilter}>
                <SelectTrigger className="w-full md:w-[180px] rounded-full border-border/50 bg-background/50 backdrop-blur-sm">
                  <SelectValue placeholder="Audience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Audiences</SelectItem>
                  {audiences.map((aud) => (
                    <SelectItem key={aud} value={aud}>{aud}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={userFilter} onValueChange={setUserFilter}>
                <SelectTrigger className="w-full md:w-[180px] rounded-full border-border/50 bg-background/50 backdrop-blur-sm">
                  <SelectValue placeholder="Users" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sizes</SelectItem>
                  <SelectItem value="0-1k">0-1k users</SelectItem>
                  <SelectItem value="1k-10k">1k-10k users</SelectItem>
                  <SelectItem value="10k-50k">10k-50k users</SelectItem>
                  <SelectItem value="50k+">50k+ users</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="relative w-full md:w-64">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 h-11 rounded-full border-border/50 bg-background/50 backdrop-blur-sm"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section id="products" className="container mx-auto px-4 md:px-6 pb-12 flex-1">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {filteredProducts.map((product) => (
              <div key={product.id} onClick={() => handleProductClick(product)}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No products found matching your filters.</p>
            </div>
          )}
        </div>
      </section>

      <Footer />

      <SubmitProductDialog open={submitDialogOpen} onOpenChange={setSubmitDialogOpen} />
      <ProductDetailDialog 
        product={selectedProduct} 
        open={detailDialogOpen} 
        onOpenChange={setDetailDialogOpen} 
      />
    </div>
  );
};

export default Index;
