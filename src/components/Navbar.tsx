import Link from "next/link";
import { auth, signOut, signIn } from "@/auth";

export default async function Navbar() {
  const session = await auth();

  return (
    <nav className="w-full bg-white border-b border-slate-200 px-10 py-4 sticky top-0 z-50">
  {/* Added w-full here to force it to stretch */}
  <div className="w-full flex justify-between items-center">
    
    {/* Logo/Home Button */}
    <Link href="/" className="font-extrabold text-xl text-slate-900 tracking-tight flex items-center gap-2">
      <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
        /
      </div>
      PrepPlatform
    </Link>

    {/* Auth Buttons */}
    <div className="flex items-center gap-6">
      {session?.user ? (
        <>
          <div className="flex items-center gap-3">
            {session.user.image && (
              <img src={session.user.image} alt="Avatar" className="w-8 h-8 rounded-full border border-slate-200" />
            )}
            <span className="text-sm font-bold text-slate-700 hidden sm:block">
              {session.user.name}
            </span>
          </div>
          
          <form action={async () => {
            "use server";
            await signOut();
          }}>
            <button className="text-sm font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 px-4 rounded-lg transition-colors">
              Log Out
            </button>
          </form>
        </>
      ) : (
        <form action={async () => {
          "use server";
          await signIn("github");
        }}>
          <button className="text-sm font-bold bg-slate-900 hover:bg-slate-800 text-white py-2 px-5 rounded-lg transition-colors shadow-sm">
            Log In
          </button>
        </form>
      )}
    </div>

  </div>
</nav>
  );
}