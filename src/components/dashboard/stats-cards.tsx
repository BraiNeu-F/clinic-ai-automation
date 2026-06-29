import { Users, Stethoscope, Calendar, DollarSign } from "lucide-react";

interface StatsCardsProps {
  totalPatients: number;
  totalStaff: number;
  todayAppointments: number;
  pendingPayments: number;
}

const cards = [
  {
    key: "patients",
    label: "Total Patients",
    icon: Users,
    tint: "bg-blue-50 text-blue-600",
    iconBg: "bg-blue-100",
  },
  {
    key: "staff",
    label: "Total Staff",
    icon: Stethoscope,
    tint: "bg-green-50 text-green-600",
    iconBg: "bg-green-100",
  },
  {
    key: "appointments",
    label: "Today's Appointments",
    icon: Calendar,
    tint: "bg-amber-50 text-amber-600",
    iconBg: "bg-amber-100",
  },
  {
    key: "payments",
    label: "Pending Payments",
    icon: DollarSign,
    tint: "bg-purple-50 text-purple-600",
    iconBg: "bg-purple-100",
  },
] as const;

function getCardValue(
  key: (typeof cards)[number]["key"],
  props: StatsCardsProps
): number {
  switch (key) {
    case "patients":
      return props.totalPatients;
    case "staff":
      return props.totalStaff;
    case "appointments":
      return props.todayAppointments;
    case "payments":
      return props.pendingPayments;
  }
}

export function StatsCards(props: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map(({ key, label, icon: Icon, tint, iconBg }) => (
        <div
          key={key}
          className={`flex items-center gap-4 rounded-xl border p-5 ${tint}`}
        >
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-lg ${iconBg}`}
          >
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium opacity-80">{label}</p>
            <p className="text-2xl font-bold">{getCardValue(key, props)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
