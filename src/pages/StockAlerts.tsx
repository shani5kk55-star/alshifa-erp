import { trpc } from "@/providers/trpc";
import { AlertTriangle, Package, ArrowRight } from "lucide-react";
import { Link } from "react-router";

export default function StockAlerts() {
  const { data: lowStock, isLoading } = trpc.product.getLowStock.useQuery();
  const { data: categories } = trpc.category.list.useQuery();

  const critical = (lowStock || []).filter((p) => p.quantity === 0);
  const warning = (lowStock || []).filter((p) => p.quantity > 0 && p.quantity <= p.reorderLevel);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Stock Alerts</h1>
        <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>Items below reorder level requiring attention</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="stat-card" style={{ borderLeftColor: "var(--status-danger)" }}>
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4" style={{ color: "var(--status-danger)" }} />
            <span className="text-xs uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Critical (Out)</span>
          </div>
          <div className="text-2xl font-bold" style={{ color: "var(--status-danger)" }}>{critical.length}</div>
        </div>
        <div className="stat-card" style={{ borderLeftColor: "var(--status-warning)" }}>
          <div className="flex items-center gap-2 mb-2">
            <Package className="w-4 h-4" style={{ color: "var(--status-warning)" }} />
            <span className="text-xs uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Low Stock</span>
          </div>
          <div className="text-2xl font-bold" style={{ color: "var(--status-warning)" }}>{warning.length}</div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-2 mb-2">
            <Package className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
            <span className="text-xs uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Total Alerts</span>
          </div>
          <div className="text-2xl font-bold" style={{ color: "var(--accent-gold)" }}>{(lowStock || []).length}</div>
        </div>
      </div>

      {/* Alerts Table */}
      <div className="table-container">
        <table className="w-full">
          <thead>
            <tr style={{ background: "var(--table-header-bg)" }}>
              <th className="text-left text-[11px] font-semibold uppercase tracking-wider p-3">Item</th>
              <th className="text-left text-[11px] font-semibold uppercase tracking-wider p-3">SKU</th>
              <th className="text-left text-[11px] font-semibold uppercase tracking-wider p-3">Category</th>
              <th className="text-left text-[11px] font-semibold uppercase tracking-wider p-3">Current QOH</th>
              <th className="text-left text-[11px] font-semibold uppercase tracking-wider p-3">Reorder Level</th>
              <th className="text-left text-[11px] font-semibold uppercase tracking-wider p-3">Required</th>
              <th className="text-left text-[11px] font-semibold uppercase tracking-wider p-3">Status</th>
              <th className="text-left text-[11px] font-semibold uppercase tracking-wider p-3">Supplier</th>
            </tr>
          </thead>
          <tbody>
            {(lowStock || []).map((item) => {
              const required = Math.max(0, item.reorderQty - item.quantity);
              const isCritical = item.quantity === 0;
              return (
                <tr key={item.id} className="transition-colors" style={{ borderBottom: "1px solid var(--border-subtle)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--table-row-hover)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                  <td className="p-3 text-xs font-medium" style={{ color: "var(--text-primary)" }}>{item.name}</td>
                  <td className="p-3 text-xs font-mono" style={{ color: "var(--accent-gold)" }}>{item.sku}</td>
                  <td className="p-3 text-xs" style={{ color: "var(--text-secondary)" }}>{item.category?.name}</td>
                  <td className="p-3 text-xs font-semibold" style={{ color: isCritical ? "var(--status-danger)" : "var(--status-warning)" }}>{item.quantity}</td>
                  <td className="p-3 text-xs" style={{ color: "var(--text-secondary)" }}>{item.reorderLevel}</td>
                  <td className="p-3 text-xs font-semibold" style={{ color: "var(--accent-gold)" }}>{required}</td>
                  <td className="p-3">
                    <span className={`badge text-[10px] ${isCritical ? "badge-red" : "badge-yellow"}`}>{isCritical ? "Critical" : "Low"}</span>
                  </td>
                  <td className="p-3 text-xs" style={{ color: "var(--text-secondary)" }}>{item.supplier?.name || "-"}</td>
                </tr>
              );
            })}
            {(!lowStock || lowStock.length === 0) && (
              <tr><td colSpan={8} className="p-8 text-center">
                <Package className="w-10 h-10 mx-auto mb-2" style={{ color: "var(--text-muted)" }} />
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>All stock levels are healthy</p>
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
