import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { Menu, PawPrint, X } from "lucide-react";
import { useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

interface HeaderProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  isAdmin: boolean;
}

export default function Header({
  currentPage,
  onNavigate,
  isAdmin,
}: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === "logging-in";

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
    } else {
      try {
        await login();
      } catch (error: any) {
        if (error.message === "User is already authenticated") {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  const navLinks = [
    { label: "Home", page: "home" },
    { label: "Services", page: "services" },
    { label: "Book Now", page: "booking" },
    ...(isAuthenticated ? [{ label: "My Bookings", page: "my-bookings" }] : []),
    ...(isAdmin ? [{ label: "Admin", page: "admin" }] : []),
  ];

  return (
    <header className="bg-card shadow-nav sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <button
          type="button"
          className="flex items-center gap-2 font-heading font-bold text-xl text-primary"
          onClick={() => onNavigate("home")}
          data-ocid="nav.link"
        >
          <PawPrint className="w-7 h-7" />
          <span>FurLogic</span>
        </button>

        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <button
              type="button"
              key={link.page}
              onClick={() => onNavigate(link.page)}
              data-ocid={`nav.${link.page}.link`}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                currentPage === link.page
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {link.label}
            </button>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Button
            onClick={handleAuth}
            disabled={isLoggingIn}
            data-ocid="nav.auth.button"
            className={`rounded-full px-5 ${
              isAuthenticated
                ? "bg-muted text-foreground hover:bg-muted/80"
                : "bg-accent text-accent-foreground hover:bg-accent/90"
            }`}
          >
            {isLoggingIn
              ? "Logging in..."
              : isAuthenticated
                ? "Logout"
                : "Login"}
          </Button>
        </div>

        <button
          type="button"
          className="md:hidden p-2 text-muted-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
          data-ocid="nav.mobile.toggle"
        >
          {mobileOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-card border-t border-border px-4 py-3 flex flex-col gap-2">
          {navLinks.map((link) => (
            <button
              type="button"
              key={link.page}
              onClick={() => {
                onNavigate(link.page);
                setMobileOpen(false);
              }}
              className={`py-2 px-4 rounded-lg text-sm font-medium text-left ${
                currentPage === link.page
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground"
              }`}
            >
              {link.label}
            </button>
          ))}
          <Button
            onClick={() => {
              handleAuth();
              setMobileOpen(false);
            }}
            disabled={isLoggingIn}
            className="rounded-full mt-1 bg-accent text-accent-foreground hover:bg-accent/90"
          >
            {isLoggingIn
              ? "Logging in..."
              : isAuthenticated
                ? "Logout"
                : "Login"}
          </Button>
        </div>
      )}
    </header>
  );
}
