import { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, LogOut, Menu, Settings2, ShieldCheck, X } from 'lucide-react';
import Brand from './Brand.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const links = [
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/accounts', label: 'Email accounts', icon: ShieldCheck },
  { to: '/profile', label: 'Profile & settings', icon: Settings2 }
];

export default function AppLayout() {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const current = links.find((item) => item.end ? location.pathname === item.to : location.pathname.startsWith(item.to));

  function logout() {
    signOut();
    navigate('/login', { replace: true });
  }

  return (
    <div className="app-shell">
      {mobileOpen && <button className="mobile-backdrop" aria-label="Close navigation" onClick={() => setMobileOpen(false)} />}
      <aside className={`sidebar ${mobileOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-brand"><Brand /><button className="mobile-close icon-button" aria-label="Close navigation" onClick={() => setMobileOpen(false)}><X size={20} /></button></div>
        <div className="workspace-label">WORKSPACE</div>
        <nav className="side-nav" aria-label="Main navigation">
          {links.map(({ to, label, icon: Icon, end }) => <NavLink key={to} to={to} end={end} onClick={() => setMobileOpen(false)} className={({ isActive }) => `nav-link ${isActive ? 'nav-active' : ''}`}><Icon size={19} /><span>{label}</span>{label === 'Email accounts' && <span className="nav-indicator" />}</NavLink>)}
        </nav>
        <div className="sidebar-note"><div className="note-icon"><ShieldCheck size={17} /></div><strong>Your vault, your privacy</strong><p>Only you can see the account details you save here.</p></div>
        <div className="sidebar-user">
          <div className="avatar">{user?.name?.slice(0, 1).toUpperCase() || 'U'}</div>
          <div className="user-copy"><strong>{user?.name}</strong><span>{user?.email}</span></div>
          <button className="icon-button logout-button" onClick={logout} aria-label="Sign out"><LogOut size={18} /></button>
        </div>
      </aside>
      <div className="main-column">
        <header className="topbar">
          <button className="mobile-menu icon-button" aria-label="Open navigation" onClick={() => setMobileOpen(true)}><Menu size={21} /></button>
          <div className="breadcrumbs"><span>Workspace</span><span className="crumb-slash">/</span><strong>{current?.label || 'Workspace'}</strong></div>
          <div className="topbar-right"><span className="secure-label"><span />Private workspace</span><div className="avatar avatar-small">{user?.name?.slice(0, 1).toUpperCase()}</div></div>
        </header>
        <main className="page-content"><Outlet /></main>
        <footer className="app-footer"><span>© {new Date().getFullYear()} Email Vault Manager</span><span>Keep your digital life organized.</span></footer>
      </div>
    </div>
  );
}
