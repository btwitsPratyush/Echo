type Props = {
  likeCount: number;
  likedByMe?: boolean;
  disabled?: boolean;
  onLike: () => Promise<number>;
};

export default function LikeButton({ likeCount, likedByMe, disabled, onLike }: Props) {
  return (
    <button
      disabled={disabled}
      onClick={async (e) => {
        e.stopPropagation();
        if (disabled) return;
        await onLike();
      }}
      className={[
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium transition-all",
        likedByMe
          ? "border-black bg-black text-white"
          : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50",
        disabled ? "cursor-not-allowed opacity-50" : ""
      ].join(" ")}
      title={disabled ? "Login to like" : likedByMe ? "You liked this" : "Like"}
    >
      <span className={likedByMe ? "text-white" : "text-zinc-900"}>{likeCount}</span>
      <span className={likedByMe ? "text-zinc-300" : "text-zinc-400"}>Likes</span>
    </button>
  );
}

