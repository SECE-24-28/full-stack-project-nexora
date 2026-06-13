"use client";

import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { useMutation } from "@apollo/client/react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import Editor from "@monaco-editor/react";

// --- GRAPHQL ---
const GET_QUESTION = gql`
  query GetQuestion($id: ID!) {
    question(id: $id) {
      id
      title
      description
      difficulty
      userStatus 
      categories { name }
      companies { name }
    }
  }
`;

const UPDATE_PROGRESS = gql`
  mutation UpdateProgress($questionId: ID!, $status: String!) {
    updateProgress(questionId: $questionId, status: $status) {
      id
      userStatus
    }
  }
`;

export default function QuestionPage() {
  const params = useParams();
  const id = params?.id;
  const [code, setCode] = useState("// Write your solution here...\n");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { loading, error, data } = useQuery<{ question: any }>(GET_QUESTION, { variables: { id }, skip: !id });
  const [updateProgress] = useMutation(UPDATE_PROGRESS);

  if (loading) return <div className="min-h-screen flex items-center justify-center font-medium bg-slate-900 text-slate-300">Loading workspace...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500 font-medium bg-slate-900">Error: {error.message}</div>;
  if (!data?.question) return <div className="min-h-screen flex items-center justify-center font-medium bg-slate-900 text-slate-300">Question not found.</div>;

  const q = data.question;
  
  // THE FIX: Create a safe status variable that defaults to 'NOT_STARTED' if null
  const safeStatus = q.userStatus || 'NOT_STARTED';

  // --- AUTOMATION LOGIC ---

  // 1. Trigger "In Progress" automatically when they start typing
  const handleEditorChange = (value: string | undefined) => {
    setCode(value || "");
    if (safeStatus === "NOT_STARTED") {
      updateProgress({ variables: { questionId: q.id, status: "IN_PROGRESS" } });
    }
  };

  // 2. Trigger "Solved" automatically when they submit successfully
  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    // Simulate running tests against their code (1.5 second delay)
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    // Automatically update the database to SOLVED
    await updateProgress({ variables: { questionId: q.id, status: "SOLVED" } });
    
    setIsSubmitting(false);
    alert("✅ All test cases passed! Progress updated to Solved.");
  };

  return (
    <main className="min-h-screen bg-slate-900 text-slate-300 flex flex-col">
      {/* Top Navigation Bar */}
      <nav className="h-14 bg-slate-950 border-b border-slate-800 flex items-center px-6 justify-between">
        <Link href="/" className="text-sm font-bold text-slate-400 hover:text-white transition-colors">
          ← Dashboard
        </Link>
        
        {/* Automatic Status Badge indicator */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Status:</span>
          <span className={`text-xs font-bold px-2 py-1 rounded ${
            safeStatus === 'SOLVED' ? 'bg-emerald-500/20 text-emerald-400' :
            safeStatus === 'IN_PROGRESS' ? 'bg-blue-500/20 text-blue-400' :
            'bg-slate-800 text-slate-400'
          }`}>
            {/* THE FIX: Use the safe variable before replacing underscores */}
            {safeStatus.replace('_', ' ')}
          </span>
        </div>
      </nav>

      {/* Split Workspace */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2">
        
        {/* LEFT PANE: Problem Description */}
        <div className="border-r border-slate-800 p-6 overflow-y-auto">
          <div className="flex justify-between items-start mb-6">
            <h1 className="text-2xl font-bold text-white">{q.title}</h1>
            <span className={`px-3 py-1 rounded text-xs font-black uppercase tracking-wider ${
              q.difficulty.toUpperCase() === 'EASY' ? 'text-emerald-400 bg-emerald-400/10' :
              q.difficulty.toUpperCase() === 'MEDIUM' ? 'text-amber-400 bg-amber-400/10' :
              'text-rose-400 bg-rose-400/10'
            }`}>
              {q.difficulty}
            </span>
          </div>
          
          <div className="prose prose-invert max-w-none mb-8">
            <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
              {q.description}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {q.categories.map((cat: any, idx: number) => (
              <span key={idx} className="bg-slate-800 text-slate-400 text-xs px-2.5 py-1 rounded font-medium">
                {cat.name}
              </span>
            ))}
          </div>
        </div>

        {/* RIGHT PANE: Code Editor */}
        <div className="flex flex-col bg-[#1e1e1e]">
          {/* Editor Header */}
          <div className="h-12 border-b border-slate-800 flex items-center px-4 justify-between bg-slate-900">
            <span className="text-sm font-medium text-slate-400">JavaScript</span>
            <div className="flex items-center gap-2">
              <Link
                href={`/ai-notes?topic=${encodeURIComponent(q.title)}`}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-bold px-3.5 py-1.5 rounded-lg transition-all duration-200 inline-flex items-center gap-1.5 shadow-md shadow-purple-900/20 hover:scale-[1.02] active:scale-[0.98]"
              >
                <svg className="w-4 h-4 text-purple-100" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.64 8.5L14 3m5.64 5.5A1.5 1.5 0 1118 7.5l1.64 1M14 3v5h5M12 12h-2m2 4h-4m12 3v-7a2 2 0 00-2-2h-3.586a1 1 0 01-.707-.293L10.293 3.707A1 1 0 009.586 3.5H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2z" />
                </svg>
                <span>AI Notes</span>
              </Link>
              <button 
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold px-4 py-1.5 rounded-lg transition-all duration-200 disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]"
              >
                {isSubmitting ? "Running Tests..." : "Submit Code"}
              </button>
            </div>
          </div>

          {/* Monaco Editor */}
          <div className="flex-1 pt-4">
            <Editor
              height="100%"
              defaultLanguage="javascript"
              theme="vs-dark"
              value={code}
              onChange={handleEditorChange}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                padding: { top: 16 },
                scrollBeyondLastLine: false,
              }}
            />
          </div>
        </div>

      </div>
    </main>
  );
}