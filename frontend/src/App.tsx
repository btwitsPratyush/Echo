import { useCallback, useEffect, useState } from "react";
import Feed from "./components/Feed";
import LeaderboardWidget from "./components/LeaderboardWidget";
import AuthPage from "./components/AuthPage";
import { api, UserBrief } from "./api"; // Updated import
import Logo from "./components/Logo";
import SplashScreen from "./components/SplashScreen";

export default function App() {
  const [token, setToken] = useState<string | null>(null);
  const [me, setMe] = useState<UserBrief | null>(null); // Store current user
  const [authChecked, setAuthChecked] = useState(false);
  const [showSplash, setShowSplash] = useState(false);
  const [splashMode, setSplashMode] = useState<"intro" | "login">("intro");

  // Helper to fetch user details
  const fetchMe = useCallback(async (t: string) => {
    try {
      const user = await api.me(t);
      setMe(user);
    } catch {
      // invalid token?
    }
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("echo_token") || "";
    const t = stored.trim() ? stored.trim() : null;
    setToken(t);
    // If we have a stored token, show splash briefly (Intro mode)
    if (t) {
      setSplashMode("intro");
      setShowSplash(true);
      void fetchMe(t);
    }
    setAuthChecked(true);
  }, [fetchMe]);

  const onAuthed = useCallback((t: string) => {
    localStorage.setItem("echo_token", t);
    setToken(t);
    // Show splash on fresh login (Login mode)
    setSplashMode("login");
    setShowSplash(true);
    void fetchMe(t);
  }, [fetchMe]);

  const [loggingOut, setLoggingOut] = useState(false);

  const logout = useCallback(async () => {
    if (!token) return;
    setLoggingOut(true);
    // Visual delay for the logout animation
    setTimeout(async () => {
      try {
        await api.logout(token);
      } catch {
        // ignore
      } finally {
        localStorage.removeItem("echo_token");
        setToken(null);
        setMe(null);
        setLoggingOut(false);
      }
    }, 1500);
  }, [token]);

  if (!authChecked) return null;
  if (!token) return <AuthPage onAuthed={onAuthed} />;

  return (
    <>
      {showSplash && <SplashScreen mode={splashMode} onFinish={() => setShowSplash(false)} />}

      {loggingOut && (
        <div className="fixed inset-0 z-[100] bg-[#8B5CF6] flex items-center justify-center animate-in fade-in duration-300">
          <div className="flex flex-col items-center gap-8 relative z-10">
            <div className="relative animate-bounce">
              <div className="absolute inset-0 bg-black blur-2xl rounded-full opacity-20" />
              <Logo className="w-24 h-24 text-black shadow-2xl" textClassName="hidden" iconClassName="text-white" />
            </div>

            <div className="text-center space-y-2">
              <h2 className="text-6xl font-black text-black uppercase tracking-tighter">
                SEE YA
              </h2>
              <p className="text-white font-mono text-xs font-bold uppercase tracking-widest">
                Terminating connection...
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-[#fafafa] relative isolate font-sans text-zinc-900 selection:bg-[#8B5CF6]">

        {/* Sticky Header with Tatva-inspired User Badge */}
        <header className="sticky top-0 z-40 border-b-2 border-black bg-white">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <Logo className="w-12 h-12 text-black shadow-lg transition-transform group-hover:scale-110 group-hover:rotate-3" textClassName="text-3xl font-black italic tracking-tighter" iconClassName="text-white" />
            </div>

            {me && (
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex items-center gap-3 border-2 border-black px-4 py-1.5 bg-[#8B5CF6] shadow-[2px_2px_0_0_#000]">
                  <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center text-[#8B5CF6] text-xs font-bold">
                    {me.username.substring(0, 1).toUpperCase()}
                  </div>
                  <span className="font-bold text-black uppercase tracking-wider text-sm">{me.username}</span>
                </div>
                <button
                  onClick={() => void logout()}
                  className="p-2 border-2 border-black hover:bg-black hover:text-white transition-colors"
                  title="Logout"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                </button>
              </div>
            )}
            {!me && (
              <button onClick={() => void logout()} className="font-bold underline">Logout</button>
            )}
          </div>
        </header>

        <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_300px] lg:gap-12">
            <div className="space-y-8 min-w-0">
              <Feed token={token} />
            </div>

            <aside className="hidden lg:block space-y-8">
              <div className="sticky top-24 space-y-6">
                <LeaderboardWidget />

                <div className="border-4 border-black bg-white p-0 shadow-[4px_4px_0_0_#000] overflow-hidden group">
                  <div className="bg-black text-white p-2 overflow-hidden whitespace-nowrap border-b-4 border-black">
                    <div className="animate-marquee inline-block font-mono text-xs font-bold uppercase tracking-widest">
                      // SYSTEM STATUS: ONLINE // WELCOME TO ECHO // NO FILTERS DETECTED // CHAOS LEVEL: MAXIMUM // JOIN THE CULT // SYSTEM STATUS: ONLINE //
                    </div>
                  </div>

                  <div className="p-6 space-y-6">
                    <div>
                      <h3 className="font-black text-3xl text-black italic leading-none tracking-tighter">ABOUT ECHO</h3>
                      <p className="text-sm text-zinc-600 font-bold leading-relaxed mt-2 font-mono">
                        The next-gen community feed. Built for speed, crafted for chaos. No algorithms, just raw data.
                      </p>
                    </div>

                    <div className="space-y-3 pt-4 border-t-2 border-dashed border-zinc-200">
                      <div className="flex justify-between items-center font-mono text-xs font-bold">
                        <span className="text-zinc-400">VERSION</span>
                        <span className="bg-[#8B5CF6] text-white px-2 py-0.5">V 0.3.0 // STABLE</span>
                      </div>
                      <div className="flex justify-between items-center font-mono text-xs font-bold">
                        <span className="text-zinc-400">PROTOCOL</span>
                        <span>REST / JSON</span>
                      </div>
                      <div className="flex justify-between items-center font-mono text-xs font-bold">
                        <span className="text-zinc-400">LATENCY</span>
                        <span className="text-emerald-600 animate-pulse">24ms</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-zinc-50 p-3 border-t-4 border-black text-center">
                    <a href="https://github.com/pratyushkumar" target="_blank" rel="noopener noreferrer" className="text-xs font-black uppercase tracking-widest text-[#8B5CF6] hover:text-black hover:underline transition-colors decoration-2 underline-offset-2">
                      View Source Code
                    </a>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </main>
      </div>
    </>
  );
}

