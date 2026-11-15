import {useState} from 'react';
import {Check, Languages, Moon, RotateCcw, Sun, Wifi} from 'lucide-react';
import {useStore} from '@/store';
import {Badge, Btn, Card, Input, PageHead, Select} from '@/components/ui';

export default function Settings() {
  const {t, lang, setLang, theme, setTheme, user, mode, refresh} = useStore();
  const [notif, setNotif] = useState({orders: true, stock: true, reviews: false});
  const [store, setStore] = useState({name: 'Islam Al-Nashar — إسلام النشار', currency: 'SAR', tax: 15});
  const [savedTick, setSavedTick] = useState(false);

  const save = () => {
    setSavedTick(true);
    setTimeout(() => setSavedTick(false), 1800);
  };

  const Toggle = ({on, onClick}: {on: boolean; onClick: () => void}) => (
    <button onClick={onClick} className={`w-10 h-[22px] border relative transition-colors shrink-0 ${on ? 'border-gold/50 bg-gold/20' : 'border-line'}`}>
      <span className={`absolute top-[3px] h-3.5 w-3.5 transition-all ${on ? 'start-[calc(100%-17px)] bg-gold' : 'start-[3px] bg-fg-mute'}`}/>
    </button>
  );

  return (
    <div className="fade-up max-w-4xl">
      <PageHead title={t('nav.settings')}
        actions={<Btn variant="gold" onClick={save}>{savedTick ? <><Check size={13}/>{t('saved')}</> : t('save')}</Btn>}/>

      {/* Profile */}
      <Card title={t('profile')} className="mb-4">
        <div className="flex items-center gap-4 mb-5">
          <span className="w-14 h-14 bg-gold/15 text-gold flex items-center justify-center text-lg font-bold">IA</span>
          <div>
            <p className="text-sm font-semibold text-fg">{user.name}</p>
            <p className="text-xs text-fg-mute mt-0.5" dir="ltr">{user.email}</p>
            <div className="mt-1.5"><Badge tone="vip">{t('admin')}</Badge></div>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] uppercase tracking-[0.15em] text-fg-mute mb-2">{t('fullName')}</label>
            <Input defaultValue={user.name}/>
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-[0.15em] text-fg-mute mb-2">{t('email')}</label>
            <Input defaultValue={user.email} dir="ltr"/>
          </div>
        </div>
      </Card>

      {/* Store */}
      <Card title={t('storeSettings')} className="mb-4">
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="sm:col-span-3">
            <label className="block text-[10px] uppercase tracking-[0.15em] text-fg-mute mb-2">{t('storeName')}</label>
            <Input value={store.name} onChange={e => setStore({...store, name: e.target.value})}/>
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-[0.15em] text-fg-mute mb-2">{t('currency')}</label>
            <Select value={store.currency} onChange={e => setStore({...store, currency: e.target.value})} className="w-full">
              <option value="SAR">SAR — ر.س</option>
              <option value="AED">AED — د.إ</option>
              <option value="USD">USD — $</option>
            </Select>
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-[0.15em] text-fg-mute mb-2">{t('taxRate')}</label>
            <Input type="number" value={store.tax} min={0} max={100} onChange={e => setStore({...store, tax: Number(e.target.value)})} dir="ltr"/>
          </div>
        </div>
      </Card>

      {/* Preferences */}
      <Card title={t('preferences')} className="mb-4">
        <div className="space-y-1">
          <div className="flex items-center justify-between py-3 border-b border-line/40">
            <div className="flex items-center gap-3">
              <Languages size={15} className="text-gold"/>
              <div>
                <p className="text-xs text-fg">{t('language')}</p>
                <p className="text-[10px] text-fg-mute mt-0.5">{t('sub')}</p>
              </div>
            </div>
            <div className="flex border border-line">
              <button onClick={() => setLang('ar')} className={`px-3 h-8 text-[11px] ${lang === 'ar' ? 'bg-gold text-ink font-semibold' : 'text-fg-soft'}`}>العربية</button>
              <button onClick={() => setLang('en')} className={`px-3 h-8 text-[11px] ${lang === 'en' ? 'bg-gold text-ink font-semibold' : 'text-fg-soft'}`}>English</button>
            </div>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-line/40">
            <div className="flex items-center gap-3">
              {theme === 'dark' ? <Moon size={15} className="text-gold"/> : <Sun size={15} className="text-gold"/>}
              <div>
                <p className="text-xs text-fg">{t('appearance')}</p>
                <p className="text-[10px] text-fg-mute mt-0.5">{theme === 'dark' ? t('darkMode') : t('lightMode')}</p>
              </div>
            </div>
            <div className="flex border border-line">
              <button onClick={() => setTheme('dark')} className={`px-3 h-8 text-[11px] flex items-center gap-1.5 ${theme === 'dark' ? 'bg-gold text-ink font-semibold' : 'text-fg-soft'}`}>
                <Moon size={12}/>{t('darkMode')}
              </button>
              <button onClick={() => setTheme('light')} className={`px-3 h-8 text-[11px] flex items-center gap-1.5 ${theme === 'light' ? 'bg-gold text-ink font-semibold' : 'text-fg-soft'}`}>
                <Sun size={12}/>{t('lightMode')}
              </button>
            </div>
          </div>

          {([
            ['orders', t('notifOrders')],
            ['stock', t('notifStock')],
            ['reviews', t('notifReviews')],
          ] as const).map(([key, label]) => (
            <div key={key} className="flex items-center justify-between py-3 border-b border-line/40">
              <p className="text-xs text-fg">{label}</p>
              <Toggle on={notif[key]} onClick={() => setNotif({...notif, [key]: !notif[key]})}/>
            </div>
          ))}
        </div>
      </Card>

      {/* Connection */}
      <Card title={t('apiStatus')} className="mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Wifi size={15} className={mode === 'live' ? 'text-emerald-400' : 'text-gold'}/>
            <div>
              <p className="text-xs text-fg">{mode === 'live' ? t('liveReal') : t('liveDemo')}</p>
              <p className="text-[10px] text-fg-mute mt-0.5" dir="ltr">
                {mode === 'live' ? 'http://localhost:3001/api' : 'localhost:3001 — offline'}
              </p>
            </div>
          </div>
          <Btn onClick={refresh}><RotateCcw size={12}/>{t('refresh')}</Btn>
        </div>
      </Card>

      {/* Danger zone */}
      <Card className="!border-red-500/25">
        <h3 className="text-[11px] uppercase tracking-[0.15em] text-red-400 mb-3">{t('dangerZone')}</h3>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <p className="text-xs text-fg-mute">{t('resetDemo')}</p>
          <Btn variant="danger" onClick={() => location.reload()}><RotateCcw size={12}/>{t('resetDemo')}</Btn>
        </div>
      </Card>
    </div>
  );
}
