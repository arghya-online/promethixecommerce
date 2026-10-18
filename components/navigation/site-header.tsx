"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Menu,
  Search,
  ShoppingCart,
  User,
  X,
  Sliders,
  CalendarCheck,
  ChevronRight,
} from "lucide-react";
import { authClient } from "@/src/lib/auth-client";
import { headerNavLinks, headerCta } from "@/data/navigation";
import { siteConfig } from "@/data/site";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function SiteHeader() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const session = authClient.useSession();
  const currentUser = session.data?.user as
    | { role?: string; name?: string; email?: string }
    | undefined;
  const isAdmin = currentUser?.role === "admin";

  useEffect(() => {
    let active = true;

    fetch("/api/cart")
      .then(async (res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (active && data?.success) {
          const total = (data.cart?.items ?? []).reduce(
            (sum: number, item: { quantity?: number }) =>
              sum + (item.quantity ?? 0),
            0,
          );
          setCartCount(total);
        }
      })
      .catch(() => {});

    function onScroll() {
      setScrolled(window.scrollY > 12);
    }
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      active = false;
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    router.push(`/shop?q=${encodeURIComponent(q)}`);
    setSearchOpen(false);
    setSheetOpen(false);
  };

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-200 border-b ${
        scrolled
          ? "bg-background/95 backdrop-blur-md shadow-xs border-border"
          : "bg-background/90 backdrop-blur-sm border-border/70"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        {/* Brand Logo & Tagline */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2.5 group transition-opacity hover:opacity-90"
            aria-label={`${siteConfig.name} - Home`}
          >
            <div className="relative w-8 h-8 rounded-md overflow-hidden bg-surface border border-border shadow-xs shrink-0">
              <Image
                src="/promethix3dLogo.png"
                alt="Promethix3D Logo"
                fill
                sizes="32px"
                className="object-cover"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="font-heading font-bold text-lg tracking-tight text-foreground flex items-center">
                Promethix<span className="text-primary font-black ml-0.5">3D</span>
              </span>
              <span className="hidden sm:inline-block text-[10px] uppercase font-semibold tracking-wider text-foreground-muted -mt-1">
                Products · Consultancy
              </span>
            </div>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav
          className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-medium"
          aria-label="Main Navigation"
        >
          {headerNavLinks.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-foreground-muted hover:text-foreground transition-colors duration-150 py-1"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Actions & CTA */}
        <div className="flex items-center gap-2.5 sm:gap-3.5">
          {/* Search Trigger / Bar */}
          <div className="relative">
            {searchOpen ? (
              <form
                onSubmit={handleSearchSubmit}
                className="flex items-center bg-surface border border-border rounded-lg pl-3 pr-1 py-1 shadow-xs animate-in fade-in zoom-in-95 duration-150 w-52 sm:w-64"
              >
                <Search className="w-4 h-4 text-foreground-muted shrink-0 mr-1.5" />
                <input
                  ref={searchInputRef}
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products or parts..."
                  className="w-full bg-transparent text-xs text-foreground placeholder:text-foreground-subtle focus:outline-none"
                  autoFocus
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => setSearchOpen(false)}
                  aria-label="Close search"
                  className="h-6 w-6 text-foreground-muted hover:text-foreground"
                >
                  <X className="w-3.5 h-3.5" />
                </Button>
              </form>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setSearchOpen(true);
                  setTimeout(() => searchInputRef.current?.focus(), 50);
                }}
                aria-label="Search products"
                className="text-foreground-muted hover:text-foreground h-9 w-9"
              >
                <Search className="w-4.5 h-4.5" />
              </Button>
            )}
          </div>

          {/* Account Link / Admin badge */}
          {currentUser ? (
            <div className="hidden sm:flex items-center gap-1.5 bg-secondary/80 border border-border/80 rounded-lg px-2.5 py-1">
              <Link
                href="/account"
                className="flex items-center gap-1.5 text-xs font-medium text-foreground hover:text-primary transition-colors"
                title={`Signed in as ${currentUser.name || currentUser.email}`}
              >
                <User className="w-3.5 h-3.5 text-primary" />
                <span className="truncate max-w-[100px]">
                  {currentUser.name?.split(" ")[0] || "Account"}
                </span>
              </Link>
              {isAdmin && (
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-1 text-[10px] font-semibold bg-primary/10 text-primary px-1.5 py-0.5 rounded"
                  title="Admin Dashboard"
                >
                  <Sliders className="w-3 h-3" />
                  <span>Admin</span>
                </Link>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-foreground-muted hover:text-foreground px-2 py-1.5 rounded-md hover:bg-secondary/60 transition-colors"
            >
              <User className="w-4 h-4" />
              <span>Sign In</span>
            </Link>
          )}

          {/* Cart Icon with Count Badge (Clean icon, NO raw text link) */}
          <Link
            href="/cart"
            aria-label={`Shopping Cart with ${cartCount} item${cartCount === 1 ? "" : "s"}`}
            className="relative inline-flex items-center justify-center h-9 w-9 rounded-lg text-foreground-muted hover:text-foreground hover:bg-secondary/60 transition-colors"
          >
            <ShoppingCart className="w-4.5 h-4.5" />
            {cartCount > 0 && (
              <span
                aria-hidden="true"
                className="absolute -top-1 -right-1 flex items-center justify-center min-w-5 h-5 px-1 text-[11px] font-bold text-white bg-primary rounded-full shadow-xs ring-2 ring-background animate-in zoom-in-75"
              >
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </Link>

          {/* Book a Consultation CTA Button */}
          <Button
            asChild
            variant="default"
            size="sm"
            className="hidden sm:inline-flex items-center gap-1.5 bg-primary hover:bg-accent-strong text-white font-medium shadow-xs"
          >
            <Link href={headerCta.href}>
              <CalendarCheck className="w-4 h-4" />
              <span>{headerCta.label}</span>
            </Link>
          </Button>

          {/* Mobile Sheet Trigger */}
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden h-9 w-9 text-foreground-muted hover:text-foreground"
                aria-label="Open navigation menu"
              >
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[85vw] sm:w-[380px] p-0 flex flex-col bg-background">
              <SheetHeader className="p-5 border-b border-border">
                <div className="flex items-center justify-between">
                  <SheetTitle className="flex items-center gap-2">
                    <div className="relative w-7 h-7 rounded overflow-hidden">
                      <Image
                        src="/promethix3dLogo.png"
                        alt="Logo"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <span className="font-heading font-bold text-lg">
                      Promethix<span className="text-primary font-black">3D</span>
                    </span>
                  </SheetTitle>
                </div>
                <p className="text-xs text-foreground-muted text-left mt-1">
                  {siteConfig.eyebrow}
                </p>
              </SheetHeader>

              {/* Mobile Search */}
              <div className="p-4 border-b border-border/60">
                <form onSubmit={handleSearchSubmit} className="relative">
                  <Input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search 3D prints & parts..."
                    className="pl-9 text-sm h-10 bg-surface"
                  />
                  <Search className="w-4 h-4 text-foreground-muted absolute left-3 top-3" />
                </form>
              </div>

              {/* Mobile Nav Links */}
              <div className="flex-1 overflow-y-auto px-4 py-3 divide-y divide-border/40">
                <div className="py-2 space-y-1">
                  {headerNavLinks.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setSheetOpen(false)}
                      className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-secondary/70 transition-colors"
                    >
                      <span>{item.label}</span>
                      <ChevronRight className="w-4 h-4 text-foreground-subtle" />
                    </Link>
                  ))}
                </div>

                {/* Mobile Consultation Highlight Card */}
                <div className="py-4">
                  <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
                    <h4 className="font-heading font-semibold text-sm text-foreground flex items-center gap-1.5">
                      <CalendarCheck className="w-4 h-4 text-primary" />
                      Free Product Consultation
                    </h4>
                    <p className="text-xs text-foreground-muted mt-1 leading-relaxed">
                      Discuss feasibility, CAD 3D modelling, or material selection directly with our engineers.
                    </p>
                    <Button
                      asChild
                      className="w-full mt-3 bg-primary hover:bg-accent-strong text-white text-xs h-9"
                    >
                      <Link href="/custom-orders" onClick={() => setSheetOpen(false)}>
                        Book a Consultation
                      </Link>
                    </Button>
                  </div>
                </div>

                {/* Mobile Auth Status */}
                <div className="py-4">
                  {currentUser ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2.5 px-3 py-2 bg-secondary/50 rounded-lg">
                        <User className="w-4 h-4 text-primary" />
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-semibold text-foreground truncate">
                            {currentUser.name || "Customer Account"}
                          </span>
                          <span className="text-[11px] text-foreground-muted truncate">
                            {currentUser.email}
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <Button asChild variant="outline" size="sm" className="w-full text-xs">
                          <Link href="/account" onClick={() => setSheetOpen(false)}>
                            My Account
                          </Link>
                        </Button>
                        {isAdmin && (
                          <Button asChild size="sm" className="w-full text-xs bg-foreground text-background">
                            <Link href="/admin" onClick={() => setSheetOpen(false)}>
                              Admin Panel
                            </Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      <Button asChild variant="outline" size="sm" className="w-full text-xs">
                        <Link href="/login" onClick={() => setSheetOpen(false)}>
                          Sign In
                        </Link>
                      </Button>
                      <Button asChild size="sm" className="w-full text-xs bg-primary text-white">
                        <Link href="/signup" onClick={() => setSheetOpen(false)}>
                          Sign Up
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
