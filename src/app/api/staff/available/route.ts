import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/staff/available?date=YYYY-MM-DD&start_time=HH:MM&end_time=HH:MM[&exclude_schedule_id=...]
export async function GET(request: NextRequest) {
  const supabase = createClient();
  const { searchParams } = new URL(request.url);

  const date = searchParams.get("date");
  const start_time = searchParams.get("start_time");
  const end_time = searchParams.get("end_time");
  const exclude_schedule_id = searchParams.get("exclude_schedule_id");

  if (!date || !start_time || !end_time) {
    return NextResponse.json(
      { error: "date, start_time, and end_time are required" },
      { status: 400 }
    );
  }

  // 1. Get all staff
  const { data: allStaff, error: staffError } = await supabase
    .from("staff")
    .select("*")
    .order("name");

  if (staffError) {
    return NextResponse.json({ error: staffError.message }, { status: 500 });
  }

  // 2. Get staff IDs that are busy at this time
  let conflictQuery = supabase
    .from("schedules")
    .select("staff_id")
    .eq("date", date)
    .lt("start_time", end_time)
    .gt("end_time", start_time)
    .neq("status", "available");

  if (exclude_schedule_id) {
    conflictQuery = conflictQuery.neq("id", exclude_schedule_id);
  }

  const { data: conflicts, error: conflictError } = await conflictQuery;

  if (conflictError) {
    return NextResponse.json({ error: conflictError.message }, { status: 500 });
  }

  // 3. Filter out busy staff
  const busyStaffIds = new Set(conflicts.map((s: { staff_id: string }) => s.staff_id));
  const available = allStaff.filter((s: { id: string }) => !busyStaffIds.has(s.id));

  return NextResponse.json(available);
}
