import { useEffect, useState } from "react";
import { api, LeaderboardEntry } from "../api";

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
    <div className="bg-white border-4 border-black p-6 shadow-[4px_4px_0_0_#000]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-xl font-black text-black uppercase tracking-tighter italic">Top 5</div>
          <div className="text-xs text-[#8B5CF6] font-bold uppercase tracking-widest">24h Leaders</div>
        </div>
        <button
          className="text-xs font-black text-zinc-400 hover:text-black transition-colors uppercase tracking-widest border-b-2 border-transparent hover:border-black"
          onClick={() => void refresh()}
        >
          Refresh
        </button>
      </div>

      {loading ? <div className="text-sm text-zinc-400 animate-pulse">Updating...</div> : null}
      {error ? (
        <div className="rounded-md bg-rose-50 p-2 text-xs text-rose-800">{error}</div>
      ) : null}

      {!loading && !error ? (
        <ol className="space-y-4">
          {rows.map((r, idx) => (
            <li key={r.user_id} className="flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <span className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold transition-transform group-hover:scale-110 ${idx === 0 ? "bg-amber-100 text-amber-700" : "bg-zinc-100 text-zinc-500"}`}>
                  {idx + 1}
                </span>
                <div className="text-sm font-semibold text-zinc-700 group-hover:text-black transition-colors truncate max-w-[120px]">
                  {r.username}
                </div>
              </div>
              <div className="text-xs font-bold text-zinc-900 bg-zinc-50 px-2 py-1 rounded-md">
                {r.karma}
              </div>
            </li>
          ))}
          {rows.length === 0 ? <div className="text-xs text-zinc-400 italic">No movement on the leaderboard yet.</div> : null}
        </ol>
      ) : null}
    </div>
  );
}


