import { NextResponse } from "next/server";
import {
  generateInterviewQuestion,
  evaluateInterviewAnswer,
} from "@/services/ai/mockInterview";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const action = body?.action;

    if (action === "generate") {
      const question = await generateInterviewQuestion(
        body.topic,
        body.difficulty,
        body.questionType,
        {
          index: body?.index,
          total: body?.total,
        }
      );

      return NextResponse.json({
        success: true,
        question,
      });
    }

    if (action === "evaluate") {
      const evaluation = await evaluateInterviewAnswer({
        topic: body.topic,
        difficulty: body.difficulty,
        questionType: body.questionType,
        question: body.question,
        answer: body.answer,
      });

      return NextResponse.json({
        success: true,
        evaluation,
      });
    }

    return NextResponse.json(
      {
        success: false,
        message: "Invalid action",
      },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Mock Interview Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Unknown Error",
      },
      { status: 500 }
    );
  }
}



