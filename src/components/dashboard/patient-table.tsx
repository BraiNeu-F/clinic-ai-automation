"use client";

import { useState, useEffect, useCallback, forwardRef, useImperativeHandle } from "react";
import { Search, Plus, Pencil, Trash2 } from "lucide-react";
import { PatientForm } from "@/components/dashboard/patient-form";

interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  gender: string;
  date_of_birth: string;
  address?: string;
  medical_history?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PatientTableRef {
  refetch: () => void;
}

export const PatientTable = forwardRef<PatientTableRef>(function PatientTable(_props, ref) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | undefined>(undefined);

  const fetchPatients = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/patients");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setPatients(data);
    } catch (err) {
      console.error("Failed to fetch patients:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useImperativeHandle(ref, () => ({
    refetch: fetchPatients,
  }), [fetchPatients]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const filtered = patients.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = () => {
    setEditingPatient(undefined);
    setFormOpen(true);
  };

  const handleEdit = (patient: Patient) => {
    setEditingPatient(patient);
    setFormOpen(true);
  };

  const handleDelete = async (patient: Patient) => {
    if (!window.confirm(`Are you sure you want to delete ${patient.name}?`)) return;
    try {
      const res = await fetch(`/api/patients/${patient.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      fetchPatients();
    } catch (err) {
      console.error("Failed to delete patient:", err);
    }
  };

  const handleSaved = () => {
    setFormOpen(false);
    setEditingPatient(undefined);
    fetchPatients();
  };

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search patients by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border bg-background py-2 pl-9 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <button
          onClick={handleAdd}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Patient
        </button>
      </div>

      {/* Table - desktop */}
      <div className="hidden sm:block overflow-hidden rounded-lg border bg-card">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                Name
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                Email
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                Phone
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                Gender
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                Date of Birth
              </th>
              <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-sm text-muted-foreground">
                  Loading patients...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-sm text-muted-foreground">
                  {search ? "No patients match your search." : "No patients yet. Add one to get started."}
                </td>
              </tr>
            ) : (
              filtered.map((patient) => (
                <tr key={patient.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium">{patient.name}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{patient.email}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{patient.phone}</td>
                  <td className="px-4 py-3 text-sm capitalize text-muted-foreground">{patient.gender}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {patient.date_of_birth
                      ? new Date(patient.date_of_birth).toLocaleDateString()
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center gap-1">
                      <button
                        onClick={() => handleEdit(patient)}
                        className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(patient)}
                        className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
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

      {/* Card list - mobile */}
      <div className="sm:hidden space-y-3">
        {loading ? (
          <p className="text-center text-sm text-muted-foreground py-8">
            Loading patients...
          </p>
        ) : filtered.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8">
            {search ? "No patients match your search." : "No patients yet. Add one to get started."}
          </p>
        ) : (
          filtered.map((patient) => (
            <div
              key={patient.id}
              className="rounded-lg border bg-card p-4 space-y-2"
            >
              <div className="flex items-start justify-between">
                <span className="font-medium text-sm">{patient.name}</span>
                <div className="inline-flex items-center gap-1">
                  <button
                    onClick={() => handleEdit(patient)}
                    className="inline-flex items-center justify-center rounded-md p-1.5 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                    title="Edit"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(patient)}
                    className="inline-flex items-center justify-center rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                <span className="text-muted-foreground">Email</span>
                <span className="truncate">{patient.email || "—"}</span>
                <span className="text-muted-foreground">Phone</span>
                <span>{patient.phone || "—"}</span>
                <span className="text-muted-foreground">Gender</span>
                <span className="capitalize">{patient.gender || "—"}</span>
                <span className="text-muted-foreground">Date of Birth</span>
                <span>
                  {patient.date_of_birth
                    ? new Date(patient.date_of_birth).toLocaleDateString()
                    : "—"}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Patient form dialog */}
      <PatientForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingPatient(undefined);
        }}
        patient={editingPatient}
        onSaved={handleSaved}
      />
    </div>
  );
});
