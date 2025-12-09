export function LabsOverviewPage() {
  return (
    <>
      <h1 className="text-3xl sm:text-4xl font-bold text-slate-50 text-center">
        Labs & Experiments
      </h1>
      <p className="mt-2 text-sm sm:text-base text-slate-300 text-center">
        Ongoing projects and technical experiments
      </p>

      <div className="mt-8 space-y-6">
        <div className="rounded-xl bg-slate-900/50 border border-slate-800 p-6">
          <h2 className="text-xl font-semibold text-slate-100 mb-4">Active Labs</h2>
          <p className="text-slate-400">
            Labs content coming soon.
          </p>
        </div>
      </div>
    </>
  );
}
