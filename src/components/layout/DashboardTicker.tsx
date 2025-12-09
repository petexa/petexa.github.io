export function DashboardTicker() {
  return (
    <div className="w-full border-b border-slate-800 bg-slate-900/50 py-2">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center gap-4 text-xs sm:text-sm text-slate-400">
          <span className="text-cyan-400 font-semibold">⚡ Live:</span>
          <span>Dashboard updates in real-time</span>
          <span className="hidden sm:inline">·</span>
          <span className="hidden sm:inline">Last sync: just now</span>
        </div>
      </div>
    </div>
  );
}
