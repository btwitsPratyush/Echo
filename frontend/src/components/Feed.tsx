import { useEffect, useState } from "react";
import { api, Post } from "../api";
import PostCard from "./PostCard";
import Logo from "./Logo";

export default function Feed({ token }: { token: string | null }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const data = await api.listPosts(token);
      setPosts(data);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center px-2 border-b-4 border-black pb-4 mb-6">
        <h2 className="text-3xl font-black italic tracking-tighter uppercase text-black">The Stream</h2>
        <div className="flex items-center gap-2 bg-[#CCFF00] px-3 py-1 border-2 border-black shadow-[2px_2px_0_0_#000]">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <span className="font-mono text-xs font-bold text-black uppercase tracking-widest">LIVE REFRESH</span>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="rounded-xl bg-rose-50 p-4 text-sm font-medium text-rose-800 border border-rose-100">
          {error}
        </div>
      )}

      <div className="space-y-8">
        {posts.map((p, idx) => (
          <div key={p.id} className="animate-in slide-in-from-bottom-4 fade-in duration-700 fill-mode-both" style={{ animationDelay: `${idx * 100}ms` }}>
            <PostCard post={p} token={token} />
          </div>
        ))}
      </div>

      {loading && (
        <div className="py-20 text-center space-y-4 flex flex-col items-center justify-center min-h-[40vh]">
          <div className="relative">
            <div className="absolute inset-0 bg-[#CCFF00] blur-xl rounded-full opacity-50 animate-pulse" />
            <Logo className="w-16 h-16 text-black relative z-10 animate-bounce" textClassName="hidden" iconClassName="text-white" />
          </div>
          <p className="font-mono text-xs font-bold text-black uppercase tracking-widest animate-pulse">Synching Feed...</p>
        </div>
      )}

      {!loading && posts.length === 0 && (
        <div className="rounded-2xl border border-dashed border-zinc-300 p-12 text-center">
          <div className="mx-auto w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center mb-4 text-zinc-400">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
          </div>
          <h3 className="text-lg font-bold text-zinc-900 font-display">It's quiet here...</h3>
          <p className="text-zinc-500 max-w-xs mx-auto mt-1">Be the first to start the conversation.</p>
        </div>
      )}
    </div>
  );
}
