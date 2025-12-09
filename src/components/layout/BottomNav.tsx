import { Link, useLocation } from 'react-router-dom';
import { House, Flask, Wrench, GraduationCap } from '@phosphor-icons/react';

export function BottomNav() {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-slate-950/95 border-t border-slate-800 pb-safe">
      <div className="max-w-5xl mx-auto px-4 py-2">
        <div className="flex items-center justify-around">
          <Link
            to="/"
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
              isActive('/') || isActive('/personal')
                ? 'text-cyan-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <House className="h-5 w-5" weight={isActive('/') || isActive('/personal') ? 'fill' : 'regular'} />
            <span className="text-xs">Home</span>
          </Link>

          <Link
            to="/labs"
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
              isActive('/labs')
                ? 'text-cyan-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Flask className="h-5 w-5" weight={isActive('/labs') ? 'fill' : 'regular'} />
            <span className="text-xs">Labs</span>
          </Link>

          <Link
            to="/tools"
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
              isActive('/tools')
                ? 'text-cyan-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Wrench className="h-5 w-5" weight={isActive('/tools') ? 'fill' : 'regular'} />
            <span className="text-xs">Tools</span>
          </Link>

          <Link
            to="/training"
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
              isActive('/training')
                ? 'text-cyan-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <GraduationCap className="h-5 w-5" weight={isActive('/training') ? 'fill' : 'regular'} />
            <span className="text-xs">Training</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
