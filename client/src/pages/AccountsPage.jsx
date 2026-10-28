import { useEffect, useState } from 'react';
import { LayoutGrid, List, Plus, Search, SlidersHorizontal, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api, getErrorMessage } from '../lib/api.js';
import { useToast } from '../context/ToastContext.jsx';
import Loading from '../components/Loading.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { AccountCard, AccountRow } from '../components/AccountCard.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';

const categories = ['All', 'Study', 'Work', 'Personal', 'Finance', 'Social', 'Shopping', 'Other'];

export default function AccountsPage() {
  const notify = useToast();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [view, setView] = useState('grid');
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  async function load(signal) {
    setError('');
    try {
      const { data } = await api.get('/emails', {
        params: {
          search: search.trim() || undefined,
          category,
          favorite: favoritesOnly ? 'true' : undefined
        },
        signal
      });
      setAccounts(data.accounts);
    } catch (requestError) {
      if (requestError.code !== 'ERR_CANCELED') {
        setError(getErrorMessage(requestError));
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => load(controller.signal), 180);
    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [search, category, favoritesOnly]);

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
      const { data } = await api.patch(`/emails/${account._id}/favorite`, {
        isFavorite: !account.isFavorite
      });
      setAccounts((current) =>
        current.map((item) => (item._id === account._id ? data.account : item))
      );
    } catch (requestError) {
      notify(getErrorMessage(requestError), 'error');
    }
  }

  if (loading) return <Loading label="Loading your accounts…" />;

  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">YOUR COLLECTION</span>
          <h1>Email accounts</h1>
          <p>
            Every inbox, neatly in its place.{' '}
            <span className="heading-count">
              {accounts.length} {accounts.length === 1 ? 'account' : 'accounts'}
            </span>
          </p>
        </div>
        <Link className="button button-primary" to="/accounts/new">
          <Plus size={18} /> Add account
        </Link>
      </div>

      {error && (
        <div className="inline-error" role="alert">
          <span>{error}</span>
          <button className="text-button" onClick={() => load()}>
            Try again
          </button>
        </div>
      )}

      <section className="collection-panel">
        <div className="collection-toolbar">
          <div className="search-field">
            <Search size={18} />
            <input
              type="search"
              aria-label="Search accounts"
              placeholder="Search email, label, purpose…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button aria-label="Clear search" onClick={() => setSearch('')}>
                <X size={15} />
              </button>
            )}
          </div>
          <div className="toolbar-right">
            <button
              className={`filter-toggle ${favoritesOnly ? 'filter-active' : ''}`}
              aria-pressed={favoritesOnly}
              onClick={() => setFavoritesOnly((value) => !value)}
            >
              <SlidersHorizontal size={16} />
              Favorites
            </button>
            <div className="view-switch" aria-label="Choose layout">
              <button
                aria-label="Grid view"
                aria-pressed={view === 'grid'}
                className={view === 'grid' ? 'view-selected' : ''}
                onClick={() => setView('grid')}
              >
                <LayoutGrid size={17} />
              </button>
              <button
                aria-label="List view"
                aria-pressed={view === 'list'}
                className={view === 'list' ? 'view-selected' : ''}
                onClick={() => setView('list')}
              >
                <List size={18} />
              </button>
            </div>
          </div>
        </div>

        <div className="category-filters" aria-label="Filter by category">
          {categories.map((item) => (
            <button
              key={item}
              className={`category-filter ${category === item ? 'category-selected' : ''}`}
              aria-pressed={category === item}
              onClick={() => setCategory(item)}
            >
              {item}
            </button>
          ))}
        </div>

        {accounts.length ? (
          view === 'grid' ? (
            <div className="account-grid collection-grid">
              {accounts.map((account, index) => (
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
            <div className="table-scroll">
              <table className="account-table">
                <thead>
                  <tr>
                    <th>Label</th>
                    <th>Email address</th>
                    <th>Category</th>
                    <th>Favorite</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {accounts.map((account) => (
                    <AccountRow
                      key={account._id}
                      account={account}
                      onDelete={setPendingDelete}
                      onFavorite={favorite}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          <EmptyState
            title={
              search || category !== 'All' || favoritesOnly
                ? 'No accounts match those filters'
                : 'Your vault is empty'
            }
            description={
              search || category !== 'All' || favoritesOnly
                ? 'Try another search or clear your filters to see your accounts.'
                : 'Add an account to see everything organized here.'
            }
            action={
              search || category !== 'All' || favoritesOnly ? (
                <button
                  className="button button-quiet"
                  onClick={() => {
                    setSearch('');
                    setCategory('All');
                    setFavoritesOnly(false);
                  }}
                >
                  Clear filters
                </button>
              ) : (
                <Link className="button button-primary" to="/accounts/new">
                  <Plus size={17} /> Add account
                </Link>
              )
            }
          />
        )}
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
    </>
  );
}
