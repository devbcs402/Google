import { useState } from 'react';
import { Check, LockKeyhole, Mail, ShieldCheck, UserRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { getErrorMessage } from '../lib/api.js';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const notify = useToast();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function submit(event) {
    event.preventDefault();
    setError('');
    if (name.trim().length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Enter a name of at least 2 characters and a valid email address.');
      return;
    }
    setSaving(true);
    try {
      await updateUser({ name: name.trim(), email: email.trim() });
      notify('Profile saved.');
    } catch (requestError) { setError(getErrorMessage(requestError)); }
    finally { setSaving(false); }
  }

  return (
    <>
      <div className="page-heading"><div><span className="eyebrow">YOUR ACCOUNT</span><h1>Profile & settings</h1><p>Manage your personal information and workspace.</p></div></div>
      <div className="profile-layout">
        <section className="profile-card">
          <div className="profile-card-heading"><div className="profile-avatar">{user?.name?.slice(0, 1).toUpperCase()}</div><div><span className="eyebrow">PERSONAL DETAILS</span><h2>Your profile</h2><p>These details are only visible to you.</p></div></div>
          <form className="form-stack profile-form" onSubmit={submit}>
            <label>Full name<div className="input-with-icon"><UserRound size={17} /><input autoComplete="name" maxLength="60" value={name} onChange={(e) => setName(e.target.value)} required /></div></label>
            <label>Email address<div className="input-with-icon"><Mail size={17} /><input type="email" autoComplete="email" maxLength="254" value={email} onChange={(e) => setEmail(e.target.value)} required /></div></label>
            {error && <p className="form-error" role="alert">{error}</p>}
            <div className="profile-actions"><button type="submit" className="button button-primary" disabled={saving}>{saving ? 'Saving…' : 'Save changes'}{!saving && <Check size={17} />}</button></div>
          </form>
        </section>
        <aside className="privacy-card"><div className="privacy-icon"><ShieldCheck size={21} /></div><span className="eyebrow">PRIVACY FIRST</span><h2>A vault, not a password manager.</h2><p>Email Vault helps you keep track of which accounts you have. It never asks for or stores the passwords to those accounts.</p><div className="privacy-divider" /><div className="privacy-point"><LockKeyhole size={17} /><span><strong>Your sign-in is protected</strong><small>Your account password is securely hashed.</small></span></div><div className="privacy-point"><UserRound size={17} /><span><strong>Your entries are private</strong><small>Only your signed-in account can access them.</small></span></div></aside>
      </div>
    </>
  );
}
