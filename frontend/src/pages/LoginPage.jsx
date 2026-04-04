import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, Shield, Stethoscope, Eye, EyeOff, ArrowRight, AlertTriangle } from 'lucide-react';

const ROLES = [
  { id: 'admin', label: 'Admin', desc: 'System oversight', icon: Shield },
  { id: 'doctor', label: 'Doctor', desc: 'Patient monitoring', icon: Stethoscope },
];

export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState('doctor');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password');
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    const result = login(username.trim(), password);
    setLoading(false);
    if (result.success) {
      navigate('/', { replace: true });
    } else {
      setError(result.error);
    }
  };

  const hint = selectedRole === 'admin' ? 'admin / admin123' : 'doctor / doctor123';

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-[380px]">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[var(--accent)] mb-5">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-[24px] font-bold tracking-tight text-[var(--text-primary)]">
            OmniKavach
          </h1>
          <p className="text-[14px] text-[var(--text-secondary)] mt-1">
            ICU Sepsis Detection System
          </p>
        </div>

        {/* Card */}
        <div className="surface p-6 mb-4">
          {/* Role Selector */}
          <div className="grid grid-cols-2 gap-2 mb-6">
            {ROLES.map((role) => {
              const Icon = role.icon;
              const active = selectedRole === role.id;
              return (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => { setSelectedRole(role.id); setError(null); }}
                  className={`flex items-center gap-2.5 p-3 rounded-xl transition-all
                    ${active
                      ? 'bg-[var(--accent-bg)] ring-1 ring-[var(--accent)]'
                      : 'hover:bg-[var(--bg-secondary)]'
                    }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-[var(--accent)]' : 'text-[var(--text-tertiary)]'}`} />
                  <div className="text-left">
                    <p className={`text-[13px] font-medium ${active ? 'text-[var(--accent)]' : 'text-[var(--text-primary)]'}`}>
                      {role.label}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[12px] font-medium text-[var(--text-secondary)] mb-1.5">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => { setUsername(e.target.value); setError(null); }}
                placeholder={selectedRole}
                autoComplete="username"
                className="w-full px-3.5 py-2.5 rounded-xl text-[14px]
                  bg-[var(--bg-secondary)] text-[var(--text-primary)]
                  border border-transparent
                  placeholder:text-[var(--text-tertiary)]
                  focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:bg-[var(--bg)]
                  transition-all"
              />
            </div>

            <div>
              <label className="block text-[12px] font-medium text-[var(--text-secondary)] mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(null); }}
                  placeholder="Enter password"
                  autoComplete="current-password"
                  className="w-full px-3.5 py-2.5 pr-10 rounded-xl text-[14px]
                    bg-[var(--bg-secondary)] text-[var(--text-primary)]
                    border border-transparent
                    placeholder:text-[var(--text-tertiary)]
                    focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:bg-[var(--bg)]
                    transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-[var(--danger-bg)]">
                <AlertTriangle className="w-3.5 h-3.5 text-[var(--danger)] flex-shrink-0" />
                <p className="text-[12px] text-[var(--danger)]">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[14px] font-medium transition-all
                ${loading
                  ? 'bg-[var(--bg-secondary)] text-[var(--text-tertiary)] cursor-not-allowed'
                  : 'bg-[var(--accent)] text-white hover:opacity-90 active:scale-[0.99]'
                }`}
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Sign In <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>
        </div>

        {/* Hint */}
        <p className="text-center text-[11px] text-[var(--text-tertiary)] font-mono">
          Demo: {hint}
        </p>
      </div>
    </div>
  );
}
