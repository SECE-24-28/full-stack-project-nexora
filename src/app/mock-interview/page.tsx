"use client";

import { useMemo, useState } from "react";

type QuestionType = "Coding" | "Theory" | "Real World";

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

type CodingQuestion = {
  id: string;
  title: string;
  statement: string; // 2-4 lines max
  codeSnippet: string;
  expectedOutputLabel: string;
  type: "Coding";
  maxAnswerChars?: number;
};

type InterviewQuestion = TheoryQuestion | RealWorldQuestion | CodingQuestion;

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
  type: QuestionType;
  theory?: TheoryEval;
  realWorld?: RealWorldEval;
  coding?: CodingEval;
};

type InterviewStats = {
  questionsAttempted: number;
  correctAnswers: number;
  wrongAnswers: number;
  totalScore: number; // computed frontend
};

type Phase = "SETUP" | "IN_PROGRESS" | "EVALUATED" | "COMPLETED";

const MAX_CHARS_DEFAULT = 1200;
const QUESTIONS_TOTAL = 20;

export default function MockInterviewPage() {
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("Easy");
  const [questionType, setQuestionType] = useState<QuestionType>("Coding");

  const [phase, setPhase] = useState<Phase>("SETUP");
  const [loading, setLoading] = useState(false);

  const [sessionQuestion, setSessionQuestion] = useState<InterviewQuestion | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [answer, setAnswer] = useState("");
  const [evalResult, setEvalResult] = useState<EvalResult | null>(null);

  const [stats, setStats] = useState<InterviewStats>({
    questionsAttempted: 0,
    correctAnswers: 0,
    wrongAnswers: 0,
    totalScore: 0,
  });

  const maxChars = useMemo(() => {
    const fromQ = sessionQuestion?.maxAnswerChars;
    return fromQ ?? MAX_CHARS_DEFAULT;
  }, [sessionQuestion]);

  const progressPct = useMemo(() => {
    if (phase === "SETUP") return 0;
    return Math.round((currentIndex / QUESTIONS_TOTAL) * 100);
  }, [currentIndex, phase]);

  const questionLabel = useMemo(() => {
    const idx = Math.min(currentIndex + 1, QUESTIONS_TOTAL);
    return `Question ${idx} of ${QUESTIONS_TOTAL}`;
  }, [currentIndex]);

  const startInterview = async () => {
    try {
      setLoading(true);
      setPhase("IN_PROGRESS");
      setCurrentIndex(0);
      setAnswer("");
      setEvalResult(null);
      setSessionQuestion(null);
      setStats({
        questionsAttempted: 0,
        correctAnswers: 0,
        wrongAnswers: 0,
        totalScore: 0,
      });

      const res = await fetch("/api/mock-interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate",
          topic,
          difficulty,
          questionType,
          index: 0,
          total: QUESTIONS_TOTAL,
        }),
      });

      const data = await res.json();
      if (!data?.success) throw new Error(data?.message || "Failed to generate question");

      setSessionQuestion(data.question);
    } catch (e) {
      console.error(e);
      alert("Failed to start mock interview. Please try again.");
      setPhase("SETUP");
    } finally {
      setLoading(false);
    }
  };

  const skipQuestion = async () => {
    // Treat as wrong/attempted with 0 score.
    setStats((prev) => ({
      ...prev,
      questionsAttempted: prev.questionsAttempted + 1,
      wrongAnswers: prev.wrongAnswers + 1,
    }));

    await loadNextQuestion();
  };

  const loadNextQuestion = async () => {
    setEvalResult(null);
    setAnswer("");
    setPhase("IN_PROGRESS");

    const nextIndex = currentIndex + 1;
    if (nextIndex >= QUESTIONS_TOTAL) {
      setPhase("COMPLETED");
      setSessionQuestion(null);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/mock-interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate",
          topic,
          difficulty,
          questionType,
          index: nextIndex,
          total: QUESTIONS_TOTAL,
        }),
      });
      const data = await res.json();
      if (!data?.success) throw new Error(data?.message || "Failed to generate question");

      setCurrentIndex(nextIndex);
      setSessionQuestion(data.question);
    } catch (e) {
      console.error(e);
      alert("Failed to load next question.");
      setPhase("COMPLETED");
    } finally {
      setLoading(false);
    }
  };

  const evaluateAnswer = async () => {
    if (!sessionQuestion) return;
    try {
      setLoading(true);
      const res = await fetch("/api/mock-interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "evaluate",
          topic,
          difficulty,
          questionType,
          question: sessionQuestion,
          answer,
          index: currentIndex,
        }),
      });

      const data = await res.json();
      if (!data?.success) throw new Error(data?.message || "Failed to evaluate answer");

      const evaluation: EvalResult = data.evaluation;
      setEvalResult(evaluation);
      setPhase("EVALUATED");

      // Frontend-only stat rules
      setStats((prev) => {
        const next = { ...prev, questionsAttempted: prev.questionsAttempted + 1 };

        if (evaluation.type === "Coding" && evaluation.coding) {
          const correct = evaluation.coding.correct;
          if (correct) {
            next.correctAnswers += 1;
            next.totalScore += 10;
          } else {
            next.wrongAnswers += 1;
            next.totalScore += 0;
          }
        }

        if (evaluation.type === "Theory" && evaluation.theory) {
          const sc = clampScore(evaluation.theory.score);
          next.totalScore += sc;
          if (sc >= 7) next.correctAnswers += 1;
          else next.wrongAnswers += 1;
        }

        if (evaluation.type === "Real World" && evaluation.realWorld) {
          const sc = clampScore(evaluation.realWorld.score);
          next.totalScore += sc;
          if (sc >= 7) next.correctAnswers += 1;
          else next.wrongAnswers += 1;
        }

        return next;
      });
    } catch (e) {
      console.error(e);
      alert("Failed to evaluate answer.");
    } finally {
      setLoading(false);
    }
  };

  const endInterview = () => {
    setPhase("COMPLETED");
    setSessionQuestion(null);
  };

  const accuracyPct = useMemo(() => {
    if (stats.questionsAttempted === 0) return 0;
    return Math.round((stats.correctAnswers / stats.questionsAttempted) * 100);
  }, [stats.correctAnswers, stats.questionsAttempted]);

  const averageScore = useMemo(() => {
    if (stats.questionsAttempted === 0) return 0;
    // totalScore is already out of 10 per question (frontend rule)
    const avg = stats.totalScore / stats.questionsAttempted;
    return Math.round(avg * 10) / 10;
  }, [stats.questionsAttempted, stats.totalScore]);

  const recommendedTopics = useMemo(() => {
    // lightweight deterministic recommendations until AI summary is added.
    const t = (topic || "Technical").trim();
    return [t, "System Design", "Debugging", "Complexity Analysis", "Coding Patterns"];
  }, [topic]);

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 md:p-10 space-y-8 animate-in fade-in duration-300">
      <div className="text-center max-w-2xl mx-auto space-y-3 mt-4">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-100/80">
          ✨ AI Tools Suite
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
          AI Mock Interview
        </h1>
        <p className="text-sm sm:text-base text-slate-500 leading-relaxed">
          One question at a time. Submit answers, get concise evaluation, track progress.
        </p>
      </div>

      {/* Progress / Stats bar (shown during session) */}
      {phase !== "SETUP" && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 md:p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">
                Progress
              </div>
              <div className="font-bold text-slate-800">{questionLabel}</div>
            </div>
            <div className="flex items-center gap-2 flex-wrap justify-end">
              <ScoreChip label="Attempted" value={stats.questionsAttempted} variant="slate" />
              <ScoreChip label="Correct" value={stats.correctAnswers} variant="emerald" />
              <ScoreChip label="Wrong" value={stats.wrongAnswers} variant="rose" />
              <ScoreChip label="Total" value={stats.totalScore} variant="cyan" />
            </div>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 h-2.5"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      )}

      {phase === "SETUP" && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-extrabold text-slate-400 uppercase tracking-widest block">
              Interview Topic
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. Dynamic Programming, Trees, System Design..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full border border-slate-200 rounded-xl pl-11 pr-4 py-3.5 text-slate-800 placeholder-slate-400 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-semibold"
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
            </div>

            <div className="flex gap-2 flex-wrap pt-1">
              {["Arrays & Strings", "Trees & Graphs", "Dynamic Programming", "SQL & Databases", "System Design"].map((item) => (
                <button
                  key={item}
                  onClick={() => setTopic(item)}
                  className={`border px-3 py-1 rounded-lg text-xs font-bold transition-all duration-150 ${
                    topic === item
                      ? "bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm"
                      : "border-slate-200 bg-white text-slate-550 hover:bg-slate-50 hover:text-slate-800"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-slate-100">
            <div className="space-y-2.5">
              <label className="text-xs font-extrabold text-slate-400 uppercase tracking-widest block">
                Difficulty
              </label>
              <div className="grid grid-cols-3 gap-2">
                {["Easy", "Medium", "Hard"].map((diff) => {
                  const isActive = difficulty === diff;
                  return (
                    <button
                      key={diff}
                      type="button"
                      onClick={() => setDifficulty(diff)}
                      className={`py-3.5 px-3 rounded-xl border text-xs sm:text-sm font-bold transition-all duration-200 flex flex-col items-center justify-center gap-1 ${
                        isActive
                          ? diff === "Easy"
                            ? "bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm"
                            : diff === "Medium"
                            ? "bg-amber-50 border-amber-500 text-amber-700 shadow-sm"
                            : "bg-rose-50 border-rose-500 text-rose-700 shadow-sm"
                          : "border-slate-200 hover:border-slate-350 hover:bg-slate-50 text-slate-600"
                      }`}
                    >
                      <span>
                        {diff === "Easy" && "🟢"}
                        {diff === "Medium" && "🟡"}
                        {diff === "Hard" && "🔴"}
                      </span>
                      <span>{diff}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2.5">
              <label className="text-xs font-extrabold text-slate-400 uppercase tracking-widest block">
                Question Type
              </label>
              <div className="grid grid-cols-3 gap-2">
                {["Coding", "Theory", "Real World"].map((type) => {
                  const isActive = questionType === type;
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setQuestionType(type as QuestionType)}
                      className={`py-3.5 px-2.5 rounded-xl border text-xs sm:text-sm font-bold transition-all duration-200 flex flex-col items-center justify-center gap-1 ${
                        isActive
                          ? "bg-cyan-50 border-cyan-500 text-cyan-700 shadow-sm"
                          : "border-slate-200 hover:border-slate-350 hover:bg-slate-50 text-slate-600"
                      }`}
                    >
                      <span>
                        {type === "Coding" && "💻"}
                        {type === "Theory" && "📚"}
                        {type === "Real World" && "💡"}
                      </span>
                      <span>{type}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={startInterview}
              disabled={loading || !topic.trim()}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-4 rounded-xl shadow-md shadow-emerald-900/10 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Formulating Question...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 text-emerald-100" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8.25 9V5.25A2.25 2.25 0 0110.5 3h3a2.25 2.25 0 012.25 2.25V9M1.5 13.5h21M3 13.5v7.5A1.5 1.5 0 004.5 22.5h15a1.5 1.5 0 001.5-1.5v-7.5"
                    />
                  </svg>
                  <span>Start Interview</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {(phase === "IN_PROGRESS" || phase === "EVALUATED") && sessionQuestion && (
        <div className="border border-slate-200/80 rounded-2xl p-6 md:p-8 bg-white shadow-xl shadow-slate-100/50 animate-in fade-in slide-in-from-bottom-5 duration-300 space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">
                {questionType} Question
              </div>
              <div className="text-xl font-bold text-slate-800">{sessionQuestion.title}</div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const text = renderQuestionText(sessionQuestion);
                  navigator.clipboard.writeText(text);
                }}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 px-3 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
              >
                Copy
              </button>
            </div>
          </div>

          <QuestionCard question={sessionQuestion} />

          {phase === "IN_PROGRESS" && (
            <div className="space-y-3">
              <div className="space-y-2">
                <div className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">
                  Your Answer
                </div>

                {sessionQuestion.type === "Coding" ? (
                  <div className="space-y-2">
                    <div className="text-sm text-slate-600 font-bold">{sessionQuestion.expectedOutputLabel}</div>
                    <input
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      placeholder="Type the expected output (exact formatting matters)."
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all font-semibold"
                    />
                    <div className="text-[11px] text-slate-500">
                      {answer.length}/{maxChars}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <textarea
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      placeholder="Write your answer concisely."
                      maxLength={maxChars}
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-semibold min-h-[140px] resize-y"
                    />
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>Keep it tight (clear bullet points work best).</span>
                      <span>
                        {answer.length}/{maxChars}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                <button
                  onClick={evaluateAnswer}
                  disabled={loading || !answer.trim()}
                  className="flex-1 min-w-[180px] bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-3.5 rounded-xl shadow-md shadow-emerald-900/10 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Evaluating..." : "Submit Answer"}
                </button>
                <button
                  onClick={skipQuestion}
                  disabled={loading}
                  className="flex-1 min-w-[160px] bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold py-3.5 rounded-xl transition-all"
                >
                  Skip Question
                </button>
                <button
                  onClick={endInterview}
                  disabled={loading}
                  className="flex-1 min-w-[140px] bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl transition-all"
                >
                  End Interview
                </button>
              </div>
            </div>
          )}

          {phase === "EVALUATED" && evalResult && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">Evaluation</div>
                <div>
                  {renderScoreChip(evalResult, questionType)}
                </div>
              </div>

              {evalResult.type === "Theory" && evalResult.theory && (
                <EvalTheory theory={evalResult.theory} />
              )}
              {evalResult.type === "Real World" && evalResult.realWorld && (
                <EvalRealWorld realWorld={evalResult.realWorld} />
              )}
              {evalResult.type === "Coding" && evalResult.coding && (
                <EvalCoding coding={evalResult.coding} />
              )}

              <div className="flex flex-wrap gap-2 pt-2">
                <button
                  onClick={loadNextQuestion}
                  disabled={loading}
                  className="flex-1 min-w-[200px] bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-3.5 rounded-xl shadow-md shadow-emerald-900/10 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next Question
                </button>
                <button
                  onClick={endInterview}
                  disabled={loading}
                  className="flex-1 min-w-[160px] bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl transition-all"
                >
                  End Interview
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {phase === "COMPLETED" && (
        <div className="border border-slate-200/80 rounded-2xl p-6 md:p-8 bg-white shadow-xl shadow-slate-100/50 animate-in fade-in slide-in-from-bottom-5 duration-300 space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">Mock Interview Completed</div>
              <div className="text-2xl font-extrabold text-slate-800">Interview Summary</div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setPhase("SETUP");
                  setSessionQuestion(null);
                  setEvalResult(null);
                  setAnswer("");
                  setStats({
                    questionsAttempted: 0,
                    correctAnswers: 0,
                    wrongAnswers: 0,
                    totalScore: 0,
                  });
                  setCurrentIndex(0);
                }}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-3.5 px-5 rounded-xl transition-all"
              >
                New Interview
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <SummaryTile label="Questions Attempted" value={stats.questionsAttempted} />
            <SummaryTile label="Correct" value={stats.correctAnswers} />
            <SummaryTile label="Wrong" value={stats.wrongAnswers} />
            <SummaryTile label="Accuracy" value={`${accuracyPct}%`} />
          </div>

          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="space-y-1">
              <div className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">Average Score</div>
              <div className="text-3xl font-extrabold text-slate-900">
                {averageScore} <span className="text-slate-500 text-base">/ 10</span>
              </div>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex-1 min-w-[260px]">
              <div className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">Recommended Topics</div>
              <div className="flex gap-2 flex-wrap pt-2">
                {recommendedTopics.map((t) => (
                  <span key={t} className="px-3 py-1 rounded-full text-xs font-bold bg-white border border-slate-200 text-slate-700">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-white border border-slate-200 rounded-2xl p-4">
              <div className="text-xs font-extrabold text-emerald-700 uppercase tracking-widest">Strong Areas</div>
              <div className="flex gap-2 flex-wrap pt-2">
                {guessStrongAreas(questionType).map((t) => (
                  <span key={t} className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 border border-emerald-200 text-emerald-800">
                    {t}
                  </span>
                ))}
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-4">
              <div className="text-xs font-extrabold text-rose-700 uppercase tracking-widest">Needs Improvement</div>
              <div className="flex gap-2 flex-wrap pt-2">
                {guessNeedsImprovement(questionType).map((t) => (
                  <span key={t} className="px-3 py-1 rounded-full text-xs font-bold bg-rose-50 border border-rose-200 text-rose-800">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="text-xs text-slate-500">
            Note: interview stats are stored in-memory (frontend) for this build.
          </div>
        </div>
      )}
    </div>
  );
}

function clampScore(n: number) {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(10, Math.round(n)));
}

function ScoreChip({
  label,
  value,
  variant,
}: {
  label: string;
  value: number | string;
  variant: "slate" | "emerald" | "rose" | "cyan";
}) {
  const cls =
    variant === "emerald"
      ? "bg-emerald-50 border-emerald-200 text-emerald-800"
      : variant === "rose"
      ? "bg-rose-50 border-rose-200 text-rose-800"
      : variant === "cyan"
      ? "bg-cyan-50 border-cyan-200 text-cyan-800"
      : "bg-slate-50 border-slate-200 text-slate-800";
  return (
    <div className={`px-3 py-1.5 rounded-full border ${cls} flex items-baseline gap-2`}>
      <span className="text-[11px] font-extrabold uppercase tracking-widest">{label}</span>
      <span className="text-sm font-extrabold">{value}</span>
    </div>
  );
}

function SummaryTile({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
      <div className="text-[11px] font-extrabold text-slate-500 uppercase tracking-widest">{label}</div>
      <div className="text-2xl font-extrabold text-slate-900 pt-1">{value}</div>
    </div>
  );
}

function QuestionCard({ question }: { question: InterviewQuestion }) {
  return (
    <div className="bg-slate-900 border border-slate-850 rounded-2xl p-5 md:p-6 shadow-inner font-mono text-slate-100 overflow-x-auto">
      {question.type === "Theory" && (
        <div className="space-y-3">
          <div className="text-xs font-bold text-slate-300">Question</div>
          <div className="whitespace-pre-wrap leading-relaxed text-sm sm:text-base">{question.prompt}</div>
        </div>
      )}
      {question.type === "Real World" && (
        <div className="space-y-3">
          <div className="text-xs font-bold text-slate-300">Scenario</div>
          <div className="whitespace-pre-wrap leading-relaxed text-sm sm:text-base">{question.prompt}</div>
        </div>
      )}
      {question.type === "Coding" && (
        <div className="space-y-3">
          <div className="text-xs font-bold text-slate-300">Problem</div>
          <div className="whitespace-pre-wrap leading-relaxed text-sm sm:text-base">{question.statement}</div>
          <div className="pt-2">
            <div className="text-xs font-bold text-slate-300">Code Snippet</div>
            <pre className="mt-2 text-sm sm:text-base whitespace-pre-wrap">{question.codeSnippet}</pre>
            <div className="pt-2 text-xs font-bold text-slate-300">Question</div>
            <div className="text-sm sm:text-base whitespace-pre-wrap">What will be the output?</div>
          </div>
        </div>
      )}
    </div>
  );
}

function renderQuestionText(q: InterviewQuestion) {
  if (q.type === "Coding") {
    return `${q.title}\n\n${q.statement}\n\n${q.codeSnippet}\n\n${q.expectedOutputLabel}`;
  }
  return `${q.title}\n\n${q.prompt}`;
}

function renderScoreChip(evalResult: EvalResult, questionType: QuestionType) {
  if (questionType === "Coding" && evalResult.coding) {
    return (
      <div className={`px-3 py-1.5 rounded-full border ${evalResult.coding.correct ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-rose-50 border-rose-200 text-rose-800"}`}>
        <span className="text-[11px] font-extrabold uppercase tracking-widest">Result</span>
        <span className="ml-2 font-extrabold">{evalResult.coding.correct ? "Correct" : "Incorrect"}</span>
      </div>
    );
  }

  if (questionType === "Theory" && evalResult.theory) {
    return (
      <div className="px-3 py-1.5 rounded-full border bg-slate-50 border-slate-200 text-slate-800">
        <span className="text-[11px] font-extrabold uppercase tracking-widest">Score</span>
        <span className="ml-2 font-extrabold">{clampScore(evalResult.theory.score)}/10</span>
      </div>
    );
  }

  if (questionType === "Real World" && evalResult.realWorld) {
    return (
      <div className="px-3 py-1.5 rounded-full border bg-slate-50 border-slate-200 text-slate-800">
        <span className="text-[11px] font-extrabold uppercase tracking-widest">Score</span>
        <span className="ml-2 font-extrabold">{clampScore(evalResult.realWorld.score)}/10</span>
      </div>
    );
  }

  return null;
}

function EvalSectionTitle({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <div className={`text-xs font-extrabold uppercase tracking-widest ${color}`}>{children}</div>
  );
}

function EvalList({ items }: { items: string[] }) {
  return (
    <ul className="list-disc pl-5 text-sm text-slate-700 space-y-1">
      {items.map((it, idx) => (
        <li key={idx}>{it}</li>
      ))}
    </ul>
  );
}

function EvalTheory({ theory }: { theory: TheoryEval }) {
  return (
    <div className="space-y-4">
      <div className="bg-white border border-slate-200 rounded-2xl p-4">
        <EvalSectionTitle color="text-slate-400">Score</EvalSectionTitle>
        <div className="text-3xl font-extrabold text-slate-900 pt-1">{clampScore(theory.score)}/10</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 md:col-span-1">
          <EvalSectionTitle color="text-emerald-700">Strengths</EvalSectionTitle>
          <div className="pt-2">
            <EvalList items={theory.strengths} />
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4 md:col-span-1">
          <EvalSectionTitle color="text-rose-700">Missing Points</EvalSectionTitle>
          <div className="pt-2">
            <EvalList items={theory.missingPoints} />
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4 md:col-span-1">
          <EvalSectionTitle color="text-cyan-700">Ideal Answer</EvalSectionTitle>
          <div className="pt-2 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{theory.idealAnswer}</div>
        </div>
      </div>
    </div>
  );
}

function EvalRealWorld({ realWorld }: { realWorld: RealWorldEval }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white border border-slate-200 rounded-2xl p-4">
          <EvalSectionTitle color="text-slate-400">Score</EvalSectionTitle>
          <div className="text-3xl font-extrabold text-slate-900 pt-1">{clampScore(realWorld.score)}/10</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4">
          <EvalSectionTitle color="text-cyan-700">Problem Solving</EvalSectionTitle>
          <div className="text-3xl font-extrabold text-slate-900 pt-1">{clampScore(realWorld.problemSolvingScore)}/10</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4">
          <EvalSectionTitle color="text-emerald-700">Technical</EvalSectionTitle>
          <div className="text-3xl font-extrabold text-slate-900 pt-1">{clampScore(realWorld.technicalScore)}/10</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 md:col-span-1">
          <EvalSectionTitle color="text-emerald-700">Strengths</EvalSectionTitle>
          <div className="pt-2">
            <EvalList items={realWorld.strengths} />
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4 md:col-span-1">
          <EvalSectionTitle color="text-rose-700">Missing Points</EvalSectionTitle>
          <div className="pt-2">
            <EvalList items={realWorld.missingPoints} />
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4 md:col-span-1">
          <EvalSectionTitle color="text-cyan-700">Ideal Approach</EvalSectionTitle>
          <div className="pt-2 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{realWorld.idealApproach}</div>
        </div>
      </div>
    </div>
  );
}

function EvalCoding({ coding }: { coding: CodingEval }) {
  return (
    <div className="space-y-4">
      <div className="bg-white border border-slate-200 rounded-2xl p-4">
        <div className="flex items-center gap-3">
          <span
            className={`px-3 py-1.5 rounded-full border font-extrabold ${
              coding.correct
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-rose-50 border-rose-200 text-rose-800"
            }`}
          >
            {coding.correct ? "Correct" : "Incorrect"}
          </span>
          <span className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">Time Complexity Tested</span>
          <span className="text-sm font-bold text-slate-800">{coding.timeComplexityConceptTested}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="bg-white border border-slate-200 rounded-2xl p-4">
          <EvalSectionTitle color="text-cyan-700">Explanation</EvalSectionTitle>
          <div className="pt-2 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{coding.explanation}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4">
          <EvalSectionTitle color="text-emerald-700">Interview Tip</EvalSectionTitle>
          <div className="pt-2 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{coding.interviewTip}</div>
        </div>
      </div>
    </div>
  );
}

function guessStrongAreas(type: QuestionType) {
  if (type === "Coding") return ["Code Reading", "Edge Cases", "Complexity"];
  if (type === "Theory") return ["Core Concepts", "Trade-offs", "Clarity"];
  return ["Structure", "Communication", "Practical Thinking"];
}

function guessNeedsImprovement(type: QuestionType) {
  if (type === "Coding") return ["Formatting Precision", "Corner Cases", "Complexity Reasoning"];
  if (type === "Theory") return ["Examples", "Missing Definitions", "Tighter Explanation"];
  return ["System Details", "Metrics", "Technical Depth"];
}

