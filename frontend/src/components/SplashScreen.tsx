import { useEffect, useState } from "react";
import Logo from "./Logo";

type SplashMode = "intro" | "login";

export default function SplashScreen({ onFinish, mode = "intro" }: { onFinish?: () => void, mode?: SplashMode }) {
    const [fading, setFading] = useState(false);

    useEffect(() => {
        const duration = mode === "login" ? 2000 : 1500;
        const timer1 = setTimeout(() => setFading(true), duration);
        const timer2 = setTimeout(() => {
            if (onFinish) onFinish();
        }, duration + 700);

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
        };
    }, [onFinish, mode]);

    // Render White "Intro" Mode (Refresh)
    if (mode === "intro") {
        return (
            <div
                className={`fixed inset-0 z-[100] flex items-center justify-center bg-white transition-opacity duration-700 ease-in-out ${fading ? "opacity-0 pointer-events-none" : "opacity-100"}`}
            >
                <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in-95 duration-500">
                    <div className="relative animate-bounce">
                        <div className="absolute inset-0 bg-brand-500/20 blur-xl rounded-full" />
                        <Logo className="w-16 h-16 text-black relative z-10" textClassName="hidden" />
                    </div>
                    <h1 className="text-2xl font-bold font-display tracking-tight text-zinc-900">
                        Echo
                    </h1>
                </div>
            </div>
        );
    }

    // Render Black "Login" Mode (Purple Background, Black Logo)
    return (
        <div
            className={`fixed inset-0 z-[100] flex items-center justify-center bg-[#8B5CF6] transition-opacity duration-700 ease-in-out ${fading ? "opacity-0 pointer-events-none" : "opacity-100"}`}
        >
            <div className="flex flex-col items-center gap-8 relative z-10">
                <div className="relative animate-bounce">
                    <div className="absolute inset-0 bg-black blur-2xl rounded-full opacity-20" />
                    <Logo className="w-24 h-24 text-black shadow-2xl" textClassName="hidden" iconClassName="text-white" />
                </div>

                <div className="text-center space-y-2">
                    <h1 className="text-6xl font-black font-display tracking-tighter text-black uppercase">
                        WELCOME<br />TO ECHO
                    </h1>
                    <div className="text-white font-mono text-xs font-bold uppercase tracking-widest">
                        Initiating Session...
                    </div>
                </div>
            </div>
        </div>
    );
}
