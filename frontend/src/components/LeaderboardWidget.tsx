import { useEffect, useState } from "react";
import { api, LeaderboardEntry } from "../api";
import Logo from "./Logo";

export default function LeaderboardWidget() {
  const [rows, setRows] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      setRows(await api.leaderboard());
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  return (
    <div className="bg-white border-4 border-black p-6 rounded-3xl shadow-[8px_8px_0_0_#CCFF00] min-h-[300px] relative">
      <div className="flex items-center justify-between mb-6 border-b-2 border-black pb-4">
        <div>
          <div className="text-3xl font-black text-black uppercase tracking-tighter italic">Top 5</div>
          <div className="text-xs text-black font-bold uppercase tracking-widest bg-[#CCFF00] inline-block px-1">24h Leaders</div>
        </div>
        <button
          className="text-xs font-black text-black hover:bg-black hover:text-[#CCFF00] transition-colors uppercase tracking-widest border-2 border-black px-2 py-1"
          onClick={() => void refresh()}
        >
          Refresh
        </button>
      </div>

      {loading && (
        <div className="absolute inset-0 z-10 bg-white/90 flex flex-col items-center justify-center animate-in fade-in duration-200">
          <Logo className="w-12 h-12 text-black animate-bounce" textClassName="hidden" iconClassName="text-[#CCFF00]" />
          <div className="font-mono text-xs font-bold text-black uppercase tracking-widest mt-4 animate-pulse">Scanning...</div>
        </div>
      )}

      {error ? (
        <div className="bg-rose-50 p-2 text-xs text-rose-800 border-2 border-rose-500 font-bold">{error}</div>
      ) : null}

      {!error && (
        <ol className="space-y-4">
          {rows.map((r, idx) => (
            <li key={r.user_id} className="flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <span className={`flex h-8 w-8 items-center justify-center border-2 border-black rounded-full font-black text-sm transition-transform group-hover:rotate-12 ${idx === 0 ? "bg-[#CCFF00] text-black shadow-[2px_2px_0_0_#000]" : "bg-white text-zinc-500"}`}>
                  {idx + 1}
                </span>
                <div className="flex flex-col">
                  <div className="text-sm font-bold text-black group-hover:underline decoration-2 decoration-[#CCFF00] truncate max-w-[120px]">
                    {r.username}
                  </div>
                </div>
              </div>
              <div className="text-xs font-black text-black bg-zinc-100 border-2 border-black px-2 py-1 shadow-[2px_2px_0_0_#000]">
                {r.karma} XP
              </div>
            </li>
          ))}
          {!loading && rows.length === 0 ? <div className="text-xs text-zinc-400 italic font-mono">No signals detected yet.</div> : null}
        </ol>
      )}
    </div>
  );
}
