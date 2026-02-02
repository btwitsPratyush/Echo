import { useEffect, useState } from "react";
import { api, Post, PostDetail } from "../api";
import LikeButton from "./LikeButton";
import ThreadedComments from "./ThreadedComments";

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `${days}d`;
}

export default function PostCard({ post, token }: { post: Post; token: string | null }) {
  const [expanded, setExpanded] = useState(false);
  const [detail, setDetail] = useState<PostDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [localLikeCount, setLocalLikeCount] = useState(post.like_count);
  const [localLiked, setLocalLiked] = useState(post.liked_by_me);

  async function refreshDetail() {
    setLoadingDetail(true);
    try {
      const d = await api.getPost(post.id, token);
      setDetail(d);
    } finally {
      setLoadingDetail(false);
    }
  }

  useEffect(() => {
    if (!expanded) return;
    void refreshDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expanded]);

  return (
    <article className="group relative overflow-hidden bg-white p-6 border-4 border-black shadow-[4px_4px_0_0_#000] transition-all duration-300 hover:-translate-y-1 hover:shadow-[8px_8px_0_0_#8B5CF6]">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-[#FF90E8] border-2 border-black flex items-center justify-center text-sm font-black text-black uppercase shadow-[2px_2px_0_0_#000]">
              {post.author.username.substring(0, 1)}
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-black text-black text-lg font-display uppercase tracking-tight hover:underline cursor-pointer decoration-2 decoration-[#8B5CF6]">{post.author.username}</span>
              <span className="text-xs text-zinc-500 font-bold mt-1 uppercase tracking-widest">{timeAgo(post.created_at)}</span>
            </div>
          </div>

          <div className="mt-2 text-lg leading-relaxed text-black font-bold whitespace-pre-wrap">
            {post.content}
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between border-t-2 border-zinc-100 pt-4">
        <div className="flex items-center gap-6 text-zinc-500">
          <LikeButton
            likeCount={localLikeCount}
            likedByMe={localLiked}
            disabled={!token}
            onLike={async () => {
              if (!token) return localLikeCount;
              const res = await api.likePost(post.id, token);
              setLocalLikeCount(res.like_count);
              setLocalLiked(true);
              return res.like_count;
            }}
          />

          <button
            className="group flex items-center gap-2 text-sm font-medium transition-colors hover:text-indigo-600"
            onClick={() => setExpanded((v) => !v)}
          >
            <div className="p-1.5 rounded-full group-hover:bg-indigo-50 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
              </svg>
            </div>
            {post.comment_count || "Reply"}
          </button>
        </div>

        {expanded && (
          <button
            className="text-xs font-bold text-zinc-300 hover:text-zinc-500 uppercase tracking-wider"
            onClick={() => void refreshDetail()}
          >
            Refresh thread
          </button>
        )}
      </div>

      {expanded ? (
        <div className="mt-6 pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
          {loadingDetail && !detail ? (
            <div className="py-8 text-center text-sm text-zinc-400 animate-pulse">Loading discussion…</div>
          ) : detail ? (
            <ThreadedComments postId={post.id} comments={detail.comments} token={token} onRefresh={refreshDetail} />
          ) : (
            <div className="text-sm text-rose-600">Unable to load discussion.</div>
          )}
        </div>
      ) : null}
    </article>
  );
}

