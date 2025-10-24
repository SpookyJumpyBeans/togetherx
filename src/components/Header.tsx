import { Button } from "@/components/ui/button";
import { Handshake, Rocket } from "lucide-react";

interface HeaderProps {
  onSubmitClick?: () => void;
}

export const Header = ({ onSubmitClick }: HeaderProps) => {
  const handleSubmitClick = () => {
    if (onSubmitClick) {
      onSubmitClick();
    }
  };

  return (
    <header className="border-b border-border/50 bg-background/95 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4 md:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-xl flex items-center justify-center shadow-sm">
              <Handshake className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold tracking-tight">
              TogetherX
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <a href="#products" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Products
            </a>
            <Button 
              variant="default" 
              size="sm" 
              className="rounded-full"
              onClick={handleSubmitClick}
            >
              <Rocket className="w-4 h-4 mr-2" />
              Submit Product
            </Button>
          </nav>

          <div className="md:hidden">
            <Button 
              variant="default" 
              size="sm" 
              className="rounded-full"
              onClick={handleSubmitClick}
            >
              <Rocket className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
