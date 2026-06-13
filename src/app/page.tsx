"use client";

import { useState } from "react"; // 1. Import useState
import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import Link from "next/link";

const GET_QUESTIONS = gql`
  query GetQuestions {
    questions {
      id
      title
      difficulty
      userStatus 
      categories { name }
      companies { name }
    }
  }
`;

export default function Home() {
  const { loading, error, data } = useQuery(GET_QUESTIONS);

  // 2. Add local state for search and filter
  const [searchTerm, setSearchTerm] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("ALL");

  if (loading) return <div className="p-10 text-center text-slate-500">Loading questions...</div>;
  if (error) return <div className="p-10 text-center text-red-500">Error: {error.message}</div>;
  if (!data?.questions) return <div className="p-10 text-center text-slate-550">No questions found.</div>;

  // 3. Filter logic: This calculates the view based on state
  const filteredQuestions = data.questions.filter((q: any) => {
    const matchesSearch = q.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = difficultyFilter === "ALL" || q.difficulty.toUpperCase() === difficultyFilter.toUpperCase();
    return matchesSearch && matchesDifficulty;
  });

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto my-8 px-6">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-8">Interview Dashboard</h1>

        {/* SEARCH AND FILTER UI */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <input
            type="text"
            placeholder="Search questions by title..."
            className="flex-1 p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="flex gap-2">
            {["ALL", "EASY", "MEDIUM", "HARD"].map((diff) => (
              <button
                key={diff}
                onClick={() => setDifficultyFilter(diff)}
                className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${difficultyFilter === diff
                    ? "bg-slate-900 text-white shadow-md"
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                  }`}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>

        {/* GRID: Map through filteredQuestions instead of data.questions */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filteredQuestions.map((q: any) => (
            <div key={q.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 flex flex-col h-full">

              <div className="flex justify-between items-start mb-4 gap-4">
                <Link
                  href={`/questions/${q.id}`}
                  className="hover:underline decoration-blue-500 decoration-2"
                >
                  <h2 className="text-xl font-bold text-slate-900">
                    {q.title}
                  </h2>
                </Link>

                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${q.difficulty.toUpperCase() === 'EASY' ? 'bg-emerald-100 text-emerald-700' :
                    q.difficulty.toUpperCase() === 'MEDIUM' ? 'bg-amber-100 text-amber-700' :
                      'bg-rose-100 text-rose-700'
                  }`}>
                  {q.difficulty}
                </span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl mb-6 border border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status</span>
                <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-md uppercase tracking-wider ${(q.userStatus || 'NOT_STARTED') === 'SOLVED' ? 'bg-emerald-100 text-emerald-700' :
                    (q.userStatus || 'NOT_STARTED') === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                      (q.userStatus || 'NOT_STARTED') === 'REVISION_NEEDED' ? 'bg-orange-100 text-orange-700' :
                        'bg-slate-200 text-slate-500'
                  }`}>
                  {(q.userStatus || 'NOT_STARTED').replace('_', ' ')}
                </span>
              </div>

              <div className="mt-auto">
                <div className="mb-3">
                  <div className="flex flex-wrap gap-2">
                    {q.categories.map((cat: any, idx: number) => (
                      <span key={idx} className="bg-indigo-50 text-indigo-700 text-[10px] px-2 py-1 rounded-md font-bold uppercase">{cat.name}</span>
                    ))}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {q.companies.map((comp: any, idx: number) => (
                    <span key={idx} className="bg-slate-100 text-slate-600 text-[10px] px-2 py-1 rounded-md font-bold uppercase border border-slate-200">{comp.name}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}