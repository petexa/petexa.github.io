import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@/context/ThemeContext';
import { GlobalShell } from '@/components/layout/GlobalShell';
import { ScrollToTop } from '@/components/layout/ScrollToTop';
import { PersonalDashboardPage } from '@/pages/PersonalDashboardPage';
import { SiteIndexPage } from '@/pages/SiteIndexPage';
import { StyleGuidePage } from '@/pages/StyleGuidePage';
import { LabsOverviewPage } from '@/pages/LabsOverviewPage';
import { InfrastructureOverviewPage } from '@/pages/InfrastructureOverviewPage';
import { TrainingOverviewPage } from '@/pages/TrainingOverviewPage';
import { ToolsOverviewPage } from '@/pages/ToolsOverviewPage';

// Placeholder component for routes not yet implemented
function PlaceholderPage({ title }: { title: string }) {
  return (
    <>
      <h1 className="text-3xl sm:text-4xl font-bold text-slate-50 text-center">
        {title}
      </h1>
      <p className="mt-2 text-sm sm:text-base text-slate-300 text-center">
        This page is under construction
      </p>
      <div className="mt-8 rounded-xl bg-slate-900/50 border border-slate-800 p-6">
        <p className="text-slate-400 text-center">
          Content coming soon...
        </p>
      </div>
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter basename="/lab">
        <ScrollToTop />
        <GlobalShell>
          <Routes>
            {/* Home & Dashboards */}
            <Route path="/" element={<PersonalDashboardPage />} />
            <Route path="/personal" element={<PersonalDashboardPage />} />
            <Route path="/site-index" element={<SiteIndexPage />} />
            <Route path="/style-guide" element={<StyleGuidePage />} />

            {/* Labs & Experiments */}
            <Route path="/labs" element={<LabsOverviewPage />} />
            <Route path="/react-training" element={<PlaceholderPage title="React Training" />} />
            <Route path="/goals-2026" element={<PlaceholderPage title="2026 Strength & Skill" />} />
            <Route path="/experiments" element={<PlaceholderPage title="Experiments" />} />
            <Route path="/automations" element={<PlaceholderPage title="Automations Lab" />} />

            {/* Infrastructure & Hosting */}
            <Route path="/infra" element={<InfrastructureOverviewPage />} />
            <Route path="/home-assistant" element={<PlaceholderPage title="Home Assistant Goals" />} />
            <Route path="/proxmox-hosting" element={<PlaceholderPage title="Proxmox Hosting" />} />
            <Route path="/petes-lab-self-host" element={<PlaceholderPage title="Self-Host Pete's Lab" />} />

            {/* Training & Certification */}
            <Route path="/training" element={<TrainingOverviewPage />} />
            <Route path="/training/react" element={<PlaceholderPage title="React Training Hub" />} />
            <Route path="/training/home-automation" element={<PlaceholderPage title="Home Automation Training" />} />
            <Route path="/training/psp" element={<PlaceholderPage title="PSP Training Hub" />} />
            <Route path="/psp/exam" element={<PlaceholderPage title="PSP Practice Exam" />} />

            {/* Tools & Utilities */}
            <Route path="/tools" element={<ToolsOverviewPage />} />
            <Route path="/blueprints" element={<PlaceholderPage title="Blueprint Viewer" />} />
            <Route path="/ha-blueprints" element={<PlaceholderPage title="HA Blueprint Builder" />} />
            <Route path="/event-pack" element={<PlaceholderPage title="Event Pack Generator" />} />
            <Route path="/what-to-train" element={<PlaceholderPage title="What To Train" />} />

            {/* IronLog Dev Tools */}
            <Route path="/pb-panel" element={<PlaceholderPage title="PB Panel" />} />
            <Route path="/ops-console" element={<PlaceholderPage title="Ops Console" />} />
            <Route path="/snapshot-viewer" element={<PlaceholderPage title="Snapshot Viewer" />} />
          </Routes>
        </GlobalShell>
      </BrowserRouter>
    </ThemeProvider>
  );
}
