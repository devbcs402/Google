import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import Brand from '../components/Brand.jsx';

export default function NotFoundPage() {
  return <main className="not-found-page"><header><Brand /></header><section><span className="eyebrow">404 · PAGE NOT FOUND</span><h1>This page wandered<br />out of your inbox.</h1><p>The link may be incorrect, or the page may have moved.</p><Link className="button button-primary" to="/"><ArrowLeft size={17} /> Back to home</Link></section></main>;
}
