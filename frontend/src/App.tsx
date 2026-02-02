import { useCallback, useEffect, useState } from "react";
import Feed from "./components/Feed";
import LeaderboardWidget from "./components/LeaderboardWidget";
import AuthPage from "./components/AuthPage";
import { api, UserBrief } from "./api"; // Updated import
import Logo from "./components/Logo";
import SplashScreen from "./components/SplashScreen";

import CreatePost from "./components/CreatePost"; // New Import

export default function App() {
  const [token, setToken] = useState<string | null>(null);
  const [me, setMe] = useState<UserBrief | null>(null); // Store current user
  const [authChecked, setAuthChecked] = useState(false);
  const [showSplash, setShowSplash] = useState(false);
  const [splashMode, setSplashMode] = useState<"intro" | "login">("intro");
  const [view, setView] = useState<"feed" | "post" | "leaderboard" | "about">("feed");

  const [showProfile, setShowProfile] = useState(false);
  const [chaosMode, setChaosMode] = useState(false); // Chaos Mode State

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
    const stored = sessionStorage.getItem("echo_token") || "";
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
    sessionStorage.setItem("echo_token", t);
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
        sessionStorage.removeItem("echo_token");
        setToken(null);
        setMe(null);
        setLoggingOut(false);
        setShowProfile(false);
        setChaosMode(false);
      }
    }, 1500);
  }, [token]);

  if (!authChecked) return null;
  if (!token) return <AuthPage onAuthed={onAuthed} />;

  return (
    <div className={chaosMode ? "chaos-active" : ""}>
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

      {/* User Profile Modal */}
      {showProfile && me && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setShowProfile(false)}
          />

          {/* Modal Content */}
          <div className="relative bg-white border-4 border-black shadow-[8px_8px_0_0_#CCFF00] w-full max-w-sm rounded-3xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-black text-[#CCFF00] p-3 border-b-4 border-black flex justify-between items-center">
              <span className="font-mono text-sm font-bold uppercase tracking-widest">// USER_DATA</span>
              <button onClick={() => setShowProfile(false)} className="text-[#CCFF00] hover:text-white">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="p-8 flex flex-col items-center gap-6">
              <div className="relative">
                <div className="absolute inset-0 bg-[#CCFF00] rounded-full blur-xl opacity-50"></div>
                <img
                  src={`https://api.dicebear.com/9.x/dylan/svg?seed=${me.username}`}
                  alt={me.username}
                  className="w-32 h-32 rounded-full border-4 border-black bg-white relative z-10"
                />
              </div>

              <div className="text-center space-y-1">
                <h3 className="text-3xl font-black uppercase italic tracking-tighter">{me.username}</h3>
                <div className="inline-block bg-black text-white px-3 py-1 font-mono text-xs font-bold rounded-full">
                  ID: #{me.id.toString().padStart(4, '0')}
                </div>
              </div>

              <div className="w-full grid grid-cols-2 gap-4 text-center">
                <div className="border-2 border-black p-2 rounded-xl bg-zinc-50">
                  <div className="text-2xl font-black">{me.post_count || 0}</div>
                  <div className="text-[10px] font-bold uppercase text-zinc-500">Posts</div>
                </div>
                <div className="border-2 border-black p-2 rounded-xl bg-zinc-50">
                  <div className="text-2xl font-black">{me.karma || 0}</div>
                  <div className="text-[10px] font-bold uppercase text-zinc-500">Karma</div>
                </div>
              </div>

              {/* CHAOS MODE TOGGLE */}
              <button
                onClick={() => setChaosMode(!chaosMode)}
                className={`w-full py-3 font-black uppercase tracking-widest border-4 border-black rounded-full transition-all ${chaosMode
                  ? 'bg-black text-[#CCFF00] shadow-none translate-x-[2px] translate-y-[2px]'
                  : 'bg-white text-black hover:bg-zinc-100 shadow-[4px_4px_0_0_#999]'
                  }`}
              >
                {chaosMode ? "DISABLE CHAOS" : "ENABLE CHAOS"}
              </button>

              <button
                onClick={() => void logout()}
                className="w-full py-4 bg-[#FF0000] text-white font-black uppercase tracking-widest border-4 border-black rounded-2xl hover:bg-black hover:text-[#FF0000] transition-colors shadow-[4px_4px_0_0_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
              >
                Terminate Session
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-[#8B5CF6] relative isolate font-sans text-zinc-900 selection:bg-pink-400 selection:text-black overflow-x-hidden pb-20">

        {/* Fixed Background Shapes - Cyber Chaos */}
        <div className="fixed top-20 right-[-50px] w-64 h-64 bg-[#FF90E8] rounded-full border-4 border-black z-0 pointer-events-none mix-blend-hard-light opacity-80" />
        <div className="fixed bottom-40 left-[-50px] w-80 h-80 bg-[#2DCDDF] border-4 border-black skew-x-12 z-0 pointer-events-none mix-blend-hard-light opacity-80" />
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600/20 rounded-full blur-3xl z-[-1] pointer-events-none" />

        {/* Sticky Header */}
        {/* HUD: Logo (Top Left) */}
        <div className="fixed top-6 left-6 z-50 cursor-pointer group" onClick={() => { setView('feed'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
          <Logo className="w-12 h-12 text-black group-hover:rotate-12 transition-transform drop-shadow-[4px_4px_0_rgba(0,0,0,1)]" textClassName="text-4xl font-black italic tracking-tighter" iconClassName="text-white" />
        </div>

        {/* HUD: User Controls (Top Right) */}
        {me && (
          <div className="fixed top-6 right-6 z-50 flex items-center gap-4">
            {/* Profile Dropdown Trigger */}
            <div className="relative group">
              <button
                onClick={() => setShowProfile(true)}
                className="hidden sm:flex items-center gap-3 border-4 border-black px-6 py-2 rounded-full bg-[#CCFF00] shadow-[4px_4px_0_0_#000] hover:translate-y-1 hover:shadow-none transition-all cursor-pointer active:scale-95"
              >
                <img
                  src={`https://api.dicebear.com/9.x/dylan/svg?seed=${me.username}`}
                  alt={me.username}
                  className="w-8 h-8 rounded-full border-2 border-black bg-white"
                />
                <div className="text-left">
                  <span className="block font-black text-black uppercase tracking-wider text-sm leading-none">{me.username}</span>
                  <span className="block font-mono text-[10px] font-bold text-black/60 leading-none">ID: #{me.id.toString().padStart(4, '0')}</span>
                </div>
              </button>
            </div>

            <button
              onClick={() => setShowProfile(true)} // Mobile profile trigger
              className="sm:hidden p-2 border-4 border-black rounded-full bg-[#CCFF00] shadow-[4px_4px_0_0_#000]"
            >
              <img
                src={`https://api.dicebear.com/9.x/dylan/svg?seed=${me.username}`}
                alt={me.username}
                className="w-8 h-8 rounded-full border-2 border-black bg-white"
              />
            </button>
          </div>
        )}
        {!me && (
          <div className="fixed top-6 right-6 z-50">
            <button onClick={() => void logout()} className="font-bold underline text-xl bg-white px-6 py-2 border-4 border-black rounded-full shadow-[4px_4px_0_0_#000]">Login</button>
          </div>
        )}

        {/* Sticky Nav Dock */}
        <header className="sticky top-6 z-40 mx-auto w-full max-w-xl px-4">
          <div className="bg-white border-4 border-black shadow-[4px_4px_0_0_#000] p-2 rounded-full">
            <nav className="flex items-center gap-2 w-full">
              {['feed', 'post', 'leaderboard', 'about'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setView(tab as any)}
                  className={`flex-1 px-6 py-3 text-xs font-black uppercase tracking-widest border-2 rounded-full transition-all ${view === tab
                    ? 'bg-black text-white border-black shadow-none'
                    : 'bg-transparent text-zinc-400 border-transparent hover:bg-zinc-100 hover:text-black'
                    }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>
        </header>

        <main className="mx-auto max-w-3xl px-4 py-8 mt-8 sm:px-6 lg:px-8">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {view === 'feed' && (
              <div className="space-y-8">
                <Feed token={token} />
              </div>
            )}

            {view === 'post' && (
              <CreatePost token={token} onPostSuccess={() => setView('feed')} />
            )}

            {view === 'leaderboard' && (
              <div className="max-w-md mx-auto">
                <LeaderboardWidget />
              </div>
            )}

            {view === 'about' && (
              <div className="max-w-md mx-auto">
                <div className="border-4 border-black bg-white p-0 rounded-3xl shadow-[8px_8px_0_0_#CCFF00] overflow-hidden group hover:-translate-y-1 transition-transform">
                  <div className="bg-black text-[#CCFF00] p-3 overflow-hidden whitespace-nowrap border-b-4 border-black">
                    <div className="animate-marquee inline-block font-mono text-sm font-bold uppercase tracking-widest">
                      // SYSTEM STATUS: ONLINE // WELCOME TO ECHO // NO FILTERS DETECTED // CHAOS LEVEL: MAXIMUM // JOIN THE CULT // SYSTEM STATUS: ONLINE //
                    </div>
                  </div>

                  <div className="p-8 space-y-8">
                    <div>
                      <h3 className="font-black text-5xl text-black italic leading-none tracking-tighter drop-shadow-[2px_2px_0_#CCFF00]">ECHO</h3>
                      <p className="text-sm text-black font-bold leading-relaxed mt-4 font-mono border-l-4 border-[#CCFF00] pl-4">
                        The next-gen community feed. Built for speed, crafted for chaos. No algorithms, just raw data.
                      </p>
                    </div>

                    <div className="space-y-4 pt-4 border-t-4 border-black">
                      <div className="flex justify-between items-center font-mono text-xs font-bold">
                        <span className="text-zinc-500">VERSION</span>
                        <span className="bg-black text-[#CCFF00] px-2 py-1">V 1.0.0 // RTM</span>
                      </div>
                      <div className="flex justify-between items-center font-mono text-xs font-bold">
                        <span className="text-zinc-500">PROTOCOL</span>
                        <span>REST / JSON</span>
                      </div>
                      <div className="flex justify-between items-center font-mono text-xs font-bold">
                        <span className="text-zinc-500">LATENCY</span>
                        <span className="text-emerald-600 animate-pulse">24ms</span>
                      </div>
                    </div>

                    <div className="bg-zinc-50 p-4 border-l-4 border-black">
                      <h4 className="font-black uppercase text-sm mb-2">Unique Features</h4>
                      <ul className="text-xs font-bold space-y-2">
                        <li className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-[#CCFF00] border border-black rounded-full"></span>
                          <span>NO ALGORITHMS. RAW FEED.</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-[#CCFF00] border border-black rounded-full"></span>
                          <span>CHAOS MODE (VISUAL GLITCH FX)</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-[#CCFF00] p-4 border-t-4 border-black text-center hover:bg-black hover:text-[#CCFF00] transition-colors cursor-pointer group/link">
                    <a href="https://github.com/btwitsPratyush/Echo" target="_blank" rel="noopener noreferrer" className="text-sm font-black uppercase tracking-widest text-black group-hover/link:text-[#CCFF00] decoration-2 underline-offset-4">
                      View Source Code
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
