"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ShoppingBag, Compass, ShoppingCart, User } from "lucide-react";
import { mobileTabLinks } from "@/data/navigation";

const iconMap = {
  Home,
  ShoppingBag,
  Compass,
  ShoppingCart,
  User,
};

export function MobileTabBar() {
  const pathname = usePathname();
  const [cartCount, setCartCount] = useState(0);

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

    return () => {
      active = false;
    };
  }, [pathname]);

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-background/95 backdrop-blur-md border-t border-border/80 shadow-[0_-4px_16px_rgba(0,0,0,0.04)] px-2 py-1 safe-area-pb"
    >
      <div className="grid grid-cols-5 items-center justify-items-center max-w-md mx-auto">
        {mobileTabLinks.map((tab) => {
          const Icon = iconMap[tab.iconName] || Home;
          const isActive =
            tab.href === "/"
              ? pathname === "/"
              : pathname.startsWith(tab.href);

          return (
            <Link
              key={tab.id}
              href={tab.href}
              className={`relative flex flex-col items-center justify-center w-full py-1.5 px-1 rounded-lg transition-colors text-center ${
                isActive
                  ? "text-primary font-semibold"
                  : "text-foreground-muted hover:text-foreground"
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? "stroke-[2.5]" : "stroke-[1.75]"}`} />
                {tab.id === "cart" && cartCount > 0 && (
                  <span
                    aria-hidden="true"
                    className="absolute -top-1.5 -right-2 flex items-center justify-center min-w-4 h-4 px-1 text-[10px] font-bold text-white bg-primary rounded-full ring-2 ring-background"
                  >
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 tracking-tight leading-none">
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
