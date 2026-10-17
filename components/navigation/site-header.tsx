"use client";

import {
  List,
  MagnifyingGlass,
  ShoppingBagOpen,
  SignOut,
  Sliders,
  User,
  X,
} from "@phosphor-icons/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Container } from "@/components/layout/container";
import { authClient } from "@/src/lib/auth-client";

export function SiteHeader() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
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
          setCartCount(
            (data.cart?.items ?? []).reduce(
              (total: number, item: { quantity?: number }) =>
                total + (item.quantity ?? 0),
              0,
            ),
          );
        }
      })
      .catch(() => {});

    function onScroll() {
      setScrolled(window.scrollY > 8);
    }
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      active = false;
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
    setSearchOpen(false);
    setMenuOpen(false);
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className={`site-header${scrolled ? " site-header--scrolled" : ""}`}>
      <Container className="header-inner">
        {/* Brand Logo */}
        <Link href="/" className="brand-logo" aria-label="Promethix3D Homepage">
          <span className="brand-mark" aria-hidden="true">
            <img src="/promethix3dLogo.png" alt="Promethix3D Logo" width={28} height={28} className="rounded" />
          </span>
          <span className="brand-name font-heading">
            Promethix<strong>3D</strong>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="desktop-nav" aria-label="Primary navigation">
          <Link href="/shop" className="nav-link">
            Shop
          </Link>
          <Link href="/#categories" className="nav-link">
            What We Print
          </Link>
          <Link href="/custom-orders" className="nav-link nav-link--highlight">
            Custom Orders
          </Link>
          <Link href="/#how-it-works" className="nav-link">
            How It Works
          </Link>
          <Link href="/about" className="nav-link">
            About
          </Link>
          <Link href="/#faqs" className="nav-link">
            FAQs
          </Link>
        </nav>

        {/* Header Actions */}
        <div className="header-actions">
          {/* Search Trigger */}
          <div className="header-search-wrap">
            {searchOpen ? (
              <form onSubmit={handleSearchSubmit} className="header-search-form">
                <input
                  ref={searchInputRef}
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search 3D prints, gifts, parts…"
                  className="header-search-input"
                  autoFocus
                />
                <button
                  type="button"
                  className="header-icon-btn"
                  onClick={() => setSearchOpen(false)}
                  aria-label="Close search"
                >
                  <X size={18} />
                </button>
              </form>
            ) : (
              <button
                type="button"
                className="header-icon-btn header-search-trigger"
                onClick={() => {
                  setSearchOpen(true);
                  setTimeout(() => searchInputRef.current?.focus(), 50);
                }}
                aria-label="Search storefront"
              >
                <MagnifyingGlass size={20} />
              </button>
            )}
          </div>

          {/* Authentication State */}
          {currentUser ? (
            <div className="user-menu-pill">
              <Link
                href="/account"
                className="header-account-link"
                title={`Signed in as ${currentUser.name || currentUser.email}`}
              >
                <User size={18} weight="bold" />
                <span className="account-text">{currentUser.name?.split(" ")[0] || "Account"}</span>
              </Link>
              {isAdmin && (
                <Link href="/admin" className="admin-chip-badge" title="Open Admin Dashboard">
                  <Sliders size={13} weight="bold" />
                  <span>Admin</span>
                </Link>
              )}
            </div>
          ) : (
            <Link href="/login" className="header-account-link">
              <User size={20} />
              <span className="account-text">Sign In</span>
            </Link>
          )}

          {/* Cart */}
          <Link
            href="/cart"
            className="cart-link"
            aria-label={`Cart, ${cartCount} item${cartCount === 1 ? "" : "s"}`}
          >
            <ShoppingBagOpen size={21} weight="regular" aria-hidden="true" />
            {cartCount > 0 && (
              <span className="cart-count" aria-hidden="true">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            className="menu-toggle"
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X size={22} aria-hidden="true" /> : <List size={22} aria-hidden="true" />}
          </button>
        </div>
      </Container>

      {/* Mobile Navigation Drawer */}
      {menuOpen && (
        <nav id="mobile-navigation" className="mobile-nav" aria-label="Mobile navigation">
          <Container className="mobile-nav-inner">
            <form onSubmit={handleSearchSubmit} className="mobile-search-form">
              <MagnifyingGlass size={18} />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="mobile-search-input"
              />
            </form>

            <div className="mobile-nav-links">
              <Link href="/shop" onClick={closeMenu}>
                Shop Products
              </Link>
              <Link href="/#categories" onClick={closeMenu}>
                What We Print
              </Link>
              <Link href="/custom-orders" className="mobile-nav-highlight" onClick={closeMenu}>
                Custom Orders &amp; CAD
              </Link>
              <Link href="/#how-it-works" onClick={closeMenu}>
                How It Works
              </Link>
              <Link href="/about" onClick={closeMenu}>
                About Our Studio
              </Link>
              <Link href="/#faqs" onClick={closeMenu}>
                Frequently Asked Questions
              </Link>
            </div>

            <div className="mobile-nav-footer">
              {currentUser ? (
                <div className="mobile-auth-status">
                  <div className="mobile-user-info">
                    <User size={18} />
                    <span>{currentUser.name || currentUser.email}</span>
                  </div>
                  <div className="mobile-auth-actions">
                    <Link href="/account" className="button button-secondary" onClick={closeMenu}>
                      My Account
                    </Link>
                    {isAdmin && (
                      <Link href="/admin" className="button button-primary" onClick={closeMenu}>
                        Admin Panel
                      </Link>
                    )}
                  </div>
                </div>
              ) : (
                <div className="mobile-auth-actions">
                  <Link href="/login" className="button button-primary" onClick={closeMenu}>
                    Sign In
                  </Link>
                  <Link href="/signup" className="button button-secondary" onClick={closeMenu}>
                    Create Account
                  </Link>
                </div>
              )}
            </div>
          </Container>
        </nav>
      )}
    </header>
  );
}
