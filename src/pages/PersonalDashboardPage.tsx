export function PersonalDashboardPage() {
  return (
    <>
      <h1 className="text-3xl sm:text-4xl font-bold text-slate-50 text-center">
        Personal Dashboard
      </h1>
      <p className="mt-2 text-sm sm:text-base text-slate-300 text-center">
        Your tools, goals, and today&apos;s training at a glance.
      </p>

      <div className="mt-8 space-y-6">
        <div className="rounded-xl bg-slate-900/50 border border-slate-800 p-6">
          <h2 className="text-xl font-semibold text-slate-100 mb-4">
            Quick Stats
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-cyan-400">12</div>
              <div className="text-xs text-slate-400">Active Projects</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-cyan-400">8</div>
              <div className="text-xs text-slate-400">Labs Running</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-cyan-400">24</div>
              <div className="text-xs text-slate-400">Tools Built</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-cyan-400">100+</div>
              <div className="text-xs text-slate-400">Experiments</div>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-slate-900/50 border border-slate-800 p-6">
          <h2 className="text-xl font-semibold text-slate-100 mb-4">
            Recent Activity
          </h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-cyan-400 mt-2" />
              <div>
                <div className="text-sm text-slate-200">Updated React Training Hub</div>
                <div className="text-xs text-slate-500">2 hours ago</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-cyan-400 mt-2" />
              <div>
                <div className="text-sm text-slate-200">Completed Home Assistant automation</div>
                <div className="text-xs text-slate-500">5 hours ago</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-cyan-400 mt-2" />
              <div>
                <div className="text-sm text-slate-200">Deployed new blueprint viewer</div>
                <div className="text-xs text-slate-500">Yesterday</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
