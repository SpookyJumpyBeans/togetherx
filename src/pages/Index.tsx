import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Handshake, TrendingUp, Zap, Users, Target, Rocket } from "lucide-react";
import heroImage from "@/assets/hero-partnership.jpg";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-hero">
      <Header />
      
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <h1 className="text-5xl md:text-6xl font-bold leading-tight">
              Build together.{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Grow faster.
              </span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              The partnership marketplace for founders. Discover synergies, unlock growth, 
              and find the perfect collaborators to 10× your traction.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/marketplace">
                <Button variant="hero" size="lg" className="gap-2">
                  Explore Marketplace
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link to="/submit">
                <Button variant="outline" size="lg" className="gap-2">
                  <Rocket className="w-5 h-5" />
                  List Your Product
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-primary opacity-20 blur-3xl rounded-full"></div>
            <img
              src={heroImage}
              alt="Partnership collaboration visualization"
              className="relative rounded-2xl shadow-2xl"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Why BuilderSync?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Not just another launch platform. We connect builders with real partnership opportunities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-border hover:shadow-lg transition-all">
            <CardContent className="pt-6 space-y-4">
              <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-bold">Find Your Match</h3>
              <p className="text-muted-foreground">
                Discover complementary products and builders aligned with your target market and goals.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border hover:shadow-lg transition-all">
            <CardContent className="pt-6 space-y-4">
              <div className="w-12 h-12 bg-gradient-accent rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-success-foreground" />
              </div>
              <h3 className="text-xl font-bold">Traction-Focused</h3>
              <p className="text-muted-foreground">
                See real metrics upfront. Filter by MAU, revenue, and growth to find proven partners.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border hover:shadow-lg transition-all">
            <CardContent className="pt-6 space-y-4">
              <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
                <Handshake className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-bold">Multiple Partnership Models</h3>
              <p className="text-muted-foreground">
                From co-marketing to white-label deals, acquisitions, and reseller partnerships.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-16 bg-muted/30 rounded-3xl my-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-lg text-muted-foreground">Three simple steps to unlock growth</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold mx-auto">
              1
            </div>
            <h3 className="text-xl font-bold">Submit Your Product</h3>
            <p className="text-muted-foreground">
              Share your product details, traction metrics, and partnership goals.
            </p>
          </div>

          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-accent text-accent-foreground rounded-full flex items-center justify-center text-2xl font-bold mx-auto">
              2
            </div>
            <h3 className="text-xl font-bold">Discover & Connect</h3>
            <p className="text-muted-foreground">
              Browse the marketplace, filter by criteria, and reach out to potential partners.
            </p>
          </div>

          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold mx-auto">
              3
            </div>
            <h3 className="text-xl font-bold">Grow Together</h3>
            <p className="text-muted-foreground">
              Collaborate on co-marketing, distribution, or strategic partnerships.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <Card className="border-border bg-gradient-primary text-primary-foreground overflow-hidden relative">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30"></div>
          <CardContent className="py-16 px-8 relative z-10">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <Users className="w-16 h-16 mx-auto opacity-90" />
              <h2 className="text-3xl md:text-4xl font-bold">
                Join 1,000+ Builders Growing Together
              </h2>
              <p className="text-lg opacity-90">
                Your traction × their traction = 10× community
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Link to="/marketplace">
                  <Button variant="secondary" size="lg" className="gap-2">
                    Browse Products
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
                <Link to="/submit">
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="gap-2 bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
                  >
                    <Zap className="w-5 h-5" />
                    Get Started Free
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default Index;
