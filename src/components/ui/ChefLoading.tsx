"use client";

export function ChefLoading() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#020408]">
      {/* Background Ornaments */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/2 left-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/10 blur-[100px]" />
      </div>

      <div className="relative flex flex-col items-center">
        {/* The Plate Animation */}
        <div className="relative h-32 w-32">
          {/* Plate Base */}
          <div className="absolute inset-0 rounded-full border-4 border-white/5 bg-gradient-to-br from-white/5 to-transparent shadow-2xl" />
          <div className="absolute inset-2 rounded-full border-2 border-white/5 bg-black/20" />
          
          {/* Steam Effect */}
          <div className="absolute -top-8 left-1/2 flex -translate-x-1/2 gap-2">
            <div className="h-8 w-1 animate-steam rounded-full bg-gradient-to-t from-violet-500/40 to-transparent blur-sm" style={{ animationDelay: '0s' }} />
            <div className="mt-2 h-10 w-1 animate-steam rounded-full bg-gradient-to-t from-indigo-500/40 to-transparent blur-sm" style={{ animationDelay: '0.4s' }} />
            <div className="h-6 w-1 animate-steam rounded-full bg-gradient-to-t from-fuchsia-500/40 to-transparent blur-sm" style={{ animationDelay: '0.8s' }} />
          </div>

          {/* Rice / Food Particles */}
          <div className="absolute inset-6 flex flex-wrap items-center justify-center gap-1.5 overflow-hidden rounded-full p-2">
            {[...Array(12)].map((_, i) => (
              <div 
                key={i} 
                className="h-2 w-2 animate-bounce rounded-full bg-slate-200/80 shadow-[0_0_8px_rgba(255,255,255,0.3)]" 
                style={{ 
                  animationDelay: `${i * 0.1}s`,
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
          <h3 className="bg-gradient-to-b from-white to-slate-500 bg-clip-text text-xl font-black tracking-tighter text-transparent">
            Lezzetler Hazırlanıyor
          </h3>
          <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.3em] text-slate-600">
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
          animation: steam 2s infinite ease-out;
        }
      `}</style>
    </div>
  );
}
