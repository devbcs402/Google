import { Layers3 } from 'lucide-react';

export default function Brand({ compact = false }) {
  return (
    <div className="brand-lockup">
      <div className="brand-mark"><Layers3 size={21} strokeWidth={2.2} /></div>
      {!compact && <div><strong>Email Vault</strong><span>MANAGER</span></div>}
    </div>
  );
}
