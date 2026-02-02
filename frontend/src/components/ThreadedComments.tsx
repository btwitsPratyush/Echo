import { useMemo, useState } from "react";
import { api, CommentNode } from "../api";
import CommentComposer from "./CommentComposer";
import LikeButton from "./LikeButton";

type Props = {
  postId: number;
  comments: CommentNode[];
  token: string | null;
  onRefresh: () => Promise<void>;
};

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

export default function ThreadedComments({ postId, comments, token, onRefresh }: Props) {
  const hasAuth = !!token;

  const totalCount = useMemo(() => {
    const countNodes = (nodes: CommentNode[]): number =>
      nodes.reduce((acc, n) => acc + 1 + countNodes(n.children || []), 0);
    return countNodes(comments);
  }, [comments]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold text-black">
          {totalCount} Comments
        </div>
      </div>

      <CommentComposer
        placeholder={hasAuth ? "Write a comment..." : "Sign in to comment"}
        submitLabel="Post Comment"
        disabled={!hasAuth}
        onSubmit={async (content) => {
          if (!token) return;
          await api.createComment(postId, content, null, token);
          await onRefresh();
        }}
      />

      <div className="space-y-6 pt-2">
        {comments.map((c) => (
          <CommentNodeView key={c.id} node={c} postId={postId} token={token} onRefresh={onRefresh} depth={0} />
        ))}
      </div>
    </div>
  );
}

function CommentNodeView({
  node,
  postId,
  token,
  onRefresh,
  depth
}: {
  node: CommentNode;
  postId: number;
  token: string | null;
  onRefresh: () => Promise<void>;
  depth: number;
}) {
  const [replying, setReplying] = useState(false);
  const [localLikeCount, setLocalLikeCount] = useState(node.like_count);
  const [localLiked, setLocalLiked] = useState(node.liked_by_me);

  const hasAuth = !!token;

  return (
    <div className="relative group">
      {/* Thread line for nested comments */}
      {depth > 0 && (
        <div className="absolute -left-3 top-0 bottom-0 w-px bg-zinc-200" />
      )}

      <div className={depth > 0 ? "pl-4" : ""}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs">
              <span className="font-bold text-black">{node.author.username}</span>
              <span className="text-zinc-400">•</span>
              <span className="text-zinc-500">{timeAgo(node.created_at)}</span>
            </div>
            <div className="mt-1 text-sm leading-relaxed text-zinc-800 whitespace-pre-wrap">{node.content}</div>
          </div>
        </div>

        <div className="mt-2 flex items-center gap-4">
          <LikeButton
            likeCount={localLikeCount}
            likedByMe={localLiked}
            disabled={!hasAuth}
            onLike={async () => {
              if (!token) return localLikeCount;
              const res = await api.likeComment(node.id, token);
              setLocalLikeCount(res.like_count);
              setLocalLiked(true);
              return res.like_count;
            }}
          />

          <button
            className="text-xs font-medium text-zinc-500 hover:text-black transition-colors"
            onClick={() => setReplying((v) => !v)}
          >
            {replying ? "Cancel" : "Reply"}
          </button>
        </div>

        {replying && (
          <div className="mt-3 pl-2 border-l-2 border-brand-500">
            <CommentComposer
              placeholder={hasAuth ? "Write a reply..." : "Sign in to reply"}
              submitLabel="Reply"
              disabled={!hasAuth}
              onSubmit={async (content) => {
                if (!token) return;
                await api.createComment(postId, content, node.id, token);
                setReplying(false);
                await onRefresh();
              }}
            />
          </div>
        )}

        {node.children?.length ? (
          <div className="mt-3 space-y-3">
            {node.children.map((child) => (
              <CommentNodeView
                key={child.id}
                node={child}
                postId={postId}
                token={token}
                onRefresh={onRefresh}
                depth={depth + 1}
              />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

