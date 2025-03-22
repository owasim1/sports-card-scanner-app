import { NextResponse } from "next/server";
import { sql } from "@vercel/postgres";

export async function GET(req) {
  try {
    const forwarded = req.headers.get("x-forwarded-for");
    const clientIp = forwarded?.split(",")[0] || "unknown";

    const { rows } = await sql`
    SELECT * FROM scans
    WHERE ip = ${clientIp}
    LIMIT 50
  `;
    console.log(rows);
    return NextResponse.json({ scans: rows });
  } catch (error) {
    console.error("❌ Error loading history:", error);
    return NextResponse.json(
      { error: "Failed to load history" },
      { status: 500 },
    );
  }
}
