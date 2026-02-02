import { useEffect, useState } from "react";
import { api, Post } from "../api";
import PostCard from "./PostCard";

export default function Feed({ token }: { token: string | null }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [composer, setComposer] = useState("");
  const [posting, setPosting] = useState(false);

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

  const canPost = !!token && !posting && composer.trim().length > 0;

  return (
    <div className="space-y-6">
      {/* Composer Card */}
      <div className="group relative overflow-hidden bg-white border-4 border-black p-4 shadow-[8px_8px_0_0_#000] transition-all focus-within:translate-x-[2px] focus-within:translate-y-[2px] focus-within:shadow-none">
        <div className="relative z-10">
          <textarea
            value={composer}
            onChange={(e) => setComposer(e.target.value)}
            placeholder={token ? "What's sparkling in your mind?" : "Sign in to start an echo..."}
            disabled={!token || posting}
            className="min-h-[120px] w-full resize-y bg-transparent text-xl font-bold text-black placeholder:text-zinc-400 focus:outline-none disabled:opacity-50"
          />
          <div className="mt-4 flex items-center justify-between border-t-2 border-zinc-100 pt-4">
            <div className="flex gap-2">
              <button disabled className="p-2 text-zinc-400 hover:text-black hover:bg-zinc-100 transition-colors border-2 border-transparent hover:border-black">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </button>
            </div>

            <div className="flex items-center gap-4">
              <button
                className="text-xs font-black uppercase tracking-widest text-zinc-400 hover:text-black transition-colors"
                onClick={() => void refresh()}
              >
                Refresh
              </button>
              <button
                disabled={!canPost}
                onClick={async () => {
                  if (!token || !canPost) return;
                  setPosting(true);
                  try {
                    await api.createPost(composer.trim(), token);
                    setComposer("");
                    await refresh();
                  } finally {
                    setPosting(false);
                  }
                }}
                className={[
                  "px-8 py-3 text-sm font-black uppercase tracking-widest border-2 border-transparent transition-all",
                  canPost
                    ? "bg-black text-white hover:bg-[#8B5CF6] hover:text-white hover:border-black hover:shadow-[4px_4px_0_0_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                    : "bg-zinc-100 text-zinc-400 cursor-not-allowed"
                ].join(" ")}
              >
                {posting ? "Posting..." : "POST IT"}
              </button>
            </div>
          </div>
        </div>
      </div >

      {
        loading ? (
          <div className="space-y-4 animate-pulse" >
            {
              [1, 2, 3].map(i => (
                <div key={i} className="h-48 rounded-2xl bg-white/40 border border-white/50" />
              ))
            }
          </div>
        ) : null
      }

      {
        error ? (
          <div className="rounded-xl bg-rose-50 p-4 text-sm font-medium text-rose-800 border border-rose-100">
            {error}
          </div>
        ) : null
      }

      <div className="space-y-6">
        {posts.map((p, idx) => (
          <div key={p.id} className="animate-in slide-in-from-bottom-4 fade-in duration-700 fill-mode-both" style={{ animationDelay: `${idx * 100}ms` }}>
            <PostCard post={p} token={token} />
          </div>
        ))}
        {!loading && posts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-300 p-12 text-center">
            <div className="mx-auto w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center mb-4 text-zinc-400">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
            </div>
            <h3 className="text-lg font-bold text-zinc-900 font-display">It's quiet here...</h3>
            <p className="text-zinc-500 max-w-xs mx-auto mt-1">Be the first to start the conversation.</p>
          </div>
        ) : null}
      </div>
    </div >
  );
}

