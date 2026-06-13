"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { loginAction, logoutAction } from "@/app/actions";

interface NavbarClientProps {
  session: {
    user?: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  } | null;
}

export default function NavbarClient({ session }: NavbarClientProps) {
  const pathname = usePathname();
  const [isAiDropdownOpen, setIsAiDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsAiDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsAiDropdownOpen(false);
  }, [pathname]);

  const isPlannerActive = pathname === "/study-planner";
  const isMockActive = pathname === "/mock-interview";
  const isNotesActive = pathname === "/ai-notes";
  const isAnyAiToolActive = isPlannerActive || isMockActive || isNotesActive;

  return (
    <nav className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-3.5 sticky top-0 z-50 shadow-sm transition-all duration-300">
      <div className="max-w-5xl mx-auto flex justify-between items-center">
        
        {/* Left Side: Logo & Desktop Links */}
        <div className="flex items-center gap-8">
          {/* Logo */}
          <Link 
            href="/" 
            className="font-extrabold text-xl text-slate-900 tracking-tight flex items-center gap-2 group"
          >
            <div className="w-9 h-9 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200">
              /
            </div>
            <span className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-950 bg-clip-text text-transparent">
              PrepPlatform
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1">

            {/* AI Tools Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsAiDropdownOpen(!isAiDropdownOpen)}
                className={`px-3.5 py-2 rounded-lg text-sm font-semibold flex items-center gap-1.5 transition-all duration-200 ${
                  isAnyAiToolActive
                    ? "bg-indigo-50 text-indigo-700 font-bold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <span>AI Tools</span>
                <span className="inline-block text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-full font-black animate-pulse uppercase tracking-wider">
                  New
                </span>
                <svg
                  className={`w-4 h-4 transition-transform duration-200 ${isAiDropdownOpen ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {isAiDropdownOpen && (
                <div className="absolute left-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-3 duration-200">
                  <div className="px-4 py-2 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    AI Preparation Suite
                  </div>
                  
                  {/* AI Study Planner */}
                  <Link
                    href="/study-planner"
                    className={`flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors ${
                      isPlannerActive ? "bg-indigo-50/50" : ""
                    }`}
                  >
                    <div className="mt-0.5 p-2 bg-blue-50 text-blue-600 rounded-lg">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <div className={`text-sm font-bold ${isPlannerActive ? "text-indigo-900" : "text-slate-800"}`}>
                        AI Study Planner
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Get a tailored company-specific study roadmap.
                      </div>
                    </div>
                  </Link>

                  {/* AI Mock Interview */}
                  <Link
                    href="/mock-interview"
                    className={`flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors ${
                      isMockActive ? "bg-indigo-50/50" : ""
                    }`}
                  >
                    <div className="mt-0.5 p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <div>
                      <div className={`text-sm font-bold ${isMockActive ? "text-indigo-900" : "text-slate-800"}`}>
                        AI Mock Interview
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Practice real-time interactive technical sessions.
                      </div>
                    </div>
                  </Link>

                  {/* AI Notes Generator */}
                  <Link
                    href="/ai-notes"
                    className={`flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors ${
                      isNotesActive ? "bg-indigo-50/50" : ""
                    }`}
                  >
                    <div className="mt-0.5 p-2 bg-purple-50 text-purple-600 rounded-lg">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <div className={`text-sm font-bold ${isNotesActive ? "text-indigo-900" : "text-slate-800"}`}>
                        AI Notes Generator
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Generate comprehensive summary guides instantly.
                      </div>
                    </div>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Auth Actions (Desktop) */}
        <div className="hidden md:flex items-center gap-4">
          {session?.user ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                {session.user.image ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name || "Avatar"}
                    className="w-7 h-7 rounded-full border border-slate-200/80 shadow-sm"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-xs">
                    {session.user.name?.charAt(0) || "U"}
                  </div>
                )}
                <span className="text-sm font-bold text-slate-700 tracking-tight">
                  {session.user.name}
                </span>
              </div>
              
              <form action={logoutAction}>
                <button 
                  type="submit"
                  className="text-xs font-extrabold bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 px-4 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                >
                  Log Out
                </button>
              </form>
            </div>
          ) : (
            <form action={loginAction}>
              <button 
                type="submit"
                className="text-sm font-extrabold bg-slate-900 hover:bg-slate-800 text-white py-2 px-5 rounded-xl transition-all duration-200 shadow-sm hover:scale-[1.02] active:scale-[0.98]"
              >
                Log In with GitHub
              </button>
            </form>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex md:hidden items-center">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg text-slate-600 hover:text-slate-950 hover:bg-slate-50 transition-colors focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

      </div>

      {/* Mobile Menu Panel */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden mt-4 pt-4 border-t border-slate-100 flex flex-col gap-3.5 animate-in fade-in slide-in-from-top-4 duration-200"
          ref={mobileMenuRef}
        >


          {/* AI Tools Section */}
          <div className="px-3 py-2">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <span>AI Tools Suite</span>
              <span className="bg-indigo-100 text-indigo-700 text-[9px] px-1.5 py-0.5 rounded-md font-black">AI</span>
            </div>
            
            <div className="flex flex-col gap-2 pl-2 border-l-2 border-slate-150">
              <Link
                href="/study-planner"
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 ${
                  isPlannerActive ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <span>📅 AI Study Planner</span>
              </Link>
              
              <Link
                href="/mock-interview"
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 ${
                  isMockActive ? "bg-emerald-50 text-emerald-700" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <span>💬 AI Mock Interview</span>
              </Link>
              
              <Link
                href="/ai-notes"
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 ${
                  isNotesActive ? "bg-purple-50 text-purple-700" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <span>✍️ AI Notes Generator</span>
              </Link>
            </div>
          </div>

          {/* User Auth (Mobile) */}
          <div className="border-t border-slate-100 pt-4 pb-2 px-3">
            {session?.user ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2.5">
                  {session.user.image ? (
                    <img
                      src={session.user.image}
                      alt={session.user.name || "Avatar"}
                      className="w-8 h-8 rounded-full border border-slate-200"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-sm">
                      {session.user.name?.charAt(0) || "U"}
                    </div>
                  )}
                  <div>
                    <div className="text-sm font-bold text-slate-800">{session.user.name}</div>
                    <div className="text-xs text-slate-400">{session.user.email}</div>
                  </div>
                </div>
                
                <form action={logoutAction} className="w-full">
                  <button 
                    type="submit"
                    className="w-full text-center text-sm font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl transition-colors"
                  >
                    Log Out
                  </button>
                </form>
              </div>
            ) : (
              <form action={loginAction} className="w-full">
                <button 
                  type="submit"
                  className="w-full text-center text-sm font-bold bg-slate-900 hover:bg-slate-800 text-white py-2.5 rounded-xl transition-colors"
                >
                  Log In with GitHub
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
