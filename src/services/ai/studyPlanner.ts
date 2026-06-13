import { geminiModel } from "@/lib/gemini";

export async function generateStudyPlan(
  company: string,
  days: number,
  level: string
) {
  console.log("INPUT:", { company, days, level });

  const prompt = `
Create a concise ${days}-day DSA roadmap for ${company}.

Level: ${level}

Rules:
- Maximum 500 words
- No introductions
- No explanations
- Only actionable tasks

Format:

| Days | Topic | Questions |
|------|-------|-----------|

Then include:

## Revision Days

## Mock Tests

## High Priority Topics

Return markdown.
`;

  const result = await geminiModel.generateContent(prompt);

  console.log("Gemini response received");

  return result.response.text();
}