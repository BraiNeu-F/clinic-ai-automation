"use client";

import { useEffect, useState, useMemo } from "react";
import { Search, Plus, Pencil, Trash2, Calendar } from "lucide-react";
import { ScheduleForm } from "./schedule-form";

interface ScheduleItem {
  id: string;
  staff_id: string;
  patient_id: string | null;
  date: string;
  start_time: string;
  end_time: string;
  status: "available" | "booked" | "completed" | "cancelled";
  type: "consultation" | "follow_up" | "procedure";
  notes: string | null;
  staff: { name: string; role: string };
  patients: { name: string } | null;
}

const statusBadgeClasses: Record<string, string> = {
  available: "bg-green-100 text-green-800",
  booked: "bg-blue-100 text-blue-800",
  completed: "bg-gray-100 text-gray-800",
  cancelled: "bg-red-100 text-red-800",
};

const statusLabels: Record<string, string> = {
  available: "Available",
  booked: "Booked",
  completed: "Completed",
  cancelled: "Cancelled",
};

const typeLabels: Record<string, string> = {
  consultation: "Consultation",
  follow_up: "Follow Up",
  procedure: "Procedure",
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatTime(timeStr: string): string {
  return timeStr.substring(0, 5);
}

export function ScheduleTable() {
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ScheduleItem | null>(
    null
  );
  const [deleteTarget, setDeleteTarget] = useState<ScheduleItem | null>(null);

  function fetchSchedules() {
    setLoading(true);
    fetch("/api/schedules")
      .then((res) => res.json())
      .then((data) => {
        setSchedules(Array.isArray(data) ? data : []);
      })
      .catch(() => setSchedules([]))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchSchedules();
  }, []);

  const filtered = useMemo(() => {
    if (!dateFilter) return schedules;
    return schedules.filter((s) => s.date === dateFilter);
  }, [schedules, dateFilter]);

  function handleAdd() {
    setEditingSchedule(null);
    setFormOpen(true);
  }

  function handleEdit(schedule: ScheduleItem) {
    setEditingSchedule(schedule);
    setFormOpen(true);
  }

  function handleDelete(schedule: ScheduleItem) {
    setDeleteTarget(schedule);
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    fetch(`/api/schedules/${deleteTarget.id}`, { method: "DELETE" })
      .then(() => {
        setDeleteTarget(null);
        fetchSchedules();
      })
      .catch(() => setDeleteTarget(null));
  }

  function handleFormSaved() {
    setFormOpen(false);
    setEditingSchedule(null);
    fetchSchedules();
  }

  function handleFormClose() {
    setFormOpen(false);
    setEditingSchedule(null);
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Date filter */}
        <div className="relative flex-1 max-w-xs">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full rounded-md border border-input bg-white pl-10 pr-3 py-2 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
          />
          {dateFilter && (
            <button
              onClick={() => setDateFilter("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              &times;
            </button>
          )}
        </div>

        {/* Add button */}
        <button
          onClick={handleAdd}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Schedule
        </button>
      </div>

      {/* Table - Desktop */}
      <div className="hidden sm:block rounded-lg border bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Date
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Time
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Doctor/Nurse
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Patient
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Type
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Status
                </th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-12 text-center text-muted-foreground"
                  >
                    <Search className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                    No schedules found
                  </td>
                </tr>
              ) : (
                filtered.map((s) => (
                  <tr key={s.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium whitespace-nowrap">
                      {formatDate(s.date)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                      {formatTime(s.start_time)} – {formatTime(s.end_time)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-medium">{s.staff.name}</div>
                      <div className="text-xs text-muted-foreground capitalize">
                        {s.staff.role}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {s.patients ? s.patients.name : "—"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {typeLabels[s.type] || s.type}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          statusBadgeClasses[s.status] || "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {statusLabels[s.status] || s.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => handleEdit(s)}
                          className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(s)}
                          className="rounded-md p-1.5 text-muted-foreground hover:bg-red-50 hover:text-destructive transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cards - Mobile */}
      <div className="sm:hidden space-y-3">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-lg border bg-white py-12 text-center text-muted-foreground">
            <Search className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
            No schedules found
          </div>
        ) : (
          filtered.map((s) => (
            <div
              key={s.id}
              className="rounded-lg border bg-white p-4 space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-medium">{formatDate(s.date)}</div>
                  <div className="text-xs text-muted-foreground">
                    {formatTime(s.start_time)} – {formatTime(s.end_time)}
                  </div>
                </div>
                <span
                  className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    statusBadgeClasses[s.status] || "bg-gray-100 text-gray-800"
                  }`}
                >
                  {statusLabels[s.status] || s.status}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <div className="text-xs text-muted-foreground">Doctor/Nurse</div>
                  <div className="font-medium">{s.staff.name}</div>
                  <div className="text-xs text-muted-foreground capitalize">
                    {s.staff.role}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Patient</div>
                  <div>{s.patients ? s.patients.name : "—"}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Type</div>
                  <div>{typeLabels[s.type] || s.type}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2 border-t">
                <button
                  onClick={() => handleEdit(s)}
                  className="inline-flex items-center gap-1.5 rounded-md border border-input bg-white px-3 py-1.5 text-xs font-medium hover:bg-muted transition-colors"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(s)}
                  className="inline-flex items-center gap-1.5 rounded-md border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-destructive hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Schedule Form Dialog */}
      <ScheduleForm
        open={formOpen}
        onClose={handleFormClose}
        schedule={editingSchedule}
        onSaved={handleFormSaved}
      />

      {/* Delete Confirmation Dialog */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setDeleteTarget(null)}
          />
          <div className="relative z-10 w-full max-w-sm mx-4 rounded-lg bg-white shadow-xl p-6">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Delete Schedule
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              Are you sure you want to delete this schedule? This action cannot
              be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="rounded-md border border-input bg-white px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
