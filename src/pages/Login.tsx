import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { Eye, EyeOff } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: (data) => {
      localStorage.setItem("alshifa_token", data.token);
      window.location.href = "/";
    },
    onError: (err) => {
      setError(err.message || "Invalid credentials");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }
    loginMutation.mutate({ email, password });
  };

  return (
    <div className="flex items-center justify-center min-h-screen" style={{ background: "var(--canvas)" }}>
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "var(--accent-gold)" }}>
            <Eye className="w-9 h-9" style={{ color: "var(--canvas)" }} />
          </div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>AlShifa Optical Store</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>ERP System</p>
        </div>

        {/* Login Form */}
        <div className="card-dark">
          <h2 className="text-base font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Sign In</h2>

          {error && (
            <div className="mb-4 p-3 rounded-lg text-sm" style={{ background: "var(--badge-red)", color: "var(--badge-red-text)" }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@alshifa.com"
                className="form-input"
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="form-input pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--text-muted)" }}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="btn-primary w-full h-10"
            >
              {loginMutation.isPending ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="mt-4 pt-4 text-center" style={{ borderTop: "1px solid var(--border-subtle)" }}>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Demo credentials:
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
              Admin: admin@alshifa.com / admin123
            </p>
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
              Reception: reception@alshifa.com / staff123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
