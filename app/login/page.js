'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Lock, Mail, Eye, EyeOff, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      });

      if (authError) {
        setError('Invalid credentials. Please check your email and password.');
      } else {
        router.push('/admin');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-bg">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
      </div>

      <div className="login-card">
        {/* Logo */}
        <div className="login-logo">
          <div className="logo-icon">PH</div>
          <div>
            <span className="logo-title">UNIMAK</span>
            <span className="logo-sub">Public Health Portal</span>
          </div>
        </div>

        <div className="login-header">
          <div className="shield-wrap">
            <ShieldCheck size={32} />
          </div>
          <h1>Admin Login</h1>
          <p>Sign in to manage the public health portal</p>
        </div>

        {error && (
          <div className="error-alert">
            <Lock size={16} />
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-wrap">
              <Mail size={18} className="input-icon" />
              <input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrap">
              <Lock size={18} className="input-icon" />
              <input
                id="password"
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                autoComplete="current-password"
              />
              <button type="button" className="toggle-pass" onClick={() => setShowPass(!showPass)}>
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? <span className="spinner" /> : 'Sign In to Admin Portal'}
          </button>
        </form>

        <p className="back-link">
          <a href="/">← Back to Public Portal</a>
        </p>
      </div>

      <style jsx>{`
        .login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 6rem 1.5rem 2rem;
          position: relative;
          background: linear-gradient(160deg, #001f4d 0%, #003D7A 60%, #005f8a 100%);
          overflow: hidden;
        }

        .login-bg { position: absolute; inset: 0; }

        .blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.2;
        }

        .blob-1 {
          width: 500px; height: 500px;
          background: var(--secondary);
          top: -150px; right: -100px;
        }

        .blob-2 {
          width: 400px; height: 400px;
          background: var(--accent);
          bottom: -100px; left: -100px;
        }

        .login-card {
          background: white;
          border-radius: 2rem;
          padding: 3rem 2.5rem;
          width: 100%;
          max-width: 480px;
          box-shadow: 0 25px 60px rgba(0,0,0,0.4);
          position: relative;
          z-index: 1;
        }

        .login-logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 2rem;
        }

        .logo-icon {
          width: 44px;
          height: 44px;
          background: var(--primary);
          color: white;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.9rem;
          font-weight: 800;
          font-family: 'Outfit', sans-serif;
        }

        .logo-title {
          display: block;
          font-weight: 800;
          font-size: 1.1rem;
          font-family: 'Outfit', sans-serif;
          color: var(--primary);
          line-height: 1;
        }

        .logo-sub {
          font-size: 0.8rem;
          color: var(--muted);
        }

        .login-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .shield-wrap {
          width: 56px;
          height: 56px;
          background: linear-gradient(135deg, var(--primary), var(--secondary));
          border-radius: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          margin: 0 auto 1rem;
        }

        .login-header h1 { font-size: 1.75rem; margin-bottom: 0.4rem; }
        .login-header p { color: var(--muted); font-size: 0.95rem; }

        .error-alert {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: #FEF2F2;
          color: #DC2626;
          border: 1px solid #FECACA;
          border-radius: 0.75rem;
          padding: 0.875rem 1rem;
          font-size: 0.9rem;
          margin-bottom: 1.5rem;
        }

        .login-form { display: flex; flex-direction: column; gap: 1.25rem; }

        .form-group label {
          display: block;
          font-weight: 600;
          font-size: 0.9rem;
          margin-bottom: 0.5rem;
          color: var(--foreground);
        }

        .input-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-icon {
          position: absolute;
          left: 1rem;
          color: var(--muted);
          pointer-events: none;
        }

        .input-wrap input {
          width: 100%;
          padding: 0.875rem 1rem 0.875rem 2.75rem;
          border: 2px solid var(--border);
          border-radius: 0.75rem;
          font-size: 0.95rem;
          font-family: inherit;
          outline: none;
          transition: var(--transition);
        }

        .input-wrap input:focus {
          border-color: var(--secondary);
          box-shadow: 0 0 0 3px rgba(0,163,173,0.12);
        }

        .toggle-pass {
          position: absolute;
          right: 1rem;
          color: var(--muted);
          padding: 0.25rem;
        }

        .toggle-pass:hover { color: var(--foreground); }

        .login-btn {
          width: 100%;
          padding: 1rem;
          background: var(--primary);
          color: white;
          border-radius: 0.75rem;
          font-size: 1rem;
          font-weight: 700;
          font-family: inherit;
          transition: var(--transition);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: 0.5rem;
          cursor: pointer;
        }

        .login-btn:hover:not(:disabled) {
          background: var(--secondary);
          transform: translateY(-2px);
          box-shadow: var(--shadow-lg);
        }

        .login-btn:disabled { opacity: 0.7; cursor: not-allowed; }

        .spinner {
          width: 22px;
          height: 22px;
          border: 3px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        .back-link {
          text-align: center;
          margin-top: 1.5rem;
          font-size: 0.9rem;
          color: var(--muted);
        }
        .back-link a { color: var(--secondary); font-weight: 600; }
        .back-link a:hover { text-decoration: underline; }
      `}</style>
    </div>
  );
}
