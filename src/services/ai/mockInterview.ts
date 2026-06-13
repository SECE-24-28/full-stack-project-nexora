import { geminiModel } from "@/lib/gemini";

type GenerateArgs = {
  index?: number;
  total?: number;
};

type CodingQuestion = {
  id: string;
  title: string;
  statement: string;
  codeSnippet: string;
  expectedOutputLabel: string;
  type: "Coding";
  maxAnswerChars?: number;
};

type TheoryQuestion = {
  id: string;
  title: string;
  prompt: string;
  type: "Theory";
  maxAnswerChars?: number;
};

type RealWorldQuestion = {
  id: string;
  title: string;
  prompt: string;
  type: "Real World";
  maxAnswerChars?: number;
};

type InterviewQuestion = CodingQuestion | TheoryQuestion | RealWorldQuestion;

type TheoryEval = {
  score: number;
  strengths: string[];
  missingPoints: string[];
  idealAnswer: string;
};

type RealWorldEval = {
  score: number;
  problemSolvingScore: number;
  technicalScore: number;
  strengths: string[];
  missingPoints: string[];
  idealApproach: string;
};

type CodingEval = {
  correct: boolean;
  explanation: string;
  timeComplexityConceptTested: string;
  interviewTip: string;
};

type EvalResult = {
  questionId: string;
  type: "Coding" | "Theory" | "Real World";
  theory?: TheoryEval;
  realWorld?: RealWorldEval;
  coding?: CodingEval;
};

function safeJsonParse<T>(text: string): T {
  const trimmed = text.trim();
  // Try to extract JSON object if model wrapped it
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  const candidate = start >= 0 && end > start ? trimmed.slice(start, end + 1) : trimmed;
  return JSON.parse(candidate) as T;
}


export async function generateInterviewQuestion(
  topic: string,
  difficulty: string,
  questionType: string,
  args?: GenerateArgs
): Promise<InterviewQuestion> {
  const index = args?.index ?? 0;
  const total = args?.total ?? 20;

  const prompt = `
You are a senior software engineering interviewer.

Create exactly ONE interview item.

Topic: ${topic}
Difficulty: ${difficulty}
Question Type: ${questionType}
Session Progress: question ${index + 1} of ${total}

Hard rules:
- Output MUST be valid JSON only (no markdown).
- Max length: keep all text concise (total <= ~200 words).
- Never generate a long LeetCode-style statement for Coding.

JSON schema:
{
  "id": string,
  "type": "Coding" | "Theory" | "Real World",
  "title": string,
  // Coding:
  "statement": string,               // 2-4 lines max
  "codeSnippet": string,            // small snippet
  "expectedOutputLabel": string,   // e.g. "What will be the output?"

  // Theory:
  "prompt": string,

  // Real World:
  "prompt": string,

  "maxAnswerChars": number
}

If Question Type is Coding:
- statement must be short (2-4 lines)
- codeSnippet must be small

If Question Type is Theory or Real World:
- put the full question/scenario into prompt
`;

  const result = await geminiModel.generateContent(prompt);
  const text = result.response.text();
  return safeJsonParse<InterviewQuestion>(text);
}

export async function evaluateInterviewAnswer(input: {
  topic: string;
  difficulty: string;
  questionType: string;
  question: any;
  answer: string;
}): Promise<EvalResult> {
  const { question, answer, questionType } = input;

  const prompt = `
You are a senior software engineering interviewer.

Evaluate the user's answer for the provided question.

Question Type: ${questionType}
Difficulty: ${input.difficulty}

User answer:
${answer}

Question (JSON):
${JSON.stringify(question)}

Hard rules:
- Output MUST be valid JSON only (no markdown).
- Keep feedback concise (total <= ~200 words).

Return schema:
{
  "questionId": string,
  "type": "Coding" | "Theory" | "Real World",

  // Theory
  "theory": {
    "score": number,              // 0-10
    "strengths": string[],
    "missingPoints": string[],
    "idealAnswer": string
  },

  // Real World
  "realWorld": {
    "score": number,
    "problemSolvingScore": number, // 0-10
    "technicalScore": number,      // 0-10
    "strengths": string[],
    "missingPoints": string[],
    "idealApproach": string
  },

  // Coding
  "coding": {
    "correct": boolean,
    "explanation": string,
    "timeComplexityConceptTested": string,
    "interviewTip": string
  }
}

Only include the evaluation block matching the Question Type.
`;

  const result = await geminiModel.generateContent(prompt);
  const text = result.response.text();
  return safeJsonParse<EvalResult>(text);
}

