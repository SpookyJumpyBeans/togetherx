import { Button } from "@/components/ui/button";
import { Handshake, Rocket, LogIn, LogOut, User, Bell } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  onSubmitClick?: () => void;
  onSubscribeClick?: () => void;
}

export const Header = ({ onSubmitClick, onSubscribeClick }: HeaderProps) => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmitClick = () => {
    if (onSubmitClick) {
      onSubmitClick();
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
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

          <nav className="flex items-center gap-4">
            <a href="#products" className="hidden md:block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Products
            </a>

            <Button 
              variant="ghost" 
              size="sm"
              onClick={onSubscribeClick}
              className="rounded-full hidden md:flex"
            >
              <Bell className="w-4 h-4 mr-2" />
              Subscribe
            </Button>
            
            <Button 
              variant="default" 
              size="sm" 
              className="rounded-full"
              onClick={handleSubmitClick}
            >
              <Rocket className="w-4 h-4 md:mr-2" />
              <span className="hidden md:inline">Submit Product</span>
            </Button>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="rounded-full h-9 w-9 p-0">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-gradient-primary text-primary-foreground text-xs">
                        {user.email?.[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => navigate("/profile")}>
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate("/auth")}
                className="rounded-full"
              >
                <LogIn className="w-4 h-4 md:mr-2" />
                <span className="hidden md:inline">Login</span>
              </Button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};
