import { useEffect, useState } from 'react';
import { ArrowLeft, Copy, ExternalLink, Heart, Pencil, ShieldCheck, Trash2 } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, getErrorMessage } from '../lib/api.js';
import { useToast } from '../context/ToastContext.jsx';
import Loading from '../components/Loading.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';

export default function AccountDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const notify = useToast();
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let active = true;
    api.get(`/emails/${id}`)
      .then(({ data }) => { if (active) setAccount(data.account); })
      .catch((requestError) => { if (active) setError(getErrorMessage(requestError)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id]);

  async function copy(value, label) {
    try {
      await navigator.clipboard.writeText(value);
      notify(`${label} copied.`);
    } catch {
      notify('Clipboard access is unavailable in this browser.', 'error');
    }
  }
  async function toggleFavorite() {
    try {
      const { data } = await api.patch(`/emails/${id}/favorite`, { isFavorite: !account.isFavorite });
      setAccount(data.account);
    } catch (requestError) { notify(getErrorMessage(requestError), 'error'); }
  }
  async function removeAccount() {
    setDeleting(true);
    try {
      await api.delete(`/emails/${id}`);
      notify('Email account removed.');
      navigate('/accounts', { replace: true });
    } catch (requestError) {
      notify(getErrorMessage(requestError), 'error');
      setDeleting(false);
    }
  }

  if (loading) return <Loading label="Loading account details…" />;
  if (error || !account) return <><div className="page-heading"><div><Link className="back-link" to="/accounts"><ArrowLeft size={16} /> All email accounts</Link><span className="eyebrow">ACCOUNT DETAILS</span><h1>Account unavailable</h1><p>{error || 'This email account could not be found.'}</p></div></div></>;
  return (
    <>
      <div className="page-heading detail-heading"><div><Link className="back-link" to="/accounts"><ArrowLeft size={16} /> All email accounts</Link><span className="eyebrow">{account.provider} ACCOUNT</span><h1>{account.label}</h1><p>{account.category} · Updated {new Date(account.updatedAt).toLocaleDateString()}</p></div><div className="detail-actions"><button className={`button button-quiet detail-favorite ${account.isFavorite ? 'favorited' : ''}`} onClick={toggleFavorite}><Heart size={17} fill={account.isFavorite ? 'currentColor' : 'none'} />{account.isFavorite ? 'Favorited' : 'Favorite'}</button><Link className="button button-quiet" to={`/accounts/${id}/edit`}><Pencil size={17} /> Edit</Link><button className="button button-danger-outline" onClick={() => setConfirmDelete(true)}><Trash2 size={17} /> Delete</button></div></div>
      <div className="account-detail-layout">
        <section className="detail-main-card">
          <div className="detail-section"><div className="detail-section-heading"><span className="detail-field-icon">✉</span><div><span className="eyebrow">EMAIL ADDRESS</span><h2>{account.emailAddress}</h2></div><button className="icon-button copy-button" aria-label="Copy email address" onClick={() => copy(account.emailAddress, 'Email address')}><Copy size={17} /></button></div></div>
          <div className="detail-section"><span className="eyebrow">PURPOSE</span><p className="detail-body-text">{account.purpose || 'No purpose added yet.'}</p></div>
          <div className="detail-section"><span className="eyebrow">STORAGE DETAILS</span><p className="detail-body-text">{account.storageDetails || 'No storage details added.'}</p></div>
          <div className="detail-section"><span className="eyebrow">NOTES</span><p className="detail-body-text">{account.notes || 'No notes added.'}</p></div>
          <div className="detail-section"><span className="eyebrow">IMPORTANT LINKS</span>{account.importantLinks?.length ? <ul className="important-link-list">{account.importantLinks.map((link, index) => <li key={`${link.url}-${index}`}><a href={link.url} target="_blank" rel="noopener noreferrer"><span>{link.title}</span><ExternalLink size={15} /></a><button className="icon-button copy-button" aria-label={`Copy ${link.title} URL`} onClick={() => copy(link.url, 'Link URL')}><Copy size={16} /></button></li>)}</ul> : <p className="detail-body-text">No important links added.</p>}</div>
        </section>
        <aside className="detail-aside-card"><div className="privacy-icon"><ShieldCheck size={21} /></div><span className="eyebrow">PRIVATE BY DESIGN</span><h2>Account details, not passwords.</h2><p>Email Vault never asks for or stores your email account passwords. Keep credentials in a dedicated password manager.</p><div className="detail-meta"><span>Provider</span><strong>{account.provider}</strong><span>Category</span><strong>{account.category}</strong><span>Created</span><strong>{new Date(account.createdAt).toLocaleDateString()}</strong></div></aside>
      </div>
      {confirmDelete && <ConfirmDialog title="Delete this account?" message={`“${account.label}” and its saved details will be permanently removed.`} onCancel={() => setConfirmDelete(false)} onConfirm={removeAccount} busy={deleting} />}
    </>
  );
}
