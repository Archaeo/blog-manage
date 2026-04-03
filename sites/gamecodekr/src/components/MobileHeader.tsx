interface MobileHeaderProps {
  onMenuClick: () => void;
}

export function MobileHeader({ onMenuClick }: MobileHeaderProps) {
  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
      <div className="flex items-center gap-2">
        <button
          onClick={onMenuClick}
          className="flex h-8 w-8 items-center justify-center rounded text-slate-600 hover:bg-slate-100"
          aria-label="메뉴 열기"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 5h14M3 10h14M3 15h14" />
          </svg>
        </button>
        <a href="/" className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-600 text-xs text-white">
            🎮
          </span>
          <span className="text-sm font-bold text-slate-900">GameCodeKR</span>
        </a>
      </div>
    </header>
  );
}
