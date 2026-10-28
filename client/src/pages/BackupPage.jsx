import { useEffect, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  Download,
  FileDown,
  FileText,
  Lock,
  Mail,
  Shield,
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { api, downloadBackupPdf, getErrorMessage } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import Loading from '../components/Loading.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';

export default function BackupPage() {
  const { user } = useAuth();
  const notify = useToast();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    api.get('/emails')
      .then(({ data }) => {
        if (active) setAccounts(data.accounts || []);
      })
      .catch((err) => {
        if (active) setError(getErrorMessage(err));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, []);

  async function handleDownloadBackup() {
    setDownloading(true);
    try {
      const filename = await downloadBackupPdf();
      setShowConfirm(false);
      notify(`PDF backup downloaded: ${filename}`);
    } catch (err) {
      notify(getErrorMessage(err), 'error');
    } finally {
      setDownloading(false);
    }
  }

  if (loading) return <Loading label="Preparing backup options…" />;

  const categoriesCount = new Set(accounts.map((a) => a.category)).size;

  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">DATA PORTABILITY & SAFEGUARD</span>
          <h1>Vault Backup</h1>
          <p>Generate a printable, confidential PDF directory of all your email accounts.</p>
        </div>
      </div>

      {error && (
        <div className="inline-error" role="alert">
          <span>{error}</span>
        </div>
      )}

      {/* Sensitive Information Security Warning */}
      <section className="backup-warning-banner" role="alert">
        <div className="backup-warning-icon">
          <ShieldAlert size={22} />
        </div>
        <div>
          <strong>Security Notice: Confidential Document</strong>
          <p>
            The generated PDF backup will contain all your email addresses, purpose notes, storage locations,
            and private notes. Please store downloaded files in an encrypted or offline location. Never share
            or email this backup to untrusted parties.
          </p>
        </div>
      </section>

      <div className="backup-grid">
        {/* Main Action Card */}
        <section className="backup-main-card">
          <div className="backup-card-header">
            <div className="backup-file-icon">
              <FileDown size={28} />
            </div>
            <div>
              <h2>PDF Directory Export</h2>
              <p>Professional, categorized A4 document ready to print or archive.</p>
            </div>
          </div>

          <div className="backup-stats-strip">
            <div className="backup-stat">
              <span>Included Accounts</span>
              <strong>{accounts.length}</strong>
            </div>
            <div className="backup-stat">
              <span>Categories</span>
              <strong>{categoriesCount}</strong>
            </div>
            <div className="backup-stat">
              <span>Format</span>
              <strong>A4 PDF</strong>
            </div>
            <div className="backup-stat">
              <span>Storage</span>
              <strong className="text-emerald-700">Streamed (0 KB Server)</strong>
            </div>
          </div>

          <div className="backup-actions">
            <button
              type="button"
              className="button button-primary backup-download-btn"
              disabled={downloading}
              onClick={() => setShowConfirm(true)}
            >
              {downloading ? (
                <>
                  <span className="backup-spinner" /> Generating PDF Backup…
                </>
              ) : (
                <>
                  <Download size={18} /> Download PDF Backup
                </>
              )}
            </button>
            <span className="backup-help-text">
              Generated on-demand for {user?.name} ({user?.email})
            </span>
          </div>

          <div className="backup-included-box">
            <h3>What is included in this backup?</h3>
            <ul className="backup-features-list">
              <li>
                <Check size={16} className="text-emerald-600" />
                <span><strong>Account Essentials:</strong> Email address, label, provider, and category</span>
              </li>
              <li>
                <Check size={16} className="text-emerald-600" />
                <span><strong>Purpose & Storage:</strong> Explanation of use and document storage locations</span>
              </li>
              <li>
                <Check size={16} className="text-emerald-600" />
                <span><strong>Important Links:</strong> Saved drive folders, support links, and URLs</span>
              </li>
              <li>
                <Check size={16} className="text-emerald-600" />
                <span><strong>Private Notes & Status:</strong> Personal notes, favorite flags, and timestamps</span>
              </li>
              <li>
                <Check size={16} className="text-emerald-600" />
                <span><strong>Printable Layout:</strong> Page numbers, category grouping, and document header</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Side Security & Privacy Guarantee */}
        <aside className="backup-side-card">
          <div className="privacy-icon">
            <Shield size={22} />
          </div>
          <span className="eyebrow">PRIVACY ASSURANCE</span>
          <h2>Zero Server Footprint</h2>
          <p>
            Your backup is generated in-memory and streamed directly to your browser. No PDF files are ever
            saved to disk on our servers.
          </p>

          <div className="backup-guarantees">
            <div className="guarantee-item">
              <Lock size={17} />
              <div>
                <strong>JWT Protected</strong>
                <p>Only your authenticated session can trigger and access this download.</p>
              </div>
            </div>
            <div className="guarantee-item">
              <Mail size={17} />
              <div>
                <strong>User Isolated</strong>
                <p>Only records created under your personal user account are included.</p>
              </div>
            </div>
            <div className="guarantee-item">
              <Clock size={17} />
              <div>
                <strong>Instant & Fresh</strong>
                <p>Reflects your latest saved records up to the exact second of generation.</p>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {showConfirm && (
        <ConfirmDialog
          title="Download Vault PDF Backup?"
          message="This backup will include all saved email account details. Continue?"
          confirmLabel="Download Backup"
          cancelLabel="Cancel"
          confirmVariant="primary"
          icon={FileDown}
          warningNotice="This document contains sensitive personal email directory data. Store it securely once downloaded."
          onCancel={() => setShowConfirm(false)}
          onConfirm={handleDownloadBackup}
          busy={downloading}
        />
      )}
    </>
  );
}
