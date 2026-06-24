import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { Search, Receipt, Eye, Printer } from "lucide-react";

export default function SalesHistory() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedSale, setSelectedSale] = useState<number | null>(null);

  const { data, isLoading } = trpc.sale.list.useQuery({ page, limit: 25 });
  const { data: saleDetail } = trpc.sale.getById.useQuery(
    { id: selectedSale! },
    { enabled: !!selectedSale }
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Sales History</h1>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>View all past transactions and invoices</p>
        </div>
      </div>

      <div className="table-container">
        <table className="w-full">
          <thead>
            <tr style={{ background: "var(--table-header-bg)" }}>
              <th className="text-left text-[11px] font-semibold uppercase tracking-wider p-3">Invoice #</th>
              <th className="text-left text-[11px] font-semibold uppercase tracking-wider p-3">Date</th>
              <th className="text-left text-[11px] font-semibold uppercase tracking-wider p-3">Patient</th>
              <th className="text-left text-[11px] font-semibold uppercase tracking-wider p-3">Items</th>
              <th className="text-left text-[11px] font-semibold uppercase tracking-wider p-3">Total</th>
              <th className="text-left text-[11px] font-semibold uppercase tracking-wider p-3">Payment</th>
              <th className="text-left text-[11px] font-semibold uppercase tracking-wider p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(data?.items || []).map((sale) => (
              <tr key={sale.id} className="transition-colors cursor-pointer" style={{ borderBottom: "1px solid var(--border-subtle)" }}
                onClick={() => setSelectedSale(sale.id)}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--table-row-hover)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                <td className="p-3 text-xs font-mono font-medium" style={{ color: "var(--accent-gold)" }}>{sale.invoiceNumber}</td>
                <td className="p-3 text-xs" style={{ color: "var(--text-secondary)" }}>{sale.createdAt ? new Date(sale.createdAt).toLocaleDateString() : "-"}</td>
                <td className="p-3 text-xs" style={{ color: "var(--text-primary)" }}>{sale.patient?.name || "Walk-in"}</td>
                <td className="p-3 text-xs" style={{ color: "var(--text-secondary)" }}>{sale.items?.length || 0}</td>
                <td className="p-3 text-xs font-semibold" style={{ color: "var(--accent-gold)" }}>Rs. {Number(sale.grandTotal).toLocaleString()}</td>
                <td className="p-3"><span className="badge badge-green text-[10px] capitalize">{sale.paymentMode?.replace("_", " ")}</span></td>
                <td className="p-3">
                  <button className="p-1.5 rounded hover:bg-white/5"><Eye className="w-3.5 h-3.5" style={{ color: "var(--text-muted)" }} /></button>
                </td>
              </tr>
            ))}
            {(!data?.items || data.items.length === 0) && (
              <tr><td colSpan={7} className="p-8 text-center">
                <Receipt className="w-10 h-10 mx-auto mb-2" style={{ color: "var(--text-muted)" }} />
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>No sales found</p>
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Sale Detail Modal */}
      {selectedSale && saleDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.6)" }} onClick={() => setSelectedSale(null)}>
          <div className="card-dark w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{saleDetail.invoiceNumber}</h3>
              <button onClick={() => setSelectedSale(null)} className="btn-secondary btn-sm">Close</button>
            </div>

            <div className="mb-4 p-3 rounded-lg" style={{ background: "var(--surface-secondary)" }}>
              <div className="text-xs" style={{ color: "var(--text-muted)" }}>AlShifa Optical Store</div>
              <div className="text-xs" style={{ color: "var(--text-muted)" }}>Sheikh Fazal Road 187/Eb Gaggoo Mandi</div>
              <div className="text-xs" style={{ color: "var(--text-muted)" }}>Phone: 03087937614</div>
            </div>

            <div className="mb-4">
              <div className="text-xs" style={{ color: "var(--text-primary)" }}><strong>Patient:</strong> {saleDetail.patient?.name || "Walk-in Customer"}</div>
              <div className="text-xs" style={{ color: "var(--text-secondary)" }}><strong>Date:</strong> {saleDetail.createdAt ? new Date(saleDetail.createdAt).toLocaleString() : "-"}</div>
              <div className="text-xs capitalize" style={{ color: "var(--text-secondary)" }}><strong>Payment:</strong> {saleDetail.paymentMode?.replace("_", " ")}</div>
            </div>

            <table className="w-full mb-4">
              <thead>
                <tr style={{ background: "var(--table-header-bg)" }}>
                  <th className="text-left text-[10px] p-2">Item</th>
                  <th className="text-right text-[10px] p-2">Qty</th>
                  <th className="text-right text-[10px] p-2">Price</th>
                  <th className="text-right text-[10px] p-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {(saleDetail.items || []).map((item) => (
                  <tr key={item.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                    <td className="p-2 text-xs" style={{ color: "var(--text-primary)" }}>{item.product?.name}</td>
                    <td className="p-2 text-xs text-right" style={{ color: "var(--text-secondary)" }}>{item.quantity}</td>
                    <td className="p-2 text-xs text-right" style={{ color: "var(--text-secondary)" }}>Rs. {Number(item.unitPrice).toLocaleString()}</td>
                    <td className="p-2 text-xs text-right font-medium" style={{ color: "var(--text-primary)" }}>Rs. {Number(item.totalPrice).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="space-y-1 text-xs" style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: 12 }}>
              <div className="flex justify-between"><span style={{ color: "var(--text-secondary)" }}>Subtotal</span><span style={{ color: "var(--text-primary)" }}>Rs. {Number(saleDetail.subtotal).toLocaleString()}</span></div>
              {Number(saleDetail.discountAmount) > 0 && <div className="flex justify-between"><span style={{ color: "var(--text-secondary)" }}>Discount</span><span style={{ color: "var(--status-success)" }}>-Rs. {Number(saleDetail.discountAmount).toLocaleString()}</span></div>}
              {Number(saleDetail.taxAmount) > 0 && <div className="flex justify-between"><span style={{ color: "var(--text-secondary)" }}>Tax</span><span style={{ color: "var(--text-primary)" }}>Rs. {Number(saleDetail.taxAmount).toLocaleString()}</span></div>}
              <div className="flex justify-between text-sm font-bold pt-2" style={{ borderTop: "1px solid var(--border-subtle)", color: "var(--accent-gold)" }}>
                <span>Grand Total</span><span>Rs. {Number(saleDetail.grandTotal).toLocaleString()}</span>
              </div>
            </div>

            <div className="mt-4 text-center text-[10px]" style={{ color: "var(--text-muted)" }}>
              <p>Clinic Timings: 9am-10pm</p>
              <p>Thank you for trusting AlShifa!</p>
            </div>

            <button className="btn-primary w-full mt-4" onClick={() => window.print()}>
              <Printer className="w-4 h-4" /> Print Receipt
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
