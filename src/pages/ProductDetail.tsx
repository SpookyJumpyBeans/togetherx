import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { mockProducts } from "@/data/mockProducts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TractionBadge } from "@/components/TractionBadge";
import { PartnershipBadges } from "@/components/PartnershipBadges";
import { ArrowLeft, Mail, Building2, Tag, TrendingUp, Sparkles, Code } from "lucide-react";

const ProductDetail = () => {
  const { id } = useParams();
  const product = mockProducts.find((p) => p.id === id);

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-hero">
        <Header />
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Product not found</h1>
          <Link to="/marketplace">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Marketplace
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <Link to="/marketplace" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Marketplace
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-start gap-6">
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center flex-shrink-0 shadow-md">
                    <img
                      src={product.logo}
                      alt={product.name}
                      className="w-20 h-20 object-contain"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-3xl font-semibold">{product.name}</h1>
                      {product.usesAI && (
                        <Badge variant="default" className="gap-1 rounded-full">
                          <Sparkles className="w-3 h-3" />
                          AI-Powered
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground mb-4">
                      <Building2 className="w-4 h-4" />
                      <span>{product.targetAudience}</span>
                    </div>
                    <p className="text-lg text-muted-foreground">
                      {product.description}
                    </p>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="w-5 h-5" />
                  Category & Tags
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="text-sm">
                    {product.category}
                  </Badge>
                  {product.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="w-5 h-5" />
                  Technology Highlights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {product.techHighlights.map((tech) => (
                    <Badge key={tech} variant="outline" className="rounded-full">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Traction Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {product.traction.users && (
                    <div className="bg-muted/50 rounded-2xl p-4">
                      <p className="text-sm text-muted-foreground mb-1">Total Users</p>
                      <p className="text-2xl font-semibold">{product.traction.users.toLocaleString()}</p>
                    </div>
                  )}
                  {product.traction.mau && (
                    <div className="bg-muted/50 rounded-2xl p-4">
                      <p className="text-sm text-muted-foreground mb-1">Monthly Active</p>
                      <p className="text-2xl font-semibold">{product.traction.mau.toLocaleString()}</p>
                    </div>
                  )}
                  {product.traction.revenue && (
                    <div className="bg-muted/50 rounded-2xl p-4">
                      <p className="text-sm text-muted-foreground mb-1">Revenue</p>
                      <p className="text-2xl font-semibold">{product.traction.revenue}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm sticky top-24">
              <CardHeader>
                <CardTitle>Partnership Opportunities</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-3">Open to:</p>
                  <PartnershipBadges partnerships={product.partnerships} />
                </div>

                <div className="pt-4 border-t border-border/50">
                  <Button className="w-full rounded-full shadow-lg" size="lg">
                    <Mail className="w-4 h-4 mr-2" />
                    Contact Founder
                  </Button>
                  <p className="text-xs text-muted-foreground text-center mt-2">
                    Direct message to the project owner
                  </p>
                </div>

                <div className="bg-muted/50 rounded-2xl p-4 space-y-2">
                  <h3 className="font-semibold text-sm">Quick Stats</h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Category:</span>
                      <span className="font-medium">{product.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Market:</span>
                      <span className="font-medium">{product.targetAudience}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProductDetail;
