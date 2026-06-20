import { useState, useEffect, useRef } from "react";
import { Eye, EyeOff, Save, Plus, Trash2, Bell, RefreshCw, Search, Package, LogOut, CheckCircle, AlertCircle, X } from "lucide-react";

const ADMIN_SECRET = "VMPADMIN2026";
const SESSION_KEY = "vmp_admin_session";
const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

type Product = {
  id: number;
  name: string;
  sku: string;
  category: string;
  categorySlug: string;
  packingQty: number;
  boxRate: string;
  pieceRate: string;
  imageUrl: string;
  inStock: boolean;
};

type Toast = { id: number; type: "success" | "error"; message: string };

async function adminFetch(path: string, options?: RequestInit) {
  const res = await fetch(`${API_BASE}/api${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "x-admin-secret": ADMIN_SECRET,
      ...options?.headers,
    },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(() => sessionStorage.getItem(SESSION_KEY) === "true");
  const [secretInput, setSecretInput] = useState("");
  const [showSecret, setShowSecret] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [tab, setTab] = useState<"products" | "add" | "notifications">("products");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Record<number, Partial<Product>>>({});
  const [saving, setSaving] = useState<Record<number, boolean>>({});
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastId = useRef(0);

  const [newProduct, setNewProduct] = useState({
    name: "", sku: "", category: "", categorySlug: "", packingQty: "", boxRate: "", pieceRate: "", imageUrl: "",
  });
  const [addSaving, setAddSaving] = useState(false);

  const [notifTitle, setNotifTitle] = useState("");
  const [notifMessage, setNotifMessage] = useState("");
  const [notifSending, setNotifSending] = useState(false);

  const ONESIGNAL_APP_ID = "YOUR_ONESIGNAL_APP_ID";
  const ONESIGNAL_API_KEY = "YOUR_ONESIGNAL_REST_API_KEY";

  const addToast = (type: "success" | "error", message: string) => {
    const id = ++toastId.current;
    setToasts(t => [...t, { id, type, message }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4000);
  };

  const handleLogin = () => {
    if (secretInput === ADMIN_SECRET) {
      sessionStorage.setItem(SESSION_KEY, "true");
      setAuthenticated(true);
    } else {
      setLoginError("Invalid admin code. Access denied.");
      setSecretInput("");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem(SESSION_KEY);
    setAuthenticated(false);
    setSecretInput("");
  };

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await adminFetch("/admin/products");
      setProducts(data.products);
    } catch {
      addToast("error", "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (authenticated) loadProducts(); }, [authenticated]);

  const filteredProducts = products.filter(p =>
    !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase())
  );

  const handleEdit = (id: number, field: keyof Product, value: string | boolean) => {
    setEditing(e => ({ ...e, [id]: { ...e[id], [field]: value } }));
  };

  const handleSave = async (id: number) => {
    const changes = editing[id];
    if (!changes || Object.keys(changes).length === 0) return;
    setSaving(s => ({ ...s, [id]: true }));
    try {
      const data = await adminFetch(`/admin/products/${id}`, {
        method: "PATCH",
        body: JSON.stringify(changes),
      });
      setProducts(ps => ps.map(p => p.id === id ? { ...p, ...data.product } : p));
      setEditing(e => { const n = { ...e }; delete n[id]; return n; });
      addToast("success", "Product updated successfully");
    } catch {
      addToast("error", "Failed to save changes");
    } finally {
      setSaving(s => ({ ...s, [id]: false }));
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await adminFetch(`/admin/products/${id}`, { method: "DELETE" });
      setProducts(ps => ps.filter(p => p.id !== id));
      addToast("success", "Product deleted");
    } catch {
      addToast("error", "Failed to delete product");
    }
  };

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.sku || !newProduct.category || !newProduct.boxRate || !newProduct.pieceRate || !newProduct.packingQty || !newProduct.imageUrl) {
      addToast("error", "Please fill in all required fields");
      return;
    }
    setAddSaving(true);
    try {
      const data = await adminFetch("/admin/products", {
        method: "POST",
        body: JSON.stringify({
          ...newProduct,
          packingQty: parseInt(newProduct.packingQty),
        }),
      });
      setProducts(ps => [...ps, data.product]);
      setNewProduct({ name: "", sku: "", category: "", categorySlug: "", packingQty: "", boxRate: "", pieceRate: "", imageUrl: "" });
      addToast("success", "Product added successfully");
      setTab("products");
    } catch {
      addToast("error", "Failed to add product");
    } finally {
      setAddSaving(false);
    }
  };

  const handleSendNotification = async () => {
    if (!notifTitle.trim() || !notifMessage.trim()) {
      addToast("error", "Title and message are required");
      return;
    }
    if (ONESIGNAL_APP_ID === "YOUR_ONESIGNAL_APP_ID") {
      addToast("error", "Configure OneSignal App ID and API Key first");
      return;
    }
    setNotifSending(true);
    try {
      const res = await fetch("https://onesignal.com/api/v1/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Basic ${ONESIGNAL_API_KEY}`,
        },
        body: JSON.stringify({
          app_id: ONESIGNAL_APP_ID,
          included_segments: ["All"],
          headings: { en: notifTitle },
          contents: { en: notifMessage },
          url: `${window.location.origin}/products`,
        }),
      });
      if (!res.ok) throw new Error("OneSignal API error");
      setNotifTitle("");
      setNotifMessage("");
      addToast("success", "Push notification sent to all subscribers!");
    } catch {
      addToast("error", "Failed to send notification. Check OneSignal configuration.");
    } finally {
      setNotifSending(false);
    }
  };

  const inputCls = "w-full bg-slate-800 border border-slate-600 rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder-slate-400";

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="h-16 w-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4">
              <Package className="h-7 w-7 text-emerald-400" />
            </div>
            <h1 className="text-xl font-bold text-white">Administrative Access</h1>
            <p className="text-slate-400 text-sm mt-1">Enter your access code to continue</p>
          </div>
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6">
            <div className="relative mb-4">
              <input
                type={showSecret ? "text" : "password"}
                value={secretInput}
                onChange={e => { setSecretInput(e.target.value); setLoginError(""); }}
                onKeyDown={e => e.key === "Enter" && handleLogin()}
                placeholder="Access code"
                className={`${inputCls} pr-10`}
                autoFocus
              />
              <button
                onClick={() => setShowSecret(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              >
                {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {loginError && (
              <div className="flex items-center gap-2 text-red-400 text-sm mb-3">
                <AlertCircle className="h-4 w-4 shrink-0" /> {loginError}
              </div>
            )}
            <button
              onClick={handleLogin}
              className="w-full h-10 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg transition-colors"
            >
              Unlock Dashboard
            </button>
          </div>
          <p className="text-center text-slate-600 text-xs mt-4">Veer Mahadev Plastic · Internal Tools</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className={`flex items-center gap-2 px-4 py-3 rounded-lg shadow-xl text-sm font-medium pointer-events-auto ${t.type === "success" ? "bg-emerald-700 text-white" : "bg-red-700 text-white"}`}>
            {t.type === "success" ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            {t.message}
            <button onClick={() => setToasts(ts => ts.filter(x => x.id !== t.id))} className="ml-1 opacity-70 hover:opacity-100"><X className="h-3.5 w-3.5" /></button>
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-white">VMP Admin Dashboard</h1>
            <p className="text-xs text-slate-400">Veer Mahadev Plastic · Internal Tools</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2.5 py-1 rounded-full">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live
            </span>
            <button onClick={handleLogout} className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white border border-slate-700 hover:border-slate-500 px-3 py-1.5 rounded-lg transition-colors">
              <LogOut className="h-3.5 w-3.5" /> Sign Out
            </button>
          </div>
        </div>
        {/* Tabs */}
        <div className="container mx-auto px-4 flex gap-1">
          {([["products", "📦 Products"], ["add", "➕ Add Product"], ["notifications", "🔔 Push Notifications"]] as const).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${tab === key ? "border-emerald-500 text-emerald-400" : "border-transparent text-slate-400 hover:text-white"}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">

        {/* ── PRODUCTS TAB ── */}
        {tab === "products" && (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search by name or SKU..."
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <button onClick={loadProducts} disabled={loading} className="flex items-center gap-1.5 text-sm text-slate-300 hover:text-white border border-slate-600 hover:border-slate-400 px-3 py-2 rounded-lg transition-colors">
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
              </button>
              <span className="text-xs text-slate-400">{filteredProducts.length} products</span>
            </div>

            {loading ? (
              <div className="text-center py-16 text-slate-400">Loading products…</div>
            ) : (
              <div className="space-y-3">
                {filteredProducts.map(p => {
                  const ed = editing[p.id] || {};
                  const isDirty = Object.keys(ed).length > 0;
                  return (
                    <div key={p.id} className={`bg-slate-900 border rounded-xl p-4 transition-colors ${isDirty ? "border-emerald-500/50" : "border-slate-700"}`}>
                      <div className="flex gap-4">
                        {/* Image preview + edit */}
                        <div className="shrink-0">
                          <img
                            src={ed.imageUrl ?? p.imageUrl}
                            alt={p.name}
                            className="h-14 w-14 object-contain rounded-lg bg-slate-800"
                            onError={e => { (e.target as HTMLImageElement).src = "https://placehold.co/56x56?text=IMG"; }}
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                            {/* Name */}
                            <div className="lg:col-span-2">
                              <label className="text-xs text-slate-400 block mb-1">Product Name</label>
                              <input
                                defaultValue={p.name}
                                onChange={e => handleEdit(p.id, "name", e.target.value)}
                                className={inputCls}
                              />
                            </div>
                            {/* Retail price (pieceRate) */}
                            <div>
                              <label className="text-xs text-slate-400 block mb-1">Retail Price (₹/pc)</label>
                              <input
                                defaultValue={p.pieceRate}
                                onChange={e => handleEdit(p.id, "pieceRate", e.target.value)}
                                className={inputCls}
                                type="number"
                                step="0.01"
                              />
                            </div>
                            {/* Box rate */}
                            <div>
                              <label className="text-xs text-slate-400 block mb-1">Bulk Rate (₹/carton)</label>
                              <input
                                defaultValue={p.boxRate}
                                onChange={e => handleEdit(p.id, "boxRate", e.target.value)}
                                className={inputCls}
                                type="number"
                                step="0.01"
                              />
                            </div>
                            {/* Image URL */}
                            <div className="sm:col-span-2 lg:col-span-3">
                              <label className="text-xs text-slate-400 block mb-1">Image URL</label>
                              <input
                                defaultValue={p.imageUrl}
                                onChange={e => handleEdit(p.id, "imageUrl", e.target.value)}
                                placeholder="https://..."
                                className={inputCls}
                              />
                            </div>
                            {/* Status + actions */}
                            <div className="flex items-end gap-2">
                              <label className="flex items-center gap-2 text-sm cursor-pointer">
                                <input
                                  type="checkbox"
                                  defaultChecked={p.inStock}
                                  onChange={e => handleEdit(p.id, "inStock", e.target.checked)}
                                  className="w-4 h-4 rounded border-slate-500 bg-slate-700 accent-emerald-500"
                                />
                                <span className="text-slate-300 text-xs">In Stock</span>
                              </label>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 mt-3">
                            <span className="text-xs text-slate-500">SKU: {p.sku} · {p.category} · {p.packingQty} pcs/carton</span>
                            <div className="ml-auto flex gap-2">
                              {isDirty && (
                                <button
                                  onClick={() => handleSave(p.id)}
                                  disabled={saving[p.id]}
                                  className="flex items-center gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-50"
                                >
                                  <Save className="h-3.5 w-3.5" />
                                  {saving[p.id] ? "Saving…" : "Save Changes"}
                                </button>
                              )}
                              <button
                                onClick={() => handleDelete(p.id, p.name)}
                                className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 border border-red-400/20 hover:border-red-400/40 px-3 py-1.5 rounded-lg transition-colors"
                              >
                                <Trash2 className="h-3.5 w-3.5" /> Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── ADD PRODUCT TAB ── */}
        {tab === "add" && (
          <div className="max-w-2xl">
            <h2 className="text-base font-semibold mb-4 text-white">Add New Product</h2>
            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-xs text-slate-400 block mb-1">Product Name *</label>
                  <input value={newProduct.name} onChange={e => setNewProduct(p => ({ ...p, name: e.target.value }))} placeholder="e.g. 500ML Round Container With Lid" className={inputCls} />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">SKU *</label>
                  <input value={newProduct.sku} onChange={e => setNewProduct(p => ({ ...p, sku: e.target.value }))} placeholder="e.g. 7063" className={inputCls} />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Packing Qty (pcs/carton) *</label>
                  <input value={newProduct.packingQty} onChange={e => setNewProduct(p => ({ ...p, packingQty: e.target.value }))} placeholder="e.g. 800" type="number" className={inputCls} />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Category (display) *</label>
                  <input value={newProduct.category} onChange={e => setNewProduct(p => ({ ...p, category: e.target.value }))} placeholder="e.g. Cornstarch Container" className={inputCls} />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Category Slug *</label>
                  <input value={newProduct.categorySlug} onChange={e => setNewProduct(p => ({ ...p, categorySlug: e.target.value }))} placeholder="e.g. cornstarch-container" className={inputCls} />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Retail Price ₹/pc (pieceRate) *</label>
                  <input value={newProduct.pieceRate} onChange={e => setNewProduct(p => ({ ...p, pieceRate: e.target.value }))} placeholder="e.g. 7.00" type="number" step="0.01" className={inputCls} />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Bulk Rate ₹/carton (boxRate) *</label>
                  <input value={newProduct.boxRate} onChange={e => setNewProduct(p => ({ ...p, boxRate: e.target.value }))} placeholder="e.g. 4800" type="number" step="0.01" className={inputCls} />
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-slate-400 block mb-1">Image URL *</label>
                  <input value={newProduct.imageUrl} onChange={e => setNewProduct(p => ({ ...p, imageUrl: e.target.value }))} placeholder="https://..." className={inputCls} />
                </div>
                {newProduct.imageUrl && (
                  <div className="col-span-2 flex items-center gap-3">
                    <img src={newProduct.imageUrl} alt="preview" className="h-16 w-16 object-contain rounded-lg bg-slate-800" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    <span className="text-xs text-slate-400">Image preview</span>
                  </div>
                )}
              </div>
              <button
                onClick={handleAddProduct}
                disabled={addSaving}
                className="w-full h-10 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="h-4 w-4" />
                {addSaving ? "Adding…" : "Add Product to Catalog"}
              </button>
            </div>
          </div>
        )}

        {/* ── PUSH NOTIFICATIONS TAB ── */}
        {tab === "notifications" && (
          <div className="max-w-xl">
            <h2 className="text-base font-semibold mb-4 text-white">Send Push Notification</h2>

            {(ONESIGNAL_APP_ID === "YOUR_ONESIGNAL_APP_ID") && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-4 text-sm text-amber-300">
                <p className="font-semibold mb-1">⚙️ OneSignal Setup Required</p>
                <ol className="list-decimal list-inside space-y-1 text-amber-300/80 text-xs">
                  <li>Create a free account at <a href="https://onesignal.com" target="_blank" rel="noopener noreferrer" className="underline">onesignal.com</a></li>
                  <li>Create a new Web Push app and get your App ID & REST API Key</li>
                  <li>Share the App ID with us to configure the SDK on the storefront</li>
                  <li>Replace <code className="bg-amber-900/30 px-1 rounded">YOUR_ONESIGNAL_APP_ID</code> and <code className="bg-amber-900/30 px-1 rounded">YOUR_ONESIGNAL_REST_API_KEY</code> in <code className="bg-amber-900/30 px-1 rounded">admin.tsx</code></li>
                </ol>
              </div>
            )}

            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 space-y-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Notification Title *</label>
                <input
                  value={notifTitle}
                  onChange={e => setNotifTitle(e.target.value)}
                  placeholder="e.g. New Stock Arrived!"
                  className={inputCls}
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Message *</label>
                <textarea
                  value={notifMessage}
                  onChange={e => setNotifMessage(e.target.value)}
                  placeholder="e.g. New 500ML Containers back in stock. Check factory rates now!"
                  rows={4}
                  className={`${inputCls} resize-none`}
                />
              </div>
              <div className="bg-slate-800 rounded-lg p-3 border border-slate-600">
                <p className="text-xs text-slate-400 font-medium mb-1">Preview</p>
                <div className="text-sm text-white font-medium">{notifTitle || "Your notification title"}</div>
                <div className="text-xs text-slate-300 mt-0.5">{notifMessage || "Your notification message"}</div>
              </div>
              <button
                onClick={handleSendNotification}
                disabled={notifSending}
                className="w-full h-10 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Bell className="h-4 w-4" />
                {notifSending ? "Sending…" : "Broadcast to All Subscribers"}
              </button>
              <p className="text-xs text-slate-500 text-center">Sends to all opted-in subscribers via OneSignal web push</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
