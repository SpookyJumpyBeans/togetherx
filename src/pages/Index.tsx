import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/ProductCard";
import { mockProducts } from "@/data/mockProducts";
import { ArrowRight, Rocket, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  
  const filteredProducts = mockProducts.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Header />
      
      {/* Hero Section - Compact & Clear */}
      <section className="container mx-auto px-4 md:px-6 py-12 md:py-20">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h1 className="text-4xl md:text-6xl font-semibold tracking-tight leading-tight">
            Find your next <br />
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              growth partner
            </span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            A marketplace for founders to discover partnership opportunities — co-marketing, white-label, acquisitions, and more.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <Link to="/submit">
              <Button size="lg" className="gap-2 rounded-full shadow-lg hover:shadow-xl transition-shadow">
                <Rocket className="w-4 h-4" />
                Submit Your Product
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Product Marketplace */}
      <section id="products" className="container mx-auto px-4 md:px-6 py-12">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Search */}
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 rounded-full border-border/50 bg-background/50 backdrop-blur-sm"
            />
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No products found matching your search.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Index;
