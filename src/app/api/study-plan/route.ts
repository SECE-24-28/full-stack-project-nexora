import { NextResponse } from "next/server";
import { generateStudyPlan } from "@/services/ai/studyPlanner";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const plan = await generateStudyPlan(
      body.company,
      body.days,
      body.level
    );

    return NextResponse.json({
      success: true,
      plan,
    });
  } catch (error: any) {
  console.error("Study Plan Error:", error);

  return NextResponse.json(
    {
      success: false,
      message: error?.message || "Unknown Error",
    },
    { status: 500 }
  );
    }
}
export async function GET() {
  return NextResponse.json({
    success: true,
    message: "Study Plan API Working",
  });
}