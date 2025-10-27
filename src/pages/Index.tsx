import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { EnhancedSubmitDialog } from "@/components/EnhancedSubmitDialog";
import { SubscribeDialog } from "@/components/SubscribeDialog";
import { ContactDialog } from "@/components/ContactDialog";
import { Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useMemo, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { DbProductCardWithPin, DbProduct } from "@/components/DbProductCardWithPin";
import { DbProductDetailDialog } from "@/components/DbProductDetailDialog";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [audienceFilter, setAudienceFilter] = useState<string>("all");
  const [userFilter, setUserFilter] = useState<string>("all");
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [selectedDbProduct, setSelectedDbProduct] = useState<DbProduct | null>(null);
  const [dbDetailDialogOpen, setDbDetailDialogOpen] = useState(false);
  const [subscribeDialogOpen, setSubscribeDialogOpen] = useState(false);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [approvedProducts, setApprovedProducts] = useState<any[]>([]);
  const PRODUCTS_PER_PAGE = 12;

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
        .select('*,user_id')
        .eq('approval_status','approved')
        .order('created_at', { ascending: false });
      
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

  const categories = useMemo(() => {
    return Array.from(new Set(approvedProducts.map(p => p.category).filter(Boolean)));
  }, [approvedProducts]);
  
  const audiences = useMemo(() => {
    return Array.from(new Set(approvedProducts.map(p => p.target_audience).filter(Boolean)));
  }, [approvedProducts]);

  const filteredProducts = useMemo(() => {
    return approvedProducts.filter((product) => {
      const matchesSearch =
        searchQuery === "" ||
        product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
      const matchesAudience = audienceFilter === "all" || product.target_audience === audienceFilter;
      
      const matchesUsers = (() => {
        if (userFilter === "all") return true;
        if (!product.users) return false;
        const users = typeof product.users === 'string' ? parseInt(product.users) : product.users;
        if (userFilter === "0-1k") return users < 1000;
        if (userFilter === "1k-10k") return users >= 1000 && users < 10000;
        if (userFilter === "10k-50k") return users >= 10000 && users < 50000;
        if (userFilter === "50k+") return users >= 50000;
        return true;
      })();

      return matchesSearch && matchesCategory && matchesAudience && matchesUsers;
    });
  }, [approvedProducts, searchQuery, categoryFilter, audienceFilter, userFilter]);

  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);

  const displayedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
    const endIndex = startIndex + PRODUCTS_PER_PAGE;
    return filteredProducts.slice(startIndex, endIndex);
  }, [filteredProducts, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, categoryFilter, audienceFilter, userFilter]);

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

      {/* Products Grid */}
      <section id="products" className="container mx-auto px-6 md:px-8 pb-20 flex-1">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayedProducts.map((product) => (
              <DbProductCardWithPin
                key={product.id}
                product={product}
                onClick={() => handleDbProductClick(product)}
              />
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg">No products found matching your filters.</p>
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-12">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => setCurrentPage(page)}
                        isActive={currentPage === page}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      </section>

      <Footer onContactClick={() => setContactDialogOpen(true)} />

      <EnhancedSubmitDialog open={submitDialogOpen} onOpenChange={setSubmitDialogOpen} />
      <SubscribeDialog open={subscribeDialogOpen} onOpenChange={setSubscribeDialogOpen} />
      <ContactDialog open={contactDialogOpen} onOpenChange={setContactDialogOpen} />
      <DbProductDetailDialog
        product={selectedDbProduct}
        open={dbDetailDialogOpen}
        onOpenChange={setDbDetailDialogOpen}
      />
    </div>
  );
};

export default Index;
