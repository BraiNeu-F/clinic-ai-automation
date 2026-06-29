import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/schedules
export async function GET() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("schedules")
    .select("*, staff(name, role), patients(name)")
    .order("date", { ascending: true })
    .order("start_time", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// POST /api/schedules
export async function POST(request: NextRequest) {
  const supabase = createClient();
  const body = await request.json();

  const { data, error } = await supabase
    .from("schedules")
    .insert({
      staff_id: body.staff_id,
      patient_id: body.patient_id || null,
      date: body.date,
      start_time: body.start_time,
      end_time: body.end_time,
      status: body.status || "available",
      type: body.type || "consultation",
      notes: body.notes,
    })
    .select("*, staff(name, role), patients(name)")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data, { status: 201 });
}
