import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export const Header = () => {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center group-hover:shadow-glow transition-all">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-xl bg-gradient-primary bg-clip-text text-transparent">
            BuilderSync
          </span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-6">
          <Link
            to="/"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              isActive("/") ? "text-primary" : "text-muted-foreground"
            }`}
          >
            Home
          </Link>
          <Link
            to="/marketplace"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              isActive("/marketplace") ? "text-primary" : "text-muted-foreground"
            }`}
          >
            Marketplace
          </Link>
          <Link
            to="/submit"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              isActive("/submit") ? "text-primary" : "text-muted-foreground"
            }`}
          >
            Submit Product
          </Link>
        </nav>
        
        <div className="flex items-center gap-3">
          <Link to="/submit">
            <Button variant="hero" size="sm">
              List Your Product
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};
