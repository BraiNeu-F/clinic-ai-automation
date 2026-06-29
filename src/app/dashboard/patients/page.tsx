import { PatientTable } from "@/components/dashboard/patient-table";

export default function PatientsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Patients</h1>
      <PatientTable />
    </div>
  );
}
