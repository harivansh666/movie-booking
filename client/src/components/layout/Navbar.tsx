import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  Film,
  Heart,
  Ticket,
  Menu,
  X,
  Sun,
  Moon,
  LogOut,
  User,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/authStore";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const { isAuthenticated, user, signOut } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || "",
  );

  useEffect(() => {
    setSearchQuery(searchParams.get("search") || "");
  }, [searchParams]);

  const links = [
    { to: "/", label: "Home", icon: Film },
    { to: "/movies", label: "Movies", icon: Film },
    { to: "/bookings", label: "My Bookings", icon: Ticket },
    { to: "/favorites", label: "Favorites", icon: Heart },
  ];

  const handleSignOut = () => {
    signOut();
    navigate("/");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/movies?search=${encodeURIComponent(searchQuery.trim())}`);
      setOpen(false);
    }
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link
          to="/"
          className="flex items-center gap-2 text-xl font-bold tracking-tight text-primary"
        >
          <Film className="h-6 w-6" />
          <span className="hidden sm:inline">CineBook</span>
        </Link>

        {/* Global Search */}
        <form
          onSubmit={handleSearch}
          className="relative mx-4 flex-1 max-w-md hidden sm:block"
        >
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search movies..."
            className="pl-9 bg-muted/50 border-none h-9 focus-visible:ring-1"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>

        {/* Desktop nav */}
        <div className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Button key={l.to} variant="ghost" size="sm" asChild>
              <Link to={l.to} className="gap-1.5">
                <l.icon className="h-4 w-4" />
                {l.label}
              </Link>
            </Button>
          ))}
        </div>

        <div className="hidden items-center gap-2 md:flex text-sm">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground whitespace-nowrap">
                <User className="mr-1 inline h-3 w-3" />
                {user?.name}
              </span>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="mr-1 h-3 w-4" />
                Sign Out
              </Button>
            </div>
          ) : (
            <Button size="sm" asChild>
              <Link to="/signin">Sign In</Link>
            </Button>
          )}
        </div>

        {/* Mobile toggle */}
        <div className="flex items-center gap-2 sm:hidden flex-1 justify-end">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setOpen(!open)}>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-b border-border md:hidden bg-background"
          >
            <div className="flex flex-col gap-1 p-4">
              <form onSubmit={handleSearch} className="relative mb-4 sm:hidden">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search movies..."
                  className="pl-9 bg-muted/50 border-none h-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </form>

              {links.map((l) => (
                <Button
                  key={l.to}
                  variant="ghost"
                  className="justify-start"
                  asChild
                  onClick={() => setOpen(false)}
                >
                  <Link to={l.to}>
                    <l.icon className="mr-2 h-4 w-4" />
                    {l.label}
                  </Link>
                </Button>
              ))}
              <div className="my-2 border-t border-border" />
              {isAuthenticated ? (
                <>
                  <div className="px-3 py-2 text-sm text-muted-foreground">
                    <User className="mr-2 inline h-4 w-4" />
                    {user?.name}
                  </div>
                  <Button
                    variant="ghost"
                    className="justify-start"
                    onClick={() => {
                      handleSignOut();
                      setOpen(false);
                    }}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <Button
                  className="justify-start"
                  asChild
                  onClick={() => setOpen(false)}
                >
                  <Link to="/signin">Sign In</Link>
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
