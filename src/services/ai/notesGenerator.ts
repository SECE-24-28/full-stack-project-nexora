import { geminiModel } from "@/lib/gemini";

export async function generateNotes(
  topic: string
) {
  const prompt = `
You are an expert DSA mentor.

Create concise interview revision notes.

Topic: ${topic}

Rules:
- Maximum 300 words
- Maximum 5 bullets per section
- No large explanations
- No code blocks
- No textbook style content
- Easy to revise before interview

Sections:

# Topic Name

## Definition

## Key Concepts

## Time Complexity

## Space Complexity

## Interview Tips

## Popular Interview Questions

Return clean markdown.
`;

  const result =
    await geminiModel.generateContent(
      prompt
    );

  return result.response.text();
}