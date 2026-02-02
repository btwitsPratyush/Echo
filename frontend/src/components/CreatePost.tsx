import { useState } from "react";
import { api } from "../api";

export default function CreatePost({ token, onPostSuccess }: { token: string | null; onPostSuccess: () => void }) {
    const [composer, setComposer] = useState("");
    const [posting, setPosting] = useState(false);

    const canPost = token && !posting && composer.trim().length > 0;

    async function handlePost() {
        if (!token || !composer.trim()) return;
        setPosting(true);
        try {
            await api.createPost(composer, token);
            setComposer("");
            onPostSuccess();
        } finally {
            setPosting(false);
        }
    }

    return (
        <div className="max-w-xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

            <div className="text-center space-y-2">
                <h2 className="text-6xl font-black italic tracking-tighter uppercase drop-shadow-[4px_4px_0_rgba(0,0,0,1)] text-[#CCFF00] stroke-black text-stroke-2">NEW POST</h2>
                <div className="inline-block bg-black px-4 py-1 transform -rotate-1">
                    <p className="font-mono text-sm font-bold text-[#CCFF00] uppercase tracking-widest">Share with the community</p>
                </div>
            </div>

            {/* Composer Card */}
            <div className="group relative overflow-hidden bg-white border-4 border-black p-6 shadow-[8px_8px_0_0_#CCFF00] transition-all focus-within:translate-x-[2px] focus-within:translate-y-[2px] focus-within:shadow-none">
                <div className="relative z-10">
                    <textarea
                        value={composer}
                        onChange={(e) => setComposer(e.target.value)}
                        placeholder={token ? "What's on your mind?" : "Sign in to post..."}
                        disabled={!token || posting}
                        className="min-h-[200px] w-full resize-y bg-transparent text-2xl font-black text-black placeholder:text-zinc-400 focus:outline-none disabled:opacity-50 tracking-tight leading-tight"
                        autoFocus
                    />
                    <div className="mt-4 flex items-center justify-end border-t-2 border-zinc-100 pt-4">
                        <div className="flex items-center gap-4">
                            <span className="font-mono text-xs font-bold text-zinc-300">
                                {composer.length}/280
                            </span>
                            <button
                                disabled={!canPost}
                                onClick={() => void handlePost()}
                                className={[
                                    "px-8 py-3 text-sm font-black uppercase tracking-widest border-2 border-transparent transition-all",
                                    canPost
                                        ? "bg-black text-white hover:bg-[#CCFF00] hover:text-black hover:border-black hover:shadow-[4px_4px_0_0_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                                        : "bg-zinc-100 text-zinc-400 cursor-not-allowed"
                                ].join(" ")}
                            >
                                {posting ? "Posting..." : "POST"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {!token && (
                <div className="text-center p-4 border-2 border-dashed border-zinc-300 bg-zinc-50 font-mono text-xs text-zinc-500">
                    AUTHENTICATION REQUIRED TO BROADCAST
                </div>
            )}
        </div>
    );
}
