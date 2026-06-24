import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import {
  TrendingUp,
  Users,
  AlertTriangle,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Receipt,
  Clock,
} from "lucide-react";

function StatCard({
  title,
  value,
  change,
  changeType,
  icon: Icon,
}: {
  title: string;
  value: string;
  change?: string;
  changeType?: "up" | "down" | "neutral";
  icon: React.ElementType;
}) {
  return (
    <div className="stat-card">
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
          {title}
        </span>
        <Icon className="w-5 h-5" style={{ color: "var(--text-muted)" }} />
      </div>
      <div className="text-2xl font-bold" style={{ color: "var(--accent-gold)" }}>
        {value}
      </div>
      {change && (
        <div className="flex items-center gap-1 mt-1">
          {changeType === "up" ? (
            <ArrowUpRight className="w-3 h-3" style={{ color: "var(--status-success)" }} />
          ) : changeType === "down" ? (
            <ArrowDownRight className="w-3 h-3" style={{ color: "var(--status-danger)" }} />
          ) : null}
          <span className="text-xs" style={{ color: changeType === "up" ? "var(--status-success)" : changeType === "down" ? "var(--status-danger)" : "var(--text-muted)" }}>
            {change}
          </span>
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  const { isAdmin } = useAuth();
  const { data: stats, isLoading } = trpc.dashboard.getStats.useQuery();
  const { data: chartData } = trpc.dashboard.getSalesChart.useQuery({ period: "daily" });
  const { data: recentSales } = trpc.dashboard.getRecentSales.useQuery({ limit: 5 });
  const { data: activities } = trpc.dashboard.getActivities.useQuery();

  const chartFormatted = chartData?.labels.map((label: string, i: number) => ({
    name: label,
    value: chartData.data[i],
  })) || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-t-transparent" style={{ borderColor: "var(--accent-gold)", borderTopColor: "transparent" }} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Dashboard</h1>
        <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>Overview of your optical store performance</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Today's Sales"
          value={`Rs. ${Number(stats?.todaySales || 0).toLocaleString()}`}
          change={`${stats?.todaySalesCount || 0} transactions`}
          changeType="neutral"
          icon={Receipt}
        />
        <StatCard
          title="Total Patients"
          value={`${stats?.totalPatients?.toLocaleString() || 0}`}
          change={`+${stats?.newPatientsToday || 0} today`}
          changeType="up"
          icon={Users}
        />
        <StatCard
          title="Low Stock Items"
          value={`${stats?.lowStockCount || 0}`}
          change={`${stats?.outOfStockCount || 0} out of stock`}
          changeType="down"
          icon={AlertTriangle}
        />
        <StatCard
          title="Pending Appointments"
          value={`${stats?.pendingAppointments || 0}`}
          change="Today"
          changeType="neutral"
          icon={Calendar}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Sales Chart */}
        <div className="card-dark lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Sales Overview</h2>
            <div className="flex gap-1">
              {["Daily", "Weekly", "Monthly"].map((p) => (
                <button key={p} className="btn-sm btn-secondary" style={{ height: 28, padding: "0 10px", fontSize: 11 }}>
                  {p}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={chartFormatted}>
              <defs>
                <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#E2B86C" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#E2B86C" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A3652" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#5E6F88" }} />
              <YAxis tick={{ fontSize: 11, fill: "#5E6F88" }} />
              <Tooltip
                contentStyle={{
                  background: "#1A2236",
                  border: "1px solid #2A3652",
                  borderRadius: 8,
                  fontSize: 12,
                  color: "#F1F5F9",
                }}
                formatter={(value: number) => [`Rs. ${value.toLocaleString()}`, "Sales"]}
              />
              <Area type="monotone" dataKey="value" stroke="#E2B86C" strokeWidth={2} fill="url(#salesGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Activity */}
        <div className="card-dark">
          <h2 className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Recent Sales</h2>
          <div className="space-y-3">
            {(recentSales || []).map((sale) => (
              <div key={sale.id} className="flex items-center justify-between py-2" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                <div>
                  <div className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>
                    {sale.invoiceNumber}
                  </div>
                  <div className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                    {sale.patient?.name || "Walk-in Customer"}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-semibold" style={{ color: "var(--accent-gold)" }}>
                    Rs. {Number(sale.grandTotal).toLocaleString()}
                  </div>
                  <div className="text-[10px] capitalize" style={{ color: "var(--text-muted)" }}>
                    {sale.paymentMode?.replace("_", " ")}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Stock Alerts */}
        <div className="card-dark">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Stock Alerts</h2>
            <a href="/stock-alerts" className="text-xs" style={{ color: "var(--accent-gold)" }}>View All</a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ background: "var(--table-header-bg)" }}>
                  <th className="text-left text-[11px] font-semibold uppercase tracking-wider p-3" style={{ color: "var(--text-muted)" }}>Item</th>
                  <th className="text-left text-[11px] font-semibold uppercase tracking-wider p-3" style={{ color: "var(--text-muted)" }}>QOH</th>
                  <th className="text-left text-[11px] font-semibold uppercase tracking-wider p-3" style={{ color: "var(--text-muted)" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {(activities?.stockAlerts || []).slice(0, 5).map((item) => (
                  <tr key={item.id} className="transition-colors" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                    <td className="p-3 text-xs" style={{ color: "var(--text-primary)" }}>{item.name}</td>
                    <td className="p-3 text-xs" style={{ color: "var(--text-primary)" }}>{item.quantity}</td>
                    <td className="p-3">
                      <span className={`badge ${item.quantity === 0 ? "badge-red" : "badge-yellow"}`}>
                        {item.quantity === 0 ? "Out" : "Low"}
                      </span>
                    </td>
                  </tr>
                ))}
                {(!activities?.stockAlerts || activities.stockAlerts.length === 0) && (
                  <tr>
                    <td colSpan={3} className="p-4 text-center text-xs" style={{ color: "var(--text-muted)" }}>No stock alerts</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Today's Appointments */}
        <div className="card-dark">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Today's Appointments</h2>
            <a href="/appointments" className="text-xs" style={{ color: "var(--accent-gold)" }}>View All</a>
          </div>
          <div className="space-y-3">
            {/* We'll show mock appointments here */}
            {[
              { time: "09:30 AM", name: "Muhammad Ali", type: "Follow-up" },
              { time: "11:00 AM", name: "Fatima Bibi", type: "Eye Test" },
              { time: "02:00 PM", name: "Bilal Ahmed", type: "Consultation" },
              { time: "04:30 PM", name: "Hina Tariq", type: "Frame Fitting" },
            ].map((apt, i) => (
              <div key={i} className="flex items-center gap-3 py-2" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                <div className="w-14 text-[11px] font-medium" style={{ color: "var(--accent-gold)" }}>{apt.time}</div>
                <div className="flex-1">
                  <div className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>{apt.name}</div>
                </div>
                <span className="badge badge-blue text-[10px]">{apt.type}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
