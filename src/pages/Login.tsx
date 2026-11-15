import {useState} from 'react';
import {ChartPie, Languages, Lock} from 'lucide-react';
import {useStore} from '@/store';

export default function Login() {
  const {t, lang, setLang, signIn} = useStore();
  const [email, setEmail] = useState('admin@aura.com');
  const [password, setPassword] = useState('Admin@123');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const err = await signIn(email, password);
    if (err) setError(t(err));
    setBusy(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 gap-6">
      <div className="flex items-center gap-3">
        <span className="w-11 h-11 border border-gold/40 text-gold flex items-center justify-center">
          <ChartPie size={20} strokeWidth={1.5}/>
        </span>
        <div>
          <p className="text-lg font-semibold text-fg leading-none">{t('brand')}</p>
          <p className="text-[10px] uppercase tracking-[0.25em] text-fg-mute mt-1.5">Aura Business Suite</p>
        </div>
      </div>

      <form onSubmit={submit} className="w-full max-w-md bg-ink-card border border-line p-8 fade-up">
        <div className="text-center mb-8">
          <span className="inline-flex w-12 h-12 items-center justify-center border border-gold/40 text-gold mb-4">
            <Lock size={20} strokeWidth={1.5}/>
          </span>
          <h1 className="text-xl font-semibold text-fg">{t('loginTitle')}</h1>
          <p className="text-xs text-fg-mute mt-2 leading-relaxed">{t('loginSub')}</p>
        </div>

        <label className="block text-[10px] uppercase tracking-[0.2em] text-fg-mute mb-2">{t('email')}</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} dir="ltr" required
          className="w-full h-11 bg-ink border border-line px-3 text-sm text-fg mb-4 focus:outline-none focus:border-gold"/>

        <label className="block text-[10px] uppercase tracking-[0.2em] text-fg-mute mb-2">{t('password')}</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} dir="ltr" required
          className="w-full h-11 bg-ink border border-line px-3 text-sm text-fg mb-5 focus:outline-none focus:border-gold"/>

        {error && <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-2 mb-4">{error}</p>}

        <button disabled={busy} className="w-full h-11 bg-gold text-ink font-semibold text-sm hover:bg-gold-deep transition disabled:opacity-60">
          {busy ? t('signingIn') : t('signIn')}
        </button>

        <div className="mt-5 space-y-1.5 text-center">
          <p className="text-[10px] text-fg-mute" dir="ltr">{t('demoHint')}</p>
          <p className="text-[10px] text-gold/70">{t('demoMode')}</p>
        </div>
      </form>

      <button onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
        className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.1em] text-fg-mute hover:text-gold transition">
        <Languages size={13}/>{lang === 'ar' ? 'English' : 'العربية'}
      </button>
    </div>
  );
}
