import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { Truck, Plus, X, Wallet } from "lucide-react";

export default function Suppliers() {
  const [showModal, setShowModal] = useState(false);
  const [showPayment, setShowPayment] = useState<number | null>(null);
  const [form, setForm] = useState({ name: "", contactPerson: "", phone: "", email: "", address: "" });
  const [paymentForm, setPaymentForm] = useState({ amount: "", paymentMode: "cash" as const, referenceNo: "", notes: "" });

  const { data: suppliers, isLoading, refetch } = trpc.supplier.list.useQuery();
  const utils = trpc.useUtils();
  const createSupplier = trpc.supplier.create.useMutation({ onSuccess: () => { setShowModal(false); setForm({ name: "", contactPerson: "", phone: "", email: "", address: "" }); refetch(); } });
  const recordPayment = trpc.supplier.recordPayment.useMutation({ onSuccess: () => { setShowPayment(null); setPaymentForm({ amount: "", paymentMode: "cash", referenceNo: "", notes: "" }); refetch(); } });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Suppliers</h1>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>Manage suppliers and track payables</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary"><Plus className="w-4 h-4" /> Add Supplier</button>
      </div>

      <div className="table-container">
        <table className="w-full">
          <thead>
            <tr style={{ background: "var(--table-header-bg)" }}>
              <th className="text-left text-[11px] font-semibold uppercase tracking-wider p-3">Name</th>
              <th className="text-left text-[11px] font-semibold uppercase tracking-wider p-3">Contact Person</th>
              <th className="text-left text-[11px] font-semibold uppercase tracking-wider p-3">Phone</th>
              <th className="text-left text-[11px] font-semibold uppercase tracking-wider p-3">Total Payable</th>
              <th className="text-left text-[11px] font-semibold uppercase tracking-wider p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(suppliers || []).map((s) => (
              <tr key={s.id} className="transition-colors" style={{ borderBottom: "1px solid var(--border-subtle)" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--table-row-hover)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                <td className="p-3 text-xs font-medium" style={{ color: "var(--text-primary)" }}>{s.name}</td>
                <td className="p-3 text-xs" style={{ color: "var(--text-secondary)" }}>{s.contactPerson || "-"}</td>
                <td className="p-3 text-xs" style={{ color: "var(--text-secondary)" }}>{s.phone || "-"}</td>
                <td className="p-3 text-xs font-semibold" style={{ color: Number(s.totalPayable) > 0 ? "var(--status-warning)" : "var(--status-success)" }}>
                  Rs. {Number(s.totalPayable).toLocaleString()}
                </td>
                <td className="p-3">
                  {Number(s.totalPayable) > 0 && (
                    <button onClick={() => setShowPayment(s.id)} className="btn-sm btn-primary" style={{ fontSize: 10, height: 26 }}>
                      <Wallet className="w-3 h-3" /> Pay
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {(!suppliers || suppliers.length === 0) && (
              <tr><td colSpan={5} className="p-8 text-center">
                <Truck className="w-10 h-10 mx-auto mb-2" style={{ color: "var(--text-muted)" }} />
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>No suppliers found</p>
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Supplier Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.6)" }}>
          <div className="card-dark w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Add Supplier</h3>
              <button onClick={() => setShowModal(false)}><X className="w-4 h-4" style={{ color: "var(--text-muted)" }} /></button>
            </div>
            <div className="space-y-3">
              <div><label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Name *</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="form-input" /></div>
              <div><label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Contact Person</label><input value={form.contactPerson} onChange={(e) => setForm({ ...form, contactPerson: e.target.value })} className="form-input" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Phone</label><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="form-input" /></div>
                <div><label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Email</label><input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="form-input" /></div>
              </div>
              <div><label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Address</label><textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="form-input" style={{ minHeight: 50, padding: 8 }} /></div>
              <button onClick={() => createSupplier.mutate(form)} disabled={!form.name || createSupplier.isPending} className="btn-primary w-full">
                {createSupplier.isPending ? "Creating..." : "Add Supplier"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.6)" }}>
          <div className="card-dark w-full max-w-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Record Payment</h3>
              <button onClick={() => setShowPayment(null)}><X className="w-4 h-4" style={{ color: "var(--text-muted)" }} /></button>
            </div>
            <div className="space-y-3">
              <div><label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Amount (Rs.) *</label><input type="number" value={paymentForm.amount} onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })} className="form-input" /></div>
              <div><label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Payment Mode</label>
                <select value={paymentForm.paymentMode} onChange={(e) => setPaymentForm({ ...paymentForm, paymentMode: e.target.value as typeof paymentForm.paymentMode })} className="form-input">
                  <option value="cash">Cash</option><option value="card">Card</option><option value="online_transfer">Online Transfer</option><option value="cheque">Cheque</option>
                </select>
              </div>
              <div><label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Reference #</label><input value={paymentForm.referenceNo} onChange={(e) => setPaymentForm({ ...paymentForm, referenceNo: e.target.value })} className="form-input" /></div>
              <div><label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Notes</label><textarea value={paymentForm.notes} onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })} className="form-input" style={{ minHeight: 50, padding: 8 }} /></div>
              <button onClick={() => recordPayment.mutate({ supplierId: showPayment, amount: parseFloat(paymentForm.amount) || 0, paymentMode: paymentForm.paymentMode, referenceNo: paymentForm.referenceNo, notes: paymentForm.notes })} disabled={!paymentForm.amount || recordPayment.isPending} className="btn-primary w-full">
                {recordPayment.isPending ? "Recording..." : "Record Payment"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
