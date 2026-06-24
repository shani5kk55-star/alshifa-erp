import { useState } from "react";
import { trpc } from "@/providers/trpc";
import {
  Search,
  Plus,
  Eye,
  Pencil,
  ClipboardList,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function Patients() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedPatient, setSelectedPatient] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState<number | null>(null);
  const [form, setForm] = useState({
    name: "", phone: "", email: "", age: "", gender: "male" as const,
    address: "", allergies: "", medicalHistory: "", medications: "", notes: "",
  });

  const { data, isLoading, refetch } = trpc.patient.list.useQuery({ search: search || undefined, page, limit: 25 });
  const { data: patientDetail } = trpc.patient.getById.useQuery(
    { id: selectedPatient! },
    { enabled: !!selectedPatient }
  );
  const { data: history } = trpc.patient.getHistory.useQuery(
    { id: selectedPatient! },
    { enabled: !!selectedPatient }
  );

  const utils = trpc.useUtils();
  const createPatient = trpc.patient.create.useMutation({
    onSuccess: () => { setShowModal(false); resetForm(); refetch(); },
  });
  const updatePatient = trpc.patient.update.useMutation({
    onSuccess: () => { setShowModal(false); setEditingPatient(null); resetForm(); refetch(); },
  });

  const resetForm = () => {
    setForm({ name: "", phone: "", email: "", age: "", gender: "male", address: "", allergies: "", medicalHistory: "", medications: "", notes: "" });
  };

  const openEdit = (patient: typeof patientDetail) => {
    if (!patient) return;
    setEditingPatient(patient.id);
    setForm({
      name: patient.name,
      phone: patient.phone,
      email: patient.email || "",
      age: patient.age?.toString() || "",
      gender: (patient.gender as "male" | "female" | "other") || "male",
      address: patient.address || "",
      allergies: patient.allergies || "",
      medicalHistory: patient.medicalHistory || "",
      medications: patient.medications || "",
      notes: patient.notes || "",
    });
    setShowModal(true);
  };

  const handleSubmit = () => {
    if (editingPatient) {
      updatePatient.mutate({ id: editingPatient, ...form, age: form.age ? parseInt(form.age) : undefined });
    } else {
      createPatient.mutate({ ...form, age: form.age ? parseInt(form.age) : undefined });
    }
  };

  const totalPages = Math.ceil((data?.total || 0) / 25);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Patient Registry</h1>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>Manage patient records and medical history</p>
        </div>
        <button onClick={() => { resetForm(); setEditingPatient(null); setShowModal(true); }} className="btn-primary">
          <Plus className="w-4 h-4" /> Add Patient
        </button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-muted)" }} />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name, phone, or patient code"
            className="form-input pl-9"
          />
        </div>
      </div>

      {/* Patient Table */}
      <div className="table-container">
        <table className="w-full">
          <thead>
            <tr style={{ background: "var(--table-header-bg)" }}>
              <th className="text-left text-[11px] font-semibold uppercase tracking-wider p-3">Code</th>
              <th className="text-left text-[11px] font-semibold uppercase tracking-wider p-3">Name</th>
              <th className="text-left text-[11px] font-semibold uppercase tracking-wider p-3">Phone</th>
              <th className="text-left text-[11px] font-semibold uppercase tracking-wider p-3">Age</th>
              <th className="text-left text-[11px] font-semibold uppercase tracking-wider p-3">Gender</th>
              <th className="text-left text-[11px] font-semibold uppercase tracking-wider p-3">Visits</th>
              <th className="text-left text-[11px] font-semibold uppercase tracking-wider p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(data?.items || []).map((patient) => (
              <tr
                key={patient.id}
                className="transition-colors cursor-pointer"
                style={{ borderBottom: "1px solid var(--border-subtle)" }}
                onClick={() => setSelectedPatient(patient.id)}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--table-row-hover)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <td className="p-3 text-xs font-medium" style={{ color: "var(--accent-gold)" }}>{patient.patientCode}</td>
                <td className="p-3 text-xs" style={{ color: "var(--text-primary)" }}>{patient.name}</td>
                <td className="p-3 text-xs" style={{ color: "var(--text-secondary)" }}>{patient.phone}</td>
                <td className="p-3 text-xs" style={{ color: "var(--text-secondary)" }}>{patient.age || "-"}</td>
                <td className="p-3">
                  <span className="badge badge-blue text-[10px] capitalize">{patient.gender || "-"}</span>
                </td>
                <td className="p-3 text-xs" style={{ color: "var(--text-secondary)" }}>{patient.totalVisits}</td>
                <td className="p-3">
                  <div className="flex items-center gap-1">
                    <button onClick={(e) => { e.stopPropagation(); setSelectedPatient(patient.id); }} className="p-1.5 rounded hover:bg-white/5">
                      <Eye className="w-3.5 h-3.5" style={{ color: "var(--text-muted)" }} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); openEdit(patient); }} className="p-1.5 rounded hover:bg-white/5">
                      <Pencil className="w-3.5 h-3.5" style={{ color: "var(--text-muted)" }} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {(!data?.items || data.items.length === 0) && (
              <tr>
                <td colSpan={7} className="p-8 text-center text-xs" style={{ color: "var(--text-muted)" }}>
                  No patients found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>Page {page} of {totalPages}</span>
          <div className="flex gap-2">
            <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="btn-secondary btn-sm"><ChevronLeft className="w-3 h-3" /></button>
            <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="btn-secondary btn-sm"><ChevronRight className="w-3 h-3" /></button>
          </div>
        </div>
      )}

      {/* Patient Detail Modal */}
      {selectedPatient && patientDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.6)" }}>
          <div className="card-dark w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>{patientDetail.name}</h3>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>{patientDetail.patientCode} | {patientDetail.phone}</p>
              </div>
              <button onClick={() => setSelectedPatient(null)}><X className="w-4 h-4" style={{ color: "var(--text-muted)" }} /></button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4 text-xs">
              <div className="p-3 rounded-lg" style={{ background: "var(--surface-secondary)" }}>
                <div style={{ color: "var(--text-muted)" }}>Age</div>
                <div className="font-medium" style={{ color: "var(--text-primary)" }}>{patientDetail.age || "-"}</div>
              </div>
              <div className="p-3 rounded-lg" style={{ background: "var(--surface-secondary)" }}>
                <div style={{ color: "var(--text-muted)" }}>Gender</div>
                <div className="font-medium capitalize" style={{ color: "var(--text-primary)" }}>{patientDetail.gender || "-"}</div>
              </div>
              <div className="p-3 rounded-lg" style={{ background: "var(--surface-secondary)" }}>
                <div style={{ color: "var(--text-muted)" }}>Address</div>
                <div className="font-medium" style={{ color: "var(--text-primary)" }}>{patientDetail.address || "-"}</div>
              </div>
              <div className="p-3 rounded-lg" style={{ background: "var(--surface-secondary)" }}>
                <div style={{ color: "var(--text-muted)" }}>Allergies</div>
                <div className="font-medium" style={{ color: "var(--text-primary)" }}>{patientDetail.allergies || "None"}</div>
              </div>
            </div>

            {/* Prescriptions */}
            <h4 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>Prescription History</h4>
            <div className="space-y-2 mb-4">
              {(history?.prescriptions || []).length === 0 && <p className="text-xs" style={{ color: "var(--text-muted)" }}>No prescriptions</p>}
              {(history?.prescriptions || []).map((rx) => (
                <div key={rx.id} className="p-3 rounded-lg" style={{ background: "var(--surface-secondary)" }}>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span style={{ color: "var(--accent-gold)" }}>OD:</span>{" "}
                      <span style={{ color: "var(--text-primary)" }}>S{rx.odSph} C{rx.odCyl} A{rx.odAxis} {rx.odAdd ? `Add ${rx.odAdd}` : ""}</span>
                    </div>
                    <div>
                      <span style={{ color: "var(--accent-gold)" }}>OS:</span>{" "}
                      <span style={{ color: "var(--text-primary)" }}>S{rx.osSph} C{rx.osCyl} A{rx.osAxis} {rx.osAdd ? `Add ${rx.osAdd}` : ""}</span>
                    </div>
                  </div>
                  {rx.pd && <div className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>PD: {rx.pd}mm | {rx.lensType}</div>}
                  {rx.remarks && <div className="text-[11px] mt-1" style={{ color: "var(--text-muted)" }}>{rx.remarks}</div>}
                </div>
              ))}
            </div>

            {/* Sales History */}
            <h4 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>Purchase History</h4>
            <div className="space-y-2">
              {(history?.sales || []).length === 0 && <p className="text-xs" style={{ color: "var(--text-muted)" }}>No purchases</p>}
              {(history?.sales || []).map((sale) => (
                <div key={sale.id} className="flex items-center justify-between p-2 rounded" style={{ background: "var(--surface-secondary)" }}>
                  <div className="text-xs" style={{ color: "var(--text-primary)" }}>{sale.invoiceNumber}</div>
                  <div className="text-xs font-semibold" style={{ color: "var(--accent-gold)" }}>Rs. {Number(sale.grandTotal).toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.6)" }}>
          <div className="card-dark w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{editingPatient ? "Edit Patient" : "New Patient"}</h3>
              <button onClick={() => setShowModal(false)}><X className="w-4 h-4" style={{ color: "var(--text-muted)" }} /></button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Name *</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="form-input" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Phone *</label>
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="form-input" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Email</label>
                <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="form-input" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Age</label>
                <input value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} className="form-input" type="number" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Gender</label>
                <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value as "male" | "female" | "other" })} className="form-input">
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Address</label>
                <textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="form-input" style={{ minHeight: 50, padding: 8 }} />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Allergies</label>
                <input value={form.allergies} onChange={(e) => setForm({ ...form, allergies: e.target.value })} className="form-input" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Medical History</label>
                <textarea value={form.medicalHistory} onChange={(e) => setForm({ ...form, medicalHistory: e.target.value })} className="form-input" style={{ minHeight: 50, padding: 8 }} />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Notes</label>
                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="form-input" style={{ minHeight: 50, padding: 8 }} />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
              <button
                onClick={handleSubmit}
                disabled={!form.name || !form.phone || createPatient.isPending || updatePatient.isPending}
                className="btn-primary"
              >
                {createPatient.isPending || updatePatient.isPending ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
