import { NextResponse } from "next/server";
import { mockPatient } from "@/lib/mockPatient";

export async function POST(req) {
  const { code } = await req.json();

  if (!/^\d{6}$/.test(code?.trim())) {
    return NextResponse.json({ valid: false });
  }

  if (code === "000000") {
    return NextResponse.json({ valid: true, patient: mockPatient });
  }

  try {
    const res = await fetch(
      `https://server.headachecalendar.com/api/patients/details/json?accessCode=${code.trim()}`
    );

    if (!res.ok) return NextResponse.json({ valid: false });

    const data = await res.json();
    if (!data || !data.records) return NextResponse.json({ valid: false });

    return NextResponse.json({ valid: true, patient: data });
  } catch {
    return NextResponse.json({ valid: false });
  }
}
