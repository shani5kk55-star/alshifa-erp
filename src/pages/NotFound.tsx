import { Link } from "react-router";
import { Home, AlertTriangle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen" style={{ background: "var(--canvas)" }}>
      <div className="text-center">
        <AlertTriangle className="w-12 h-12 mx-auto mb-4" style={{ color: "var(--accent-gold)" }} />
        <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>404</h1>
        <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>Page not found</p>
        <Link to="/" className="btn-primary inline-flex items-center gap-2">
          <Home className="w-4 h-4" /> Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
