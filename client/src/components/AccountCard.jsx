import { useState } from 'react';
import {
  BriefcaseBusiness,
  Check,
  ChevronRight,
  Copy,
  Ellipsis,
  Heart,
  Mail,
  Pencil,
  ShoppingBag,
  Trash2,
  UserRound,
  UsersRound
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const notify = useToast();
  const Icon = categoryIcon[account.category] || Mail;
  const color = colors[(account.label?.charCodeAt(0) || index) % colors.length];

  function handleCardClick() {
    navigate(`/accounts/${account._id}`);
  }

  function handleKeyDown(event) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      navigate(`/accounts/${account._id}`);
    }
  }

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
    <div
      role="button"
      tabIndex={0}
      aria-label={`Open details for ${account.emailAddress}`}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      className="account-card cursor-pointer group"
    >
      <div className="account-top">
        <div className="service-icon" style={{ backgroundColor: color }}>
          <Icon size={20} />
        </div>
        <div className="account-actions">
          <button
            type="button"
            className={`icon-button favorite-button ${account.isFavorite ? 'favorited' : ''}`}
            aria-label={account.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            aria-pressed={account.isFavorite}
            onClick={(e) => {
              e.stopPropagation();
              onFavorite(account);
            }}
          >
            <Heart size={18} fill={account.isFavorite ? 'currentColor' : 'none'} />
          </button>
          <div className="menu-wrap" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="icon-button"
              aria-label={`More options for ${account.label}`}
              aria-expanded={menuOpen}
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen((open) => !open);
              }}
            >
              <Ellipsis size={20} />
            </button>
            {menuOpen && (
              <div className="action-menu" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(false);
                    navigate(`/accounts/${account._id}`);
                  }}
                >
                  <Mail size={15} /> View Details
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(false);
                    navigate(`/accounts/${account._id}/edit`);
                  }}
                >
                  <Pencil size={15} /> Edit
                </button>
                <button
                  type="button"
                  className="danger-text"
                  onClick={(e) => {
                    e.stopPropagation();
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
        <div className="flex items-center justify-between gap-1">
          <h3 className="truncate font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
            {account.label}
          </h3>
          <ChevronRight
            size={16}
            className="text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all shrink-0"
          />
        </div>
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
    </div>
  );
}

export function AccountRow({ account, onDelete, onFavorite }) {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const notify = useToast();

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
    <tr
      className="hover:bg-slate-50/70 cursor-pointer transition-colors"
      onClick={() => navigate(`/accounts/${account._id}`)}
    >
      <td>
        <div className="table-service">
          <span className="table-icon">
            <Mail size={17} />
          </span>
          <span className="font-semibold text-gray-900 hover:text-indigo-600 transition-colors">
            {account.label}
          </span>
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
          type="button"
          className={`icon-button favorite-button ${account.isFavorite ? 'favorited' : ''}`}
          aria-label={account.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          aria-pressed={account.isFavorite}
          onClick={(e) => {
            e.stopPropagation();
            onFavorite(account);
          }}
        >
          <Heart size={18} fill={account.isFavorite ? 'currentColor' : 'none'} />
        </button>
      </td>
      <td>
        <div className="table-row-actions" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            className="icon-button"
            aria-label={`Edit ${account.label}`}
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/accounts/${account._id}/edit`);
            }}
          >
            <Pencil size={17} />
          </button>
          <button
            type="button"
            className="icon-button danger-text"
            aria-label={`Delete ${account.label}`}
            onClick={(e) => {
              e.stopPropagation();
              onDelete(account);
            }}
          >
            <Trash2 size={17} />
          </button>
        </div>
      </td>
    </tr>
  );
}
