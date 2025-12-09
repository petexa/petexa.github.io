import foxHero from '@/assets/fox-hero.svg';
import { Sun, Moon } from '@phosphor-icons/react';
import { useTheme } from '@/context/ThemeContext';

interface BrandHeaderProps {
  onMenuClick?: () => void;
}

export function BrandHeader({ onMenuClick }: BrandHeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const isLight = theme === 'light';

  return (
    <header className="w-full border-b border-slate-900 bg-slate-950/95">
      <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
        {/* Left: fox + brand text */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 rounded-full blur-xl bg-cyan-500/35" />
            <img
              src={foxHero}
              alt="Pete's Lab"
              className="relative h-12 w-12 sm:h-14 sm:w-14 rounded-full shadow-lg"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-50">
              PETE&apos;S LAB
            </span>
            <span className="text-xs sm:text-sm text-slate-300">
              Automation · Code · Gym experiments
            </span>
          </div>
        </div>

        {/* Right: theme toggle + menu button */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-2 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-200"
          >
            {isLight ? (
              <Moon className="h-4 w-4 text-cyan-300" weight="fill" />
            ) : (
              <Sun className="h-4 w-4 text-[#FF9D2A]" weight="fill" />
            )}
          </button>

          <button
            type="button"
            aria-label="Open navigation"
            onClick={onMenuClick}
            className="flex flex-col gap-[3px] pr-1 text-slate-200 hover:text-cyan-300 transition-colors"
          >
            <span className="w-6 h-[2px] rounded-full bg-current" />
            <span className="w-6 h-[2px] rounded-full bg-current" />
            <span className="w-6 h-[2px] rounded-full bg-current" />
          </button>
        </div>
      </div>
    </header>
  );
}
