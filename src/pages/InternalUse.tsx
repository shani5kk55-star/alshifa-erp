import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { UserCog, Plus, X, Package } from "lucide-react";

export default function InternalUse() {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ userId: "", productId: "", quantity: "", reason: "", date: new Date().toISOString().split("T")[0] });

  const { data: records, refetch } = trpc.internalUse.list.useQuery();
  const { data: users } = trpc.auth.listUsers.useQuery(undefined, { enabled: false });
  const { data: products } = trpc.product.list.useQuery({ limit: 100 });
  const utils = trpc.useUtils();

  const createRecord = trpc.internalUse.create.useMutation({
    onSuccess: () => { setShowModal(false); setForm({ userId: "", productId: "", quantity: "", reason: "", date: new Date().toISOString().split("T")[0] }); refetch(); },
  });

  const internalProducts = (products?.items || []).filter((p) => p.category?.name === "Internal Use");

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Internal Use / Staff Consumption</h1>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>Track staff consumption of trial lenses, solutions, and supplies</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary"><Plus className="w-4 h-4" /> Record Use</button>
      </div>

      <div className="table-container">
        <table className="w-full">
          <thead>
            <tr style={{ background: "var(--table-header-bg)" }}>
              <th className="text-left text-[11px] font-semibold uppercase tracking-wider p-3">Date</th>
              <th className="text-left text-[11px] font-semibold uppercase tracking-wider p-3">Staff</th>
              <th className="text-left text-[11px] font-semibold uppercase tracking-wider p-3">Item</th>
              <th className="text-left text-[11px] font-semibold uppercase tracking-wider p-3">Qty</th>
              <th className="text-left text-[11px] font-semibold uppercase tracking-wider p-3">Reason</th>
            </tr>
          </thead>
          <tbody>
            {(records || []).map((r) => (
              <tr key={r.id} className="transition-colors" style={{ borderBottom: "1px solid var(--border-subtle)" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--table-row-hover)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                <td className="p-3 text-xs" style={{ color: "var(--text-secondary)" }}>{r.date ? new Date(r.date).toLocaleDateString() : "-"}</td>
                <td className="p-3 text-xs" style={{ color: "var(--text-primary)" }}>{r.user?.name}</td>
                <td className="p-3 text-xs" style={{ color: "var(--text-primary)" }}>{r.product?.name}</td>
                <td className="p-3 text-xs font-semibold" style={{ color: "var(--accent-gold)" }}>{r.quantity}</td>
                <td className="p-3 text-xs" style={{ color: "var(--text-secondary)" }}>{r.reason}</td>
              </tr>
            ))}
            {(!records || records.length === 0) && (
              <tr><td colSpan={5} className="p-8 text-center">
                <UserCog className="w-10 h-10 mx-auto mb-2" style={{ color: "var(--text-muted)" }} />
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>No internal use records</p>
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Record Use Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.6)" }}>
          <div className="card-dark w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Record Internal Use</h3>
              <button onClick={() => setShowModal(false)}><X className="w-4 h-4" style={{ color: "var(--text-muted)" }} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Staff Member *</label>
                <select value={form.userId} onChange={(e) => setForm({ ...form, userId: e.target.value })} className="form-input">
                  <option value="">Select staff</option>
                  <option value={String(user?.id)}>{user?.name} (You)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Item *</label>
                <select value={form.productId} onChange={(e) => setForm({ ...form, productId: e.target.value })} className="form-input">
                  <option value="">Select item</option>
                  {(internalProducts.length > 0 ? internalProducts : (products?.items || []).filter((p) => p.quantity > 0)).map((p) => (
                    <option key={p.id} value={p.id}>{p.name} (Stock: {p.quantity})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Quantity *</label><input type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} className="form-input" min={1} /></div>
                <div><label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Date</label><input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="form-input" /></div>
              </div>
              <div><label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Reason *</label><textarea value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} className="form-input" style={{ minHeight: 60, padding: 8 }} placeholder="e.g., Patient eye testing, Trial use" /></div>
              <button onClick={() => createRecord.mutate({ userId: parseInt(form.userId), productId: parseInt(form.productId), quantity: parseInt(form.quantity) || 1, reason: form.reason, date: form.date })} disabled={!form.userId || !form.productId || !form.reason || !form.quantity || createRecord.isPending} className="btn-primary w-full">
                {createRecord.isPending ? "Recording..." : "Record Use"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
