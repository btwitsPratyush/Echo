import { useState } from "react";

type Props = {
  placeholder: string;
  submitLabel: string;
  disabled?: boolean;
  onSubmit: (content: string) => Promise<void>;
};

export default function CommentComposer({ placeholder, submitLabel, disabled, onSubmit }: Props) {
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = !disabled && !submitting && content.trim().length > 0;

  return (
    <div className="group relative">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        className="min-h-[80px] w-full resize-y border-2 border-black bg-white px-3 py-2 text-sm font-bold text-black placeholder:text-zinc-400 focus:outline-none focus:shadow-[4px_4px_0_0_#CCFF00] transition-shadow disabled:bg-zinc-50 disabled:text-zinc-400"
        disabled={disabled || submitting}
      />
      <div className="mt-2 flex items-center justify-end">
        <button
          disabled={!canSubmit}
          onClick={async () => {
            if (!canSubmit) return;
            setSubmitting(true);
            try {
              await onSubmit(content.trim());
              setContent("");
            } finally {
              setSubmitting(false);
            }
          }}
          className={[
            "px-4 py-2 text-xs font-black uppercase tracking-widest border-2 transition-all",
            canSubmit
              ? "bg-black text-white border-transparent hover:bg-[#CCFF00] hover:text-black hover:border-black hover:shadow-[2px_2px_0_0_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
              : "bg-zinc-100 text-zinc-400 border-transparent cursor-not-allowed"
          ].join(" ")}
        >
          {submitting ? "..." : submitLabel}
        </button>
      </div>
    </div>
  );
}

