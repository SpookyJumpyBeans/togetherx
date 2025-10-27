import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ProductCardWithPin } from "@/components/ProductCardWithPin";
import { mockProducts } from "@/data/mockProducts";
import { EnhancedSubmitDialog } from "@/components/EnhancedSubmitDialog";
import { ProductDetailDialog } from "@/components/ProductDetailDialog";
import { SubscribeDialog } from "@/components/SubscribeDialog";
import { ContactDialog } from "@/components/ContactDialog";
import { Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { Product } from "@/components/ProductCard";
import { supabase } from "@/lib/supabase";
import { DbProductCardWithPin, DbProduct } from "@/components/DbProductCardWithPin";
import { DbProductDetailDialog } from "@/components/DbProductDetailDialog";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [audienceFilter, setAudienceFilter] = useState<string>("all");
  const [userFilter, setUserFilter] = useState<string>("all");
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedDbProduct, setSelectedDbProduct] = useState<DbProduct | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [dbDetailDialogOpen, setDbDetailDialogOpen] = useState(false);
  const [subscribeDialogOpen, setSubscribeDialogOpen] = useState(false);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [displayCount, setDisplayCount] = useState(12);
  const [approvedProducts, setApprovedProducts] = useState<any[]>([]);
  const observerTarget = useRef(null);

  // Listen for custom event to reopen submit dialog after auth
  useEffect(() => {
    const handleOpenSubmit = () => {
      setSubmitDialogOpen(true);
      
      // Check if we should auto-submit (user filled form before auth)
      const autoSubmit = localStorage.getItem('auto_submit_after_auth');
      if (autoSubmit === 'true') {
        // Auto-submit will be handled by the dialog itself when it detects the user is now logged in
        // The form data is already loaded via localStorage in EnhancedSubmitDialog
      }
    };
    window.addEventListener('openSubmitDialog', handleOpenSubmit);
    return () => window.removeEventListener('openSubmitDialog', handleOpenSubmit);
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('approval_status','approved')
        .order('created_at', { ascending: false })
        .limit(8);
      
      if (error) {
        console.error('Error loading approved products:', error);
      }
      
      if (!error && mounted && data) {
        console.log('Loaded approved products:', data);
        setApprovedProducts(data);
      }
    })();
    return () => { mounted = false; };
  }, []);

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

  const handleDbProductClick = (product: DbProduct) => {
    setSelectedDbProduct(product);
    setDbDetailDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header 
        onSubmitClick={() => setSubmitDialogOpen(true)}
        onSubscribeClick={() => setSubscribeDialogOpen(true)}
      />
      
      {/* Hero Section */}
      <section className="bg-muted/30 py-20 md:py-32">
        <div className="container mx-auto px-6 md:px-8">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-background border border-border text-sm">
              <Sparkles className="w-4 h-4" />
              Partnership marketplace for founders
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
              A community where<br />founders scale each other.
            </h1>
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Discover complementary products and unlock strategic partnerships. Connect with builders who have proven traction for co-marketing, white-label deals, and acquisitions.
            </p>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="container mx-auto px-6 md:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
            <div className="flex gap-3 flex-wrap lg:flex-nowrap">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full lg:w-[160px] h-11 rounded-lg border-border bg-background">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={audienceFilter} onValueChange={setAudienceFilter}>
                <SelectTrigger className="w-full lg:w-[160px] h-11 rounded-lg border-border bg-background">
                  <SelectValue placeholder="All Audiences" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Audiences</SelectItem>
                  {audiences.map((aud) => (
                    <SelectItem key={aud} value={aud}>{aud}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={userFilter} onValueChange={setUserFilter}>
                <SelectTrigger className="w-full lg:w-[160px] h-11 rounded-lg border-border bg-background">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="0-1k">0-1k users</SelectItem>
                  <SelectItem value="1k-10k">1k-10k users</SelectItem>
                  <SelectItem value="10k-50k">10k-50k users</SelectItem>
                  <SelectItem value="50k+">50k+ users</SelectItem>
                </SelectContent>
              </Select>

              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-full lg:w-[160px] h-11 rounded-lg border-border bg-background">
                  <SelectValue placeholder="All Time" />
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
              className="w-full lg:w-80 h-11 rounded-lg border-border bg-background px-4 placeholder:text-muted-foreground"
            />
          </div>
        </div>
      </section>

      {/* Approved Products (live) */}
      {approvedProducts.length > 0 && (
        <section id="approved-products" className="container mx-auto px-6 md:px-8 pb-12">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl font-semibold mb-4">Approved Products</h2>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6">
              {approvedProducts.map((p) => (
                <DbProductCardWithPin
                  key={p.id}
                  product={p}
                  onClick={() => handleDbProductClick(p)}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Products Grid (demo/mock) */}
      <section id="products" className="container mx-auto px-6 md:px-8 pb-20 flex-1">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6">
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
      <DbProductDetailDialog
        product={selectedDbProduct}
        open={dbDetailDialogOpen}
        onOpenChange={setDbDetailDialogOpen}
      />
    </div>
  );
};

export default Index;
