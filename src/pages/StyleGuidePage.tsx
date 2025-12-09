export function StyleGuidePage() {
  return (
    <>
      <h1 className="text-3xl sm:text-4xl font-bold text-slate-50 text-center">
        Style Guide
      </h1>
      <p className="mt-2 text-sm sm:text-base text-slate-300 text-center">
        Design patterns and component guidelines for Pete&apos;s Lab
      </p>

      <div className="mt-8 space-y-8">
        {/* Global Layout Pattern */}
        <section className="rounded-xl bg-slate-900/50 border border-slate-800 p-6">
          <h2 className="text-2xl font-semibold text-slate-100 mb-4">
            Global Layout Pattern
          </h2>
          <p className="text-slate-300 mb-4">
            All Pete&apos;s Lab pages are wrapped with <code className="px-2 py-1 bg-slate-800 rounded text-cyan-300">GlobalShell</code>,
            which provides consistent header, navigation, and footer across the app.
          </p>
          
          <div className="bg-slate-950 rounded-lg p-4 mb-4 overflow-x-auto">
            <pre className="text-sm text-slate-300">
              <code>{`<BrowserRouter>
  <ScrollToTop />
  <GlobalShell>
    <Routes>
      <Route path="/" element={<PersonalDashboardPage />} />
      {/* more routes */}
    </Routes>
  </GlobalShell>
</BrowserRouter>`}</code>
            </pre>
          </div>

          <h3 className="text-lg font-semibold text-slate-100 mt-6 mb-3">
            GlobalShell renders:
          </h3>
          <ul className="list-disc list-inside space-y-2 text-slate-300">
            <li><strong>BrandHeader</strong> - PETE&apos;S LAB branding with theme toggle and menu button</li>
            <li><strong>DashboardTicker</strong> - Optional ticker for / and /personal routes</li>
            <li><strong>Page content</strong> - Your page component with single H1</li>
            <li><strong>BottomNav</strong> - Fixed bottom navigation bar</li>
            <li><strong>NavigationDrawer</strong> - Slide-out navigation when menu is tapped</li>
          </ul>
        </section>

        {/* Do's and Don'ts */}
        <section className="rounded-xl bg-slate-900/50 border border-slate-800 p-6">
          <h2 className="text-2xl font-semibold text-slate-100 mb-4">
            Do&apos;s and Don&apos;ts
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <span className="text-green-400 text-xl">✓</span>
              <div>
                <strong className="text-slate-100">Do:</strong>
                <span className="text-slate-300"> Put one H1 at the top of the page content.</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-red-400 text-xl">✗</span>
              <div>
                <strong className="text-slate-100">Don&apos;t:</strong>
                <span className="text-slate-300"> Render AppBar or BrandHeader inside page components.</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-green-400 text-xl">✓</span>
              <div>
                <strong className="text-slate-100">Do:</strong>
                <span className="text-slate-300"> Add new pages to NavigationDrawer sections + Site Index.</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-green-400 text-xl">✓</span>
              <div>
                <strong className="text-slate-100">Do:</strong>
                <span className="text-slate-300"> Use cyan for interactive elements, orange for accents.</span>
              </div>
            </div>
          </div>
        </section>

        {/* Color Palette */}
        <section className="rounded-xl bg-slate-900/50 border border-slate-800 p-6">
          <h2 className="text-2xl font-semibold text-slate-100 mb-4">
            Color Palette
          </h2>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <div className="h-16 bg-cyan-400 rounded-lg mb-2"></div>
              <div className="text-sm text-slate-300">Cyan 400</div>
              <div className="text-xs text-slate-500">Primary interactive</div>
            </div>
            <div>
              <div className="h-16 bg-[#FF9D2A] rounded-lg mb-2"></div>
              <div className="text-sm text-slate-300">Orange</div>
              <div className="text-xs text-slate-500">Accent color</div>
            </div>
            <div>
              <div className="h-16 bg-slate-950 border border-slate-800 rounded-lg mb-2"></div>
              <div className="text-sm text-slate-300">Slate 950</div>
              <div className="text-xs text-slate-500">Background</div>
            </div>
            <div>
              <div className="h-16 bg-slate-800 rounded-lg mb-2"></div>
              <div className="text-sm text-slate-300">Slate 800</div>
              <div className="text-xs text-slate-500">Borders</div>
            </div>
          </div>
        </section>

        {/* Component Examples */}
        <section className="rounded-xl bg-slate-900/50 border border-slate-800 p-6">
          <h2 className="text-2xl font-semibold text-slate-100 mb-4">
            Button Examples
          </h2>
          
          <div className="flex flex-wrap gap-4">
            <button className="px-4 py-2 bg-cyan-400 text-slate-950 rounded-lg font-semibold hover:bg-cyan-300 transition-colors">
              Primary Button
            </button>
            <button className="px-4 py-2 bg-slate-800 text-slate-100 rounded-lg font-semibold hover:bg-slate-700 transition-colors">
              Secondary Button
            </button>
            <button className="px-4 py-2 border border-cyan-400 text-cyan-400 rounded-lg font-semibold hover:bg-cyan-400/10 transition-colors">
              Outline Button
            </button>
          </div>
        </section>
      </div>
    </>
  );
}
