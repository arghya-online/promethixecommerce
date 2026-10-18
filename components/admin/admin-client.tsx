"use client";

import { motion, AnimatePresence } from "motion/react";
import {
  ArrowRight,
  ArrowUpRight,
  Bell,
  CaretDown,
  Check,
  CheckCircle,
  Circle,
  Clock,
  CloudArrowUp,
  Cube,
  CurrencyInr,
  Eye,
  FileText,
  FloppyDisk,
  Funnel,
  Gauge,
  Gear,
  Globe,
  Info,
  List,
  MagnifyingGlass,
  Package,
  PencilSimple,
  Plus,
  ShieldCheck,
  SignOut,
  Sparkle,
  Spinner,
  SquaresFour,
  Tag,
  Trash,
  TrendUp,
  UserCheck,
  Users,
  WarningCircle,
  X,
  ClipboardText,
} from "@phosphor-icons/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AuthForm } from "@/components/auth/auth-form";
import { BannerManager } from "@/components/admin/banner-manager";
import { CloudinaryMedia } from "@/components/admin/cloudinary-media";
import { ProductManager } from "@/components/admin/product-manager";
import type { Category, Product } from "@/components/catalog/product-types";
import { Container } from "@/components/layout/container";
import { SiteHeader } from "@/components/navigation/site-header";
import { authClient } from "@/src/lib/auth-client";

type Banner = {
  _id: string;
  slot: "hero" | "promotion";
  title: string;
  subtitle: string;
  image: string;
  href: string;
  isActive: boolean;
  sortOrder: number;
};

type AdminOrder = {
  _id: string;
  total: number;
  paymentMethod?: "online" | "cod" | "cash" | "upi" | "bank_transfer";
  paymentStatus: string;
  orderStatus: string;
  createdAt: string;
  razorpayOrderId?: string | null;
  items: Array<{ name: string; quantity: number; price: number }>;
  shippingAddress: { fullName: string; phone: string; city: string; postalCode: string };
};

type CustomRequest = {
  _id: string;
  referenceCode?: string;
  name: string;
  email: string;
  phone: string;
  projectTitle?: string;
  projectType: string;
  description: string;
  quantity?: string;
  dimensions?: string;
  material?: string;
  colorFinish?: string;
  application?: string;
  timeline?: string;
  budget?: string;
  fileUrls?: string[];
  status: string;
  createdAt: string;
};

type Overview = {
  stats: { totalOrders: number; paidRevenue: number; pendingOrders: number; lowStockProducts: number };
  recentOrders: AdminOrder[];
  pendingRequests: CustomRequest[];
};

type DashboardData = { products: Product[]; categories: Category[]; banners: Banner[] };
type AdminTab = "overview" | "orders" | "requests" | "products" | "storefront" | "media";

const ORDER_STATUSES = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];
const REQUEST_STATUSES = ["new", "reviewing", "quoted", "approved", "in_production", "completed", "rejected", "cancelled"];

export default function AdminClient() {
  const router = useRouter();
  const session = authClient.useSession();
  const currentUser = session.data?.user as { role?: string; name?: string; email?: string } | undefined;
  const isAdmin = currentUser?.role === "admin";
  const [data, setData] = useState<DashboardData | null>(null);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [requests, setRequests] = useState<CustomRequest[]>([]);
  const [tab, setTab] = useState<AdminTab>("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [orderMessage, setOrderMessage] = useState("");
  const [requestMessage, setRequestMessage] = useState("");
  const [signingOut, setSigningOut] = useState(false);
  const [showCreateOrder, setShowCreateOrder] = useState(false);

  useEffect(() => {
    if (session.isPending || !isAdmin) return;
    const load = async () => {
      try {
        const responses = await Promise.all([
          fetch("/api/products?limit=100"),
          fetch("/api/categories"),
          fetch("/api/banners?admin=1"),
          fetch("/api/admin/overview"),
          fetch("/api/orders?limit=100"),
          fetch("/api/custom-orders?limit=100"),
        ]);
        const payloads = await Promise.all(responses.map((response) => response.json()));
        const [products, categories, banners, overviewPayload, ordersPayload, requestsPayload] = payloads;
        const failed = responses.findIndex((response, index) => !response.ok || !payloads[index].success);
        if (failed >= 0) throw new Error(payloads[failed].message || "Could not load dashboard data.");
        setData({ products: products.products, categories: categories.categories, banners: banners.banners });
        setOverview(overviewPayload);
        setOrders(ordersPayload.orders);
        setRequests(requestsPayload.inquiries);
      } catch (reason) {
        setError(reason instanceof Error ? reason.message : "Could not load dashboard data.");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [isAdmin, session.isPending]);

  async function signOut() {
    setSigningOut(true);
    await authClient.signOut();
    router.push("/");
    router.refresh();
  }

  async function updateOrderStatus(order: AdminOrder, orderStatus: string) {
    if (!window.confirm(`Change order status for ${order.shippingAddress?.fullName || "customer"} to "${orderStatus.toUpperCase()}"?`)) return;
    const response = await fetch(`/api/orders/${order._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderStatus }),
    });
    const result = await response.json();
    if (!response.ok || !result.success) {
      setOrderMessage(result.message || "Could not update order.");
      return;
    }

    setOrders((current) => current.map((item) => (item._id === order._id ? result.order : item)));
    setOrderMessage(`Order #${order._id.slice(-6).toUpperCase()} updated to ${orderStatus}.`);
    setTimeout(() => setOrderMessage(""), 4000);
  }

  async function updateOrderPaymentStatus(order: AdminOrder, paymentStatus: string) {
    if (!window.confirm(`Update payment status for order #${order._id.slice(-6).toUpperCase()} to "${paymentStatus.toUpperCase()}"?`)) return;
    const response = await fetch(`/api/orders/${order._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentStatus }),
    });
    const result = await response.json();
    if (!response.ok || !result.success) {
      setOrderMessage(result.message || "Could not update payment status.");
      return;
    }

    const wasPaid = order.paymentStatus === "paid";
    const nowPaid = paymentStatus === "paid";
    const diff = (nowPaid ? order.total : 0) - (wasPaid ? order.total : 0);

    setOrders((current) => current.map((item) => (item._id === order._id ? result.order : item)));

    setOverview((current) => {
      if (!current) return current;
      return {
        ...current,
        stats: {
          ...current.stats,
          paidRevenue: Math.max(0, current.stats.paidRevenue + diff),
        },
        recentOrders: current.recentOrders.map((item) => (item._id === order._id ? result.order : item)),
      };
    });

    void fetch("/api/admin/overview")
      .then((res) => res.json())
      .then((payload) => {
        if (payload.success) setOverview(payload);
      })
      .catch(() => {});

    setOrderMessage(`Order #${order._id.slice(-6).toUpperCase()} payment updated to ${paymentStatus.toUpperCase()}. Revenue updated.`);
    setTimeout(() => setOrderMessage(""), 4000);
  }

  async function handleCreateManualOrder(orderPayload: {
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    city?: string;
    addressLine?: string;
    postalCode?: string;
    items: Array<{ productId?: string; name: string; price: number; quantity: number }>;
    paymentMethod: string;
    paymentStatus: string;
    orderStatus: string;
    shippingCost: number;
    notes?: string;
  }) {
    const response = await fetch("/api/admin/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderPayload),
    });
    const result = await response.json();
    if (!response.ok || !result.success) {
      throw new Error(result.message || "Failed to create manual order.");
    }

    const newOrder = result.order as AdminOrder;
    setOrders((current) => [newOrder, ...current]);
    setShowCreateOrder(false);

    setOverview((current) => {
      if (!current) return current;
      const isPaid = newOrder.paymentStatus === "paid";
      return {
        ...current,
        stats: {
          ...current.stats,
          totalOrders: current.stats.totalOrders + 1,
          paidRevenue: isPaid ? current.stats.paidRevenue + newOrder.total : current.stats.paidRevenue,
          pendingOrders: ["pending", "confirmed", "processing"].includes(newOrder.orderStatus)
            ? current.stats.pendingOrders + 1
            : current.stats.pendingOrders,
        },
        recentOrders: [newOrder, ...current.recentOrders.slice(0, 5)],
      };
    });

    void fetch("/api/admin/overview")
      .then((res) => res.json())
      .then((payload) => {
        if (payload.success) setOverview(payload);
      })
      .catch(() => {});

    setOrderMessage(
      `Manual order #${newOrder._id.slice(-6).toUpperCase()} created successfully! Revenue updated by ₹${newOrder.total.toLocaleString("en-IN")}.`,
    );
    setTimeout(() => setOrderMessage(""), 5000);
  }

  async function updateRequest(request: CustomRequest, status: string) {
    const response = await fetch(`/api/custom-orders?id=${request._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const result = await response.json();
    if (!response.ok || !result.success) {
      setRequestMessage(result.message || "Could not update custom request.");
      return;
    }
    setRequests((current) => current.map((item) => (item._id === request._id ? result.inquiry : item)));
    setRequestMessage(`Inquiry for "${request.projectTitle || request.name}" moved to ${status.replace("_", " ")}.`);
    setTimeout(() => setRequestMessage(""), 4000);
  }

  if (session.isPending) {
    return (
      <div className="min-h-screen bg-[#faf8f5] flex flex-col">
        <SiteHeader />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="bg-white border border-[#e8e2d8] rounded-2xl p-8 max-w-sm w-full text-center shadow-sm">
            <Spinner className="animate-spin mx-auto text-[#d9531e] mb-4" size={36} />
            <h3 className="font-heading font-semibold text-lg text-[#181615]">Verifying Studio Credentials</h3>
            <p className="text-sm text-[#5c5650] mt-1">Authenticating secure administrative session…</p>
          </div>
        </main>
      </div>
    );
  }

  if (!session.data) {
    return (
      <div className="min-h-screen bg-[#faf8f5] flex flex-col">
        <SiteHeader />
        <main className="flex-1 flex items-center justify-center p-6 bg-cad-grid">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-md"
          >
            <div className="text-center mb-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#d9531e]/10 text-[#d9531e] border border-[#d9531e]/20 mb-3">
                <ShieldCheck size={14} weight="fill" /> Promethix3D Studio Control
              </span>
              <h1 className="font-heading text-2xl font-bold text-[#181615]">Administrator Portal</h1>
              <p className="text-sm text-[#5c5650] mt-1">Sign in with verified studio account to access admin systems.</p>
            </div>

            <div className="bg-white border border-[#e8e2d8] rounded-2xl p-6 sm:p-8 shadow-sm">
              <AuthForm mode="signin" redirectTo="/admin" />
              <div className="mt-6 pt-5 border-t border-[#f0ece4] text-center text-xs text-[#5c5650]">
                Customer account?{" "}
                <Link href="/login" className="text-[#d9531e] font-semibold hover:underline">
                  Sign in to customer portal
                </Link>
              </div>
            </div>
          </motion.div>
        </main>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#faf8f5] flex flex-col">
        <SiteHeader />
        <main className="flex-1 flex items-center justify-center p-6 bg-cad-grid">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border border-[#e8e2d8] rounded-2xl p-8 max-w-md w-full text-center shadow-sm"
          >
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4 border border-red-200">
              <WarningCircle size={26} weight="bold" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-red-600">Access Restricted</span>
            <h1 className="font-heading text-2xl font-bold text-[#181615] mt-1 mb-2">Admin Privileges Required</h1>
            <p className="text-sm text-[#5c5650] leading-relaxed mb-6">
              You are signed in as <strong className="text-[#181615]">{currentUser?.name || session.data.user.email}</strong>, which does not have studio administrative authorization.
            </p>
            <div className="flex flex-col gap-2.5">
              <Link
                href="/account"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#d9531e] text-white font-medium text-sm hover:bg-[#bf4413] transition-colors"
              >
                Go to Customer Account <ArrowRight size={16} />
              </Link>
              <button
                type="button"
                onClick={() => void signOut()}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#f3efe8] text-[#181615] font-medium text-sm hover:bg-[#e8e2d8] transition-colors"
              >
                Sign Out
              </button>
            </div>
          </motion.div>
        </main>
      </div>
    );
  }

  const activeProductsCount = data?.products.filter((product) => product.isActive).length ?? 0;
  const activeCategoriesCount = data?.categories.filter((category) => category.isActive).length ?? 0;
  const activeBannersCount = data?.banners.filter((banner) => banner.isActive).length ?? 0;
  const pendingRequestsCount = requests.filter((r) => r.status === "new" || r.status === "reviewing").length;
  const pendingOrdersCount = orders.filter((o) => o.orderStatus === "pending" || o.orderStatus === "confirmed").length;

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = `${order.shippingAddress?.fullName ?? ""} ${order.shippingAddress?.phone ?? ""} ${order.razorpayOrderId ?? ""} ${order._id}`
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesStatus = !statusFilter || order.orderStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const adminName = currentUser?.name || session.data.user.name || "Administrator";
  const adminEmail = currentUser?.email || session.data.user.email;
  const adminInitials = adminName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-[#faf8f5] text-[#181615] flex flex-col font-sans">
      {/* ── Top Executive Bar ── */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#e8e2d8] shadow-xs">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Left Brand & Breadcrumb */}
          <div className="flex items-center gap-4 sm:gap-6">
            <Link href="/" className="flex items-center gap-2 group">
              <span className="font-heading font-black text-xl tracking-tight text-[#181615]">
                Promethix<span className="text-[#d9531e]">3D</span>
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-[#181615] text-white">
                Studio
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-2 text-xs text-[#5c5650] border-l border-[#e8e2d8] pl-4">
              <span className="text-[#878177]">Dashboard</span>
              <span>/</span>
              <span className="font-semibold text-[#181615] capitalize">{tab}</span>
            </div>
          </div>

          {/* Right Controls & Profile */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>MongoDB Operational</span>
            </div>

            <Link
              href="/"
              target="_blank"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#e8e2d8] text-xs font-medium text-[#5c5650] hover:text-[#181615] hover:bg-[#f3efe8] transition-colors"
            >
              <Globe size={14} />
              <span>Storefront</span>
              <ArrowUpRight size={13} className="text-[#878177]" />
            </Link>

            {/* Logged in User Pill */}
            <div className="flex items-center gap-3 pl-2 sm:pl-3 sm:border-l sm:border-[#e8e2d8]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#d9531e] to-[#f27438] text-white flex items-center justify-center font-heading font-bold text-xs shadow-xs">
                  {adminInitials}
                </div>
                <div className="hidden md:flex flex-col text-left">
                  <span className="text-xs font-bold text-[#181615] leading-tight flex items-center gap-1">
                    {adminName}
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#d9531e]/15 text-[#d9531e]">
                      ADMIN
                    </span>
                  </span>
                  <span className="text-[11px] text-[#5c5650] truncate max-w-[150px] leading-tight">
                    {adminEmail}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => void signOut()}
                disabled={signingOut}
                title="Sign out of Admin Session"
                className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-[#5c5650] hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors"
              >
                {signingOut ? <Spinner className="animate-spin" size={16} /> : <SignOut size={17} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── Main Workspace ── */}
      <div className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6 items-start">
          {/* ── Sidebar Navigation ── */}
          <aside className="bg-white border border-[#e8e2d8] rounded-2xl p-4 shadow-xs sticky top-22">
            <div className="px-2 py-1.5 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#878177]">
                Management Workspace
              </span>
            </div>

            <nav className="flex flex-col gap-1" aria-label="Admin navigation">
              <SidebarItem
                active={tab === "overview"}
                onClick={() => setTab("overview")}
                icon={<Gauge size={18} weight={tab === "overview" ? "bold" : "regular"} />}
                label="Overview"
                badge={null}
              />
              <SidebarItem
                active={tab === "orders"}
                onClick={() => setTab("orders")}
                icon={<Package size={18} weight={tab === "orders" ? "bold" : "regular"} />}
                label="Orders"
                badge={
                  pendingOrdersCount > 0 ? (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                      {pendingOrdersCount} new
                    </span>
                  ) : (
                    <span className="text-xs text-[#878177]">{orders.length}</span>
                  )
                }
              />
              <SidebarItem
                active={tab === "requests"}
                onClick={() => setTab("requests")}
                icon={<ClipboardText size={18} weight={tab === "requests" ? "bold" : "regular"} />}
                label="Custom Requests"
                badge={
                  pendingRequestsCount > 0 ? (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-[#d9531e] text-white">
                      {pendingRequestsCount} active
                    </span>
                  ) : (
                    <span className="text-xs text-[#878177]">{requests.length}</span>
                  )
                }
              />
              <SidebarItem
                active={tab === "products"}
                onClick={() => setTab("products")}
                icon={<Cube size={18} weight={tab === "products" ? "bold" : "regular"} />}
                label="Products & Categories"
                badge={<span className="text-xs text-[#878177]">{data?.products.length ?? 0}</span>}
              />
              <SidebarItem
                active={tab === "storefront"}
                onClick={() => setTab("storefront")}
                icon={<SquaresFour size={18} weight={tab === "storefront" ? "bold" : "regular"} />}
                label="Storefront Banners"
                badge={<span className="text-xs text-[#878177]">{data?.banners.length ?? 0}</span>}
              />
              <SidebarItem
                active={tab === "media"}
                onClick={() => setTab("media")}
                icon={<CloudArrowUp size={18} weight={tab === "media" ? "bold" : "regular"} />}
                label="Media Library"
                badge={null}
              />
            </nav>

            {/* Sidebar User Identity Box */}
            <div className="mt-6 pt-4 border-t border-[#f0ece4] bg-[#faf8f5] rounded-xl p-3 border">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-[11px] font-semibold text-[#5c5650]">Studio Director</span>
              </div>
              <p className="text-xs font-bold text-[#181615] truncate">{adminName}</p>
              <p className="text-[11px] text-[#878177] truncate mb-3">{adminEmail}</p>
              <div className="flex items-center justify-between text-[10px] text-[#878177] border-t border-[#e8e2d8]/60 pt-2">
                <span>Role: <strong className="text-[#181615]">SUPER_ADMIN</strong></span>
                <span className="text-emerald-700 font-semibold">Active</span>
              </div>
            </div>
          </aside>

          {/* ── Main Panel Content ── */}
          <main className="min-w-0">
            {loading ? (
              <div className="bg-white border border-[#e8e2d8] rounded-2xl p-16 text-center shadow-xs">
                <Spinner className="animate-spin mx-auto text-[#d9531e] mb-3" size={32} />
                <p className="text-sm font-medium text-[#5c5650]">Loading studio metrics and management assets…</p>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-red-800" role="alert">
                <div className="flex items-center gap-2 font-bold mb-1">
                  <WarningCircle size={20} />
                  <span>Unable to synchronize studio data</span>
                </div>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            ) : tab === "overview" ? (
              <OverviewPanel
                overview={overview}
                orders={orders}
                requests={requests}
                activeProducts={activeProductsCount}
                activeCategories={activeCategoriesCount}
                activeBanners={activeBannersCount}
                onOrders={() => setTab("orders")}
                onRequests={() => setTab("requests")}
                onProducts={() => setTab("products")}
                onCreateOrder={() => setShowCreateOrder(true)}
              />
            ) : tab === "orders" ? (
              <OrdersPanel
                orders={filteredOrders}
                products={data?.products ?? []}
                totalCount={orders.length}
                search={search}
                filter={statusFilter}
                onSearch={setSearch}
                onFilter={setStatusFilter}
                onStatusChange={updateOrderStatus}
                onPaymentStatusChange={updateOrderPaymentStatus}
                onCreateOrder={() => setShowCreateOrder(true)}
                message={orderMessage}
              />
            ) : tab === "requests" ? (
              <RequestsPanel
                requests={requests}
                onStatusChange={updateRequest}
                message={requestMessage}
              />
            ) : tab === "products" ? (
              <ProductManager
                categories={data?.categories ?? []}
                products={data?.products ?? []}
                onProductsChange={(products) =>
                  setData((current) => (current ? { ...current, products } : current))
                }
                onCategoriesChange={(categories) =>
                  setData((current) => (current ? { ...current, categories } : current))
                }
              />
            ) : tab === "storefront" ? (
              <BannerManager
                banners={data?.banners ?? []}
                onBannersChange={(banners) =>
                  setData((current) => (current ? { ...current, banners } : current))
                }
              />
            ) : (
              <CloudinaryMedia />
            )}

            {showCreateOrder && (
              <CreateOrderDialog
                products={data?.products ?? []}
                onClose={() => setShowCreateOrder(false)}
                onSubmit={handleCreateManualOrder}
              />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

function SidebarItem({
  active,
  onClick,
  icon,
  label,
  badge,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  badge: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
        active
          ? "bg-[#181615] text-white shadow-xs"
          : "text-[#5c5650] hover:text-[#181615] hover:bg-[#f3efe8]"
      }`}
    >
      <div className="flex items-center gap-2.5">
        <span className={active ? "text-[#d9531e]" : "text-[#878177]"}>{icon}</span>
        <span>{label}</span>
      </div>
      {badge}
    </button>
  );
}

// ─────────────────────────────────────────────────────────
// OVERVIEW PANEL WITH DATA VISUALIZATION
// ─────────────────────────────────────────────────────────
function OverviewPanel({
  overview,
  orders,
  requests,
  activeProducts,
  activeCategories,
  activeBanners,
  onOrders,
  onRequests,
  onProducts,
  onCreateOrder,
}: {
  overview: Overview | null;
  orders: AdminOrder[];
  requests: CustomRequest[];
  activeProducts: number;
  activeCategories: number;
  activeBanners: number;
  onOrders: () => void;
  onRequests: () => void;
  onProducts: () => void;
  onCreateOrder: () => void;
}) {
  const stats = overview?.stats;
  const totalOrders = stats?.totalOrders ?? orders.length;
  const paidRevenue = stats?.paidRevenue ?? orders.reduce((sum, o) => o.paymentStatus === "captured" || o.paymentStatus === "paid" ? sum + o.total : sum, 0);
  const averageOrderValue = totalOrders > 0 ? Math.round(paidRevenue / totalOrders) : 0;
  const pendingOrders = stats?.pendingOrders ?? orders.filter((o) => o.orderStatus === "pending" || o.orderStatus === "confirmed").length;
  const lowStock = stats?.lowStockProducts ?? 0;

  // Order distribution calculation
  const orderBreakdown = useMemo(() => {
    const counts: Record<string, number> = {
      pending: 0,
      confirmed: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    };
    orders.forEach((o) => {
      const s = o.orderStatus.toLowerCase();
      if (counts[s] !== undefined) counts[s]++;
      else counts.pending++;
    });
    return counts;
  }, [orders]);

  // Request distribution calculation
  const requestBreakdown = useMemo(() => {
    const counts: Record<string, number> = {
      new: 0,
      reviewing: 0,
      quoted: 0,
      approved: 0,
      in_production: 0,
      completed: 0,
    };
    requests.forEach((r) => {
      const s = r.status.toLowerCase();
      if (counts[s] !== undefined) counts[s]++;
    });
    return counts;
  }, [requests]);

  return (
    <div className="flex flex-col gap-6">
      {/* ── Welcome Banner ── */}
      <div className="bg-white border border-[#e8e2d8] rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-radial-warmth">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#d9531e]">
            Studio Intelligence
          </span>
          <h1 className="font-heading text-2xl font-bold text-[#181615] mt-0.5">
            Operational Executive Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-[#5c5650] mt-1">
            Real-time telemetry on revenue, production pipelines, order fulfillment, and storefront status.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onCreateOrder}
            className="px-3.5 py-2 rounded-xl bg-[#d9531e] text-white text-xs font-semibold hover:bg-[#bf4413] transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Plus size={15} weight="bold" /> Manual Order
          </button>
          <button
            type="button"
            onClick={onOrders}
            className="px-3.5 py-2 rounded-xl bg-[#181615] text-white text-xs font-semibold hover:bg-black transition-colors flex items-center gap-1.5"
          >
            <Package size={15} /> Review Orders
          </button>
          <button
            type="button"
            onClick={onRequests}
            className="px-3.5 py-2 rounded-xl bg-[#f3efe8] text-[#181615] text-xs font-semibold hover:bg-[#e8e2d8] transition-colors flex items-center gap-1.5"
          >
            <ClipboardText size={15} /> Custom Inquiries
          </button>
        </div>
      </div>

      {/* ── 4 Executive KPI Metric Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Paid Revenue */}
        <div className="bg-white border border-[#e8e2d8] rounded-2xl p-5 shadow-xs relative overflow-hidden group hover:border-[#d9531e]/40 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#878177]">Gross Paid Revenue</span>
            <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm">
              ₹
            </span>
          </div>
          <div className="font-heading text-2xl lg:text-3xl font-extrabold text-[#181615]">
            ₹{paidRevenue.toLocaleString("en-IN")}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-emerald-700 font-medium">
            <TrendUp size={14} weight="bold" />
            <span>Settled via Razorpay</span>
          </div>
        </div>

        {/* Total Orders & AOV */}
        <div className="bg-white border border-[#e8e2d8] rounded-2xl p-5 shadow-xs relative overflow-hidden group hover:border-[#d9531e]/40 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#878177]">Total Orders</span>
            <span className="w-8 h-8 rounded-lg bg-[#faf8f5] border border-[#e8e2d8] text-[#181615] flex items-center justify-center">
              <Package size={16} />
            </span>
          </div>
          <div className="font-heading text-2xl lg:text-3xl font-extrabold text-[#181615]">
            {totalOrders}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-[#5c5650]">
            <span>Avg order value:</span>
            <strong className="text-[#181615]">₹{averageOrderValue.toLocaleString("en-IN")}</strong>
          </div>
        </div>

        {/* Pending Orders */}
        <div className="bg-white border border-[#e8e2d8] rounded-2xl p-5 shadow-xs relative overflow-hidden group hover:border-amber-300 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#878177]">Pending Fulfillment</span>
            <span className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Clock size={16} />
            </span>
          </div>
          <div className="font-heading text-2xl lg:text-3xl font-extrabold text-[#181615]">
            {pendingOrders}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-amber-800 font-medium">
            {pendingOrders > 0 ? (
              <>
                <Circle size={8} weight="fill" className="text-amber-500 animate-pulse" />
                <span>Requires processing</span>
              </>
            ) : (
              <span className="text-emerald-700">All shipments up to date</span>
            )}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white border border-[#e8e2d8] rounded-2xl p-5 shadow-xs relative overflow-hidden group hover:border-red-300 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#878177]">Low Stock Items</span>
            <span className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
              <WarningCircle size={16} />
            </span>
          </div>
          <div className="font-heading text-2xl lg:text-3xl font-extrabold text-[#181615]">
            {lowStock}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-[#5c5650]">
            {lowStock > 0 ? (
              <span className="text-red-600 font-semibold">Inventory restock suggested</span>
            ) : (
              <span className="text-emerald-700">Healthy catalog levels</span>
            )}
          </div>
        </div>
      </div>

      {/* ── DATA VISUALIZATIONS SECTION (2 Rich Charts) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Visual 1: Order Status Distribution Bar */}
        <div className="bg-white border border-[#e8e2d8] rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#d9531e]">
                  Data Visualization
                </span>
                <h3 className="font-heading text-base font-bold text-[#181615]">
                  Order Fulfillment Status Distribution
                </h3>
              </div>
              <span className="text-xs text-[#878177] font-semibold">{totalOrders} total</span>
            </div>

            {/* Segmented Horizontal Progress Bar */}
            <div className="h-4 w-full bg-[#f3efe8] rounded-full overflow-hidden flex my-4 p-0.5 gap-0.5">
              {totalOrders === 0 ? (
                <div className="h-full w-full bg-[#e8e2d8] rounded-full" />
              ) : (
                <>
                  <div
                    style={{ width: `${(orderBreakdown.delivered / totalOrders) * 100}%` }}
                    className="h-full bg-emerald-500 rounded-l-full transition-all duration-500"
                    title={`Delivered: ${orderBreakdown.delivered}`}
                  />
                  <div
                    style={{ width: `${(orderBreakdown.shipped / totalOrders) * 100}%` }}
                    className="h-full bg-blue-500 transition-all duration-500"
                    title={`Shipped: ${orderBreakdown.shipped}`}
                  />
                  <div
                    style={{ width: `${(orderBreakdown.processing / totalOrders) * 100}%` }}
                    className="h-full bg-indigo-500 transition-all duration-500"
                    title={`Processing: ${orderBreakdown.processing}`}
                  />
                  <div
                    style={{ width: `${(orderBreakdown.confirmed / totalOrders) * 100}%` }}
                    className="h-full bg-amber-500 transition-all duration-500"
                    title={`Confirmed: ${orderBreakdown.confirmed}`}
                  />
                  <div
                    style={{ width: `${(orderBreakdown.pending / totalOrders) * 100}%` }}
                    className="h-full bg-amber-300 transition-all duration-500"
                    title={`Pending: ${orderBreakdown.pending}`}
                  />
                  <div
                    style={{ width: `${(orderBreakdown.cancelled / totalOrders) * 100}%` }}
                    className="h-full bg-red-400 rounded-r-full transition-all duration-500"
                    title={`Cancelled: ${orderBreakdown.cancelled}`}
                  />
                </>
              )}
            </div>

            {/* Status Legend Pills */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center text-xs mt-3">
              <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-100">
                <span className="text-emerald-700 font-extrabold text-sm block">{orderBreakdown.delivered}</span>
                <span className="text-[10px] text-emerald-800 font-medium">Delivered</span>
              </div>
              <div className="p-2 rounded-xl bg-blue-50 border border-blue-100">
                <span className="text-blue-700 font-extrabold text-sm block">{orderBreakdown.shipped}</span>
                <span className="text-[10px] text-blue-800 font-medium">Shipped</span>
              </div>
              <div className="p-2 rounded-xl bg-indigo-50 border border-indigo-100">
                <span className="text-indigo-700 font-extrabold text-sm block">{orderBreakdown.processing}</span>
                <span className="text-[10px] text-indigo-800 font-medium">Processing</span>
              </div>
              <div className="p-2 rounded-xl bg-amber-50 border border-amber-100">
                <span className="text-amber-700 font-extrabold text-sm block">{orderBreakdown.confirmed}</span>
                <span className="text-[10px] text-amber-800 font-medium">Confirmed</span>
              </div>
              <div className="p-2 rounded-xl bg-orange-50 border border-orange-100">
                <span className="text-orange-700 font-extrabold text-sm block">{orderBreakdown.pending}</span>
                <span className="text-[10px] text-orange-800 font-medium">Pending</span>
              </div>
              <div className="p-2 rounded-xl bg-red-50 border border-red-100">
                <span className="text-red-700 font-extrabold text-sm block">{orderBreakdown.cancelled}</span>
                <span className="text-[10px] text-red-800 font-medium">Cancelled</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#f0ece4] flex items-center justify-between text-xs text-[#5c5650]">
            <span>Success rate: <strong className="text-[#181615]">{totalOrders > 0 ? Math.round(((orderBreakdown.delivered + orderBreakdown.shipped) / totalOrders) * 100) : 0}%</strong> fulfilled</span>
            <button type="button" onClick={onOrders} className="text-[#d9531e] font-semibold hover:underline">Manage all orders →</button>
          </div>
        </div>

        {/* Visual 2: Custom Request Pipeline Distribution */}
        <div className="bg-white border border-[#e8e2d8] rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#d9531e]">
                  Pipeline Intelligence
                </span>
                <h3 className="font-heading text-base font-bold text-[#181615]">
                  Custom 3D Printing Inquiries Funnel
                </h3>
              </div>
              <span className="text-xs text-[#878177] font-semibold">{requests.length} inquiries</span>
            </div>

            {/* Pipeline Stage Tracks */}
            <div className="space-y-2.5 my-3">
              {[
                { label: "New Inquiry", count: requestBreakdown.new, color: "bg-[#d9531e]" },
                { label: "Under Review", count: requestBreakdown.reviewing, color: "bg-amber-500" },
                { label: "Quotation Sent", count: requestBreakdown.quoted, color: "bg-blue-500" },
                { label: "Approved & In Production", count: requestBreakdown.approved + requestBreakdown.in_production, color: "bg-indigo-600" },
                { label: "Completed / Dispatched", count: requestBreakdown.completed, color: "bg-emerald-600" },
              ].map((stage, idx) => {
                const totalReq = requests.length || 1;
                const pct = Math.round((stage.count / totalReq) * 100);
                return (
                  <div key={idx} className="flex items-center gap-3 text-xs">
                    <span className="w-36 text-[#5c5650] font-medium truncate">{stage.label}</span>
                    <div className="flex-1 h-3 bg-[#f3efe8] rounded-full overflow-hidden">
                      <div
                        style={{ width: `${pct}%` }}
                        className={`h-full rounded-full ${stage.color} transition-all duration-500`}
                      />
                    </div>
                    <span className="w-8 text-right font-bold text-[#181615]">{stage.count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#f0ece4] flex items-center justify-between text-xs text-[#5c5650]">
            <span>Active requests pending action: <strong className="text-[#d9531e]">{requestBreakdown.new + requestBreakdown.reviewing}</strong></span>
            <button type="button" onClick={onRequests} className="text-[#d9531e] font-semibold hover:underline">View pipeline →</button>
          </div>
        </div>
      </div>

      {/* ── Catalogue Quick Health Strip ── */}
      <div className="bg-white border border-[#e8e2d8] rounded-2xl p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#d9531e]/10 text-[#d9531e] flex items-center justify-center font-bold">
            <Cube size={22} />
          </div>
          <div>
            <h4 className="font-heading font-bold text-sm text-[#181615]">Studio Catalogue Status</h4>
            <p className="text-xs text-[#5c5650]">
              {activeProducts} published products · {activeCategories} active categories · {activeBanners} active promotional slots
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onProducts}
          className="px-3.5 py-1.5 rounded-lg border border-[#e8e2d8] hover:bg-[#f3efe8] text-xs font-semibold text-[#181615] transition-colors"
        >
          Manage Catalogue
        </button>
      </div>

      {/* ── Recent Activity 2-Column Split ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders List */}
        <div className="bg-white border border-[#e8e2d8] rounded-2xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#878177]">
                Live Transactions
              </span>
              <h3 className="font-heading text-base font-bold text-[#181615]">Recent Orders</h3>
            </div>
            <button type="button" onClick={onOrders} className="text-xs font-semibold text-[#d9531e] hover:underline">
              View All ({orders.length})
            </button>
          </div>

          <div className="divide-y divide-[#f0ece4]">
            {overview?.recentOrders.length ? (
              overview.recentOrders.slice(0, 5).map((order) => (
                <div key={order._id} className="py-3 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-[#f3efe8] text-[#181615] flex items-center justify-center font-bold text-[11px] shrink-0">
                      {order.shippingAddress?.fullName ? order.shippingAddress.fullName[0].toUpperCase() : "C"}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-[#181615] truncate">
                        {order.shippingAddress?.fullName || "Guest Customer"}
                      </p>
                      <span className="text-[#878177] text-[11px]">
                        {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} · {order.items.length} items
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="font-extrabold text-[#181615]">₹{order.total.toLocaleString("en-IN")}</p>
                    <span className={`inline-block px-1.5 py-0.2 rounded text-[10px] font-bold capitalize ${
                      order.orderStatus === "delivered" ? "bg-emerald-100 text-emerald-800" :
                      order.orderStatus === "shipped" ? "bg-blue-100 text-blue-800" :
                      order.orderStatus === "cancelled" ? "bg-red-100 text-red-800" :
                      "bg-amber-100 text-amber-800"
                    }`}>
                      {order.orderStatus}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="py-8 text-center text-xs text-[#878177]">No recent orders logged.</p>
            )}
          </div>
        </div>

        {/* Recent Custom Inquiries */}
        <div className="bg-white border border-[#e8e2d8] rounded-2xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#878177]">
                Customer Requests
              </span>
              <h3 className="font-heading text-base font-bold text-[#181615]">Recent Custom Requests</h3>
            </div>
            <button type="button" onClick={onRequests} className="text-xs font-semibold text-[#d9531e] hover:underline">
              View All ({requests.length})
            </button>
          </div>

          <div className="divide-y divide-[#f0ece4]">
            {overview?.pendingRequests.length ? (
              overview.pendingRequests.slice(0, 5).map((request) => (
                <div key={request._id} className="py-3 flex items-center justify-between gap-3 text-xs">
                  <div className="min-w-0">
                    <p className="font-bold text-[#181615] truncate">
                      {request.projectTitle || request.name}
                    </p>
                    <p className="text-[#878177] text-[11px] truncate">
                      Client: {request.name} · {request.projectType}
                    </p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold capitalize shrink-0 ${
                    request.status === "new" ? "bg-[#d9531e] text-white" :
                    request.status === "completed" ? "bg-emerald-100 text-emerald-800" :
                    "bg-[#f3efe8] text-[#5c5650]"
                  }`}>
                    {request.status.replace("_", " ")}
                  </span>
                </div>
              ))
            ) : (
              <p className="py-8 text-center text-xs text-[#878177]">No pending custom inquiries.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// ORDERS MANAGEMENT PANEL WITH DETAILS DIALOG
// ─────────────────────────────────────────────────────────
function OrdersPanel({
  orders,
  products,
  totalCount,
  search,
  filter,
  onSearch,
  onFilter,
  onStatusChange,
  onPaymentStatusChange,
  onCreateOrder,
  message,
}: {
  orders: AdminOrder[];
  products: Product[];
  totalCount: number;
  search: string;
  filter: string;
  onSearch: (value: string) => void;
  onFilter: (value: string) => void;
  onStatusChange: (order: AdminOrder, status: string) => void;
  onPaymentStatusChange: (order: AdminOrder, status: string) => void;
  onCreateOrder: () => void;
  message: string;
}) {
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);

  return (
    <div className="bg-white border border-[#e8e2d8] rounded-2xl p-6 shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#f0ece4] mb-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#d9531e]">
            Orders & Shipments
          </span>
          <h2 className="font-heading text-xl font-bold text-[#181615]">
            Customer Fulfillment Hub
          </h2>
          <p className="text-xs text-[#5c5650] mt-0.5">
            Showing {orders.length} of {totalCount} total orders recorded.
          </p>
        </div>
        <button
          type="button"
          onClick={onCreateOrder}
          className="px-4 py-2 rounded-xl bg-[#d9531e] text-white text-xs font-semibold hover:bg-[#bf4413] transition-colors flex items-center gap-1.5 shadow-xs shrink-0"
        >
          <Plus size={16} weight="bold" /> Log Manual Order
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between mb-4">
        <div className="relative flex-1 max-w-md">
          <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#878177]" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search customer, phone, Razorpay ID..."
            className="w-full pl-9 pr-3 py-2 bg-[#faf8f5] border border-[#e8e2d8] rounded-xl text-xs text-[#181615] placeholder:text-[#878177] focus:outline-none focus:border-[#d9531e] focus:bg-white"
          />
        </div>

        {/* Status Filter Dropdown / Pills */}
        <div className="flex items-center gap-2">
          <select
            value={filter}
            onChange={(e) => onFilter(e.target.value)}
            aria-label="Filter orders by status"
            className="px-3 py-2 bg-[#faf8f5] border border-[#e8e2d8] rounded-xl text-xs text-[#181615] focus:outline-none focus:border-[#d9531e]"
          >
            <option value="">All Fulfillment Statuses</option>
            {ORDER_STATUSES.map((status) => (
              <option key={status} value={status}>
                Status: {status.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
      </div>

      {message ? (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2" role="status">
          <CheckCircle size={16} weight="bold" />
          <span>{message}</span>
        </div>
      ) : null}

      {/* Orders Table */}
      {orders.length ? (
        <div className="overflow-x-auto border border-[#e8e2d8] rounded-xl">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#faf8f5] text-[#5c5650] uppercase tracking-wider text-[11px] font-bold border-b border-[#e8e2d8]">
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Total</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Fulfillment Status</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0ece4]">
              {orders.map((order) => (
                <tr key={order._id} className="hover:bg-[#faf8f5]/60 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-[#f3efe8] text-[#181615] flex items-center justify-center font-bold text-xs shrink-0">
                        {order.shippingAddress?.fullName ? order.shippingAddress.fullName[0].toUpperCase() : "C"}
                      </div>
                      <div>
                        <div className="font-bold text-[#181615]">
                          {order.shippingAddress?.fullName || "Customer"}
                        </div>
                        <div className="text-[11px] text-[#878177]">
                          {order.shippingAddress?.phone} · {order.shippingAddress?.city}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-extrabold text-[#181615]">
                    ₹{order.total.toLocaleString("en-IN")}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex flex-col gap-1 items-start">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          order.paymentStatus === "captured" || order.paymentStatus === "paid"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {order.paymentStatus}
                      </span>
                      <span
                        className={`inline-block px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider ${
                          order.paymentMethod === "cod"
                            ? "bg-amber-50 text-amber-900 border border-amber-200"
                            : order.paymentMethod === "cash"
                            ? "bg-emerald-50 text-emerald-900 border border-emerald-200"
                            : order.paymentMethod === "upi"
                            ? "bg-purple-50 text-purple-900 border border-purple-200"
                            : "bg-blue-50 text-blue-800 border border-blue-200"
                        }`}
                      >
                        {order.paymentMethod === "cod"
                          ? "Cash on Delivery"
                          : order.paymentMethod === "cash"
                          ? "Cash (Direct)"
                          : order.paymentMethod === "upi"
                          ? "UPI Transfer"
                          : order.paymentMethod === "bank_transfer"
                          ? "Bank Wire"
                          : "Online"}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <select
                      value={order.orderStatus}
                      onChange={(e) => void onStatusChange(order, e.target.value)}
                      aria-label={`Update order status ${order._id}`}
                      className="px-2 py-1 bg-white border border-[#e8e2d8] rounded-lg text-xs font-semibold capitalize focus:outline-none focus:border-[#d9531e]"
                    >
                      {ORDER_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-3.5 px-4 text-[#878177]">
                    {new Date(order.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => setSelectedOrder(order)}
                      className="px-2.5 py-1 rounded-lg border border-[#e8e2d8] text-xs font-semibold text-[#181615] hover:bg-[#181615] hover:text-white transition-colors"
                    >
                      Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="py-12 text-center text-xs text-[#878177]">
          No orders match the current search or status filter.
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder ? (
        <OrderDialog
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onPaymentStatusChange={(order, status) => {
            void onPaymentStatusChange(order, status);
            setSelectedOrder((prev) => (prev && prev._id === order._id ? { ...prev, paymentStatus: status } : prev));
          }}
        />
      ) : null}
    </div>
  );
}

function OrderDialog({
  order,
  onClose,
  onPaymentStatusChange,
}: {
  order: AdminOrder;
  onClose: () => void;
  onPaymentStatusChange: (order: AdminOrder, status: string) => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
      role="presentation"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-details-title"
        onClick={(e) => e.stopPropagation()}
        className="bg-white border border-[#e8e2d8] rounded-2xl p-6 max-w-lg w-full shadow-xl relative"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute right-4 top-4 w-7 h-7 rounded-lg text-[#878177] hover:text-[#181615] hover:bg-[#f3efe8] flex items-center justify-center"
        >
          <X size={18} />
        </button>

        <span className="text-[11px] font-bold uppercase tracking-wider text-[#d9531e]">
          Order Inspection
        </span>
        <h3 id="order-details-title" className="font-heading text-lg font-bold text-[#181615] mt-0.5">
          Order #{order._id.slice(-8).toUpperCase()}
        </h3>

        {/* Customer Shipping Info */}
        <div className="mt-4 p-3 bg-[#faf8f5] rounded-xl border border-[#e8e2d8] text-xs space-y-1">
          <p className="font-bold text-[#181615]">{order.shippingAddress?.fullName || "Customer"}</p>
          <p className="text-[#5c5650]">{order.shippingAddress?.phone}</p>
          <p className="text-[#5c5650]">
            {order.shippingAddress?.city} — {order.shippingAddress?.postalCode}
          </p>
        </div>

        {/* Items */}
        <div className="mt-4">
          <p className="text-xs font-bold uppercase text-[#878177] mb-2 tracking-wider">
            Purchased 3D Print Items
          </p>
          <div className="divide-y divide-[#f0ece4] max-h-48 overflow-y-auto">
            {order.items.map((item, index) => (
              <div key={`${item.name}-${index}`} className="py-2 flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-[#181615]">{item.name}</span>
                  <span className="text-[#878177] ml-2">× {item.quantity}</span>
                </div>
                <span className="font-bold text-[#181615]">
                  ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Total breakdown */}
        <div className="mt-4 pt-3 border-t border-[#f0ece4] flex items-center justify-between text-sm">
          <span className="font-bold text-[#181615]">Total Settled</span>
          <span className="font-heading font-extrabold text-base text-[#181615]">
            ₹{order.total.toLocaleString("en-IN")}
          </span>
        </div>

        <div className="mt-3 text-[11px] text-[#878177] flex flex-wrap items-center gap-x-2 gap-y-1">
          <span>
            Payment Status: <strong className="text-[#181615] uppercase">{order.paymentStatus}</strong>
          </span>
          <span>·</span>
          <span>
            Method:{" "}
            <strong className="text-[#181615]">
              {order.paymentMethod === "cod"
                ? "Cash on Delivery"
                : order.paymentMethod === "cash"
                ? "Cash (Direct)"
                : order.paymentMethod === "upi"
                ? "UPI Transfer"
                : order.paymentMethod === "bank_transfer"
                ? "Bank Wire"
                : "Online (Razorpay)"}
            </strong>
          </span>
          {order.razorpayOrderId ? (
            <>
              <span>·</span>
              <span>Razorpay Ref: {order.razorpayOrderId}</span>
            </>
          ) : null}
        </div>

        {/* Quick Payment Status Updater */}
        <div className="mt-4 pt-3 border-t border-[#f0ece4] flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs font-semibold text-[#5c5650]">Update Payment Status:</span>
          <select
            value={order.paymentStatus}
            onChange={(e) => void onPaymentStatusChange(order, e.target.value)}
            aria-label="Update payment status"
            className="px-2.5 py-1.5 bg-[#faf8f5] border border-[#e8e2d8] rounded-lg text-xs font-bold uppercase focus:outline-none focus:border-[#d9531e]"
          >
            <option value="pending">PENDING (NOT CREDITED)</option>
            <option value="paid">PAID (CREDIT REVENUE)</option>
            <option value="failed">FAILED</option>
            <option value="refunded">REFUNDED</option>
          </select>
        </div>
      </motion.div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// CREATE MANUAL ORDER DIALOG (CRUD ADD)
// ─────────────────────────────────────────────────────────
function CreateOrderDialog({
  products,
  onClose,
  onSubmit,
}: {
  products: Product[];
  onClose: () => void;
  onSubmit: (data: {
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    city?: string;
    addressLine?: string;
    postalCode?: string;
    items: Array<{ productId?: string; name: string; price: number; quantity: number }>;
    paymentMethod: string;
    paymentStatus: string;
    orderStatus: string;
    shippingCost: number;
    notes?: string;
  }) => Promise<void>;
}) {
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [city, setCity] = useState("Kolkata");
  const [addressLine, setAddressLine] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [paymentStatus, setPaymentStatus] = useState("paid");
  const [orderStatus, setOrderStatus] = useState("confirmed");
  const [shippingCost, setShippingCost] = useState("0");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [items, setItems] = useState<Array<{ productId?: string; name: string; price: number; quantity: number }>>([
    { productId: "", name: "", price: 0, quantity: 1 },
  ]);

  const subtotal = items.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1), 0);
  const numShipping = Math.max(Number(shippingCost) || 0, 0);
  const total = subtotal + numShipping;

  function handleProductSelect(index: number, productId: string) {
    if (!productId) {
      setItems((prev) =>
        prev.map((item, idx) => (idx === index ? { ...item, productId: "" } : item)),
      );
      return;
    }
    const found = products.find((p) => p._id === productId);
    if (found) {
      setItems((prev) =>
        prev.map((item, idx) =>
          idx === index
            ? { ...item, productId, name: found.name, price: found.price }
            : item,
        ),
      );
    }
  }

  function handleItemFieldChange(index: number, field: "name" | "price" | "quantity", value: string) {
    setItems((prev) =>
      prev.map((item, idx) => {
        if (idx !== index) return item;
        if (field === "price") return { ...item, price: Math.max(Number(value) || 0, 0) };
        if (field === "quantity") return { ...item, quantity: Math.max(Number(value) || 1, 1) };
        return { ...item, name: value };
      }),
    );
  }

  function handleAddItem() {
    setItems((prev) => [...prev, { productId: "", name: "", price: 0, quantity: 1 }]);
  }

  function handleRemoveItem(index: number) {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  }

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!customerName.trim()) {
      setError("Please enter customer name.");
      return;
    }
    if (!customerPhone.trim()) {
      setError("Please enter customer phone number.");
      return;
    }
    const invalidItem = items.find((i) => !i.name.trim() || i.price <= 0);
    if (invalidItem) {
      setError("Please enter a valid title and price greater than 0 for all items.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await onSubmit({
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim() || undefined,
        city: city.trim() || "Kolkata",
        addressLine: addressLine.trim() || undefined,
        postalCode: postalCode.trim() || undefined,
        items,
        paymentMethod,
        paymentStatus,
        orderStatus,
        shippingCost: numShipping,
        notes: notes.trim() || undefined,
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create manual order.");
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      role="presentation"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="manual-order-title"
        onClick={(e) => e.stopPropagation()}
        className="bg-white border border-[#e8e2d8] rounded-2xl p-5 sm:p-7 max-w-2xl w-full shadow-2xl relative my-8 max-h-[90vh] overflow-y-auto"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute right-4 top-4 w-8 h-8 rounded-lg text-[#878177] hover:text-[#181615] hover:bg-[#f3efe8] flex items-center justify-center transition-colors"
        >
          <X size={18} />
        </button>

        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#d9531e]">
            Studio Operations
          </span>
          <h2 id="manual-order-title" className="font-heading text-xl font-bold text-[#181615] mt-0.5">
            Log Manual Order
          </h2>
          <p className="text-xs text-[#5c5650] mt-0.5">
            Create in-person studio walk-in sales, WhatsApp orders, or custom quotes.
          </p>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
            <WarningCircle size={16} weight="bold" className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={(e) => void handleFormSubmit(e)} className="mt-5 space-y-5 text-xs">
          {/* Customer Information */}
          <div className="p-4 bg-[#faf8f5] border border-[#e8e2d8] rounded-xl space-y-3">
            <h3 className="font-bold text-xs uppercase text-[#5c5650] tracking-wider">Customer Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-[#181615] block mb-1">Customer Name *</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Rahul Sen"
                  className="w-full px-3 py-2 bg-white border border-[#e8e2d8] rounded-lg text-xs focus:outline-none focus:border-[#d9531e]"
                />
              </div>
              <div>
                <label className="font-semibold text-[#181615] block mb-1">Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="e.g. 9876543210"
                  className="w-full px-3 py-2 bg-white border border-[#e8e2d8] rounded-lg text-xs focus:outline-none focus:border-[#d9531e]"
                />
              </div>
              <div>
                <label className="font-semibold text-[#181615] block mb-1">Email Address</label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="customer@example.com (optional)"
                  className="w-full px-3 py-2 bg-white border border-[#e8e2d8] rounded-lg text-xs focus:outline-none focus:border-[#d9531e]"
                />
              </div>
              <div>
                <label className="font-semibold text-[#181615] block mb-1">City / Location</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Kolkata"
                  className="w-full px-3 py-2 bg-white border border-[#e8e2d8] rounded-lg text-xs focus:outline-none focus:border-[#d9531e]"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="font-semibold text-[#181615] block mb-1">Address / Pickup Details</label>
                <input
                  type="text"
                  value={addressLine}
                  onChange={(e) => setAddressLine(e.target.value)}
                  placeholder="e.g. Studio Pickup / Salt Lake Sector V"
                  className="w-full px-3 py-2 bg-white border border-[#e8e2d8] rounded-lg text-xs focus:outline-none focus:border-[#d9531e]"
                />
              </div>
            </div>
          </div>

          {/* Purchased Items */}
          <div className="p-4 bg-[#faf8f5] border border-[#e8e2d8] rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xs uppercase text-[#5c5650] tracking-wider">Order Items</h3>
              <button
                type="button"
                onClick={handleAddItem}
                className="text-[11px] font-bold text-[#d9531e] hover:underline flex items-center gap-1"
              >
                <Plus size={13} weight="bold" /> Add Item
              </button>
            </div>

            <div className="space-y-3">
              {items.map((item, idx) => (
                <div key={idx} className="p-3 bg-white border border-[#e8e2d8] rounded-lg space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-[#878177]">Item #{idx + 1}</span>
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="text-red-600 hover:text-red-800 p-1 rounded"
                        title="Remove item"
                      >
                        <Trash size={14} />
                      </button>
                    )}
                  </div>

                  {/* Catalog product picker */}
                  <div>
                    <label className="text-[11px] text-[#878177] block mb-1">Pick from Catalog (Optional)</label>
                    <select
                      value={item.productId || ""}
                      onChange={(e) => handleProductSelect(idx, e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-[#faf8f5] border border-[#e8e2d8] rounded text-xs focus:outline-none focus:border-[#d9531e]"
                    >
                      <option value="">-- Custom Print / Custom Job --</option>
                      {products.map((p) => (
                        <option key={p._id} value={p._id}>
                          {p.name} (₹{p.price.toLocaleString("en-IN")}) — Stock: {p.stock}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="sm:col-span-1">
                      <label className="text-[11px] font-semibold text-[#181615] block mb-1">Item Title *</label>
                      <input
                        type="text"
                        required
                        value={item.name}
                        onChange={(e) => handleItemFieldChange(idx, "name", e.target.value)}
                        placeholder="e.g. Precision Gear"
                        className="w-full px-2.5 py-1.5 border border-[#e8e2d8] rounded text-xs focus:outline-none focus:border-[#d9531e]"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-[#181615] block mb-1">Price (₹) *</label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={item.price || ""}
                        onChange={(e) => handleItemFieldChange(idx, "price", e.target.value)}
                        placeholder="Price per unit"
                        className="w-full px-2.5 py-1.5 border border-[#e8e2d8] rounded text-xs focus:outline-none focus:border-[#d9531e]"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-[#181615] block mb-1">Qty *</label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={item.quantity || 1}
                        onChange={(e) => handleItemFieldChange(idx, "quantity", e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-[#e8e2d8] rounded text-xs focus:outline-none focus:border-[#d9531e]"
                      />
                    </div>
                  </div>

                  <div className="text-right text-[11px] text-[#5c5650]">
                    Item Subtotal: <strong className="text-[#181615]">₹{((item.price || 0) * (item.quantity || 1)).toLocaleString("en-IN")}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment & Status */}
          <div className="p-4 bg-[#faf8f5] border border-[#e8e2d8] rounded-xl space-y-3">
            <h3 className="font-bold text-xs uppercase text-[#5c5650] tracking-wider">Payment & Settlement</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-[#181615] block mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#e8e2d8] rounded-lg text-xs focus:outline-none focus:border-[#d9531e]"
                >
                  <option value="cash">Cash / Studio Direct</option>
                  <option value="upi">Direct UPI / QR Transfer</option>
                  <option value="bank_transfer">Bank Wire / IMPS</option>
                  <option value="cod">Cash on Delivery</option>
                  <option value="online">Online Gateway</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-[#181615] block mb-1">Payment Settlement Status</label>
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#e8e2d8] rounded-lg text-xs font-bold focus:outline-none focus:border-[#d9531e]"
                >
                  <option value="paid">PAID IN FULL (CREDIT REVENUE)</option>
                  <option value="pending">PENDING (NOT CREDITED YET)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-[#181615] block mb-1">Fulfillment Status</label>
                <select
                  value={orderStatus}
                  onChange={(e) => setOrderStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#e8e2d8] rounded-lg text-xs focus:outline-none focus:border-[#d9531e]"
                >
                  <option value="confirmed">Confirmed</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="pending">Pending</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-[#181615] block mb-1">Shipping Fee (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={shippingCost}
                  onChange={(e) => setShippingCost(e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2 bg-white border border-[#e8e2d8] rounded-lg text-xs focus:outline-none focus:border-[#d9531e]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-semibold text-[#181615] block mb-1">Internal Reference / Studio Notes</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Paid in cash at studio workshop"
                  className="w-full px-3 py-2 bg-white border border-[#e8e2d8] rounded-lg text-xs focus:outline-none focus:border-[#d9531e]"
                />
              </div>
            </div>
          </div>

          {/* Revenue preview impact card */}
          <div className="p-4 rounded-xl border border-[#e8e2d8] bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading font-bold text-base text-[#181615]">Total: ₹{total.toLocaleString("en-IN")}</span>
                <span className="text-[#878177] text-xs">(Subtotal: ₹{subtotal.toLocaleString("en-IN")} + Ship: ₹{numShipping})</span>
              </div>
              <p className="text-[11px] text-[#5c5650] mt-1">
                {paymentStatus === "paid" ? (
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle size={14} weight="bold" /> ₹{total.toLocaleString("en-IN")} will be added to Paid Revenue immediately.
                  </span>
                ) : (
                  <span className="text-amber-700 font-medium">
                    Marked Pending. Revenue will update once status is changed to Paid.
                  </span>
                )}
              </p>
            </div>

            <div className="flex items-center gap-2 justify-end">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="px-4 py-2 rounded-xl border border-[#e8e2d8] text-xs font-semibold text-[#5c5650] hover:bg-[#f3efe8] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 rounded-xl bg-[#d9531e] text-white text-xs font-semibold hover:bg-[#bf4413] transition-colors flex items-center gap-1.5 shadow-xs"
              >
                {submitting ? <Spinner className="animate-spin" size={15} /> : <FloppyDisk size={15} />}
                <span>{submitting ? "Saving Order…" : "Create Order & Update Revenue"}</span>
              </button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// CUSTOM REQUESTS PIPELINE PANEL
// ─────────────────────────────────────────────────────────
function RequestsPanel({
  requests,
  onStatusChange,
  message,
}: {
  requests: CustomRequest[];
  onStatusChange: (request: CustomRequest, status: string) => void;
  message: string;
}) {
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [query, setQuery] = useState("");

  const filteredRequests = requests.filter((r) => {
    const matchesStatus = selectedStatus === "all" || r.status === selectedStatus;
    const matchesQuery = `${r.name} ${r.email} ${r.phone} ${r.projectTitle ?? ""} ${r.referenceCode ?? ""}`
      .toLowerCase()
      .includes(query.toLowerCase());
    return matchesStatus && matchesQuery;
  });

  return (
    <div className="bg-white border border-[#e8e2d8] rounded-2xl p-6 shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#f0ece4] mb-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#d9531e]">
            Studio Engineering Quotes
          </span>
          <h2 className="font-heading text-xl font-bold text-[#181615]">
            Custom 3D Printing Pipeline
          </h2>
          <p className="text-xs text-[#5c5650] mt-0.5">
            {requests.length} client inquiries received across all engineering stages.
          </p>
        </div>
      </div>

      {/* Status Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-4 scrollbar-none">
        <button
          type="button"
          onClick={() => setSelectedStatus("all")}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
            selectedStatus === "all"
              ? "bg-[#181615] text-white"
              : "bg-[#f3efe8] text-[#5c5650] hover:text-[#181615]"
          }`}
        >
          All ({requests.length})
        </button>
        {REQUEST_STATUSES.map((status) => {
          const count = requests.filter((r) => r.status === status).length;
          return (
            <button
              key={status}
              type="button"
              onClick={() => setSelectedStatus(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap capitalize transition-colors ${
                selectedStatus === status
                  ? "bg-[#181615] text-white"
                  : "bg-[#f3efe8] text-[#5c5650] hover:text-[#181615]"
              }`}
            >
              {status.replace("_", " ")} ({count})
            </button>
          );
        })}
      </div>

      {/* Search Input */}
      <div className="relative mb-4">
        <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#878177]" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter by client name, email, project title or reference code..."
          className="w-full pl-9 pr-3 py-2 bg-[#faf8f5] border border-[#e8e2d8] rounded-xl text-xs text-[#181615] placeholder:text-[#878177] focus:outline-none focus:border-[#d9531e] focus:bg-white"
        />
      </div>

      {message ? (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2" role="status">
          <CheckCircle size={16} weight="bold" />
          <span>{message}</span>
        </div>
      ) : null}

      {/* Request Cards Grid */}
      {filteredRequests.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRequests.map((request) => (
            <article
              key={request._id}
              className="bg-[#faf8f5] border border-[#e8e2d8] rounded-xl p-5 flex flex-col justify-between hover:border-[#d9531e]/50 transition-colors"
            >
              <div>
                {/* Top strip */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        request.status === "new"
                          ? "bg-[#d9531e] text-white"
                          : request.status === "completed"
                          ? "bg-emerald-100 text-emerald-800"
                          : request.status === "quoted"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {request.status.replace("_", " ")}
                    </span>
                    {request.referenceCode ? (
                      <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-white border border-[#e8e2d8] text-[#5c5650]">
                        {request.referenceCode}
                      </span>
                    ) : null}
                  </div>
                  <time className="text-[11px] text-[#878177]">
                    {new Date(request.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </time>
                </div>

                {/* Title & Client Contact */}
                <h3 className="font-heading font-bold text-base text-[#181615]">
                  {request.projectTitle || request.name}
                </h3>

                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#5c5650] my-2">
                  <span>
                    <strong>Client:</strong> {request.name}
                  </span>
                  <span>
                    <a href={`mailto:${request.email}`} className="text-[#d9531e] hover:underline">
                      {request.email}
                    </a>
                  </span>
                  <span>
                    <a href={`tel:${request.phone}`} className="text-[#d9531e] hover:underline">
                      {request.phone}
                    </a>
                  </span>
                </div>

                {/* Engineering specs grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-white border border-[#e8e2d8] rounded-lg p-2.5 my-3 text-[11px]">
                  <div>
                    <span className="text-[#878177] block">Type</span>
                    <strong className="text-[#181615] capitalize">{request.projectType}</strong>
                  </div>
                  {request.quantity ? (
                    <div>
                      <span className="text-[#878177] block">Quantity</span>
                      <strong className="text-[#181615]">{request.quantity}</strong>
                    </div>
                  ) : null}
                  {request.material ? (
                    <div>
                      <span className="text-[#878177] block">Material</span>
                      <strong className="text-[#181615]">{request.material}</strong>
                    </div>
                  ) : null}
                  {request.colorFinish ? (
                    <div>
                      <span className="text-[#878177] block">Finish</span>
                      <strong className="text-[#181615]">{request.colorFinish}</strong>
                    </div>
                  ) : null}
                  {request.dimensions ? (
                    <div>
                      <span className="text-[#878177] block">Dimensions</span>
                      <strong className="text-[#181615]">{request.dimensions}</strong>
                    </div>
                  ) : null}
                  {request.budget ? (
                    <div>
                      <span className="text-[#878177] block">Budget</span>
                      <strong className="text-[#181615]">{request.budget}</strong>
                    </div>
                  ) : null}
                  {request.timeline ? (
                    <div>
                      <span className="text-[#878177] block">Timeline</span>
                      <strong className="text-[#181615]">{request.timeline}</strong>
                    </div>
                  ) : null}
                </div>

                {request.description ? (
                  <p className="text-xs text-[#5c5650] leading-relaxed my-2 line-clamp-3">
                    {request.description}
                  </p>
                ) : null}

                {/* Attachments */}
                {request.fileUrls && request.fileUrls.length > 0 ? (
                  <div className="mt-3 pt-2 border-t border-[#e8e2d8]/60">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#878177] block mb-1.5">
                      Attached Design Files ({request.fileUrls.length})
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {request.fileUrls.map((url, idx) => (
                        <a
                          key={idx}
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-white border border-[#e8e2d8] text-[11px] font-semibold text-[#d9531e] hover:bg-[#d9531e]/5"
                        >
                          <FileText size={12} /> File #{idx + 1} ↗
                        </a>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Status Selector Footer */}
              <div className="mt-4 pt-3 border-t border-[#e8e2d8] flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-[#5c5650]">Change Stage:</span>
                <select
                  value={request.status}
                  onChange={(e) => void onStatusChange(request, e.target.value)}
                  aria-label={`Update stage for ${request.name}`}
                  className="px-2.5 py-1 bg-white border border-[#e8e2d8] rounded-lg text-xs font-bold capitalize focus:outline-none focus:border-[#d9531e]"
                >
                  {REQUEST_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status.replace("_", " ")}
                    </option>
                  ))}
                </select>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="py-12 text-center text-xs text-[#878177]">
          No custom requests match the current filter.
        </div>
      )}
    </div>
  );
}
