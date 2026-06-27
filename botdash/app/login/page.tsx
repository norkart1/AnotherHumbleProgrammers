'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bot, Eye, EyeOff, LogIn } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (res.ok) {
        router.push('/');
        router.refresh();
      } else {
        setError('Incorrect username or password.');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#36393f] px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-[#5865f2] flex items-center justify-center mb-4 shadow-lg shadow-[#5865f2]/30">
            <Bot size={30} className="text-white" />
          </div>
          <h1 className="text-white text-2xl font-bold">Welcome back</h1>
          <p className="text-[#72767d] text-sm mt-1">Sign in to BotDash Control Panel</p>
        </div>

        <div className="bg-[#2c2f33] rounded-2xl p-6 border border-[#36393f] shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[#b9bbbe] text-xs font-semibold uppercase tracking-wide mb-1.5">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
                autoComplete="username"
                className="w-full bg-[#1e2124] border border-[#36393f] rounded-lg px-3 py-2.5 text-white text-sm placeholder-[#4f545c] focus:outline-none focus:border-[#5865f2] transition-colors"
              />
            </div>

            <div>
              <label className="block text-[#b9bbbe] text-xs font-semibold uppercase tracking-wide mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                  className="w-full bg-[#1e2124] border border-[#36393f] rounded-lg px-3 py-2.5 pr-10 text-white text-sm placeholder-[#4f545c] focus:outline-none focus:border-[#5865f2] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#72767d] hover:text-[#b9bbbe] transition-colors"
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-[#ed4245]/10 border border-[#ed4245]/30 rounded-lg px-3 py-2.5 text-[#ed4245] text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#5865f2] hover:bg-[#4752c4] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg text-sm transition-colors flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <LogIn size={15} />
              )}
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="text-center text-[#4f545c] text-xs mt-6">
          BotDash — Discord Bot Control Panel
        </p>
      </div>
    </div>
  );
}
