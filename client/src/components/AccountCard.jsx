import { useState } from 'react';
import { BriefcaseBusiness, Check, Copy, Ellipsis, Heart, Mail, Pencil, ShoppingBag, Trash2, UserRound, UsersRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext.jsx';

const categoryIcon = {
  Work: BriefcaseBusiness,
  Shopping: ShoppingBag,
  Personal: UserRound,
  Social: UsersRound,
  Study: UserRound,
  Finance: BriefcaseBusiness,
  Other: Mail
};

const colors = ['#e9e7ff', '#e1f4ef', '#fff0e3', '#e7f1ff', '#fde8ef'];

export function AccountCard({ account, index = 0, onDelete, onFavorite }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const notify = useToast();
  const Icon = categoryIcon[account.category] || Mail;
  const color = colors[(account.label?.charCodeAt(0) || index) % colors.length];

  async function handleCopy(e) {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(account.emailAddress);
      setCopied(true);
      if (notify) notify(`Copied ${account.emailAddress} to clipboard.`);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      if (notify) notify('Failed to copy to clipboard.', 'error');
    }
  }

  return (
    <article className="account-card">
      <div className="account-top">
        <div className="service-icon" style={{ backgroundColor: color }}>
          <Icon size={20} />
        </div>
        <div className="account-actions">
          <button
            className={`icon-button favorite-button ${account.isFavorite ? 'favorited' : ''}`}
            aria-label={account.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            aria-pressed={account.isFavorite}
            onClick={() => onFavorite(account)}
          >
            <Heart size={18} fill={account.isFavorite ? 'currentColor' : 'none'} />
          </button>
          <div className="menu-wrap">
            <button
              className="icon-button"
              aria-label={`More options for ${account.label}`}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
            >
              <Ellipsis size={20} />
            </button>
            {menuOpen && (
              <div className="action-menu">
                <Link to={`/accounts/${account._id}`} onClick={() => setMenuOpen(false)}>
                  <Mail size={15} /> View Details
                </Link>
                <Link to={`/accounts/${account._id}/edit`} onClick={() => setMenuOpen(false)}>
                  <Pencil size={15} /> Edit
                </Link>
                <button
                  className="danger-text"
                  onClick={() => {
                    setMenuOpen(false);
                    onDelete(account);
                  }}
                >
                  <Trash2 size={15} /> Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="account-info">
        <h3>
          <Link to={`/accounts/${account._id}`}>{account.label}</Link>
        </h3>
        <div className="flex items-center justify-between text-muted text-sm mt-1">
          <span className="flex items-center gap-1.5 truncate font-mono text-xs">
            <Mail size={13} className="shrink-0" />
            <span className="truncate">{account.emailAddress}</span>
          </span>
          <button
            type="button"
            className="icon-button copy-button shrink-0 ml-1.5"
            title="Copy email address"
            aria-label="Copy email address"
            onClick={handleCopy}
          >
            {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
          </button>
        </div>
      </div>
      <div className="account-card-footer">
        <span className="category-chip">{account.category}</span>
        <span className="provider-label">{account.provider}</span>
      </div>
    </article>
  );
}

export function AccountRow({ account, onDelete, onFavorite }) {
  const [copied, setCopied] = useState(false);
  const notify = useToast();

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(account.emailAddress);
      setCopied(true);
      if (notify) notify(`Copied ${account.emailAddress} to clipboard.`);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      if (notify) notify('Failed to copy to clipboard.', 'error');
    }
  }

  return (
    <tr>
      <td>
        <div className="table-service">
          <span className="table-icon">
            <Mail size={17} />
          </span>
          <Link to={`/accounts/${account._id}`}>
            <strong>{account.label}</strong>
          </Link>
        </div>
      </td>
      <td>
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs">{account.emailAddress}</span>
          <button
            type="button"
            className="icon-button copy-button shrink-0"
            title="Copy email address"
            aria-label="Copy email address"
            onClick={handleCopy}
          >
            {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
          </button>
        </div>
      </td>
      <td>
        <span className="category-chip">{account.category}</span>
      </td>
      <td>
        <button
          className={`icon-button favorite-button ${account.isFavorite ? 'favorited' : ''}`}
          aria-label={account.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          aria-pressed={account.isFavorite}
          onClick={() => onFavorite(account)}
        >
          <Heart size={18} fill={account.isFavorite ? 'currentColor' : 'none'} />
        </button>
      </td>
      <td>
        <div className="table-row-actions">
          <Link className="icon-button" to={`/accounts/${account._id}/edit`} aria-label={`Edit ${account.label}`}>
            <Pencil size={17} />
          </Link>
          <button
            className="icon-button danger-text"
            aria-label={`Delete ${account.label}`}
            onClick={() => onDelete(account)}
          >
            <Trash2 size={17} />
          </button>
        </div>
      </td>
    </tr>
  );
}
