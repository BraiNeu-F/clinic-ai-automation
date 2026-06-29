"use client";

import { useEffect, useState, FormEvent } from "react";
import { X } from "lucide-react";

interface Staff {
  id: string;
  name: string;
  role: string;
}

interface Patient {
  id: string;
  name: string;
}

interface ScheduleFormData {
  date: string;
  start_time: string;
  end_time: string;
  staff_id: string;
  patient_id: string;
  status: string;
  type: string;
  notes: string;
}

interface ScheduleFormProps {
  open: boolean;
  onClose: () => void;
  schedule?: any;
  onSaved: () => void;
}

export function ScheduleForm({
  open,
  onClose,
  schedule,
  onSaved,
}: ScheduleFormProps) {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [patientList, setPatientList] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState<ScheduleFormData>({
    date: "",
    start_time: "",
    end_time: "",
    staff_id: "",
    patient_id: "",
    status: "available",
    type: "consultation",
    notes: "",
  });

  const isEdit = !!schedule;

  useEffect(() => {
    if (!open) return;

    setLoading(true);
    setErrors({});

    Promise.all([
      fetch("/api/staff").then((r) => r.json()),
      fetch("/api/patients").then((r) => r.json()),
    ])
      .then(([staffData, patientData]) => {
        setStaffList(Array.isArray(staffData) ? staffData : []);
        setPatientList(Array.isArray(patientData) ? patientData : []);
      })
      .catch(() => {
        setStaffList([]);
        setPatientList([]);
      })
      .finally(() => setLoading(false));

    if (schedule) {
      setForm({
        date: schedule.date || "",
        start_time: schedule.start_time
          ? schedule.start_time.substring(0, 5)
          : "",
        end_time: schedule.end_time
          ? schedule.end_time.substring(0, 5)
          : "",
        staff_id: schedule.staff_id || "",
        patient_id: schedule.patient_id || "",
        status: schedule.status || "available",
        type: schedule.type || "consultation",
        notes: schedule.notes || "",
      });
    } else {
      setForm({
        date: "",
        start_time: "",
        end_time: "",
        staff_id: "",
        patient_id: "",
        status: "available",
        type: "consultation",
        notes: "",
      });
    }
  }, [open, schedule]);

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!form.date) errs.date = "Date is required";
    if (!form.start_time) errs.start_time = "Start time is required";
    if (!form.end_time) errs.end_time = "End time is required";
    if (!form.staff_id) errs.staff_id = "Staff is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);

    const payload = {
      ...form,
      patient_id: form.patient_id || null,
    };

    try {
      const url = isEdit ? `/api/schedules/${schedule.id}` : "/api/schedules";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        setErrors({ form: data.error || "Something went wrong" });
        return;
      }

      onSaved();
    } catch {
      setErrors({ form: "Network error. Please try again." });
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Card */}
      <div className="relative z-10 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto rounded-lg bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-lg font-semibold text-foreground">
            {isEdit ? "Edit Schedule" : "Add Schedule"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {errors.form && (
              <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {errors.form}
              </div>
            )}

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Date <span className="text-destructive">*</span>
              </label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className={`w-full rounded-md border bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary ${
                  errors.date ? "border-destructive" : "border-input"
                }`}
              />
              {errors.date && (
                <p className="mt-1 text-xs text-destructive">{errors.date}</p>
              )}
            </div>

            {/* Start Time & End Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Start Time <span className="text-destructive">*</span>
                </label>
                <input
                  type="time"
                  value={form.start_time}
                  onChange={(e) =>
                    setForm({ ...form, start_time: e.target.value })
                  }
                  className={`w-full rounded-md border bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary ${
                    errors.start_time ? "border-destructive" : "border-input"
                  }`}
                />
                {errors.start_time && (
                  <p className="mt-1 text-xs text-destructive">
                    {errors.start_time}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  End Time <span className="text-destructive">*</span>
                </label>
                <input
                  type="time"
                  value={form.end_time}
                  onChange={(e) =>
                    setForm({ ...form, end_time: e.target.value })
                  }
                  className={`w-full rounded-md border bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary ${
                    errors.end_time ? "border-destructive" : "border-input"
                  }`}
                />
                {errors.end_time && (
                  <p className="mt-1 text-xs text-destructive">
                    {errors.end_time}
                  </p>
                )}
              </div>
            </div>

            {/* Staff */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Doctor/Nurse <span className="text-destructive">*</span>
              </label>
              <select
                value={form.staff_id}
                onChange={(e) =>
                  setForm({ ...form, staff_id: e.target.value })
                }
                className={`w-full rounded-md border bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary ${
                  errors.staff_id ? "border-destructive" : "border-input"
                }`}
              >
                <option value="">Select staff...</option>
                {staffList.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.role})
                  </option>
                ))}
              </select>
              {errors.staff_id && (
                <p className="mt-1 text-xs text-destructive">
                  {errors.staff_id}
                </p>
              )}
            </div>

            {/* Patient */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Patient
              </label>
              <select
                value={form.patient_id}
                onChange={(e) =>
                  setForm({ ...form, patient_id: e.target.value })
                }
                className="w-full rounded-md border border-input bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
              >
                <option value="">No Patient</option>
                {patientList.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status & Type */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Status
                </label>
                <select
                  value={form.status}
                  onChange={(e) =>
                    setForm({ ...form, status: e.target.value })
                  }
                  className="w-full rounded-md border border-input bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
                >
                  <option value="available">Available</option>
                  <option value="booked">Booked</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Type
                </label>
                <select
                  value={form.type}
                  onChange={(e) =>
                    setForm({ ...form, type: e.target.value })
                  }
                  className="w-full rounded-md border border-input bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
                >
                  <option value="consultation">Consultation</option>
                  <option value="follow_up">Follow Up</option>
                  <option value="procedure">Procedure</option>
                </select>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Notes
              </label>
              <textarea
                value={form.notes}
                onChange={(e) =>
                  setForm({ ...form, notes: e.target.value })
                }
                rows={3}
                className="w-full rounded-md border border-input bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 border-t pt-4">
              <button
                type="button"
                onClick={onClose}
                className="rounded-md border border-input bg-white px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
              >
                {submitting && (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                )}
                {isEdit ? "Save Changes" : "Add Schedule"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
