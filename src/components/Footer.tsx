import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="border-t border-border/50 py-8 mt-16">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col sm:flex-row justify-center items-center gap-6 text-sm text-muted-foreground">
          <Link to="/terms" className="hover:text-foreground transition-colors">
            Terms
          </Link>
          <Link to="/privacy" className="hover:text-foreground transition-colors">
            Privacy
          </Link>
          <Link to="/contact" className="hover:text-foreground transition-colors">
            Contact Us
          </Link>
        </div>
      </div>
    </footer>
  );
};
