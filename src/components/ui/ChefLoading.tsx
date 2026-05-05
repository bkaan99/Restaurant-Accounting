"use client";

import { useTheme } from "@/context/ThemeContext";

export function ChefLoading() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center transition-colors duration-500 ${
        isDark ? "bg-[#020408]" : "bg-[#fafafa]"
      }`}
    >
      {/* Background Ornaments */}
      <div className="pointer-events-none absolute inset-0">
        <div className={`absolute top-1/2 left-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[100px] ${isDark ? "bg-violet-600/10" : "bg-violet-600/5"}`} />
      </div>

      <div className="relative flex flex-col items-center">
        {/* The Plate Animation */}
        <div className="relative h-32 w-32">
          {/* Plate Base */}
          <div className={`absolute inset-0 rounded-full border-4 bg-gradient-to-br shadow-xl ${isDark ? "border-white/5 from-white/5 to-transparent shadow-2xl" : "border-black/5 from-white to-slate-50"}`} />
          <div className={`absolute inset-2 rounded-full border-2 ${isDark ? "border-white/5 bg-black/20" : "border-black/5 bg-slate-100"}`} />
          
          {/* Steam Effect */}
          <div className="absolute -top-8 left-1/2 flex -translate-x-1/2 gap-2">
            <div className={`h-8 w-1 animate-steam rounded-full bg-gradient-to-t to-transparent blur-sm ${isDark ? "from-violet-500/40" : "from-violet-500/20"}`} style={{ animationDelay: "0s" }} />
            <div className={`mt-2 h-10 w-1 animate-steam rounded-full bg-gradient-to-t to-transparent blur-sm ${isDark ? "from-indigo-500/40" : "from-indigo-500/20"}`} style={{ animationDelay: "0.2s" }} />
            <div className={`h-6 w-1 animate-steam rounded-full bg-gradient-to-t to-transparent blur-sm ${isDark ? "from-fuchsia-500/40" : "from-fuchsia-500/20"}`} style={{ animationDelay: "0.4s" }} />
          </div>

          {/* Rice / Food Particles */}
          <div className="absolute inset-6 flex flex-wrap items-center justify-center gap-1.5 overflow-hidden rounded-full p-2">
            {[...Array(12)].map((_, i) => (
              <div 
                key={i} 
                className={`h-2 w-2 animate-bounce rounded-full shadow-sm ${
                  isDark
                    ? "bg-slate-200/80 shadow-[0_0_8px_rgba(255,255,255,0.3)]"
                    : "bg-slate-400/30"
                }`}
                style={{ 
                  animationDelay: `${i * 0.05}s`,
                  opacity: 0.4 + (i % 5) * 0.1
                }} 
              />
            ))}
          </div>

          {/* Glow Effect */}
          <div className="absolute inset-0 animate-pulse rounded-full bg-violet-500/5 blur-xl" />
        </div>

        {/* Text */}
        <div className="mt-12 flex flex-col items-center text-center">
          <h3 className={`bg-gradient-to-b bg-clip-text text-xl font-black tracking-tighter text-transparent ${isDark ? "from-white to-slate-500" : "from-slate-900 to-slate-500"}`}>
            Lezzetler Hazırlanıyor
          </h3>
          <p className={`mt-2 text-[10px] font-bold uppercase tracking-[0.3em] ${isDark ? "text-slate-600" : "text-slate-400"}`}>
            Lütfen Bekleyin...
          </p>
        </div>
      </div>

      <style jsx global>{`
        @keyframes steam {
          0% { transform: translateY(0) scaleX(1); opacity: 0; }
          50% { transform: translateY(-10px) scaleX(1.5); opacity: 0.6; }
          100% { transform: translateY(-25px) scaleX(2); opacity: 0; }
        }
        .animate-steam {
          animation: steam 1.2s infinite ease-out;
        }
      `}</style>
    </div>
  );
}
