import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { ArrowRight, Check, Eye, EyeOff, LockKeyhole, ShieldCheck } from 'lucide-react';
import Brand from '../components/Brand.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { getErrorMessage } from '../lib/api.js';

export default function AuthPage({ mode }) {
  const isRegister = mode === 'register';
  const { user, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  if (user) return <Navigate to="/dashboard" replace />;

  async function submit(event) {
    event.preventDefault();
    setError('');
    if (isRegister && form.name.trim().length < 2) return setError('Please enter your name.');
    if (form.password.length < 8) return setError('Your password must be at least 8 characters.');
    setLoading(true);
    try {
      await (isRegister ? signUp({ ...form, name: form.name.trim() }) : signIn(form));
      navigate('/dashboard', { replace: true });
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-main">
        <div className="auth-brand"><Brand /></div>
        <section className="auth-card">
          <div className="auth-heading"><div className="auth-icon"><LockKeyhole size={21} /></div><span className="eyebrow">{isRegister ? 'YOUR OWN PRIVATE SPACE' : 'WELCOME BACK'}</span><h1>{isRegister ? 'Start your vault' : 'Sign in to your vault'}</h1><p>{isRegister ? 'One calm place to keep your email life organized.' : 'Your organized digital life is right where you left it.'}</p></div>
          <form onSubmit={submit} className="form-stack">
            {isRegister && <label>Your name<input autoComplete="name" maxLength="60" placeholder="How should we call you?" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></label>}
            <label>Email address<input type="email" autoComplete="email" maxLength="254" placeholder="you@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></label>
            <label>Password<div className="password-field"><input type={showPassword ? 'text' : 'password'} autoComplete={isRegister ? 'new-password' : 'current-password'} minLength="8" maxLength="72" placeholder="At least 8 characters" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required /><button type="button" className="password-toggle" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword((value) => !value)}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></label>
            {error && <p className="form-error" role="alert">{error}</p>}
            <button type="submit" className="button button-primary auth-submit" disabled={loading}>{loading ? 'Please wait…' : isRegister ? 'Create my vault' : 'Sign in'}{!loading && <ArrowRight size={17} />}</button>
          </form>
          <p className="auth-switch">{isRegister ? 'Already have a vault?' : 'New to Email Vault?'} <Link to={isRegister ? '/login' : '/register'}>{isRegister ? 'Sign in' : 'Create an account'}</Link></p>
        </section>
        <div className="auth-foot"><ShieldCheck size={15} />Your data is private and protected by your account.</div>
      </div>
      <aside className="auth-aside">
        <div className="aside-glow" />
        <div className="aside-content"><div className="aside-badge"><ShieldCheck size={16} /> BUILT FOR PEACE OF MIND</div><h2>All your email accounts.<br /><span>One clear view.</span></h2><p>Keep track of every inbox, without the clutter. Securely organized and always easy to find.</p>
          <div className="feature-list"><div><Check size={16} /><span>Everything organized in one place</span></div><div><Check size={16} /><span>Private to your personal workspace</span></div><div><Check size={16} /><span>Find any account in seconds</span></div></div>
          <div className="aside-decoration"><div className="decor-window"><div className="decor-top"><span /><span /><span /></div><div className="decor-line wide" /><div className="decor-line" /><div className="decor-line medium" /><div className="decor-bubble"><ShieldCheck size={17} /> Your accounts, in good hands.</div></div></div>
        </div>
        <span className="aside-caption">A little more order, a lot more peace.</span>
      </aside>
    </div>
  );
}
