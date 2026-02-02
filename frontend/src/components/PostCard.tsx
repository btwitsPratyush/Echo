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
    <article className="group relative overflow-hidden bg-white hover:bg-zinc-50 border-4 border-black rounded-3xl shadow-[4px_4px_0_0_#EEEEEE] hover:shadow-[6px_6px_0_0_#8B5CF6] transition-all duration-200">

      {/* Header / Author Info */}
      <div className="p-5 flex items-start justify-between gap-4 border-b-2 border-zinc-100">
        <div className="flex items-center gap-3">
          <img
            src={`https://api.dicebear.com/9.x/dylan/svg?seed=${post.author.username}`}
            alt={post.author.username}
            className="w-10 h-10 rounded-full border-2 border-black bg-white"
          />
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-black text-black text-base font-display tracking-tight hover:underline cursor-pointer">{post.author.username}</span>
              {/* Simulated Verified Badge */}
              <div className="w-4 h-4 rounded-full bg-[#8B5CF6] flex items-center justify-center text-white text-[10px]">
                <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              </div>
            </div>
            <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">{timeAgo(post.created_at)}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 text-xl leading-relaxed text-zinc-800 font-medium whitespace-pre-wrap">
        {post.content}
      </div>

      {/* Footer / Actions */}
      <div className="px-6 py-4 bg-zinc-50 border-t-2 border-black/5 flex items-center justify-between">
        <div className="flex items-center gap-4">
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
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border-2 text-xs font-black uppercase tracking-wider transition-all
                ${expanded
                ? 'bg-black text-white border-black'
                : 'bg-white text-zinc-600 border-zinc-200 hover:border-black hover:text-black'
              }`}
            onClick={() => setExpanded((v) => !v)}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
            </svg>
            <span>{post.comment_count} Replies</span>
          </button>
        </div>

        {expanded && (
          <button onClick={() => void refreshDetail()} className="p-2 hover:bg-zinc-200 rounded-full transition-colors" title="Refresh Thread">
            <svg className="w-4 h-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          </button>
        )}
      </div>

      {expanded ? (
        <div className="border-t-2 border-black/5 bg-zinc-50 p-6 animate-in slide-in-from-top-2 fade-in duration-200">
          {loadingDetail && !detail ? (
            <div className="flex justify-center py-4">
              <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
            </div>
          ) : detail ? (
            <ThreadedComments postId={post.id} comments={detail.comments} token={token} onRefresh={refreshDetail} />
          ) : (
            <div className="text-xs text-rose-500 font-bold uppercase">Unable to load discussion.</div>
          )}
        </div>
      ) : null}
    </article>
  );
}

