import { ArrowRight, Check, Mail, ShieldCheck, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import Brand from '../components/Brand.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function LandingPage() {
  const { user } = useAuth();
  const destination = user ? '/dashboard' : '/register';
  return (
    <main className="landing-page">
      <header className="landing-nav"><Brand /><nav><Link to="/login">Sign in</Link><Link className="button button-primary" to={destination}>{user ? 'Open your vault' : 'Get started'}<ArrowRight size={16} /></Link></nav></header>
      <section className="landing-hero">
        <div className="landing-copy"><div className="aside-badge"><Sparkles size={15} /> A CALMER WAY TO STAY ORGANIZED</div><h1>All your email accounts.<br /><span>One clear view.</span></h1><p>Keep track of every inbox, the details that matter, and the links you need—without the clutter.</p><div className="landing-actions"><Link className="button button-primary" to={destination}>{user ? 'Go to dashboard' : 'Create your free vault'}<ArrowRight size={17} /></Link><Link className="landing-secondary" to="/login">I already have an account</Link></div><div className="landing-trust"><ShieldCheck size={17} /> Private to you. Never stores email passwords.</div></div>
        <div className="landing-preview" aria-label="Illustration of an organized email account vault"><div className="preview-top"><div><span className="eyebrow">YOUR WORKSPACE</span><h2>Your accounts</h2></div><div className="preview-spark">✦</div></div><div className="preview-stat"><span className="preview-mail-icon"><Mail size={20} /></span><div><strong>3 accounts</strong><small>organized and easy to find</small></div></div>{[['Work inbox', 'you@company.com', 'WORK'], ['Personal email', 'hello@example.com', 'PERSONAL'], ['Study account', 'student@school.edu', 'STUDY']].map(([label, address, category]) => <div className="preview-account" key={label}><span className="preview-account-dot"><Mail size={16} /></span><div><strong>{label}</strong><small>{address}</small></div><span>{category}</span></div>)}<div className="preview-private"><ShieldCheck size={16} /> Your details stay private</div></div>
      </section>
      <section className="landing-features"><div><span className="eyebrow">MADE FOR YOUR DIGITAL LIFE</span><h2>A little more order,<br />a lot more peace.</h2></div><div className="landing-feature"><span className="feature-check"><Check size={17} /></span><div><strong>Keep the details that matter</strong><p>Purpose, important links, and storage notes for every inbox.</p></div></div><div className="landing-feature"><span className="feature-check"><Check size={17} /></span><div><strong>Find any account in seconds</strong><p>Search your collection and filter by category or favorites.</p></div></div><div className="landing-feature"><span className="feature-check"><Check size={17} /></span><div><strong>Private by design</strong><p>Your entries are scoped to your account—not shared with anyone.</p></div></div></section>
      <footer className="landing-footer"><Brand /><span>© {new Date().getFullYear()} Email Vault Manager · Your vault, your privacy.</span></footer>
    </main>
  );
}
