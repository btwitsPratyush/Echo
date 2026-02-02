import { useEffect, useMemo, useState } from "react";
import { api } from "../api";
import Logo from "./Logo";

type Mode = "login" | "signup";

type Props = {
  onAuthed: (token: string) => void;
};

export default function AuthPage({ onAuthed }: Props) {
  const [mode, setMode] = useState<Mode>("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false); // New state

  const canSubmit = useMemo(() => {
    if (!username.trim() || !password) return false;
    if (mode === "signup" && password !== confirm) return false;
    return true;
  }, [username, password, confirm, mode]);

  useEffect(() => setError(null), [mode]);

  return (
    <div className="min-h-screen w-full flex bg-[#8B5CF6] font-sans selection:bg-black selection:text-[#8B5CF6]">
      {/* Left Panel - Branding & Description (Desktop) */}
      <div className="hidden lg:flex w-1/2 flex-col justify-between p-12 relative overflow-hidden border-r-4 border-black">
        {/* Abstract geometric shapes */}
        <div className="absolute top-20 right-20 w-32 h-32 bg-[#FF90E8] rounded-full border-4 border-black" />
        <div className="absolute bottom-40 left-20 w-48 h-48 bg-[#2DCDDF] border-4 border-black skew-x-12" />

        <div className="relative z-10">
          <Logo className="w-16 h-16 text-black" textClassName="text-4xl" />
        </div>

        <div className="relative z-10 space-y-6 max-w-xl">
          <h1 className="text-8xl font-black tracking-tighter leading-[0.9] text-black drop-shadow-[4px_4px_0_rgba(255,255,255,0.5)]">
            SPEAK<br />LOUD.
          </h1>
          <p className="text-2xl font-bold font-display border-l-4 border-black pl-6 py-2 bg-white/50 backdrop-blur-sm">
            The feed for raw thoughts. No filters, no fluff. Just pure, unadulterated chaos and community.
          </p>
        </div>

        <div className="relative z-10 font-mono text-xs font-bold uppercase tracking-widest text-black/60">
          © 2026 Echo Systems Inc.
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-white relative">
        {/* Mobile Background styling */}
        <div className="absolute inset-0 lg:hidden bg-[#8B5CF6]" />

        <div className="w-full max-w-md bg-white border-4 border-[#8B5CF6] shadow-[0_0_20px_#8B5CF6] p-8 relative z-10">
          <div className="mb-8 text-center">
            <h2 className="text-4xl font-black uppercase text-black italic">
              {mode === "login" ? "Enter the Arena" : "Join the Cult"}
            </h2>
            <p className="mt-3 font-bold text-zinc-500">
              {mode === "login" ? "Welcome back, stranger." : "Claim your username before it's gone."}
            </p>
          </div>

          <div className="flex border-2 border-black mb-6 p-1 gap-1 bg-zinc-100">
            <button
              onClick={() => setMode("login")}
              className={`flex-1 py-3 text-sm font-black uppercase tracking-widest transition-all ${mode === 'login' ? 'bg-[#8B5CF6] text-white border-2 border-[#8B5CF6] shadow-[0_0_10px_#8B5CF6]' : 'text-zinc-500 hover:bg-zinc-200'}`}
            >
              Login
            </button>
            <button
              onClick={() => setMode("signup")}
              className={`flex-1 py-3 text-sm font-black uppercase tracking-widest transition-all ${mode === 'signup' ? 'bg-[#8B5CF6] text-white border-2 border-[#8B5CF6] shadow-[0_0_10px_#8B5CF6]' : 'text-zinc-500 hover:bg-zinc-200'}`}
            >
              Sign Up
            </button>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-xs font-black uppercase mb-1">Username</label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-zinc-50 border-2 border-black px-4 py-3 font-bold placeholder:text-zinc-400 focus:outline-none focus:bg-[#8B5CF6]"
                placeholder="USERNAME"
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-zinc-50 border-2 border-black px-4 py-3 font-bold placeholder:text-zinc-400 focus:outline-none focus:bg-[#8B5CF6] pr-12"
                  placeholder="PASSWORD"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-black"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  )}
                </button>
              </div>
            </div>

            {mode === "signup" && (
              <div>
                <label className="block text-xs font-black uppercase mb-1">Confirm</label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="w-full bg-zinc-50 border-2 border-black px-4 py-3 font-bold placeholder:text-zinc-400 focus:outline-none focus:bg-[#8B5CF6]"
                  placeholder="CONFIRM PASSWORD"
                />
              </div>
            )}

            <button
              disabled={!canSubmit || busy}
              onClick={async () => {
                if (!canSubmit) return;
                setBusy(true);
                setError(null);
                try {
                  const res = mode === "login"
                    ? await api.login(username.trim(), password)
                    : await api.signup(username.trim(), password);
                  onAuthed(res.token);
                } catch (e) {
                  let msg = (e as Error).message;
                  // Improved Error Parsing
                  if (msg.includes("Bad Request:")) {
                    try {
                      const jsonStr = msg.split("Bad Request:")[1].trim();
                      const data = JSON.parse(jsonStr);
                      const parts = [];
                      // Flatten all error messages
                      if (data.non_field_errors) parts.push(...data.non_field_errors);
                      if (data.username) parts.push(...data.username);
                      if (data.password) parts.push(...data.password);
                      if (parts.length > 0) msg = parts.join(" ");
                      else msg = "Invalid credentials provided.";
                    } catch {
                      msg = "Invalid login details.";
                    }
                  } else if (msg.includes("401")) { // Handle standard 401 unauthorized
                    msg = "Incorrect username or password.";
                  }
                  setError(msg);
                } finally {
                  setBusy(false);
                }
              }}
              className="w-full bg-black text-white py-4 font-black uppercase tracking-widest text-lg border-2 border-transparent hover:bg-white hover:text-black hover:border-[#8B5CF6] hover:shadow-[0_0_20px_#8B5CF6] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {busy ? "LOADING..." : "LET'S GO"}
            </button>

            {error && (
              <div className="bg-[#FF0000] text-white font-bold p-3 border-2 border-black shadow-[4px_4px_0px_0px_#000] animate-in fade-in slide-in-from-top-2">
                ERROR: {error}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

