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
        className="min-h-[80px] w-full resize-y rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm placeholder:text-zinc-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 disabled:bg-zinc-50 disabled:text-zinc-400"
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
            "rounded-md px-3 py-1.5 text-xs font-semibold transition-all",
            canSubmit
              ? "bg-brand-600 text-white hover:bg-brand-700 shadow-sm"
              : "bg-zinc-100 text-zinc-400 cursor-not-allowed"
          ].join(" ")}
        >
          {submitting ? "..." : submitLabel}
        </button>
      </div>
    </div>
  );
}

