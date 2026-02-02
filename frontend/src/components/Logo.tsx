export default function Logo({ className = "w-6 h-6", textClassName = "text-xl", iconClassName = "text-white" }: { className?: string, textClassName?: string, iconClassName?: string }) {
    return (
        <div className="flex items-center gap-2.5">
            <div className={`relative flex items-center justify-center ${className}`}>
                {/* bg-current here uses the PARENT'S text color (e.g. text-black) */}
                <div className="absolute inset-0 bg-current rounded-lg rotate-3 opacity-20" />
                <div className="relative w-full h-full bg-current rounded-lg flex items-center justify-center shadow-sm">
                    {/* We isolate text-white here so it doesn't affect the bg-current above */}
                    <div className={`${iconClassName} w-full h-full flex items-center justify-center`}>
                        <svg className="w-1/2 h-1/2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M7 8L3 12L7 16" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M17 8L21 12L17 16" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M14 4L10 20" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                </div>
            </div>
            <span className={`font-bold tracking-tight font-display text-zinc-900 ${textClassName}`}>Echo</span>
        </div>
    );
}
