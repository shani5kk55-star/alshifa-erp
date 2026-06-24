import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { Eye, Plus, X } from "lucide-react";

export default function Prescriptions() {
  const [patientId, setPatientId] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    patientId: "", odSph: "", odCyl: "", odAxis: "", odAdd: "",
    osSph: "", osCyl: "", osAxis: "", osAdd: "", pd: "",
    lensType: "single_vision" as const, remarks: "", followUpDate: "",
  });

  const { data: prescriptions, isLoading } = trpc.prescription.list.useQuery(
    patientId ? { patientId: parseInt(patientId) } : undefined
  );
  const { data: patients } = trpc.patient.list.useQuery({ limit: 100 });
  const utils = trpc.useUtils();
  const createRx = trpc.prescription.create.useMutation({
    onSuccess: () => { setShowModal(false); utils.prescription.list.invalidate(); },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Prescriptions</h1>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>Manage eye prescriptions and Rx records</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary"><Plus className="w-4 h-4" /> New Prescription</button>
      </div>

      {/* Filter */}
      <div className="mb-4">
        <select
          value={patientId}
          onChange={(e) => setPatientId(e.target.value)}
          className="form-input max-w-xs"
        >
          <option value="">All Patients</option>
          {(patients?.items || []).map((p) => (
            <option key={p.id} value={p.id}>{p.name} ({p.patientCode})</option>
          ))}
        </select>
      </div>

      {/* Prescriptions Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-t-transparent" style={{ borderColor: "var(--accent-gold)" }} />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {(prescriptions || []).map((rx) => (
            <div key={rx.id} className="card-dark">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4" style={{ color: "var(--accent-gold)" }} />
                  <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{rx.patient?.name}</span>
                </div>
                <span className="badge badge-blue text-[10px]">{rx.lensType?.replace("_", " ")}</span>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-3">
                {/* OD */}
                <div className="p-2 rounded" style={{ background: "var(--surface-secondary)" }}>
                  <div className="text-[10px] font-semibold mb-1" style={{ color: "var(--accent-gold)" }}>RIGHT EYE (OD)</div>
                  <div className="text-xs" style={{ color: "var(--text-primary)" }}>
                    SPH: {rx.odSph || "-"} | CYL: {rx.odCyl || "-"}
                  </div>
                  <div className="text-xs" style={{ color: "var(--text-secondary)" }}>
                    Axis: {rx.odAxis || "-"} | Add: {rx.odAdd || "-"}
                  </div>
                </div>
                {/* OS */}
                <div className="p-2 rounded" style={{ background: "var(--surface-secondary)" }}>
                  <div className="text-[10px] font-semibold mb-1" style={{ color: "var(--accent-gold)" }}>LEFT EYE (OS)</div>
                  <div className="text-xs" style={{ color: "var(--text-primary)" }}>
                    SPH: {rx.osSph || "-"} | CYL: {rx.osCyl || "-"}
                  </div>
                  <div className="text-xs" style={{ color: "var(--text-secondary)" }}>
                    Axis: {rx.osAxis || "-"} | Add: {rx.osAdd || "-"}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 text-[11px]" style={{ color: "var(--text-muted)" }}>
                {rx.pd && <span>PD: {rx.pd}mm</span>}
                {rx.followUpDate && <span>Follow-up: {new Date(rx.followUpDate).toLocaleDateString()}</span>}
              </div>
              {rx.remarks && (
                <div className="text-[11px] mt-2 p-2 rounded" style={{ background: "var(--surface-secondary)", color: "var(--text-secondary)" }}>
                  {rx.remarks}
                </div>
              )}
            </div>
          ))}
          {(!prescriptions || prescriptions.length === 0) && (
            <div className="col-span-2 text-center py-12">
              <Eye className="w-10 h-10 mx-auto mb-2" style={{ color: "var(--text-muted)" }} />
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>No prescriptions found</p>
            </div>
          )}
        </div>
      )}

      {/* New Rx Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.6)" }}>
          <div className="card-dark w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>New Prescription</h3>
              <button onClick={() => setShowModal(false)}><X className="w-4 h-4" style={{ color: "var(--text-muted)" }} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Patient *</label>
                <select value={form.patientId} onChange={(e) => setForm({ ...form, patientId: e.target.value })} className="form-input">
                  <option value="">Select patient</option>
                  {(patients?.items || []).map((p) => (<option key={p.id} value={p.id}>{p.name}</option>))}
                </select>
              </div>

              {/* OD */}
              <div>
                <h4 className="text-xs font-semibold mb-2" style={{ color: "var(--accent-gold)" }}>Right Eye (OD)</h4>
                <div className="grid grid-cols-4 gap-2">
                  {["odSph", "odCyl", "odAxis", "odAdd"].map((field) => (
                    <div key={field}>
                      <label className="block text-[10px] mb-1 uppercase" style={{ color: "var(--text-muted)" }}>{field.replace("od", "")}</label>
                      <input value={(form as Record<string, string>)[field]} onChange={(e) => setForm({ ...form, [field]: e.target.value })} className="form-input" />
                    </div>
                  ))}
                </div>
              </div>

              {/* OS */}
              <div>
                <h4 className="text-xs font-semibold mb-2" style={{ color: "var(--accent-gold)" }}>Left Eye (OS)</h4>
                <div className="grid grid-cols-4 gap-2">
                  {["osSph", "osCyl", "osAxis", "osAdd"].map((field) => (
                    <div key={field}>
                      <label className="block text-[10px] mb-1 uppercase" style={{ color: "var(--text-muted)" }}>{field.replace("os", "")}</label>
                      <input value={(form as Record<string, string>)[field]} onChange={(e) => setForm({ ...form, [field]: e.target.value })} className="form-input" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>PD (mm)</label>
                  <input value={form.pd} onChange={(e) => setForm({ ...form, pd: e.target.value })} className="form-input" placeholder="62" />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Lens Type</label>
                  <select value={form.lensType} onChange={(e) => setForm({ ...form, lensType: e.target.value as typeof form.lensType })} className="form-input">
                    <option value="single_vision">Single Vision</option>
                    <option value="bifocal">Bifocal</option>
                    <option value="progressive">Progressive</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Follow-up Date</label>
                  <input type="date" value={form.followUpDate} onChange={(e) => setForm({ ...form, followUpDate: e.target.value })} className="form-input" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Remarks</label>
                <textarea value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} className="form-input" style={{ minHeight: 60, padding: 8 }} />
              </div>

              <button
                onClick={() => createRx.mutate({ patientId: parseInt(form.patientId), odSph: form.odSph, odCyl: form.odCyl, odAxis: form.odAxis ? parseInt(form.odAxis) : undefined, odAdd: form.odAdd, osSph: form.osSph, osCyl: form.osCyl, osAxis: form.osAxis ? parseInt(form.osAxis) : undefined, osAdd: form.osAdd, pd: form.pd, lensType: form.lensType, remarks: form.remarks, followUpDate: form.followUpDate })}
                disabled={!form.patientId || createRx.isPending}
                className="btn-primary w-full"
              >
                {createRx.isPending ? "Saving..." : "Save Prescription"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
