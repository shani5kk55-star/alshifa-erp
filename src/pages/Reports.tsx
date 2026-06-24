import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { BarChart3, Calendar } from "lucide-react";

const COLORS = ["#E2B86C", "#3B82F6", "#14B8A6", "#A78BFA", "#EF4444", "#22C55E"];

export default function Reports() {
  const [startDate, setStartDate] = useState("2026-01-01");
  const [endDate, setEndDate] = useState("2026-06-24");

  const { data: pl } = trpc.report.getProfitLoss.useQuery({ startDate, endDate });
  const { data: byCategory } = trpc.report.getSalesByCategory.useQuery({ startDate, endDate });
  const { data: topItems } = trpc.report.getTopItems.useQuery({ startDate, endDate, limit: 5 });

  const pieData = (byCategory || []).map((c) => ({ name: c.category, value: c.revenue }));
  const barData = (topItems || []).map((i) => ({ name: i.product.slice(0, 20), quantity: i.quantity }));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Reports & P&L</h1>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>Financial analytics and profit/loss statements</p>
        </div>
        <div className="flex gap-2">
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="form-input" style={{ width: 140 }} />
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="form-input" style={{ width: 140 }} />
        </div>
      </div>

      {/* P&L Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="stat-card"><div className="text-xs uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>Revenue</div><div className="text-2xl font-bold" style={{ color: "var(--accent-gold)" }}>Rs. {(pl?.revenue || 0).toLocaleString()}</div></div>
        <div className="stat-card" style={{ borderLeftColor: "var(--status-danger)" }}><div className="text-xs uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>Total Cost</div><div className="text-2xl font-bold" style={{ color: "var(--status-danger)" }}>Rs. {(pl?.cost || 0).toLocaleString()}</div></div>
        <div className="stat-card" style={{ borderLeftColor: "var(--status-success)" }}><div className="text-xs uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>Gross Profit</div><div className="text-2xl font-bold" style={{ color: "var(--status-success)" }}>Rs. {(pl?.profit || 0).toLocaleString()}</div></div>
        <div className="stat-card" style={{ borderLeftColor: "var(--status-info)" }}><div className="text-xs uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>Profit Margin</div><div className="text-2xl font-bold" style={{ color: "var(--status-info)" }}>{pl?.margin || 0}%</div></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Sales by Category */}
        <div className="card-dark">
          <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Sales by Category</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value">
                {pieData.map((_, i) => (<Cell key={i} fill={COLORS[i % COLORS.length]} />))}
              </Pie>
              <Tooltip contentStyle={{ background: "#1A2236", border: "1px solid #2A3652", borderRadius: 8, fontSize: 12, color: "#F1F5F9" }} formatter={(value: number) => [`Rs. ${value.toLocaleString()}`, "Revenue"]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 justify-center mt-2">
            {pieData.map((entry, i) => (
              <div key={i} className="flex items-center gap-1"><div className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} /><span className="text-[10px]" style={{ color: "var(--text-secondary)" }}>{entry.name}</span></div>
            ))}
          </div>
        </div>

        {/* Top Selling Items */}
        <div className="card-dark">
          <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Top Selling Items</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={barData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#2A3652" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: "#5E6F88" }} />
              <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 10, fill: "#94A3B8" }} />
              <Tooltip contentStyle={{ background: "#1A2236", border: "1px solid #2A3652", borderRadius: 8, fontSize: 12, color: "#F1F5F9" }} />
              <Bar dataKey="quantity" fill="#E2B86C" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
