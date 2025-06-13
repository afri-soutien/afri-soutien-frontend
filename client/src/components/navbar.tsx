import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Heart, Menu, User, LogOut } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setLocation("/");
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <Heart className="text-white w-4 h-4" />
              </div>
              <span className="font-header font-bold text-xl text-neutral">Afri Soutien</span>
            </Link>

            <nav className="hidden md:flex space-x-6">
              <Link href="/" className="text-neutral hover:text-primary font-medium transition-colors">
                Accueil
              </Link>
              <Link href="/campaigns" className="text-neutral hover:text-primary font-medium transition-colors">
                Cagnottes
              </Link>
              <Link href="/boutique" className="text-neutral hover:text-primary font-medium transition-colors">
                Boutique
              </Link>
              <Link href="/donate-material" className="text-neutral hover:text-primary font-medium transition-colors">
                Donner
              </Link>
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <span className="hidden sm:block text-sm text-gray-600">
                  Bonjour, {user?.firstName}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setLocation("/dashboard")}
                  className="hidden sm:flex"
                >
                  <User className="w-4 h-4 mr-2" />
                  Tableau de bord
                </Button>
                {user?.role === "admin" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setLocation("/admin")}
                    className="hidden sm:flex border-accent text-accent"
                  >
                    Admin
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-gray-600 hover:text-red-600"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setLocation("/login")}
                  className="hidden sm:block"
                >
                  Connexion
                </Button>
                <Button
                  size="sm"
                  onClick={() => setLocation("/register")}
                  className="bg-primary hover:bg-orange-700"
                >
                  Inscription
                </Button>
              </>
            )}

            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <nav className="flex flex-col space-y-4">
              <Link
                href="/"
                className="text-neutral hover:text-primary font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Accueil
              </Link>
              <Link
                href="/campaigns"
                className="text-neutral hover:text-primary font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Cagnottes
              </Link>
              <Link
                href="/boutique"
                className="text-neutral hover:text-primary font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Boutique
              </Link>
              <Link
                href="/donate-material"
                className="text-neutral hover:text-primary font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Donner
              </Link>

              {isAuthenticated && (
                <>
                  <Link
                    href="/dashboard"
                    className="text-neutral hover:text-primary font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Tableau de bord
                  </Link>
                  {user?.role === "admin" && (
                    <Link
                      href="/admin"
                      className="text-accent hover:text-orange-600 font-medium"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Administration
                    </Link>
                  )}
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
