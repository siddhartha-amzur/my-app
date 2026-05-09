import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSearchParams } from 'react-router-dom';
import { login } from '../lib/api';
// @ts-expect-error -- global CSS side-effect import is handled by the bundler
import '../App.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const oauthError = searchParams.get('error');
    if (oauthError) {
      setError(oauthError);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login({ email, password });
      navigate('/chat');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setGoogleLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/auth/google/login', {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        let message = 'Google login is currently unavailable';
        try {
          const errorData = (await response.json()) as { detail?: string };
          if (errorData.detail) {
            message = errorData.detail;
          }
        } catch {
          // Keep default message when response body is not JSON.
        }
        throw new Error(message);
      }

      const data = (await response.json()) as { url?: string };
      if (!data.url) {
        throw new Error('Google login URL not returned by backend');
      }

      window.location.href = data.url;
    } catch (err) {
      if (err instanceof TypeError) {
        setError('Cannot reach backend at http://localhost:8000. Start the backend server and try again.');
      } else {
        setError(err instanceof Error ? err.message : 'Google login failed');
      }
      setGoogleLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '40px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        maxWidth: '400px',
        width: '100%'
      }}>
        <h1 style={{ textAlign: 'center', marginBottom: '32px', color: '#333' }}>
          AI Chat Login
        </h1>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#555' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid #ddd',
                fontSize: '14px'
              }}
              placeholder="you@amzur.com"
            />
          </div>

          <div style={{ marginBottom: '16px', fontSize: '12px', color: '#7a4b12', background: '#fff6e6', borderRadius: '8px', padding: '10px' }}>
            Only @amzur.com accounts are allowed.
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#555' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid #ddd',
                fontSize: '14px'
              }}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div style={{
              background: '#fee',
              color: '#c33',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '20px',
              fontSize: '14px'
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              background: loading ? '#999' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              marginBottom: '16px'
            }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '16px',
            color: '#999',
            fontSize: '13px'
          }}>
            <div style={{ height: '1px', background: '#eee', flex: 1 }} />
            <span>OR</span>
            <div style={{ height: '1px', background: '#eee', flex: 1 }} />
          </div>

          <button
            type="button"
            disabled={googleLoading}
            onClick={handleGoogleLogin}
            style={{
              width: '100%',
              padding: '12px',
              background: 'white',
              color: '#333',
              border: '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '15px',
              fontWeight: 600,
              cursor: googleLoading ? 'not-allowed' : 'pointer',
              marginBottom: '16px'
            }}
          >
            {googleLoading ? 'Connecting to Google...' : 'Continue with Google'}
          </button>

          <p style={{ textAlign: 'center', color: '#666', fontSize: '14px' }}>
            Don't have an account?{' '}
            <a
              href="/register"
              style={{ color: '#667eea', textDecoration: 'none', fontWeight: 600 }}
            >
              Register
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
