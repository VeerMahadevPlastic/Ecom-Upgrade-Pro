import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Search, ShoppingCart, Menu, X, Globe, Phone } from "lucide-react";
import { useCart } from "../../contexts/CartContext";
import { useCurrency } from "../../contexts/CurrencyContext";
import { CURRENCIES, CurrencyCode } from "../../lib/currency";
import { Button } from "../ui/button";
import { useDebounce } from "../../hooks/use-debounce";
import { useGetSearchSuggestions } from "@workspace/api-client-react";
import logoUrl from "/vm-plastic-logo.png";

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { cartCount, setIsCartOpen } = useCart();
  const { currency, setCurrency } = useCurrency();
  const [, setLocation] = useLocation();

  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const { data: suggestionsData } = useGetSearchSuggestions(
    { q: debouncedSearch },
    {
      query: {
        enabled: debouncedSearch.length >= 2,
        queryKey: ["searchSuggestions", debouncedSearch]
      }
    }
  );

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setShowSuggestions(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-sidebar-border bg-sidebar text-sidebar-foreground">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden p-2 -ml-2"
          onClick={() => setIsMobileMenuOpen(true)}
        >
          <Menu className="h-6 w-6" />
        </button>

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <img src={logoUrl} alt="VM Plastic" className="h-9 w-9 object-contain rounded-full" />
          <span className="hidden sm:inline-block font-semibold text-lg tracking-tight">
            Veer Mahadev Plastic
          </span>
        </Link>

        {/* Search */}
        <div className="flex-1 max-w-2xl hidden md:block relative">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="search"
              placeholder="Search products, SKUs, categories..."
              className="w-full bg-sidebar-accent/50 border border-sidebar-accent rounded-full px-4 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-sidebar-foreground/50" />
            <button
              type="submit"
              className="absolute right-1 top-1/2 -translate-y-1/2 bg-primary text-primary-foreground hover:bg-primary/90 px-3 py-1 rounded-full text-xs font-medium transition-colors"
            >
              Search
            </button>
          </form>

          {/* Search Suggestions */}
          {showSuggestions && suggestionsData?.suggestions && suggestionsData.suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-popover text-popover-foreground border rounded-md shadow-lg overflow-hidden z-50">
              {suggestionsData.suggestions.map((s) => (
                <div
                  key={s.id}
                  className="px-4 py-2 hover:bg-muted cursor-pointer flex justify-between items-center"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setLocation(`/products/${s.id}`);
                    setShowSuggestions(false);
                    setSearchQuery("");
                  }}
                >
                  <div>
                    <div className="font-medium text-sm">{s.name}</div>
                    <div className="text-xs text-muted-foreground">{s.category}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <div className="hidden sm:flex items-center gap-1 text-sm bg-sidebar-accent/50 px-2 py-1 rounded-md border border-sidebar-accent">
            <Globe className="h-4 w-4 text-sidebar-foreground/70" />
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
              className="bg-transparent border-none focus:outline-none focus:ring-0 text-sidebar-foreground font-medium cursor-pointer"
            >
              {Object.keys(CURRENCIES).map((c) => (
                <option key={c} value={c} className="bg-popover text-popover-foreground">
                  {c}
                </option>
              ))}
            </select>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="relative text-sidebar-foreground hover:bg-sidebar-accent"
            onClick={() => setIsCartOpen(true)}
          >
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full">
                {cartCount}
              </span>
            )}
          </Button>

          <a
            href="https://wa.me/918050389261"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden lg:flex items-center gap-2 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] border border-[#25D366]/30 px-3 py-2 rounded-md font-medium text-sm transition-colors"
          >
            <Phone className="h-4 w-4" />
            <span>Support</span>
          </a>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-background md:hidden flex flex-col">
          <div className="h-16 px-4 flex items-center justify-between border-b border-border bg-sidebar text-sidebar-foreground">
            <span className="font-semibold text-lg">Menu</span>
            <button className="p-2 -mr-2" onClick={() => setIsMobileMenuOpen(false)}>
              <X className="h-6 w-6" />
            </button>
          </div>
          <div className="p-4 flex-1 overflow-y-auto">
            <form onSubmit={(e) => { e.preventDefault(); handleSearchSubmit(e); setIsMobileMenuOpen(false); }} className="relative mb-6">
              <input
                type="search"
                placeholder="Search products..."
                className="w-full bg-muted border rounded-md px-4 py-3 pl-10 focus:outline-none focus:ring-2 focus:ring-primary"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            </form>

            <nav className="flex flex-col gap-2">
              <Link href="/" className="px-4 py-3 text-lg font-medium border-b" onClick={() => setIsMobileMenuOpen(false)}>
                Home
              </Link>
              <Link href="/products" className="px-4 py-3 text-lg font-medium border-b" onClick={() => setIsMobileMenuOpen(false)}>
                All Products
              </Link>
              <div className="px-4 py-3 border-b">
                <label className="text-sm text-muted-foreground block mb-2">Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                  className="w-full bg-muted border rounded-md p-2"
                >
                  {Object.keys(CURRENCIES).map((c) => (
                    <option key={c} value={c}>
                      {c} - {CURRENCIES[c as CurrencyCode].name}
                    </option>
                  ))}
                </select>
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
