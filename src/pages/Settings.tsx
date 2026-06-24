import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { Settings as SettingsIcon, UserPlus, KeyRound, Store } from "lucide-react";

export default function Settings() {
  const { isAdmin, user } = useAuth();
  const [activeTab, setActiveTab] = useState<"users" | "password" | "store">("users");

  // User management
  const [userForm, setUserForm] = useState({ name: "", email: "", password: "", role: "receptionist" as const, phone: "" });
  const { data: users, refetch } = trpc.auth.listUsers.useQuery(undefined, { enabled: isAdmin });
  const createUser = trpc.auth.register.useMutation({ onSuccess: () => { setUserForm({ name: "", email: "", password: "", role: "receptionist", phone: "" }); refetch(); } });

  // Password change
  const [pwForm, setPwForm] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
  const changePw = trpc.auth.changePassword.useMutation({
    onSuccess: () => { setPwForm({ oldPassword: "", newPassword: "", confirmPassword: "" }); alert("Password changed successfully!"); },
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Settings</h1>
        <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>Manage users, security, and store settings</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
        {isAdmin && (
          <button onClick={() => setActiveTab("users")} className={`px-4 py-2 text-xs font-medium transition-colors ${activeTab === "users" ? "border-b-2" : ""}`} style={activeTab === "users" ? { color: "var(--accent-gold)", borderColor: "var(--accent-gold)" } : { color: "var(--text-secondary)" }}>
            <UserPlus className="w-3.5 h-3.5 inline mr-1" /> Users
          </button>
        )}
        <button onClick={() => setActiveTab("password")} className={`px-4 py-2 text-xs font-medium transition-colors ${activeTab === "password" ? "border-b-2" : ""}`} style={activeTab === "password" ? { color: "var(--accent-gold)", borderColor: "var(--accent-gold)" } : { color: "var(--text-secondary)" }}>
          <KeyRound className="w-3.5 h-3.5 inline mr-1" /> Change Password
        </button>
        <button onClick={() => setActiveTab("store")} className={`px-4 py-2 text-xs font-medium transition-colors ${activeTab === "store" ? "border-b-2" : ""}`} style={activeTab === "store" ? { color: "var(--accent-gold)", borderColor: "var(--accent-gold)" } : { color: "var(--text-secondary)" }}>
          <Store className="w-3.5 h-3.5 inline mr-1" /> Store Info
        </button>
      </div>

      {/* Users Tab */}
      {activeTab === "users" && isAdmin && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card-dark">
            <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Add New User</h3>
            <div className="space-y-3">
              <div><label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Name *</label><input value={userForm.name} onChange={(e) => setUserForm({ ...userForm, name: e.target.value })} className="form-input" /></div>
              <div><label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Email *</label><input type="email" value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} className="form-input" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Password *</label><input type="password" value={userForm.password} onChange={(e) => setUserForm({ ...userForm, password: e.target.value })} className="form-input" placeholder="Min 6 characters" /></div>
                <div><label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Role</label>
                  <select value={userForm.role} onChange={(e) => setUserForm({ ...userForm, role: e.target.value as typeof userForm.role })} className="form-input">
                    <option value="receptionist">Receptionist</option>
                    <option value="lab_tech">Lab Technician</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              <div><label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Phone</label><input value={userForm.phone} onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })} className="form-input" /></div>
              <button onClick={() => createUser.mutate(userForm)} disabled={!userForm.name || !userForm.email || !userForm.password || createUser.isPending} className="btn-primary w-full">
                {createUser.isPending ? "Creating..." : "Create User"}
              </button>
            </div>
          </div>

          <div className="card-dark">
            <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Existing Users</h3>
            <div className="space-y-2">
              {(users || []).map((u) => (
                <div key={u.id} className="flex items-center justify-between p-3 rounded-lg" style={{ background: "var(--surface-secondary)" }}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold" style={{ background: "var(--accent-gold)", color: "var(--canvas)" }}>
                      {u.name?.charAt(0)}
                    </div>
                    <div>
                      <div className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>{u.name}</div>
                      <div className="text-[11px]" style={{ color: "var(--text-muted)" }}>{u.email}</div>
                    </div>
                  </div>
                  <span className="badge badge-blue text-[10px] capitalize">{u.role?.replace("_", " ")}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Password Tab */}
      {activeTab === "password" && (
        <div className="card-dark max-w-md">
          <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Change Password</h3>
          <div className="space-y-3">
            <div><label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Current Password</label><input type="password" value={pwForm.oldPassword} onChange={(e) => setPwForm({ ...pwForm, oldPassword: e.target.value })} className="form-input" /></div>
            <div><label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>New Password</label><input type="password" value={pwForm.newPassword} onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })} className="form-input" placeholder="Min 6 characters" /></div>
            <div><label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Confirm New Password</label><input type="password" value={pwForm.confirmPassword} onChange={(e) => setPwForm({ ...pwForm, confirmPassword: e.target.value })} className="form-input" /></div>
            <button
              onClick={() => {
                if (pwForm.newPassword !== pwForm.confirmPassword) { alert("Passwords do not match"); return; }
                if (pwForm.newPassword.length < 6) { alert("Password must be at least 6 characters"); return; }
                changePw.mutate({ oldPassword: pwForm.oldPassword, newPassword: pwForm.newPassword });
              }}
              disabled={!pwForm.oldPassword || !pwForm.newPassword || !pwForm.confirmPassword || changePw.isPending}
              className="btn-primary w-full"
            >
              {changePw.isPending ? "Changing..." : "Change Password"}
            </button>
          </div>
        </div>
      )}

      {/* Store Info Tab */}
      {activeTab === "store" && (
        <div className="card-dark max-w-lg">
          <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Store Information</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-lg" style={{ background: "var(--surface-secondary)" }}>
              <Store className="w-5 h-5" style={{ color: "var(--accent-gold)" }} />
              <div>
                <div className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>AlShifa Optical Store</div>
                <div className="text-[11px]" style={{ color: "var(--text-muted)" }}>Eye Clinic & Optical Shop</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg" style={{ background: "var(--surface-secondary)" }}>
                <div style={{ color: "var(--text-muted)" }}>Address</div>
                <div className="font-medium mt-0.5" style={{ color: "var(--text-primary)" }}>Sheikh Fazal Road 187/Eb<br />Gaggoo Mandi</div>
              </div>
              <div className="p-3 rounded-lg" style={{ background: "var(--surface-secondary)" }}>
                <div style={{ color: "var(--text-muted)" }}>Phone</div>
                <div className="font-medium mt-0.5" style={{ color: "var(--text-primary)" }}>03087937614</div>
              </div>
              <div className="p-3 rounded-lg" style={{ background: "var(--surface-secondary)" }}>
                <div style={{ color: "var(--text-muted)" }}>Timings</div>
                <div className="font-medium mt-0.5" style={{ color: "var(--text-primary)" }}>9:00 AM - 10:00 PM</div>
              </div>
              <div className="p-3 rounded-lg" style={{ background: "var(--surface-secondary)" }}>
                <div style={{ color: "var(--text-muted)" }}>NTN</div>
                <div className="font-medium mt-0.5" style={{ color: "var(--text-primary)" }}>-</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
