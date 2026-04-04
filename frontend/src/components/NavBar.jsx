import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Activity, ChevronRight, Bell, Clock, Sun, Moon, LogOut } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

export default function NavBar() {
  const [time, setTime] = useState(new Date());
  const location = useLocation();
  const isDetail = location.pathname.startsWith('/patient/');
  const { isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  return (
    <nav className="flex-shrink-0 h-12 flex items-center justify-between px-5 mb-1">
      {/* Left: Brand + Breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-7 h-7 rounded-lg bg-[var(--accent)] flex items-center justify-center">
            <Activity className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-[var(--text-primary)] font-semibold text-sm tracking-tight">
            OmniKavach
          </span>
        </Link>

        {isDetail && (
          <div className="hidden sm:flex items-center gap-1 text-[13px] text-[var(--text-tertiary)]">
            <ChevronRight className="w-3 h-3" />
            <Link to="/" className="hover:text-[var(--accent)] transition-colors">Ward</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-[var(--text-secondary)]">Patient</span>
          </div>
        )}
      </div>

      {/* Right: Controls */}
      <div className="flex items-center gap-1">
        {/* Theme Toggle */}
        <button
          id="btn-theme-toggle"
          onClick={toggleTheme}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-all"
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Notifications */}
        <button className="relative w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-all">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[var(--danger)] rounded-full" />
        </button>

        {/* Divider */}
        <div className="w-px h-4 bg-[var(--border)] mx-1" />

        {/* User + Time */}
        {user && (
          <div className="hidden md:flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full">
              <div className="w-5 h-5 rounded-full bg-[var(--accent-bg)] flex items-center justify-center">
                <span className="text-[9px] font-bold text-[var(--accent)]">
                  {user.name.charAt(0)}
                </span>
              </div>
              <span className="text-[12px] text-[var(--text-secondary)] font-medium">{user.name}</span>
            </div>
            <button
              onClick={logout}
              title="Sign out"
              className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-tertiary)] hover:text-[var(--danger)] hover:bg-[var(--danger-bg)] transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <div className="hidden sm:flex items-center gap-1 text-[12px] font-mono text-[var(--text-tertiary)] ml-1">
          <Clock className="w-3 h-3" />
          <span className="tabular-nums">
            {time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false })}
          </span>
        </div>
      </div>
    </nav>
  );
}
