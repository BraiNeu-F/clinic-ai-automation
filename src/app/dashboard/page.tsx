import { createServerSupabaseClient } from "@/lib/supabase/server";
import { StatsCards } from "@/components/dashboard/stats-cards";

const STATUS_COLORS: Record<string, string> = {
  available: "bg-green-100 text-green-700",
  booked: "bg-blue-100 text-blue-700",
  completed: "bg-gray-100 text-gray-700",
  cancelled: "bg-red-100 text-red-700",
  "in-progress": "bg-amber-100 text-amber-700",
};

function StatusBadge({ status }: { status: string }) {
  const color = STATUS_COLORS[status] ?? "bg-gray-100 text-gray-600";
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${color}`}
    >
      {status}
    </span>
  );
}

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient();

  // Fetch all counts in parallel
  const todayStr = new Date().toISOString().split("T")[0];

  const [
    patientsCount,
    staffCount,
    todaySchedules,
    pendingPayments,
    recentPatients,
    recentSchedules,
  ] = await Promise.all([
    supabase
      .from("patients")
      .select("*", { count: "exact", head: true }),
    supabase
      .from("staff")
      .select("*", { count: "exact", head: true }),
    supabase
      .from("schedules")
      .select("*", { count: "exact", head: true })
      .eq("date", todayStr),
    supabase
      .from("payments")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase
      .from("patients")
      .select("name, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("schedules")
      .select("date, start_time, end_time, status, staff(name), patients(name)")
      .order("date", { ascending: true })
      .order("start_time", { ascending: true })
      .limit(5),
  ]);

  const totalPatients = patientsCount.count ?? 0;
  const totalStaff = staffCount.count ?? 0;
  const todayAppointments = todaySchedules.count ?? 0;
  const pendingPaymentsCount = pendingPayments.count ?? 0;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold tracking-tight text-foreground">
        Clinic Overview
      </h1>

      <StatsCards
        totalPatients={totalPatients}
        totalStaff={totalStaff}
        todayAppointments={todayAppointments}
        pendingPayments={pendingPaymentsCount}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Today's Appointments */}
        <section className="lg:col-span-2 rounded-xl border bg-white">
          <div className="border-b px-6 py-4">
            <h2 className="text-lg font-semibold text-foreground">
              Today&apos;s Appointments
            </h2>
          </div>
          <div className="overflow-x-auto">
            {recentSchedules.data && recentSchedules.data.length > 0 ? (
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50 text-left text-sm text-muted-foreground">
                    <th className="px-6 py-3 font-medium">Time</th>
                    <th className="px-6 py-3 font-medium">Doctor</th>
                    <th className="px-6 py-3 font-medium">Patient</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentSchedules.data.map((schedule) => {
                    const staff = Array.isArray(schedule.staff)
                      ? schedule.staff[0]
                      : schedule.staff;
                    const patient = Array.isArray(schedule.patients)
                      ? schedule.patients[0]
                      : schedule.patients;

                    return (
                      <tr
                        key={(schedule as any).id}
                        className="border-b text-sm last:border-0"
                      >
                        <td className="px-6 py-3 font-medium">
                          {schedule.start_time?.slice(0, 5)}
                          {" — "}
                          {schedule.end_time?.slice(0, 5)}
                        </td>
                        <td className="px-6 py-3">
                          {staff?.name ?? "—"}
                        </td>
                        <td className="px-6 py-3">
                          {patient?.name ?? "—"}
                        </td>
                        <td className="px-6 py-3">
                          <StatusBadge status={schedule.status ?? ""} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="px-6 py-8 text-center text-sm text-muted-foreground">
                No data
              </div>
            )}
          </div>
        </section>

        {/* Recent Patients */}
        <section className="rounded-xl border bg-white">
          <div className="border-b px-6 py-4">
            <h2 className="text-lg font-semibold text-foreground">
              Recent Patients
            </h2>
          </div>
          <div>
            {recentPatients.data && recentPatients.data.length > 0 ? (
              <ul className="divide-y">
                {recentPatients.data.map((patient) => (
                  <li
                    key={(patient as any).id}
                    className="flex items-center justify-between px-6 py-3 text-sm"
                  >
                    <span className="font-medium text-foreground">
                      {patient.name}
                    </span>
                    <span className="text-muted-foreground">
                      {new Date(patient.created_at).toLocaleDateString(
                        "en-US",
                        {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        }
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-6 py-8 text-center text-sm text-muted-foreground">
                No data
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
