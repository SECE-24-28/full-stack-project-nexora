"use client";

import { gql } from "@apollo/client";
import { useQuery, useMutation } from "@apollo/client/react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import Editor from "@monaco-editor/react";
import { TEST_SUITES } from "@/tests"; // Import your centralized test suite

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
  
  const [output, setOutput] = useState<{ type: 'idle' | 'success' | 'error', text: string }>({ 
    type: 'idle', 
    text: 'Run your code to see test results here...' 
  });

  const { loading, error, data } = useQuery(GET_QUESTION, { variables: { id }, skip: !id });
  const [updateProgress] = useMutation(UPDATE_PROGRESS);

  if (loading) return <div className="min-h-screen flex items-center justify-center font-medium bg-slate-50 text-slate-500">Loading workspace...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center font-medium bg-slate-50 text-red-500">Error: {error.message}</div>;
  if (!data?.question) return <div className="min-h-screen flex items-center justify-center font-medium bg-slate-50 text-slate-500">Question not found.</div>;

  const q = data.question;
  const safeStatus = q.userStatus || 'NOT_STARTED';

  const handleEditorChange = (value: string | undefined) => {
    setCode(value || "");
    if (safeStatus === "NOT_STARTED") {
      updateProgress({ variables: { questionId: q.id, status: "IN_PROGRESS" } });
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setOutput({ type: 'idle', text: 'Executing tests...' });

    await new Promise((resolve) => setTimeout(resolve, 800));

    try {
      const userCode = code.replace('// Write your solution here...', '').trim();
      if (userCode.length === 0) throw new Error("Error: Please write some code before submitting.");

      // 1. Get the suite for this specific problem
      const suite = TEST_SUITES[q.title];
      if (!suite) throw new Error("No test suite configured for this problem.");

      // 2. Define the execution sandbox
      const funcName = q.title.replace(/\s+/g, '')[0].toLowerCase() + q.title.replace(/\s+/g, '').slice(1);
      
      const runTest = new Function('input', `
        ${userCode}
        if (typeof ${funcName} !== 'function') throw new Error("ReferenceError: function '${funcName}' is not defined.");
        return ${funcName}(...input);
      `);

      // 3. Run all cases in the suite
      for (const test of suite) {
        const actual = runTest(test.inputs);
        if (JSON.stringify(actual) !== JSON.stringify(test.expected)) {
          throw new Error(`Failed Case: Input ${JSON.stringify(test.inputs)}\nExpected: ${JSON.stringify(test.expected)}\nActual: ${JSON.stringify(actual)}`);
        }
      }

      setOutput({ type: 'success', text: "✅ All test cases passed successfully!" });
      await updateProgress({ variables: { questionId: q.id, status: "SOLVED" } });

    } catch (err: any) {
      setOutput({ type: 'error', text: err.message });
      await updateProgress({ variables: { questionId: q.id, status: "REVISION_NEEDED" } });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col">
      <nav className="h-14 bg-white border-b border-slate-200 flex items-center px-6 justify-between shadow-sm">
        <Link href="/" className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">← Dashboard</Link>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status:</span>
          <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-md uppercase tracking-wider ${
            safeStatus === 'SOLVED' ? 'bg-emerald-100 text-emerald-700' :
            safeStatus === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
            safeStatus === 'REVISION_NEEDED' ? 'bg-orange-100 text-orange-700' :
            'bg-slate-100 text-slate-500'
          }`}>
            {safeStatus.replace('_', ' ')}
          </span>
        </div>
      </nav>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2">
        <div className="border-r border-slate-200 p-8 overflow-y-auto bg-white flex flex-col h-[calc(100vh-56px)]">
          <div className="flex justify-between items-start mb-6">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{q.title}</h1>
            <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider ${
              q.difficulty.toUpperCase() === 'EASY' ? 'bg-emerald-100 text-emerald-700' :
              q.difficulty.toUpperCase() === 'MEDIUM' ? 'bg-amber-100 text-amber-700' :
              'bg-rose-100 text-rose-700'
            }`}>{q.difficulty}</span>
          </div>
          <div className="prose prose-slate max-w-none mb-8">
            <p className="text-slate-600 leading-relaxed text-lg whitespace-pre-wrap">{q.description}</p>
          </div>
          <div className="flex flex-wrap gap-2 mb-6 mt-auto">
            {q.categories.map((cat: any, idx: number) => (
              <span key={idx} className="bg-indigo-50 text-indigo-700 text-xs px-3 py-1.5 rounded-md font-bold uppercase">{cat.name}</span>
            ))}
          </div>
        </div>

        <div className="flex flex-col bg-white h-[calc(100vh-56px)]">
          <div className="h-12 border-b border-slate-200 flex items-center px-4 justify-between bg-slate-50 shrink-0">
            <span className="text-sm font-bold text-slate-700">JavaScript</span>
            <button onClick={handleSubmit} disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold px-4 py-1.5 rounded transition-colors shadow-sm disabled:opacity-50">
              {isSubmitting ? "Running..." : "Submit Code"}
            </button>
          </div>
          <div className="flex-1 pt-4 border-l border-slate-100 overflow-hidden">
            <Editor height="100%" defaultLanguage="javascript" theme="light" value={code} onChange={handleEditorChange} options={{ minimap: { enabled: false }, fontSize: 15, padding: { top: 16 } }} />
          </div>
          <div className="h-48 border-t border-slate-200 bg-slate-50 flex flex-col shrink-0">
            <div className="h-8 bg-white border-b border-slate-200 flex items-center px-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Test Results</span>
            </div>
            <div className="p-4 overflow-y-auto font-mono text-sm">
              {output.type === 'idle' && <span className="text-slate-500">{output.text}</span>}
              {output.type === 'success' && <span className="text-emerald-600 whitespace-pre-wrap">{output.text}</span>}
              {output.type === 'error' && <span className="text-rose-600 whitespace-pre-wrap">{output.text}</span>}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}