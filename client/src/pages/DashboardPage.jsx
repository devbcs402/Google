import { useEffect, useState } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  Clock3,
  FileDown,
  Plus,
  ShieldCheck,
  Star,
  WalletCards
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { api, downloadBackupPdf, getErrorMessage } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import Loading from '../components/Loading.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { AccountCard } from '../components/AccountCard.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';

const categories = ['Study', 'Work', 'Personal', 'Finance', 'Social', 'Shopping', 'Other'];

export default function DashboardPage() {
  const { user } = useAuth();
  const notify = useToast();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [showBackupConfirm, setShowBackupConfirm] = useState(false);
  const [downloadingBackup, setDownloadingBackup] = useState(false);

  async function load() {
    setError('');
    try {
      const { data } = await api.get('/emails');
      setAccounts(data.accounts);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function removeAccount() {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await api.delete(`/emails/${pendingDelete._id}`);
      setAccounts((current) => current.filter((item) => item._id !== pendingDelete._id));
      setPendingDelete(null);
      notify('Email account removed.');
    } catch (requestError) {
      notify(getErrorMessage(requestError), 'error');
    } finally {
      setDeleting(false);
    }
  }

  async function favorite(account) {
    try {
      const { data } = await api.patch(`/emails/${account._id}/favorite`, { isFavorite: !account.isFavorite });
      setAccounts((current) => current.map((item) => (item._id === account._id ? data.account : item)));
    } catch (requestError) {
      notify(getErrorMessage(requestError), 'error');
    }
  }

  async function handleBackupDownload() {
    setDownloadingBackup(true);
    try {
      const filename = await downloadBackupPdf();
      setShowBackupConfirm(false);
      notify(`PDF backup downloaded: ${filename}`);
    } catch (err) {
      notify(getErrorMessage(err), 'error');
    } finally {
      setDownloadingBackup(false);
    }
  }

  const favoriteAccounts = accounts.filter((account) => account.isFavorite);
  const favoriteCount = favoriteAccounts.length;
  const categoryCounts = categories.map((category) => ({
    category,
    count: accounts.filter((account) => account.category === category).length
  }));
  const recent = [...accounts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 3);

  if (loading) return <Loading />;

  return (
    <>
      <div className="page-heading dashboard-heading">
        <div>
          <span className="eyebrow">YOUR OVERVIEW</span>
          <h1>
            Good to see you, {user?.name?.split(' ')[0]} <span className="wave">✦</span>
          </h1>
          <p>Everything you need, right where you need it.</p>
        </div>
        <div className="heading-actions flex items-center gap-2.5">
          <button
            type="button"
            className="button button-quiet backup-now-btn"
            disabled={downloadingBackup}
            onClick={() => setShowBackupConfirm(true)}
          >
            {downloadingBackup ? (
              <>
                <span className="backup-spinner" /> Generating…
              </>
            ) : (
              <>
                <FileDown size={17} /> Backup Now
              </>
            )}
          </button>
          <Link className="button button-primary" to="/accounts/new">
            <Plus size={18} /> Add account
          </Link>
        </div>
      </div>

      {error && (
        <div className="inline-error" role="alert">
          <span>{error}</span>
          <button className="text-button" onClick={load}>
            Try again
          </button>
        </div>
      )}

      <section className="stats-grid" aria-label="Account overview">
        <div className="stat-card">
          <div className="stat-icon stat-violet">
            <WalletCards size={20} />
          </div>
          <div>
            <span>Total accounts</span>
            <strong>{accounts.length}</strong>
            <small>organized in your vault</small>
          </div>
          <span className="stat-decoration">01</span>
        </div>

        <div className="stat-card">
          <div className="stat-icon stat-amber">
            <Star size={20} />
          </div>
          <div>
            <span>Favorites</span>
            <strong>{favoriteCount}</strong>
            <small>quick access, anytime</small>
          </div>
          <span className="stat-decoration">02</span>
        </div>

        <div className="stat-card stat-callout">
          <div className="callout-check">
            <ShieldCheck size={20} />
          </div>
          <div>
            <span>Private by design</span>
            <strong>Just for you</strong>
            <small>Your accounts stay in your workspace</small>
          </div>
          <ArrowUpRight size={18} className="callout-arrow" />
        </div>
      </section>

      <section className="section-block category-count-section" aria-label="Account counts by category">
        <div className="section-heading">
          <div>
            <span className="eyebrow">AT A GLANCE</span>
            <h2>By category</h2>
          </div>
        </div>
        <div className="category-count-grid">
          {categoryCounts.map(({ category, count }) => (
            <article className="category-count-card" key={category}>
              <span>{category}</span>
              <strong>{count}</strong>
            </article>
          ))}
        </div>
      </section>

      {favoriteAccounts.length > 0 && (
        <section className="section-block" aria-label="Favorite accounts">
          <div className="section-heading">
            <div>
              <span className="eyebrow">STARRED ACCOUNTS</span>
              <h2>Favorite accounts</h2>
            </div>
            <Link to="/accounts" className="link-button">
              View all ({favoriteAccounts.length}) <ArrowRight size={16} />
            </Link>
          </div>
          <div className="account-grid">
            {favoriteAccounts.slice(0, 4).map((account, index) => (
              <AccountCard
                key={account._id}
                account={account}
                index={index}
                onDelete={setPendingDelete}
                onFavorite={favorite}
              />
            ))}
          </div>
        </section>
      )}

      <section className="section-block">
        <div className="section-heading">
          <div>
            <span className="eyebrow">YOUR COLLECTION</span>
            <h2>Recently added</h2>
          </div>
          <Link to="/accounts" className="link-button">
            View all accounts <ArrowRight size={16} />
          </Link>
        </div>
        {recent.length ? (
          <div className="account-grid">
            {recent.map((account, index) => (
              <AccountCard
                key={account._id}
                account={account}
                index={index}
                onDelete={setPendingDelete}
                onFavorite={favorite}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="Your vault is ready"
            description="Add your first email account and start bringing everything together."
            action={
              <Link className="button button-primary" to="/accounts/new">
                <Plus size={17} /> Add your first account
              </Link>
            }
          />
        )}
      </section>

      <section className="tip-banner">
        <div className="tip-icon">
          <Clock3 size={19} />
        </div>
        <div>
          <strong>Small tip, big peace of mind</strong>
          <p>For your security, keep passwords out of notes. This vault is designed to organize account details—not credentials.</p>
        </div>
        <ShieldCheck size={19} className="tip-shield" />
      </section>

      {pendingDelete && (
        <ConfirmDialog
          title="Delete this account?"
          message={`“${pendingDelete.label}” and its saved details will be permanently removed.`}
          onCancel={() => setPendingDelete(null)}
          onConfirm={removeAccount}
          busy={deleting}
        />
      )}

      {showBackupConfirm && (
        <ConfirmDialog
          title="Download Vault PDF Backup?"
          message="This backup will include all saved email account details. Continue?"
          confirmLabel="Download Backup"
          cancelLabel="Cancel"
          confirmVariant="primary"
          icon={FileDown}
          warningNotice="This document contains sensitive personal email directory data. Store it securely once downloaded."
          onCancel={() => setShowBackupConfirm(false)}
          onConfirm={handleBackupDownload}
          busy={downloadingBackup}
        />
      )}
    </>
  );
}
