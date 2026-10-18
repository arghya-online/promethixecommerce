"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Loader2,
  LogOut,
  Package,
  RefreshCw,
  ShoppingBag,
  Sliders,
  User,
  AlertCircle,
} from "lucide-react";
import { AnnouncementBar } from "@/components/navigation/announcement-bar";
import { SiteHeader } from "@/components/navigation/site-header";
import { SiteFooter } from "@/components/navigation/site-footer";
import { MobileTabBar } from "@/components/navigation/mobile-tab-bar";
import { formatPrice } from "@/components/catalog/product-types";
import { authClient } from "@/src/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

type Order = {
  _id: string;
  createdAt: string;
  total: number;
  paymentMethod?: "online" | "cod";
  paymentStatus: string;
  orderStatus: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
};

function formatStatus(val: string) {
  return val
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function getStatusBadge(status: string) {
  const norm = status.toLowerCase();
  if (["paid", "completed", "delivered", "success"].includes(norm)) {
    return (
      <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-500/20 text-[10px]">
        {formatStatus(status)}
      </Badge>
    );
  }
  if (["pending", "processing", "created", "awaiting-payment"].includes(norm)) {
    return (
      <Badge className="bg-amber-500/10 text-amber-700 border-amber-500/20 text-[10px]">
        {formatStatus(status)}
      </Badge>
    );
  }
  if (["failed", "cancelled", "canceled", "refunded"].includes(norm)) {
    return (
      <Badge variant="destructive" className="text-[10px]">
        {formatStatus(status)}
      </Badge>
    );
  }
  return <Badge variant="secondary" className="text-[10px]">{formatStatus(status)}</Badge>;
}

export default function AccountClient() {
  const router = useRouter();
  const session = authClient.useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState("");
  const [signingOut, setSigningOut] = useState(false);

  const user = session.data?.user as
    | { role?: string; name?: string; email?: string }
    | undefined;
  const isAdmin = user?.role === "admin";

  const loadOrders = useCallback(async () => {
    setOrdersLoading(true);
    setOrdersError("");

    try {
      const res = await fetch("/api/orders");
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Could not load order history.");
      }

      setOrders(Array.isArray(data.orders) ? data.orders : []);
    } catch (err: unknown) {
      setOrdersError(
        err instanceof Error ? err.message : "Error retrieving orders.",
      );
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!session.isPending && !session.data) {
      router.push("/login?redirect=/account");
      return;
    }

    if (session.data) {
      void loadOrders();
    }
  }, [session.data, session.isPending, router, loadOrders]);

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await authClient.signOut();
      router.push("/");
      router.refresh();
    } catch {
      setSigningOut(false);
    }
  }

  if (session.isPending) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <AnnouncementBar />
        <SiteHeader />
        <main className="flex-1 max-w-5xl mx-auto px-4 py-16 w-full space-y-6">
          <Skeleton className="h-28 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col pb-16 md:pb-0">
      <AnnouncementBar />
      <SiteHeader />

      <main className="flex-1 py-10 md:py-16 bg-gradient-to-b from-[#eee8dc]/60 via-[#f7f4ed]/40 to-background bg-cad-dots relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* User Profile Card */}
          <Card className="bg-surface border-border shadow-xs rounded-2xl p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center font-heading font-black text-2xl shrink-0">
                  {user?.name?.[0]?.toUpperCase() || <User className="w-7 h-7" />}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h1 className="font-heading font-bold text-xl sm:text-2xl text-foreground">
                      {user?.name || "Customer Account"}
                    </h1>
                    {isAdmin && (
                      <Badge className="bg-primary text-white text-[10px]">
                        Admin
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-foreground-muted">{user?.email}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-2.5">
                {isAdmin && (
                  <Button asChild size="sm" variant="outline" className="text-xs">
                    <Link href="/admin" className="flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-primary" />
                      <span>Admin Panel</span>
                    </Link>
                  </Button>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  disabled={signingOut}
                  onClick={handleSignOut}
                  className="text-xs text-destructive border-destructive/20 hover:bg-destructive/10"
                >
                  {signingOut ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                  ) : (
                    <LogOut className="w-3.5 h-3.5 mr-1.5" />
                  )}
                  <span>Sign Out</span>
                </Button>
              </div>
            </div>
          </Card>

          {/* Orders Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-heading font-bold text-xl text-foreground flex items-center gap-2">
                  <Package className="w-5 h-5 text-primary" />
                  <span>My Orders</span>
                </h2>
                <p className="text-xs text-foreground-muted mt-0.5">
                  Track production progress and dispatch details.
                </p>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => void loadOrders()}
                disabled={ordersLoading}
                className="text-xs text-foreground-muted hover:text-foreground"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 mr-1.5 ${
                    ordersLoading ? "animate-spin" : ""
                  }`}
                />
                <span>Refresh</span>
              </Button>
            </div>

            {ordersLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 2 }).map((_, i) => (
                  <Skeleton key={i} className="h-36 w-full rounded-xl" />
                ))}
              </div>
            ) : ordersError ? (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-xs flex items-center justify-between">
                <span>{ordersError}</span>
                <Button size="xs" variant="outline" onClick={() => void loadOrders()}>
                  Retry
                </Button>
              </div>
            ) : orders.length === 0 ? (
              <Card className="text-center py-12 px-6 bg-surface border border-dashed border-border rounded-xl space-y-3">
                <Package className="w-10 h-10 text-foreground-subtle/40 mx-auto" />
                <h3 className="font-heading font-bold text-base text-foreground">
                  No orders yet
                </h3>
                <p className="text-xs text-foreground-muted max-w-sm mx-auto">
                  When you purchase 3D prints or approve a custom job quote, your tracking updates will show here.
                </p>
                <Button asChild size="sm" className="bg-primary hover:bg-accent-strong text-white text-xs mt-2">
                  <Link href="/shop">Browse Storefront</Link>
                </Button>
              </Card>
            ) : (
              <div className="space-y-4">
                {orders.map((ord) => (
                  <Card
                    key={ord._id}
                    className="bg-surface border-border rounded-xl p-5 shadow-xs space-y-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border/80 text-xs">
                      <div className="space-y-0.5">
                        <span className="font-mono text-foreground-subtle text-[11px] block">
                          Order ID: {ord._id}
                        </span>
                        <span className="text-foreground-muted">
                          Placed on:{" "}
                          {new Date(ord.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {ord.paymentMethod === "cod" ? (
                          <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-800 border-amber-200">
                            Cash on Delivery
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-800 border-emerald-200">
                            Online
                          </Badge>
                        )}
                        {getStatusBadge(ord.paymentStatus)}
                        {getStatusBadge(ord.orderStatus)}
                      </div>
                    </div>

                    {/* Items list */}
                    <div className="space-y-2">
                      {ord.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex justify-between items-center text-xs"
                        >
                          <span className="font-medium text-foreground">
                            {item.quantity} × {item.name}
                          </span>
                          <span className="font-bold text-foreground">
                            {formatPrice(item.price * item.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-3 border-t border-border/80 flex items-center justify-between text-xs">
                      <span className="text-foreground-muted">Total Amount</span>
                      <span className="font-heading font-bold text-base text-primary">
                        {formatPrice(ord.total)}
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <SiteFooter />
      <MobileTabBar />
    </div>
  );
}
