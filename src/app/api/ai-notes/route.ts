import { NextResponse } from "next/server";
import { generateNotes } from "@/services/ai/notesGenerator";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const notes = await generateNotes(
      body.topic
    );

    return NextResponse.json({
      success: true,
      notes,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 }
    );
  }
}