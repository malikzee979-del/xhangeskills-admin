'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthContext';
import { AlertCircle, Loader } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(identifier, password);
      router.push('/');
    } catch (err: any) {
      setError(err || 'Login failed. Please try again.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="loginContainer">
      <div className="loginCard">
        {/* Logo/Title */}
        <div className="logoSection">
          <h1 className="logoTitle">XchangeSkills</h1>
          <p className="logoSubtitle">Admin Panel Login</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="errorAlert">
            <AlertCircle size={20} className="errorIcon" />
            <p className="errorText">{error}</p>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          {/* Username/Email Input */}
          <div className="formGroup">
            <label className="formLabel">Username or Email</label>
            <input
              type="text"
              className="formInput"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="Enter your username or email"
              required
              disabled={loading}
            />
          </div>

          {/* Password Input */}
          <div className="formGroupLastPassword">
            <label className="formLabel">Password</label>
            <input
              type="password"
              className="formInput"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              disabled={loading}
            />
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading || !identifier || !password}
            className="loginButton"
          >
            {loading && <Loader size={16} className="spinIcon" />}
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}
