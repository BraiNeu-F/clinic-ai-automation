import { StaffTable } from "@/components/dashboard/staff-table";

export default function StaffPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Nurses & Doctors</h1>
      <StaffTable />
    </div>
  );
}
