import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="border-t border-border/30 py-12 mt-24">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
          <p className="text-sm text-muted-foreground">
            © 2025 TogetherX. All rights reserved.
          </p>
          <div className="flex items-center gap-8 text-sm text-muted-foreground">
            <Link 
              to="/terms" 
              className="hover:text-foreground transition-colors relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-primary after:transition-all hover:after:w-full"
            >
              Terms
            </Link>
            <Link 
              to="/privacy" 
              className="hover:text-foreground transition-colors relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-primary after:transition-all hover:after:w-full"
            >
              Privacy
            </Link>
            <Link 
              to="/contact" 
              className="hover:text-foreground transition-colors relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-primary after:transition-all hover:after:w-full"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
