import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ProductCardWithPin } from "@/components/ProductCardWithPin";
import { mockProducts } from "@/data/mockProducts";
import { EnhancedSubmitDialog } from "@/components/EnhancedSubmitDialog";
import { ProductDetailDialog } from "@/components/ProductDetailDialog";
import { SubscribeDialog } from "@/components/SubscribeDialog";
import { ContactDialog } from "@/components/ContactDialog";
import { Rocket } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { Product } from "@/components/ProductCard";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [audienceFilter, setAudienceFilter] = useState<string>("all");
  const [userFilter, setUserFilter] = useState<string>("all");
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [subscribeDialogOpen, setSubscribeDialogOpen] = useState(false);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [displayCount, setDisplayCount] = useState(12);
  const observerTarget = useRef(null);

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
      });
  }, [searchQuery, categoryFilter, audienceFilter, userFilter]);

  const displayedProducts = useMemo(() => {
    return filteredProducts.slice(0, displayCount);
  }, [filteredProducts, displayCount]);

  const loadMore = useCallback(() => {
    if (displayCount < filteredProducts.length) {
      setDisplayCount(prev => Math.min(prev + 12, filteredProducts.length));
    }
  }, [displayCount, filteredProducts.length]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [loadMore]);

  useEffect(() => {
    setDisplayCount(12);
  }, [searchQuery, categoryFilter, audienceFilter, userFilter]);

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setDetailDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header 
        onSubmitClick={() => setSubmitDialogOpen(true)}
        onSubscribeClick={() => setSubscribeDialogOpen(true)}
      />
      
      {/* Hero Section */}
      <section className="container mx-auto px-6 md:px-8 pt-20 md:pt-28 pb-12 md:pb-16">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1]">
            Discover partnership opportunities
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Co-marketing, white-label, acquisitions, and more. Connect with founders who want to scale together.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button 
              size="lg" 
              className="rounded-full bg-foreground text-background hover:bg-foreground/90 px-8 h-12"
              onClick={() => setSubmitDialogOpen(true)}
            >
              Submit your product
            </Button>
            <Button
              variant="ghost"
              size="lg"
              className="rounded-full px-8 h-12"
              onClick={() => window.location.href = "/leaderboard"}
            >
              View leaderboard
            </Button>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="container mx-auto px-6 md:px-8 pb-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
            <div className="flex gap-3 flex-wrap lg:flex-nowrap">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full lg:w-[160px] h-10 rounded-full bg-muted border-0 hover:bg-muted/80">
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
                <SelectTrigger className="w-full lg:w-[160px] h-10 rounded-full bg-muted border-0 hover:bg-muted/80">
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
                <SelectTrigger className="w-full lg:w-[160px] h-10 rounded-full bg-muted border-0 hover:bg-muted/80">
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

              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-full lg:w-[160px] h-10 rounded-full bg-muted border-0 hover:bg-muted/80">
                  <SelectValue placeholder="Date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full lg:w-80 h-10 rounded-full bg-muted border-0 px-4 placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
        </div>
      </section>

      {/* Products Grid - Pinterest Style */}
      <section id="products" className="container mx-auto px-6 md:px-8 pb-20 flex-1">
        <div className="max-w-7xl mx-auto">
          <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
            {displayedProducts.map((product) => (
              <ProductCardWithPin
                key={product.id}
                product={product}
                onClick={() => handleProductClick(product)}
              />
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg">No products found matching your filters.</p>
            </div>
          )}

          {displayedProducts.length < filteredProducts.length && (
            <div ref={observerTarget} className="h-20 flex items-center justify-center mt-8">
              <div className="animate-pulse text-muted-foreground">Loading more...</div>
            </div>
          )}
        </div>
      </section>

      <Footer onContactClick={() => setContactDialogOpen(true)} />

      <EnhancedSubmitDialog open={submitDialogOpen} onOpenChange={setSubmitDialogOpen} />
      <SubscribeDialog open={subscribeDialogOpen} onOpenChange={setSubscribeDialogOpen} />
      <ContactDialog open={contactDialogOpen} onOpenChange={setContactDialogOpen} />
      <ProductDetailDialog 
        product={selectedProduct} 
        open={detailDialogOpen} 
        onOpenChange={setDetailDialogOpen} 
      />
    </div>
  );
};

export default Index;
