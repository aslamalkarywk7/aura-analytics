import type {ReactNode} from 'react';
import {ArrowDownRight, ArrowUpRight, Minus} from 'lucide-react';
import {pct, type Lang} from '@/lib/format';

/* ── Card ────────────────────────────────────────────────── */
export function Card({title, extra, children, className = '', pad = true}: {
  title?: ReactNode; extra?: ReactNode; children: ReactNode; className?: string; pad?: boolean;
}) {
  return (
    <div className={`bg-ink-card border border-line ${pad ? 'p-5' : ''} ${className}`}>
      {title && (
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[11px] uppercase tracking-[0.18em] text-fg-mute">{title}</h2>
          {extra}
        </div>
      )}
      {children}
    </div>
  );
}

/* ── KPI ─────────────────────────────────────────────────── */
export function Kpi({icon: Icon, label, value, delta, sub}: {
  icon: React.ComponentType<{size?: number; strokeWidth?: number; className?: string}>;
  label: string; value: string; delta?: number; sub?: string;
}) {
  return (
    <div className="bg-ink-card border border-line p-4 hover:border-gold/40 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] uppercase tracking-[0.15em] text-fg-mute">{label}</span>
        <Icon size={15} strokeWidth={1.5} className="text-gold" />
      </div>
      <p className="text-xl font-semibold text-fg" dir="ltr">{value}</p>
      {delta !== undefined && (
        <p className={`flex items-center gap-1 text-[11px] mt-1.5 ${delta > 0 ? 'text-emerald-400' : delta < 0 ? 'text-red-400' : 'text-fg-mute'}`}>
          {delta > 0 ? <ArrowUpRight size={12}/> : delta < 0 ? <ArrowDownRight size={12}/> : <Minus size={12}/>}
          <span dir="ltr">{Math.abs(delta).toFixed(1)}%</span>
          {sub && <span className="text-fg-mute ms-1">{sub}</span>}
        </p>
      )}
      {delta === undefined && sub && <p className="text-[11px] text-fg-mute mt-1.5">{sub}</p>}
    </div>
  );
}

/* ── Badge ───────────────────────────────────────────────── */
const TONES: Record<string, string> = {
  pending: 'bg-amber-500/10 text-amber-400 border-amber-500/25',
  paid: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
  processing: 'bg-blue-500/10 text-blue-400 border-blue-500/25',
  shipped: 'bg-violet-500/10 text-violet-400 border-violet-500/25',
  delivered: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
  cancelled: 'bg-red-500/10 text-red-400 border-red-500/25',
  refunded: 'bg-red-500/10 text-red-400 border-red-500/25',
  vip: 'bg-gold/15 text-gold border-gold/30',
  loyal: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
  regular: 'bg-blue-500/10 text-blue-400 border-blue-500/25',
  new: 'bg-stone-500/10 text-fg-soft border-stone-500/25',
  on: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
  off: 'bg-stone-500/10 text-fg-mute border-stone-500/25',
  low: 'bg-amber-500/10 text-amber-400 border-amber-500/25',
  out: 'bg-red-500/10 text-red-400 border-red-500/25',
  ok: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
};

export function Badge({tone, children}: {tone: string; children: ReactNode}) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 border text-[10px] uppercase tracking-[0.1em] ${TONES[tone] ?? TONES.off}`}>
      {children}
    </span>
  );
}

/* ── Page header ─────────────────────────────────────────── */
export function PageHead({title, sub, actions}: {title: string; sub?: string; actions?: ReactNode}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
      <div>
        <h1 className="text-2xl font-semibold text-fg">{title}</h1>
        {sub && <p className="text-xs text-fg-mute mt-1.5">{sub}</p>}
      </div>
      <div className="flex items-center gap-2">{actions}</div>
    </div>
  );
}

/* ── Buttons / inputs ────────────────────────────────────── */
export function Btn({children, onClick, variant = 'ghost', disabled, className = ''}: {
  children: ReactNode; onClick?: () => void; variant?: 'gold' | 'ghost' | 'danger'; disabled?: boolean; className?: string;
}) {
  const styles = {
    gold: 'bg-gold text-ink font-semibold hover:bg-gold-deep',
    ghost: 'border border-line text-fg-soft hover:border-gold/50 hover:text-gold',
    danger: 'border border-red-500/30 text-red-400 hover:bg-red-500/10',
  }[variant];
  return (
    <button onClick={onClick} disabled={disabled} className={`h-9 px-3.5 flex items-center gap-1.5 text-[11px] uppercase tracking-[0.1em] transition disabled:opacity-50 ${styles} ${className}`}>
      {children}
    </button>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input {...props} className={`w-full h-10 bg-ink border border-line px-3 text-sm text-fg focus:outline-none focus:border-gold placeholder:text-fg-mute ${props.className ?? ''}`}/>
  );
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select {...props} className={`h-9 bg-ink border border-line px-2.5 text-xs text-fg-soft focus:outline-none focus:border-gold ${props.className ?? ''}`}/>
  );
}

/* ── Progress bar row ────────────────────────────────────── */
export function ProgressRow({label, value, max, right, tone}: {
  label: ReactNode; value: number; max: number; right?: ReactNode; tone?: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1.5">
        <span className="text-fg-soft line-clamp-1">{label}</span>
        <span className="text-fg-mute shrink-0 ms-2" dir="ltr">{right}</span>
      </div>
      <div className="h-1.5 bg-line">
        <div className="h-1.5 transition-all" style={{width: `${Math.min(100, (value / (max || 1)) * 100)}%`, background: tone ?? 'var(--gold)'}}/>
      </div>
    </div>
  );
}

/* ── Empty / loading ─────────────────────────────────────── */
export function Empty({text}: {text: string}) {
  return <p className="text-fg-mute text-xs py-10 text-center">{text}</p>;
}

/* ── Range switcher ──────────────────────────────────────── */
export function RangeSwitch({value, onChange, options}: {
  value: string; onChange: (v: string) => void; options: {key: string; label: string}[];
}) {
  return (
    <div className="flex border border-line">
      {options.map(o => (
        <button key={o.key} onClick={() => onChange(o.key)}
          className={`px-2.5 h-7 text-[10px] uppercase tracking-[0.1em] transition ${value === o.key ? 'bg-gold text-ink font-semibold' : 'text-fg-mute hover:text-gold'}`}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

/* ── Modal ───────────────────────────────────────────────── */
export function Modal({open, onClose, title, children, wide}: {
  open: boolean; onClose: () => void; title: string; children: ReactNode; wide?: boolean;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose}/>
      <div className={`relative bg-ink-card border border-line w-full ${wide ? 'max-w-3xl' : 'max-w-lg'} max-h-[85vh] overflow-y-auto fade-up`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-line sticky top-0 bg-ink-card z-10">
          <h3 className="text-sm font-semibold text-fg">{title}</h3>
          <button onClick={onClose} className="text-fg-mute hover:text-gold text-lg leading-none px-1">×</button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

/* ── Chart helpers ───────────────────────────────────────── */
export const CHART_COLORS = ['#c8b49c', '#8fae8b', '#7f9fbf', '#d1a36a', '#b87a7a', '#8a8a7e', '#a78baf', '#6fb3ae'];
export const tooltipStyle = {background: 'var(--tooltip-bg)', border: '1px solid var(--line)', borderRadius: 0, fontSize: 12} as const;
export const gold = () => 'var(--gold)';
export function trendPct(v: number, lang: Lang) {return pct(v / 100, lang, 1);}
