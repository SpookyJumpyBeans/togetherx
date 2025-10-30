import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { EnhancedSubmitDialog } from "@/components/EnhancedSubmitDialog";
import { SubscribeDialog } from "@/components/SubscribeDialog";
import { ContactDialog } from "@/components/ContactDialog";
import { ParticleBackground } from "@/components/ParticleBackground";
import { Sparkles, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TagSelector } from "@/components/ui/tag-selector";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useState, useMemo, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { DbProductCardWithPin, DbProduct } from "@/components/DbProductCardWithPin";
import { DbProductDetailDialog } from "@/components/DbProductDetailDialog";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { TARGET_AUDIENCE_SUGGESTIONS, CATEGORY_SUGGESTIONS, USER_RANGES, REVENUE_RANGES } from "@/data/tagSuggestions";
import { isWithinInterval, subDays, subWeeks, subMonths, subYears, startOfDay } from "date-fns";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);
  const [audienceFilter, setAudienceFilter] = useState<string[]>([]);
  const [userFilter, setUserFilter] = useState<string[]>([]);
  const [revenueFilter, setRevenueFilter] = useState<string[]>([]);
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

  const filteredProducts = useMemo(() => {
    return approvedProducts.filter((product) => {
      // Search filter - matches keywords in name, description, category, tags, and other fields
      const matchesSearch = (() => {
        if (searchQuery === "") return true;
        const query = searchQuery.toLowerCase();
        const searchableFields = [
          product.name,
          product.description,
          product.category,
          product.tags,
          product.target_audience,
          product.tech_highlights,
        ].filter(Boolean).join(' ').toLowerCase();
        return searchableFields.includes(query);
      })();

      // Category filter - supports multiple tags
      const matchesCategory = (() => {
        if (categoryFilter.length === 0) return true;
        if (!product.category) return false;
        const productCategories = product.category.split(',').map((c: string) => c.trim().toLowerCase());
        return categoryFilter.some(filter => 
          productCategories.some((cat: string) => cat.includes(filter.toLowerCase()))
        );
      })();

      // Audience filter - supports multiple tags
      const matchesAudience = (() => {
        if (audienceFilter.length === 0) return true;
        if (!product.target_audience) return false;
        const productAudiences = product.target_audience.split(',').map((a: string) => a.trim().toLowerCase());
        return audienceFilter.some(filter => 
          productAudiences.some((aud: string) => aud.includes(filter.toLowerCase()))
        );
      })();
      
      // User filter - exact match against user ranges
      const matchesUsers = (() => {
        if (userFilter.length === 0) return true;
        if (!product.users) return false;
        
        return userFilter.includes(product.users.toString());
      })();

      // Revenue filter - exact match against revenue ranges
      const matchesRevenue = (() => {
        if (revenueFilter.length === 0) return true;
        if (!product.revenue) return false;
        
        return revenueFilter.includes(product.revenue.toString());
      })();

      // Date filter - filters by created_at timestamp
      const matchesDate = (() => {
        if (dateFilter === "all") return true;
        if (!product.created_at) return false;
        
        const productDate = new Date(product.created_at);
        const now = new Date();
        const todayStart = startOfDay(now);
        
        switch (dateFilter) {
          case "today":
            return isWithinInterval(productDate, { start: todayStart, end: now });
          case "week":
            return isWithinInterval(productDate, { start: subWeeks(now, 1), end: now });
          case "month":
            return isWithinInterval(productDate, { start: subMonths(now, 1), end: now });
          case "year":
            return isWithinInterval(productDate, { start: subYears(now, 1), end: now });
          default:
            return true;
        }
      })();

      return matchesSearch && matchesCategory && matchesAudience && matchesUsers && matchesRevenue && matchesDate;
    });
  }, [approvedProducts, searchQuery, categoryFilter, audienceFilter, userFilter, revenueFilter, dateFilter]);

  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);

  const displayedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
    const endIndex = startIndex + PRODUCTS_PER_PAGE;
    return filteredProducts.slice(startIndex, endIndex);
  }, [filteredProducts, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, categoryFilter, audienceFilter, userFilter, revenueFilter, dateFilter]);

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
      <section className="bg-muted/30 py-20 md:py-32 relative overflow-hidden">
        <ParticleBackground />
        <div className="container mx-auto px-6 md:px-8 relative z-10">
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
      <section className="container mx-auto px-6 md:px-8 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap items-center gap-3">
            {/* Category Filter */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="h-9 rounded-full border-border bg-background px-4 text-sm">
                  {categoryFilter.length > 0 ? `Categories (${categoryFilter.length})` : "All Categories"}
                  <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-3 bg-background z-50" align="start">
                <div className="space-y-2">
                  <div className="text-sm font-medium mb-2">Select Categories</div>
                  <TagSelector
                    value={categoryFilter}
                    onChange={setCategoryFilter}
                    suggestions={CATEGORY_SUGGESTIONS}
                    placeholder="Type to filter categories..."
                  />
                </div>
              </PopoverContent>
            </Popover>

            {/* Audience Filter */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="h-9 rounded-full border-border bg-background px-4 text-sm">
                  {audienceFilter.length > 0 ? `Audiences (${audienceFilter.length})` : "All Audiences"}
                  <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-3 bg-background z-50" align="start">
                <div className="space-y-2">
                  <div className="text-sm font-medium mb-2">Select Target Audiences</div>
                  <TagSelector
                    value={audienceFilter}
                    onChange={setAudienceFilter}
                    suggestions={TARGET_AUDIENCE_SUGGESTIONS}
                    placeholder="Type to filter audiences..."
                  />
                </div>
              </PopoverContent>
            </Popover>

            {/* Users & Revenue Combined Filter */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="h-9 rounded-full border-border bg-background px-4 text-sm">
                  {userFilter.length > 0 || revenueFilter.length > 0 
                    ? `Traction (${userFilter.length + revenueFilter.length})` 
                    : "All"}
                  <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-3 bg-background z-50" align="start">
                <div className="space-y-4">
                  <div>
                    <div className="text-sm font-medium mb-2">User Count</div>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {USER_RANGES.map((range) => (
                        <div key={range} className="flex items-center space-x-2">
                          <Checkbox
                            id={`user-${range}`}
                            checked={userFilter.includes(range)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setUserFilter([...userFilter, range]);
                              } else {
                                setUserFilter(userFilter.filter(r => r !== range));
                              }
                            }}
                          />
                          <Label htmlFor={`user-${range}`} className="text-sm cursor-pointer">
                            {range}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium mb-2">Revenue</div>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {REVENUE_RANGES.map((range) => (
                        <div key={range} className="flex items-center space-x-2">
                          <Checkbox
                            id={`revenue-${range}`}
                            checked={revenueFilter.includes(range)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setRevenueFilter([...revenueFilter, range]);
                              } else {
                                setRevenueFilter(revenueFilter.filter(r => r !== range));
                              }
                            }}
                          />
                          <Label htmlFor={`revenue-${range}`} className="text-sm cursor-pointer">
                            {range}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {/* Time Filter */}
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="h-9 w-auto rounded-full border-border bg-background px-4 text-sm">
                <SelectValue placeholder="All Time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>

            {/* Search - Right aligned on desktop */}
            <div className="ml-auto w-full sm:w-auto">
              <Input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 rounded-full border-border bg-background px-4 w-full sm:w-64 placeholder:text-muted-foreground text-sm"
              />
            </div>
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
