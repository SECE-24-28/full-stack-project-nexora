"use client";

import { gql } from "@apollo/client";
import { useQuery, useMutation } from "@apollo/client/react";
import Link from "next/link";

const GET_QUESTIONS = gql`
  query GetQuestions {
    questions {
      id
      title
      difficulty
      userStatus # <-- Request the new status field
      categories { name }
      companies { name }
    }
  }
`;

const UPDATE_PROGRESS = gql`
  mutation UpdateProgress($questionId: ID!, $status: String!) {
    updateProgress(questionId: $questionId, status: $status) {
      id
      userStatus # Apollo Cache automatically uses this to update the UI instantly!
    }
  }
`;

interface Tag { name: string; }
interface Question {
  id: string;
  title: string;
  difficulty: string;
  userStatus: string;
  categories: Tag[];
  companies: Tag[];
}

export default function Home() {
  const { loading, error, data } = useQuery<{ questions: Question[] }>(GET_QUESTIONS);
  const [updateProgress] = useMutation(UPDATE_PROGRESS);

  if (loading) return <div className="p-10 text-center text-slate-500">Loading questions...</div>;
  if (error) return <div className="p-10 text-center text-red-500">Error: {error.message}</div>;
  if (!data?.questions) return <div className="p-10 text-center text-slate-550">No questions found.</div>;

  return (
    <main className="min-h-screen bg-slate-50 p-10">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-8">Interview Dashboard</h1>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {data.questions.map((q: Question) => (
            <div key={q.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col h-full">
              
              {/* Card Header */}
              <div className="flex justify-between items-start mb-4 gap-4">
                <Link href={`/questions/${q.id}`} className="hover:underline decoration-blue-500 decoration-2">
                  <h2 className="text-xl font-bold text-slate-900">{q.title}</h2>
                </Link>

                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  q.difficulty.toUpperCase() === 'EASY' ? 'bg-emerald-100 text-emerald-700' :
                  q.difficulty.toUpperCase() === 'MEDIUM' ? 'bg-amber-100 text-amber-700' :
                  'bg-rose-100 text-rose-700'
                }`}>
                  {q.difficulty}
                </span>
              </div>

              {/* Read-Only Status Badge */}
<div className="bg-slate-50 p-3 rounded-xl mb-6 border border-slate-100 flex items-center justify-between">
  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
    Status
  </span>
  <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-md uppercase tracking-wider ${
    (q.userStatus || 'NOT_STARTED') === 'SOLVED' ? 'bg-emerald-100 text-emerald-700' :
    (q.userStatus || 'NOT_STARTED') === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
    'bg-slate-200 text-slate-500'
  }`}>
    {(q.userStatus || 'NOT_STARTED').replace('_', ' ')}
  </span>
</div>
              
              {/* Tags Section */}
              <div className="mt-auto">
                <div className="mb-3">
                  <div className="flex flex-wrap gap-2">
                    {q.categories.map((cat, idx) => (
                      <span key={idx} className="bg-indigo-50 text-indigo-700 text-[10px] px-2 py-1 rounded-md font-bold uppercase">
                        {cat.name}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="flex flex-wrap gap-2">
                    {q.companies.map((comp, idx) => (
                      <span key={idx} className="bg-slate-100 text-slate-600 text-[10px] px-2 py-1 rounded-md font-bold uppercase border border-slate-200">
                        {comp.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          ))}
        </div>
      </div>
    </main>
  );
}