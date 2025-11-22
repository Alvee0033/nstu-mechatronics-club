'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Terminal, Shield, Lock } from 'lucide-react';

export default function AdminLogin() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    await new Promise(resolve => setTimeout(resolve, 500));

    if (username === 'Alvee1177' && password === 'alvee6969') {
      sessionStorage.setItem('adminLoggedIn', 'true');
      sessionStorage.setItem('adminUsername', username);
      sessionStorage.setItem('adminLoginTime', Date.now().toString());
      router.push('/admin');
    } else {
      setError('ACCESS DENIED: Invalid credentials');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 z-0 pointer-events-none bg-[linear-gradient(to_right,#00f3ff05_1px,transparent_1px),linear-gradient(to_bottom,#00f3ff05_1px,transparent_1px)] bg-[size:40px_40px]" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="holo-card p-8 md:p-10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-neon-cyan to-transparent opacity-50" />

          <div className="text-center mb-10">
            <div className="w-16 h-16 mx-auto mb-6 bg-neon-cyan/10 rounded-full flex items-center justify-center border border-neon-cyan/30 animate-pulse-glow">
              <Shield className="w-8 h-8 text-neon-cyan" />
            </div>
            <h1 className="text-3xl font-bold text-white font-display tracking-wide mb-2">
              ADMIN <span className="text-neon-cyan">ACCESS</span>
            </h1>
            <div className="flex items-center justify-center gap-2 text-xs text-cyan-100/50 font-mono tracking-widest uppercase">
              <Terminal className="w-3 h-3" /> Secure Terminal
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-neon-cyan font-mono uppercase mb-2">
                Operator ID
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-black/50 border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-neon-cyan focus:shadow-[0_0_15px_rgba(0,243,255,0.2)] transition-all font-mono text-sm"
                placeholder="ENTER_ID"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neon-cyan font-mono uppercase mb-2">
                Access Key
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-black/50 border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-neon-cyan focus:shadow-[0_0_15px_rgba(0,243,255,0.2)] transition-all font-mono text-sm"
                placeholder="ENTER_KEY"
                required
              />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-mono flex items-center gap-2"
              >
                <Lock className="w-3 h-3" />
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="cyber-button w-full py-4 text-lg font-bold group relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isLoading ? 'AUTHENTICATING...' : 'INITIALIZE SESSION'}
              </span>
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <p className="text-[10px] text-white/20 font-mono uppercase tracking-widest">
              Restricted Access • Authorized Personnel Only
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
