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
  const [patientList, setPatientList] = useState<Patient[]>([]);
  const [availableStaffList, setAvailableStaffList] = useState<Staff[]>([]);
  const [fetchingStaff, setFetchingStaff] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState<ScheduleFormData>({
    date: "",
    start_time: "",
    end_time: "",
    staff_id: "",
    patient_id: "",
    status: "booked",
    type: "consultation",
    notes: "",
  });

  const isEdit = !!schedule;

  // Load patients on open
  useEffect(() => {
    if (!open) return;
    fetch("/api/patients")
      .then((r) => r.json())
      .then((data) => setPatientList(Array.isArray(data) ? data : []))
      .catch(() => setPatientList([]));
  }, [open]);

  // Pre-fill form when editing
  useEffect(() => {
    if (!open) return;
    setErrors({});
    setAvailableStaffList([]);

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
        status: schedule.status || "booked",
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
        status: "booked",
        type: "consultation",
        notes: "",
      });
    }
  }, [open, schedule]);

  // Fetch available doctors when date + time are filled
  useEffect(() => {
    if (!form.date || !form.start_time || !form.end_time) {
      setAvailableStaffList([]);
      return;
    }

    setFetchingStaff(true);
    const params = new URLSearchParams({
      date: form.date,
      start_time: form.start_time,
      end_time: form.end_time,
    });
    if (schedule?.id) {
      params.set("exclude_schedule_id", schedule.id);
    }

    fetch(`/api/staff/available?${params}`)
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setAvailableStaffList(list);

        // If current selected doctor is not in the available list, keep them anyway (edit mode)
        if (isEdit && form.staff_id && !list.find((s: Staff) => s.id === form.staff_id)) {
          // The API already excludes the current schedule, so this handles stale state
        }
      })
      .catch(() => setAvailableStaffList([]))
      .finally(() => setFetchingStaff(false));
  }, [form.date, form.start_time, form.end_time, schedule?.id, isEdit]);

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!form.date) errs.date = "Date is required";
    if (!form.start_time) errs.start_time = "Start time is required";
    if (!form.end_time) errs.end_time = "End time is required";
    if (!form.staff_id) errs.staff_id = "Doctor is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);

    // Build payload — auto-derive status on create
    const isCancel = isEdit && form.status === "available";
    const payload = {
      date: form.date,
      start_time: form.start_time,
      end_time: form.end_time,
      staff_id: form.staff_id,
      patient_id: isCancel ? null : (form.patient_id || null),
      status: isEdit ? form.status : (form.patient_id ? "booked" : "available"),
      type: form.type,
      notes: form.notes,
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

  function handleFormChange(updates: Partial<ScheduleFormData>) {
    const updated = { ...form, ...updates };
    // Clear staff selection when date/time changes
    if ("date" in updates || "start_time" in updates || "end_time" in updates) {
      if (!isEdit) {
        updated.staff_id = "";
      }
    }
    setForm(updated);
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
                onChange={(e) => handleFormChange({ date: e.target.value })}
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
                    handleFormChange({ start_time: e.target.value })
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
                    handleFormChange({ end_time: e.target.value })
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
              {!form.date || !form.start_time || !form.end_time ? (
                <p className="text-sm text-muted-foreground py-2">
                  Select date and time to see available doctors
                </p>
              ) : fetchingStaff ? (
                <div className="flex items-center gap-2 py-2 text-sm text-muted-foreground">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  Loading available doctors...
                </div>
              ) : (
                <select
                  value={form.staff_id}
                  onChange={(e) =>
                    handleFormChange({ staff_id: e.target.value })
                  }
                  className={`w-full rounded-md border bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary ${
                    errors.staff_id ? "border-destructive" : "border-input"
                  }`}
                >
                  <option value="">Select doctor...</option>
                  {availableStaffList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.role})
                    </option>
                  ))}
                </select>
              )}
              {availableStaffList.length === 0 &&
                form.date &&
                form.start_time &&
                form.end_time &&
                !fetchingStaff && (
                  <p className="mt-1 text-xs text-amber-600">
                    No doctors available at this time
                  </p>
                )}
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
                  handleFormChange({ patient_id: e.target.value })
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

            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Type
              </label>
              <select
                value={form.type}
                onChange={(e) => handleFormChange({ type: e.target.value })}
                className="w-full rounded-md border border-input bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
              >
                <option value="consultation">Consultation</option>
                <option value="follow_up">Follow Up</option>
                <option value="procedure">Procedure</option>
              </select>
            </div>

            {/* Status — edit mode only */}
            {isEdit && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Status
                </label>
                <select
                  value={form.status}
                  onChange={(e) =>
                    handleFormChange({ status: e.target.value })
                  }
                  className="w-full rounded-md border border-input bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
                >
                  <option value="booked">Booked</option>
                  <option value="completed">Mark as Completed</option>
                  <option value="available">Cancel Booking</option>
                </select>
                {form.status === "available" && (
                  <p className="mt-1 text-xs text-amber-600">
                    This will release the slot — patient will be removed and
                    status set to available.
                  </p>
                )}
              </div>
            )}

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Notes
              </label>
              <textarea
                value={form.notes}
                onChange={(e) =>
                  handleFormChange({ notes: e.target.value })
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
