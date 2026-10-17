"use client";

import { List, ShoppingBagOpen, UserCircle, X } from "@phosphor-icons/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Container } from "@/components/layout/container";

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [scrolled, setScrolled] = useState(false);

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

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className={`site-header${scrolled ? " site-header--scrolled" : ""}`}>
      <Container className="header-inner">
        <Link href="/" className="wordmark" aria-label="Promethix3D home">
          Promethix3D
        </Link>

        <nav className="desktop-nav" aria-label="Primary navigation">
          <Link href="/shop">Shop</Link>
          <Link href="/shop#categories">Categories</Link>
          <Link href="/custom-orders">Custom Orders</Link>
          <Link href="/about">About</Link>
        </nav>

        <div className="header-actions">
          <Link href="/login" className="header-account">
            <UserCircle size={20} weight="regular" aria-hidden="true" />
            <span>Account</span>
          </Link>
          <Link href="/cart" className="cart-link" aria-label={`Cart, ${cartCount} item${cartCount === 1 ? "" : "s"}`}>
            <ShoppingBagOpen size={20} weight="regular" aria-hidden="true" />
            {cartCount > 0 && (
              <span className="cart-count" aria-hidden="true">{cartCount}</span>
            )}
          </Link>
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

      {menuOpen && (
        <nav id="mobile-navigation" className="mobile-nav" aria-label="Mobile navigation">
          <Container className="mobile-nav-inner">
            <Link href="/shop" onClick={closeMenu}>Shop</Link>
            <Link href="/shop#categories" onClick={closeMenu}>Categories</Link>
            <Link href="/custom-orders" onClick={closeMenu}>Custom Orders</Link>
            <Link href="/about" onClick={closeMenu}>About</Link>
            <Link href="/login" onClick={closeMenu}>Account</Link>
          </Container>
        </nav>
      )}
    </header>
  );
}
