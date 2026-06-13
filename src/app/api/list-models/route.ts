import { NextResponse } from "next/server";

export async function GET() {
  const key = process.env.GEMINI_API_KEY;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`
  );

  const data = await response.json();

  return NextResponse.json(data);
}