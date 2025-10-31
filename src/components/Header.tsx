import { Button } from "@/components/ui/button";
import { Rocket, LogIn, LogOut, User, Bell, Plus, Trophy, CheckSquare, Package } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { Link, useNavigate, useLocation } from "react-router-dom";
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
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Subscribe first to avoid missing the initial SIGNED_IN event on redirects
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      // Defer async operations to prevent deadlock
      if (session?.user) {
        setTimeout(() => {
          checkAdminRole(session.user.id);
        }, 0);
      } else {
        setIsAdmin(false);
      }
    });

    // Then fetch any existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkAdminRole(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAdminRole = async (userId: string) => {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();
    
    setIsAdmin(!!data);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  return (
    <header className="border-b border-border/50 bg-background/95 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4 md:px-6 py-4">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => navigate("/")}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 bg-foreground rounded-xl flex items-center justify-center shadow-sm">
              <Rocket className="w-5 h-5 text-background" />
            </div>
            <span className="text-xl font-semibold tracking-tight">
              TogetherX
            </span>
          </button>

          <nav className="flex items-center gap-6">
            <Link to="/leaderboard" className="hidden md:flex items-center gap-2 text-sm font-medium text-foreground hover:text-muted-foreground transition-colors">
              <Trophy className="w-4 h-4" />
              Leaderboard
            </Link>

            {isAdmin && (
              <>
                <Link to="/approvals" className="hidden md:flex items-center gap-2 text-sm font-medium text-foreground hover:text-muted-foreground transition-colors">
                  <CheckSquare className="w-4 h-4" />
                  Product Approvals
                </Link>
                <Link to="/story-approvals" className="hidden md:flex items-center gap-2 text-sm font-medium text-foreground hover:text-muted-foreground transition-colors">
                  <Trophy className="w-4 h-4" />
                  Story Approvals
                </Link>
              </>
            )}

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
              className="rounded-full bg-foreground text-background hover:bg-foreground/90"
              onClick={onSubmitClick}
            >
              <Plus className="w-4 h-4 md:mr-2" />
              <span className="hidden md:inline">Submit Product</span>
            </Button>

            {user ? (
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="rounded-full h-9 w-9 p-0">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-muted text-foreground text-xs">
                        { (user.email ?? "").charAt(0).toUpperCase() || ((user.user_metadata?.name ?? "").charAt(0).toUpperCase()) || "U" }
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => navigate("/profile")}>
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/my-products")}>
                    <Package className="w-4 h-4 mr-2" />
                    My Products
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
