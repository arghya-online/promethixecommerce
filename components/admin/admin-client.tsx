"use client";

import { ArrowRight, Bell, ClipboardText, Cube, Gauge, List, MagnifyingGlass, Package, SignOut, Spinner, SquaresFour, Users, X } from "@phosphor-icons/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AuthForm } from "@/components/auth/auth-form";
import { BannerManager } from "@/components/admin/banner-manager";
import { CloudinaryMedia } from "@/components/admin/cloudinary-media";
import { ProductManager } from "@/components/admin/product-manager";
import type { Category, Product } from "@/components/catalog/product-types";
import { Container } from "@/components/layout/container";
import { authClient } from "@/src/lib/auth-client";

type Banner = { _id: string; slot: "hero" | "promotion"; title: string; subtitle: string; image: string; href: string; isActive: boolean; sortOrder: number };
type AdminOrder = { _id: string; total: number; paymentStatus: string; orderStatus: string; createdAt: string; razorpayOrderId?: string | null; items: Array<{ name: string; quantity: number; price: number }>; shippingAddress: { fullName: string; phone: string; city: string; postalCode: string } };
type CustomRequest = { _id: string; name: string; email: string; phone: string; projectType: string; description: string; status: string; createdAt: string };
type Overview = { stats: { totalOrders: number; paidRevenue: number; pendingOrders: number; lowStockProducts: number }; recentOrders: AdminOrder[]; pendingRequests: CustomRequest[] };
type DashboardData = { products: Product[]; categories: Category[]; banners: Banner[] };
type AdminTab = "overview" | "orders" | "requests" | "products" | "storefront" | "media";

const orderStatuses = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];

export default function AdminClient() {
  const router = useRouter();
  const session = authClient.useSession();
  const currentUser = session.data?.user as { role?: string; name?: string } | undefined;
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
    if (!window.confirm(`Change this order to ${orderStatus}?`)) return;
    const response = await fetch(`/api/orders/${order._id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderStatus }) });
    const result = await response.json();
    if (!response.ok || !result.success) {
      setOrderMessage(result.message || "Could not update order.");
      return;
    }

    setOrders((current) => current.map((item) => item._id === order._id ? result.order : item));
    setOrderMessage("Order status updated.");
  }

  async function updateRequest(request: CustomRequest, status: string) {
    const response = await fetch(`/api/custom-orders?id=${request._id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    const result = await response.json();
    if (!response.ok || !result.success) {
      setRequestMessage(result.message || "Could not update custom request.");
      return;
    }
    setRequests((current) => current.map((item) => item._id === request._id ? result.inquiry : item));
    setRequestMessage("Custom request updated.");
  }

  if (session.isPending) return <div className="admin-shell"><Container><div className="detail-loading" role="status">Checking admin access…</div></Container></div>;
  if (!session.data) return <div className="admin-shell"><Container className="admin-auth-layout"><div className="admin-auth-copy"><p className="eyebrow">Promethix3D / Admin</p><h1 className="font-heading page-title">Product control.</h1><p>Sign in with an administrator account to manage the catalogue.</p></div><div className="auth-card"><AuthForm mode="signin" redirectTo="/admin" /><p className="auth-switch">Customer account? <Link href="/login">Use customer sign in</Link></p></div></Container></div>;
  if (!isAdmin) return <div className="admin-shell"><Container><div className="admin-denied" role="alert"><p className="eyebrow">Access restricted</p><h1 className="font-heading">This area is for administrators.</h1><p>Your customer account does not have access to the product dashboard.</p><div className="admin-denied-actions"><Link href="/account" className="button button-primary">Back to account <ArrowRight size={18} /></Link><button type="button" className="account-signout" onClick={() => void signOut()}>Sign out</button></div></div></Container></div>;

  const activeProducts = data?.products.filter((product) => product.isActive).length ?? 0;
  const activeCategories = data?.categories.filter((category) => category.isActive).length ?? 0;
  const filteredOrders = orders.filter((order) => `${order.shippingAddress?.fullName ?? ""} ${order.shippingAddress?.phone ?? ""} ${order.razorpayOrderId ?? ""}`.toLowerCase().includes(search.toLowerCase()) && (!statusFilter || order.orderStatus === statusFilter));
  const nav = (value: AdminTab, label: string, icon: React.ReactNode) => <button type="button" className={`admin-nav-item ${tab === value ? "is-active" : ""}`} onClick={() => setTab(value)}>{icon}<span>{label}</span></button>;

  return <div className="admin-shell">
    <header className="admin-header"><Container className="admin-header-inner"><Link href="/" className="wordmark">Promethix3D <span>/ Products</span></Link><div className="admin-header-actions"><span className="admin-account"><Bell size={17} />{currentUser?.name || "Administrator"}</span><Link href="/" className="admin-view-link">View shop</Link><button type="button" className="account-signout" onClick={() => void signOut()} disabled={signingOut}>{signingOut ? <Spinner className="spin" size={18} /> : <SignOut size={18} />}Sign out</button></div></Container></header>
    <main><Container className="admin-content admin-layout"><aside className="admin-sidebar" aria-label="Admin navigation"><div className="admin-nav-label">Workspace</div>{nav("overview", "Overview", <Gauge size={18} />)}{nav("orders", "Orders", <Package size={18} />)}{nav("requests", "Custom requests", <ClipboardText size={18} />)}{nav("products", "Products & categories", <Cube size={18} />)}{nav("storefront", "Storefront", <SquaresFour size={18} />)}{nav("media", "Media library", <List size={18} />)}</aside>
      <section className="admin-main"><div className="admin-title-row"><div><p className="eyebrow">Administrator dashboard</p><h1 className="font-heading">Good work, {currentUser?.name || "admin"}.</h1></div><SquaresFour size={34} weight="thin" aria-hidden="true" /></div>
        {loading ? <div className="detail-loading" role="status">Loading dashboard…</div> : error ? <div className="admin-state" role="alert"><p>{error}</p></div> : tab === "overview" ? <OverviewPanel overview={overview} activeProducts={activeProducts} activeCategories={activeCategories} onOrders={() => setTab("orders")} onRequests={() => setTab("requests")} /> : tab === "orders" ? <OrdersPanel orders={filteredOrders} search={search} filter={statusFilter} onSearch={setSearch} onFilter={setStatusFilter} onStatusChange={updateOrderStatus} message={orderMessage} /> : tab === "requests" ? <RequestsPanel requests={requests} onStatusChange={updateRequest} message={requestMessage} /> : tab === "products" ? <ProductManager categories={data?.categories ?? []} products={data?.products ?? []} onProductsChange={(products) => setData((current) => current ? { ...current, products } : current)} onCategoriesChange={(categories) => setData((current) => current ? { ...current, categories } : current)} /> : tab === "storefront" ? <BannerManager banners={data?.banners ?? []} onBannersChange={(banners) => setData((current) => current ? { ...current, banners } : current)} /> : <CloudinaryMedia />}
      </section></Container></main>
  </div>;
}

function OverviewPanel({ overview, activeProducts, activeCategories, onOrders, onRequests }: { overview: Overview | null; activeProducts: number; activeCategories: number; onOrders: () => void; onRequests: () => void }) {
  const stats = overview?.stats;
  return <div className="admin-dashboard-grid"><div className="admin-stats admin-stats-wide"><div><span>Total orders</span><strong>{stats?.totalOrders ?? 0}</strong></div><div><span>Paid revenue</span><strong>₹{(stats?.paidRevenue ?? 0).toLocaleString("en-IN")}</strong></div><div><span>Pending orders</span><strong>{stats?.pendingOrders ?? 0}</strong></div><div><span>Low stock</span><strong>{stats?.lowStockProducts ?? 0}</strong></div></div><div className="admin-panel admin-overview-panel"><div className="admin-panel-heading"><h2 className="font-heading">Recent orders</h2><button type="button" className="admin-text-button" onClick={onOrders}>View all</button></div>{overview?.recentOrders.length ? overview.recentOrders.map((order) => <div className="admin-list-row" key={order._id}><div><strong>{order.shippingAddress?.fullName || "Customer"}</strong><span>{order.orderStatus}</span></div><b>₹{order.total.toLocaleString("en-IN")}</b></div>) : <EmptyState text="No orders yet." />}</div><div className="admin-panel admin-overview-panel"><div className="admin-panel-heading"><h2 className="font-heading">Custom requests</h2><button type="button" className="admin-text-button" onClick={onRequests}>View all</button></div>{overview?.pendingRequests.length ? overview.pendingRequests.map((request) => <div className="admin-list-row" key={request._id}><div><strong>{request.name}</strong><span>{request.projectType} · {request.status}</span></div></div>) : <EmptyState text="No pending custom requests." />}</div><div className="admin-panel admin-quick-actions"><p className="eyebrow">Quick actions</p><h2 className="font-heading">Keep the shop moving.</h2><p className="admin-note">Manage the catalogue, campaigns, and customer fulfilment from one workspace.</p><div className="admin-action-row"><button type="button" className="button button-primary" onClick={onOrders}>Review orders</button><span>{activeProducts} active products · {activeCategories} categories</span></div></div></div>;
}

function OrdersPanel({ orders, search, filter, onSearch, onFilter, onStatusChange, message }: { orders: AdminOrder[]; search: string; filter: string; onSearch: (value: string) => void; onFilter: (value: string) => void; onStatusChange: (order: AdminOrder, status: string) => void; message: string }) {
  const [selected, setSelected] = useState<AdminOrder | null>(null);
  return <div className="admin-panel"><div className="admin-panel-heading"><h2 className="font-heading">Orders</h2><span>{orders.length} shown</span></div><div className="admin-toolbar"><label className="admin-search"><MagnifyingGlass size={18} /><input value={search} onChange={(event) => onSearch(event.target.value)} placeholder="Search customer, phone, payment reference" /></label><select value={filter} onChange={(event) => onFilter(event.target.value)} aria-label="Filter order status"><option value="">All statuses</option>{orderStatuses.map((status) => <option key={status} value={status}>{status}</option>)}</select></div>{message ? <p className="admin-feedback" role="status">{message}</p> : null}{orders.length ? <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Customer</th><th>Total</th><th>Payment</th><th>Status</th><th>Date</th><th /></tr></thead><tbody>{orders.map((order) => <tr key={order._id}><td><strong>{order.shippingAddress?.fullName || "Customer"}</strong><small>{order.shippingAddress?.phone}</small></td><td>₹{order.total.toLocaleString("en-IN")}</td><td><span className={`admin-status is-${order.paymentStatus}`}>{order.paymentStatus}</span></td><td><select value={order.orderStatus} onChange={(event) => void onStatusChange(order, event.target.value)} aria-label={`Update order ${order._id}`}>{orderStatuses.map((status) => <option key={status} value={status}>{status}</option>)}</select></td><td>{new Date(order.createdAt).toLocaleDateString("en-IN")}</td><td><button type="button" className="admin-text-button" onClick={() => setSelected(order)}>Details</button></td></tr>)}</tbody></table></div> : <EmptyState text="No orders match these filters." />}{selected ? <OrderDialog order={selected} onClose={() => setSelected(null)} /> : null}</div>;
}

function OrderDialog({ order, onClose }: { order: AdminOrder; onClose: () => void }) {
  return <div className="admin-dialog-backdrop" role="presentation" onClick={onClose}><div className="admin-dialog" role="dialog" aria-modal="true" aria-labelledby="order-details-title" onClick={(event) => event.stopPropagation()}><button type="button" className="admin-dialog-close" onClick={onClose} aria-label="Close order details"><X size={19} /></button><p className="eyebrow">Order details</p><h3 id="order-details-title">{order.shippingAddress?.fullName || "Customer"}</h3><p>{order.shippingAddress?.phone} · {order.shippingAddress?.city} {order.shippingAddress?.postalCode}</p><div className="admin-dialog-items">{order.items.map((item, index) => <div key={`${item.name}-${index}`}><span>{item.name} × {item.quantity}</span><b>₹{(item.price * item.quantity).toLocaleString("en-IN")}</b></div>)}</div><div className="admin-dialog-total"><span>Total</span><strong>₹{order.total.toLocaleString("en-IN")}</strong></div><p className="admin-note">Payment: {order.paymentStatus}{order.razorpayOrderId ? ` · ${order.razorpayOrderId}` : ""}</p></div></div>;
}

function RequestsPanel({ requests, onStatusChange, message }: { requests: CustomRequest[]; onStatusChange: (request: CustomRequest, status: string) => void; message: string }) {
  const statuses = ["new", "reviewing", "quoted", "approved", "in_production", "completed", "rejected", "cancelled"];
  return <div className="admin-panel"><div className="admin-panel-heading"><h2 className="font-heading">Request pipeline</h2><span>{requests.length} requests</span></div>{message ? <p className="admin-feedback" role="status">{message}</p> : null}{requests.length ? <div className="admin-request-grid">{requests.map((request) => <article className="admin-request-card" key={request._id}><div className="admin-request-card-top"><span className={`admin-status is-${request.status}`}>{request.status.replace("_", " ")}</span><time>{new Date(request.createdAt).toLocaleDateString("en-IN")}</time></div><h3>{request.name}</h3><p>{request.projectType} · {request.email} · {request.phone}</p><p>{request.description}</p><select value={request.status} onChange={(event) => void onStatusChange(request, event.target.value)} aria-label={`Update request ${request._id}`}>{statuses.map((status) => <option key={status} value={status}>{status.replace("_", " ")}</option>)}</select></article>)}</div> : <EmptyState text="No custom requests found." />}</div>;
}

function EmptyState({ text }: { text: string }) {
  return <div className="admin-empty"><Users size={22} /><p>{text}</p></div>;
}
