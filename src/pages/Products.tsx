import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { Search, Plus, Pencil, SlidersHorizontal, X } from "lucide-react";

export default function Products() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState<number | undefined>();
  const [stockFilter, setStockFilter] = useState<string | undefined>();
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({
    sku: "", name: "", categoryId: "", brandId: "", supplierId: "",
    color: "", size: "", frameType: "" as "full_rim" | "half_rim" | "rimless" | "",
    material: "", purchasePrice: "", sellingPrice: "", quantity: "",
    reorderLevel: "10", reorderQty: "50", location: "shop" as const, barcode: "",
  });

  const { data, isLoading, refetch } = trpc.product.list.useQuery({
    search: search || undefined, categoryId: categoryFilter, stockStatus: stockFilter as "all" | "in_stock" | "low_stock" | "out_of_stock" | undefined, page, limit: 25,
  });
  const { data: categories } = trpc.category.list.useQuery();
  const { data: brands } = trpc.brand.list.useQuery();
  const { data: suppliers } = trpc.supplier.list.useQuery();
  const utils = trpc.useUtils();

  const createProduct = trpc.product.create.useMutation({ onSuccess: () => { setShowModal(false); resetForm(); refetch(); } });
  const updateProduct = trpc.product.update.useMutation({ onSuccess: () => { setShowModal(false); setEditingId(null); resetForm(); refetch(); } });

  const resetForm = () => setForm({ sku: "", name: "", categoryId: "", brandId: "", supplierId: "", color: "", size: "", frameType: "", material: "", purchasePrice: "", sellingPrice: "", quantity: "", reorderLevel: "10", reorderQty: "50", location: "shop", barcode: "" });

  const openEdit = (product: NonNullable<typeof data>["items"][0]) => {
    setEditingId(product.id);
    setForm({
      sku: product.sku, name: product.name, categoryId: product.categoryId.toString(),
      brandId: product.brandId?.toString() || "", supplierId: product.supplierId?.toString() || "",
      color: product.color || "", size: product.size || "", frameType: product.frameType || "",
      material: product.material || "", purchasePrice: product.purchasePrice.toString(),
      sellingPrice: product.sellingPrice.toString(), quantity: product.quantity.toString(),
      reorderLevel: product.reorderLevel.toString(), reorderQty: product.reorderQty.toString(),
      location: product.location, barcode: product.barcode || "",
    });
    setShowModal(true);
  };

  const handleSubmit = () => {
    const data = { ...form, categoryId: parseInt(form.categoryId), brandId: form.brandId ? parseInt(form.brandId) : undefined, supplierId: form.supplierId ? parseInt(form.supplierId) : undefined, purchasePrice: parseFloat(form.purchasePrice) || 0, sellingPrice: parseFloat(form.sellingPrice) || 0, quantity: parseInt(form.quantity) || 0, reorderLevel: parseInt(form.reorderLevel) || 10, reorderQty: parseInt(form.reorderQty) || 50, frameType: form.frameType || undefined };
    if (editingId) { updateProduct.mutate({ id: editingId, ...data }); }
    else { createProduct.mutate(data); }
  };

  const totalPages = Math.ceil((data?.total || 0) / 25);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Products</h1>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>Manage inventory - frames, lenses, solutions, accessories</p>
        </div>
        <button onClick={() => { resetForm(); setEditingId(null); setShowModal(true); }} className="btn-primary"><Plus className="w-4 h-4" /> Add Product</button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-muted)" }} />
          <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search products..." className="form-input pl-9" />
        </div>
        <select value={categoryFilter || ""} onChange={(e) => { setCategoryFilter(e.target.value ? parseInt(e.target.value) : undefined); setPage(1); }} className="form-input" style={{ width: 160 }}>
          <option value="">All Categories</option>
          {(categories || []).map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
        </select>
        <select value={stockFilter || ""} onChange={(e) => { setStockFilter(e.target.value || undefined); setPage(1); }} className="form-input" style={{ width: 160 }}>
          <option value="">All Stock</option>
          <option value="in_stock">In Stock</option>
          <option value="low_stock">Low Stock</option>
          <option value="out_of_stock">Out of Stock</option>
        </select>
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="w-full">
          <thead>
            <tr style={{ background: "var(--table-header-bg)" }}>
              <th className="text-left text-[11px] font-semibold uppercase tracking-wider p-3">SKU</th>
              <th className="text-left text-[11px] font-semibold uppercase tracking-wider p-3">Name</th>
              <th className="text-left text-[11px] font-semibold uppercase tracking-wider p-3">Category</th>
              <th className="text-left text-[11px] font-semibold uppercase tracking-wider p-3">Stock</th>
              <th className="text-left text-[11px] font-semibold uppercase tracking-wider p-3">Price</th>
              <th className="text-left text-[11px] font-semibold uppercase tracking-wider p-3">Status</th>
              <th className="text-left text-[11px] font-semibold uppercase tracking-wider p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(data?.items || []).map((p) => (
              <tr key={p.id} className="transition-colors" style={{ borderBottom: "1px solid var(--border-subtle)" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--table-row-hover)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                <td className="p-3 text-xs font-mono" style={{ color: "var(--accent-gold)" }}>{p.sku}</td>
                <td className="p-3 text-xs" style={{ color: "var(--text-primary)" }}>{p.name}</td>
                <td className="p-3 text-xs" style={{ color: "var(--text-secondary)" }}>{p.category?.name}</td>
                <td className="p-3 text-xs" style={{ color: "var(--text-primary)" }}>{p.quantity}</td>
                <td className="p-3 text-xs" style={{ color: "var(--accent-gold)" }}>Rs. {Number(p.sellingPrice).toLocaleString()}</td>
                <td className="p-3">
                  <span className={`badge text-[10px] ${p.quantity === 0 ? "badge-red" : p.quantity <= p.reorderLevel ? "badge-yellow" : "badge-green"}`}>
                    {p.quantity === 0 ? "Out" : p.quantity <= p.reorderLevel ? "Low" : "OK"}
                  </span>
                </td>
                <td className="p-3">
                  <button onClick={() => openEdit(p)} className="p-1.5 rounded hover:bg-white/5"><Pencil className="w-3.5 h-3.5" style={{ color: "var(--text-muted)" }} /></button>
                </td>
              </tr>
            ))}
            {(!data?.items || data.items.length === 0) && (
              <tr><td colSpan={7} className="p-8 text-center text-xs" style={{ color: "var(--text-muted)" }}>No products found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>Page {page} of {totalPages}</span>
          <div className="flex gap-2">
            <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="btn-secondary btn-sm"><SlidersHorizontal className="w-3 h-3 rotate-90" /></button>
            <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="btn-secondary btn-sm"><SlidersHorizontal className="w-3 h-3 -rotate-90" /></button>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.6)" }}>
          <div className="card-dark w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{editingId ? "Edit Product" : "New Product"}</h3>
              <button onClick={() => setShowModal(false)}><X className="w-4 h-4" style={{ color: "var(--text-muted)" }} /></button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2"><label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Name *</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="form-input" /></div>
              <div><label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>SKU *</label><input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} className="form-input" placeholder="Auto-generate or enter" /></div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Category *</label>
                <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className="form-input">
                  <option value="">Select</option>
                  {(categories || []).map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
                </select>
              </div>
              <div><label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Purchase Price</label><input type="number" value={form.purchasePrice} onChange={(e) => setForm({ ...form, purchasePrice: e.target.value })} className="form-input" /></div>
              <div><label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Selling Price</label><input type="number" value={form.sellingPrice} onChange={(e) => setForm({ ...form, sellingPrice: e.target.value })} className="form-input" /></div>
              <div><label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Quantity</label><input type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} className="form-input" /></div>
              <div><label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Reorder Level</label><input type="number" value={form.reorderLevel} onChange={(e) => setForm({ ...form, reorderLevel: e.target.value })} className="form-input" /></div>
              <div><label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Color</label><input value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className="form-input" /></div>
              <div><label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Size</label><input value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })} className="form-input" placeholder="52-18-140" /></div>
              <div><label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Frame Type</label>
                <select value={form.frameType} onChange={(e) => setForm({ ...form, frameType: e.target.value as typeof form.frameType })} className="form-input">
                  <option value="">Select</option><option value="full_rim">Full Rim</option><option value="half_rim">Half Rim</option><option value="rimless">Rimless</option>
                </select>
              </div>
              <div><label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Barcode</label><input value={form.barcode} onChange={(e) => setForm({ ...form, barcode: e.target.value })} className="form-input" /></div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
              <button onClick={handleSubmit} disabled={!form.name || !form.sku || !form.categoryId || createProduct.isPending || updateProduct.isPending} className="btn-primary">
                {createProduct.isPending || updateProduct.isPending ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
