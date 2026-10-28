import { useEffect, useState } from 'react';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, getErrorMessage } from '../lib/api.js';
import { useToast } from '../context/ToastContext.jsx';
import Loading from '../components/Loading.jsx';

const categories = ['Study', 'Work', 'Personal', 'Finance', 'Social', 'Shopping', 'Other'];
const providers = ['Gmail', 'Outlook', 'Yahoo', 'Other'];
const blank = {
  emailAddress: '', label: '', provider: 'Other', category: 'Personal', purpose: '',
  storageDetails: '', importantLinks: [], notes: '', isFavorite: false
};

export default function AccountFormPage() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const notify = useToast();
  const [form, setForm] = useState(blank);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    let active = true;
    api.get(`/emails/${id}`)
      .then(({ data }) => {
        if (active) {
          const account = data.account;
          setForm({
            emailAddress: account.emailAddress,
            label: account.label,
            provider: account.provider,
            category: account.category,
            purpose: account.purpose,
            storageDetails: account.storageDetails,
            importantLinks: account.importantLinks || [],
            notes: account.notes,
            isFavorite: account.isFavorite
          });
        }
      })
      .catch((requestError) => { if (active) setError(getErrorMessage(requestError)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id]);

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  function updateLink(index, key, value) {
    setForm((current) => ({
      ...current,
      importantLinks: current.importantLinks.map((link, linkIndex) => linkIndex === index ? { ...link, [key]: value } : link)
    }));
  }
  async function submit(event) {
    event.preventDefault();
    setError('');
    setSaving(true);
    try {
      const { data } = isEditing
        ? await api.put(`/emails/${id}`, form)
        : await api.post('/emails', form);
      notify(isEditing ? 'Account details updated.' : 'Account added to your vault.');
      navigate(`/accounts/${data.account._id}`, { replace: true });
    } catch (requestError) {
      const fieldErrors = requestError.response?.data?.errors;
      const detail = fieldErrors ? Object.values(fieldErrors).join(' ') : '';
      setError(detail || getErrorMessage(requestError));
    } finally { setSaving(false); }
  }

  if (loading) return <Loading label="Loading account details…" />;
  return (
    <>
      <div className="page-heading"><div><Link className="back-link" to={isEditing ? `/accounts/${id}` : '/accounts'}><ArrowLeft size={16} /> {isEditing ? 'Back to account' : 'All email accounts'}</Link><span className="eyebrow">{isEditing ? 'UPDATE YOUR VAULT' : 'NEW ENTRY'}</span><h1>{isEditing ? 'Edit account' : 'Add an account'}</h1><p>Keep the details you need close at hand. Never add email passwords.</p></div></div>
      {error && <div className="inline-error" role="alert">{error}</div>}
      <form className="account-form-panel form-stack" onSubmit={submit}>
        <div className="form-section-heading"><span>01</span><div><h2>Account details</h2><p>The email address must be unique within your vault.</p></div></div>
        <div className="form-row">
          <label>Account label<input autoFocus maxLength="100" placeholder="e.g. Personal inbox" value={form.label} onChange={(event) => update('label', event.target.value)} required /></label>
          <label>Email address<input type="email" autoComplete="email" maxLength="254" placeholder="you@example.com" value={form.emailAddress} onChange={(event) => update('emailAddress', event.target.value)} required /></label>
        </div>
        <div className="form-row">
          <label>Email provider<select value={form.provider} onChange={(event) => update('provider', event.target.value)}>{providers.map((provider) => <option key={provider}>{provider}</option>)}</select></label>
          <label>Category<select value={form.category} onChange={(event) => update('category', event.target.value)}>{categories.map((category) => <option key={category}>{category}</option>)}</select></label>
        </div>
        <label>Purpose <span className="label-hint">What do you use this inbox for?</span><textarea rows="3" maxLength="2000" placeholder="Work correspondence, shopping receipts…" value={form.purpose} onChange={(event) => update('purpose', event.target.value)} /></label>
        <label>Storage details <span className="label-hint">Where account recovery or backup details are kept—never passwords.</span><textarea rows="3" maxLength="1000" placeholder="For example, recovery information is in your secure offline records." value={form.storageDetails} onChange={(event) => update('storageDetails', event.target.value)} /></label>

        <div className="form-section-heading form-subsection-heading"><span>02</span><div><h2>Important links</h2><p>Save useful account, support, or recovery pages.</p></div></div>
        <div className="link-entry-list">
          {form.importantLinks.map((link, index) => <div className="link-entry" key={index}>
            <label>Link title<input maxLength="100" placeholder="Account settings" value={link.title} onChange={(event) => updateLink(index, 'title', event.target.value)} /></label>
            <label>URL<input type="url" maxLength="2048" placeholder="https://example.com/settings" value={link.url} onChange={(event) => updateLink(index, 'url', event.target.value)} /></label>
            <button type="button" className="icon-button danger-text" aria-label={`Remove link ${index + 1}`} onClick={() => update('importantLinks', form.importantLinks.filter((_, linkIndex) => linkIndex !== index))}><Trash2 size={17} /></button>
          </div>)}
          <button type="button" className="button button-quiet add-link-button" disabled={form.importantLinks.length >= 20} onClick={() => update('importantLinks', [...form.importantLinks, { title: '', url: '' }])}><Plus size={16} /> Add a link</button>
        </div>

        <label>Notes <span className="label-hint">Optional, never store passwords here.</span><textarea rows="4" maxLength="2000" placeholder="A reminder about this account…" value={form.notes} onChange={(event) => update('notes', event.target.value)} /></label>
        <label className="checkbox-line"><input type="checkbox" checked={form.isFavorite} onChange={(event) => update('isFavorite', event.target.checked)} /> Add to favorites</label>
        <div className="account-form-actions"><Link className="button button-quiet" to={isEditing ? `/accounts/${id}` : '/accounts'}>Cancel</Link><button type="submit" className="button button-primary" disabled={saving}>{saving ? 'Saving…' : isEditing ? 'Save changes' : 'Add account'}</button></div>
      </form>
    </>
  );
}
