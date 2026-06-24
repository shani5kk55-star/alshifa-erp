import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, addMonths, subMonths } from "date-fns";
import { ChevronLeft, ChevronRight, Plus, X, Check, Clock } from "lucide-react";

const typeColors: Record<string, string> = {
  eye_test: "var(--badge-blue-text)",
  follow_up: "var(--badge-gold-text)",
  frame_fitting: "var(--badge-green-text)",
  lens_fitting: "var(--status-info)",
  delivery: "var(--status-warning)",
  consultation: "var(--status-purple)",
};

const typeLabels: Record<string, string> = {
  eye_test: "Eye Test",
  follow_up: "Follow-up",
  frame_fitting: "Frame Fitting",
  lens_fitting: "Lens Fitting",
  delivery: "Delivery",
  consultation: "Consultation",
};

export default function Appointments() {
  const [currentMonth, setCurrentMonth] = useState(new Date("2026-06-24"));
  const [selectedDate, setSelectedDate] = useState<string>("2026-06-24");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ patientId: "", date: "", time: "", type: "eye_test" as const, notes: "" });

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const { data: monthAppointments } = trpc.appointment.list.useQuery({
    month: currentMonth.getMonth() + 1,
    year: currentMonth.getFullYear(),
  });

  const { data: dayAppointments } = trpc.appointment.getByDate.useQuery(
    { date: selectedDate },
    { enabled: !!selectedDate }
  );

  const { data: patients } = trpc.patient.list.useQuery({ limit: 100 });
  const utils = trpc.useUtils();

  const createApt = trpc.appointment.create.useMutation({
    onSuccess: () => { setShowModal(false); utils.appointment.list.invalidate(); utils.appointment.getByDate.invalidate(); },
  });

  const updateStatus = trpc.appointment.updateStatus.useMutation({
    onSuccess: () => { utils.appointment.getByDate.invalidate(); },
  });

  const getAppointmentsForDay = (day: Date) => {
    const dateStr = format(day, "yyyy-MM-dd");
    return (monthAppointments || []).filter((a) => format(new Date(a.appointmentDate), "yyyy-MM-dd") === dateStr);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Appointments</h1>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>Schedule and manage patient appointments</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary"><Plus className="w-4 h-4" /> New Appointment</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Calendar */}
        <div className="lg:col-span-2 card-dark">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              {format(currentMonth, "MMMM yyyy")}
            </h2>
            <div className="flex gap-1">
              <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="btn-secondary btn-sm"><ChevronLeft className="w-3 h-3" /></button>
              <button onClick={() => setCurrentMonth(new Date("2026-06-24"))} className="btn-secondary btn-sm" style={{ fontSize: 11 }}>Today</button>
              <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="btn-secondary btn-sm"><ChevronRight className="w-3 h-3" /></button>
            </div>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d} className="text-center text-[10px] font-semibold uppercase py-1" style={{ color: "var(--text-muted)" }}>{d}</div>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: monthStart.getDay() }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {days.map((day) => {
              const dayApts = getAppointmentsForDay(day);
              const isSelected = format(day, "yyyy-MM-dd") === selectedDate;
              const isTodayDate = isToday(day);
              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDate(format(day, "yyyy-MM-dd"))}
                  className="aspect-square rounded-lg p-1 flex flex-col items-center justify-start transition-colors relative"
                  style={{
                    background: isSelected ? "var(--accent-gold-muted)" : isTodayDate ? "var(--surface-secondary)" : "transparent",
                    border: isSelected ? "1px solid var(--accent-gold)" : "1px solid transparent",
                  }}
                >
                  <span className={`text-xs font-medium ${isTodayDate ? "text-[var(--accent-gold)]" : "text-[var(--text-primary)]"}`}>
                    {format(day, "d")}
                  </span>
                  {dayApts.length > 0 && (
                    <div className="flex gap-0.5 mt-1 flex-wrap justify-center">
                      {dayApts.slice(0, 3).map((a, i) => (
                        <div key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: typeColors[a.type] || "var(--text-muted)" }} />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Day List */}
        <div className="card-dark">
          <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
            {selectedDate ? format(new Date(selectedDate), "EEEE, MMM d") : "Select a date"}
          </h3>
          <div className="space-y-2">
            {(dayAppointments || []).length === 0 && (
              <p className="text-xs text-center py-8" style={{ color: "var(--text-muted)" }}>No appointments for this day</p>
            )}
            {(dayAppointments || []).map((apt) => (
              <div key={apt.id} className="p-3 rounded-lg" style={{ background: "var(--surface-secondary)" }}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3" style={{ color: "var(--accent-gold)" }} />
                    <span className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>{apt.appointmentTime?.slice(0, 5)}</span>
                  </div>
                  <span className="badge text-[10px]" style={{ background: `${typeColors[apt.type]}22`, color: typeColors[apt.type] }}>
                    {typeLabels[apt.type]}
                  </span>
                </div>
                <div className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>{apt.patient?.name}</div>
                {apt.notes && <div className="text-[11px] mt-0.5" style={{ color: "var(--text-muted)" }}>{apt.notes}</div>}
                <div className="flex gap-1 mt-2">
                  {apt.status === "scheduled" && (
                    <>
                      <button onClick={() => updateStatus.mutate({ id: apt.id, status: "in_progress" })} className="btn-sm btn-primary" style={{ fontSize: 10, height: 24 }}>Start</button>
                      <button onClick={() => updateStatus.mutate({ id: apt.id, status: "cancelled" })} className="btn-sm btn-secondary" style={{ fontSize: 10, height: 24 }}>Cancel</button>
                    </>
                  )}
                  {apt.status === "in_progress" && (
                    <button onClick={() => updateStatus.mutate({ id: apt.id, status: "completed" })} className="btn-sm btn-primary" style={{ fontSize: 10, height: 24 }}>Complete</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* New Appointment Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.6)" }}>
          <div className="card-dark w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>New Appointment</h3>
              <button onClick={() => setShowModal(false)}><X className="w-4 h-4" style={{ color: "var(--text-muted)" }} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Patient *</label>
                <select value={form.patientId} onChange={(e) => setForm({ ...form, patientId: e.target.value })} className="form-input">
                  <option value="">Select patient</option>
                  {(patients?.items || []).map((p) => (
                    <option key={p.id} value={p.id}>{p.name} ({p.phone})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Date *</label>
                  <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="form-input" />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Time *</label>
                  <input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} className="form-input" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Type</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as typeof form.type })} className="form-input">
                  {Object.entries(typeLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Notes</label>
                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="form-input" style={{ minHeight: 60, padding: 8 }} />
              </div>
              <button
                onClick={() => createApt.mutate({ patientId: parseInt(form.patientId), date: form.date, time: form.time, type: form.type, notes: form.notes })}
                disabled={!form.patientId || !form.date || !form.time || createApt.isPending}
                className="btn-primary w-full"
              >
                {createApt.isPending ? "Creating..." : "Create Appointment"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
