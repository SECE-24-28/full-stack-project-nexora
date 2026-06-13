import { geminiModel } from "./gemini";

export async function testGemini() {
  const result = await geminiModel.generateContent({
    contents: [
      {
        role: "user",
        parts: [
          {
            text: "Say hello from Gemini",
          },
        ],
      },
    ],
  });

  return result.response.text();
}