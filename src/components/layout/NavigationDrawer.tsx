import { Link } from 'react-router-dom';
import { X, ArrowSquareOut } from '@phosphor-icons/react';

interface NavigationDrawerProps {
  open: boolean;
  onClose: () => void;
}

interface NavItem {
  label: string;
  to?: string;
  href?: string;
  description?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const SECTIONS: NavSection[] = [
  {
    title: 'Home & Dashboards',
    items: [
      { label: 'Personal Dashboard', to: '/' },
      { label: 'Site Index', to: '/site-index' },
      { label: 'Style Guide', to: '/style-guide' },
    ],
  },
  {
    title: 'Labs & Experiments',
    items: [
      { label: 'Labs Overview', to: '/labs' },
      { label: 'React Training', to: '/react-training' },
      { label: '2026 Strength & Skill', to: '/goals-2026' },
      { label: 'Experiments', to: '/experiments' },
      { label: 'Automations Lab', to: '/automations' },
    ],
  },
  {
    title: 'Infrastructure & Hosting',
    items: [
      { label: 'Infrastructure Overview', to: '/infra' },
      { label: 'Home Assistant Goals', to: '/home-assistant' },
      { label: 'Proxmox Hosting', to: '/proxmox-hosting' },
      { label: 'Self-Host Pete\'s Lab', to: '/petes-lab-self-host' },
    ],
  },
  {
    title: 'Training & Certification',
    items: [
      { label: 'Training Overview', to: '/training' },
      { label: 'React Training Hub', to: '/training/react' },
      { label: 'Home Automation Training', to: '/training/home-automation' },
      { label: 'PSP Training Hub', to: '/training/psp' },
      { label: 'PSP Practice Exam', to: '/psp/exam' },
    ],
  },
  {
    title: 'Tools & Utilities',
    items: [
      { label: 'Tools Overview', to: '/tools' },
      { label: 'Blueprint Viewer', to: '/blueprints' },
      { label: 'HA Blueprint Builder', to: '/ha-blueprints' },
      { label: 'Event Pack Generator', to: '/event-pack' },
      { label: 'What To Train', to: '/what-to-train' },
    ],
  },
  {
    title: 'IronLog (Dev)',
    items: [
      { label: 'IronLog Home', href: 'https://www.ironlog.co.uk' },
      { label: 'PB Panel', to: '/pb-panel' },
      { label: 'Ops Console', to: '/ops-console' },
      { label: 'Snapshot Viewer', to: '/snapshot-viewer' },
    ],
  },
];

export function NavigationDrawer({ open, onClose }: NavigationDrawerProps) {
  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed inset-x-0 top-0 z-50 max-w-5xl mx-auto px-4 pt-4">
        <div className="rounded-2xl bg-slate-950/98 border border-slate-800 shadow-2xl">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
            <h2 className="text-sm sm:text-base font-semibold text-slate-50">
              Navigation
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close navigation"
              className="p-1.5 rounded-full hover:bg-slate-800 text-slate-300"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="max-h-[70vh] overflow-y-auto py-3">
            <div className="space-y-4 px-3 pb-3">
              {SECTIONS.map((section) => (
                <div key={section.title} className="space-y-1.5">
                  <div className="text-[11px] uppercase tracking-wide text-slate-500 px-2">
                    {section.title}
                  </div>
                  <div className="space-y-1">
                    {section.items.map((item) => {
                      const content = (
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex flex-col">
                            <span className="text-sm text-slate-100">
                              {item.label}
                            </span>
                            {item.description && (
                              <span className="text-xs text-slate-400">
                                {item.description}
                              </span>
                            )}
                          </div>
                          {item.href && (
                            <ArrowSquareOut className="h-3.5 w-3.5 text-slate-400" />
                          )}
                        </div>
                      );

                      if (item.href) {
                        return (
                          <a
                            key={item.label}
                            href={item.href}
                            target="_blank"
                            rel="noreferrer"
                            onClick={onClose}
                            className="block rounded-xl bg-slate-900/80 hover:bg-slate-800 px-3 py-2.5 text-left"
                          >
                            {content}
                          </a>
                        );
                      }

                      return (
                        <Link
                          key={item.label}
                          to={item.to!}
                          onClick={onClose}
                          className="block rounded-xl bg-slate-900/80 hover:bg-slate-800 px-3 py-2.5 text-left"
                        >
                          {content}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
