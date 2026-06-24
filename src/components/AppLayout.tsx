import { useState } from "react";
import { Link, useLocation } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  Calendar,
  Eye,
  Package,
  AlertTriangle,
  Receipt,
  Truck,
  BarChart3,
  UserCog,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Bell,
  Search,
} from "lucide-react";

const navGroups = [
  {
    label: "MAIN",
    items: [
      { path: "/", label: "Dashboard", icon: LayoutDashboard },
      { path: "/pos", label: "Point of Sale", icon: ShoppingCart },
      { path: "/patients", label: "Patients", icon: Users },
      { path: "/appointments", label: "Appointments", icon: Calendar },
      { path: "/prescriptions", label: "Prescriptions", icon: Eye },
    ],
  },
  {
    label: "INVENTORY",
    items: [
      { path: "/products", label: "Products", icon: Package },
      { path: "/stock-alerts", label: "Stock Alerts", icon: AlertTriangle },
    ],
  },
  {
    label: "FINANCE",
    items: [
      { path: "/sales", label: "Sales History", icon: Receipt },
      { path: "/suppliers", label: "Suppliers", icon: Truck },
      { path: "/reports", label: "Reports", icon: BarChart3 },
    ],
  },
  {
    label: "SETTINGS",
    items: [
      { path: "/internal-use", label: "Staff / Internal Use", icon: UserCog },
      { path: "/settings", label: "Settings", icon: Settings },
    ],
  },
];

function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const location = useLocation();
  const { logout, user } = useAuth();

  return (
    <aside
      className="flex flex-col h-screen fixed left-0 top-0 z-40 transition-all duration-200"
      style={{
        width: collapsed ? 64 : 220,
        background: "var(--sidebar-bg)",
        borderRight: "1px solid var(--border-subtle)",
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-3 h-14" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "var(--accent-gold)" }}>
          <Eye className="w-5 h-5" style={{ color: "var(--canvas)" }} />
        </div>
        {!collapsed && (
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="font-bold text-sm whitespace-nowrap" style={{ color: "var(--text-primary)" }}>AlShifa</span>
            <span className="badge badge-gold text-[10px] px-2 py-0.5">ERP</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
        {navGroups.map((group) => (
          <div key={group.label} className="mb-4">
            {!collapsed && (
              <div className="px-3 mb-1 text-[10px] font-semibold tracking-wider" style={{ color: "var(--text-muted)" }}>
                {group.label}
              </div>
            )}
            {group.items.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`nav-item ${isActive ? "active" : ""} ${collapsed ? "justify-center px-0" : ""}`}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-2 py-2" style={{ borderTop: "1px solid var(--border-subtle)" }}>
        <button
          onClick={onToggle}
          className="nav-item w-full mb-1"
          style={{ justifyContent: collapsed ? "center" : undefined, padding: collapsed ? "0" : undefined }}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <>
            <ChevronLeft className="w-4 h-4" />
            <span>Collapse</span>
          </>}
        </button>
        <button
          onClick={logout}
          className="nav-item w-full"
          style={{ color: "var(--status-danger)", justifyContent: collapsed ? "center" : undefined, padding: collapsed ? "0" : undefined }}
        >
          <LogOut className="w-4 h-4" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}

function TopBar() {
  const { user } = useAuth();
  const now = new Date();
  const timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
  const dateStr = now.toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short", year: "numeric" });

  return (
    <header
      className="sticky top-0 z-30 flex items-center justify-between px-6 h-14"
      style={{
        background: "var(--canvas)",
        borderBottom: "1px solid var(--border-subtle)",
      }}
    >
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
          AlShifa Optical Store
        </h1>
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
          Admin Panel
        </span>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
          {dateStr} | {timeStr}
        </span>
        <div className="relative">
          <Bell className="w-4 h-4 cursor-pointer" style={{ color: "var(--text-secondary)" }} />
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full" style={{ background: "var(--accent-gold)" }} />
        </div>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold" style={{ background: "var(--accent-gold)", color: "var(--canvas)" }}>
            {user?.name?.charAt(0) || "U"}
          </div>
          <div className="hidden md:block">
            <div className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>{user?.name}</div>
            <div className="text-[10px] capitalize" style={{ color: "var(--text-muted)" }}>{user?.role?.replace("_", " ")}</div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen" style={{ background: "var(--canvas)" }}>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <div
        className="flex-1 flex flex-col min-h-screen transition-all duration-200"
        style={{ marginLeft: collapsed ? 64 : 220 }}
      >
        <TopBar />
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
