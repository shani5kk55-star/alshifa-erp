import { Routes, Route, Navigate } from "react-router";
import { BrowserRouter } from "react-router";
import { TRPCProvider } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import POS from "./pages/POS";
import Patients from "./pages/Patients";
import Appointments from "./pages/Appointments";
import Prescriptions from "./pages/Prescriptions";
import Products from "./pages/Products";
import StockAlerts from "./pages/StockAlerts";
import SalesHistory from "./pages/SalesHistory";
import Suppliers from "./pages/Suppliers";
import Reports from "./pages/Reports";
import InternalUse from "./pages/InternalUse";
import Settings from "./pages/Settings";
import AppLayout from "./components/AppLayout";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ background: "var(--canvas)" }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-t-transparent mx-auto mb-4" style={{ borderColor: "var(--accent-gold)", borderTopColor: "transparent" }} />
          <p style={{ color: "var(--text-secondary)" }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAdmin, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ background: "var(--canvas)" }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-t-transparent mx-auto mb-4" style={{ borderColor: "var(--accent-gold)", borderTopColor: "transparent" }} />
          <p style={{ color: "var(--text-secondary)" }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <TRPCProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Dashboard />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/pos"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <POS />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/patients"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Patients />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/appointments"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Appointments />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/prescriptions"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Prescriptions />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/products"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Products />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/stock-alerts"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <StockAlerts />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/sales"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <SalesHistory />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/suppliers"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Suppliers />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <AdminRoute>
                <AppLayout>
                  <Reports />
                </AppLayout>
              </AdminRoute>
            }
          />
          <Route
            path="/internal-use"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <InternalUse />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <AdminRoute>
                <AppLayout>
                  <Settings />
                </AppLayout>
              </AdminRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TRPCProvider>
  );
}
