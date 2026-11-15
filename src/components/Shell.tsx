import {useState} from 'react';
import {NavLink, useLocation} from 'react-router-dom';
import {AnimatePresence, motion} from 'motion/react';
import {
  Bell, ChartPie, Gauge, Languages, LayoutDashboard, LogOut, Menu,
  Megaphone, Moon, Package, RefreshCw, ShoppingCart, Sun, Users,
  FileBarChart, Warehouse, Settings, X,
} from 'lucide-react';
import {useStore} from '@/store';

const NAV = [
  {group: 'nav.group.main', items: [
    {to: '/', icon: LayoutDashboard, key: 'nav.dashboard'},
    {to: '/analytics', icon: Gauge, key: 'nav.analytics'},
  ]},
  {group: 'nav.group.commerce', items: [
    {to: '/orders', icon: ShoppingCart, key: 'nav.orders'},
    {to: '/products', icon: Package, key: 'nav.products'},
    {to: '/customers', icon: Users, key: 'nav.customers'},
    {to: '/inventory', icon: Warehouse, key: 'nav.inventory'},
  ]},
  {group: 'nav.group.growth', items: [
    {to: '/marketing', icon: Megaphone, key: 'nav.marketing'},
    {to: '/reports', icon: FileBarChart, key: 'nav.reports'},
  ]},
  {group: 'nav.group.system', items: [
    {to: '/settings', icon: Settings, key: 'nav.settings'},
  ]},
];

export default function Shell({children}: {children: React.ReactNode}) {
  const {t, lang, setLang, theme, setTheme, logout, refresh, mode, user} = useStore();
  const [open, setOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const loc = useLocation();

  const sidebar = (
    <nav className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-5 h-16 border-b border-line shrink-0">
        <span className="w-9 h-9 border border-gold/40 text-gold flex items-center justify-center shrink-0">
          <ChartPie size={17} strokeWidth={1.5}/>
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-fg leading-none truncate">{t('brand')}</p>
          <p className="text-[9px] uppercase tracking-[0.2em] text-fg-mute mt-1">Aura Suite</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
        {NAV.map(sec => (
          <div key={sec.group}>
            <p className="text-[9px] uppercase tracking-[0.22em] text-fg-mute/70 px-2 mb-2">{t(sec.group)}</p>
            <ul className="space-y-0.5">
              {sec.items.map(item => (
                <li key={item.to}>
                  <NavLink to={item.to} end={item.to === '/'}
                    onClick={() => setOpen(false)}
                    className={({isActive}) => `flex items-center gap-2.5 h-9 px-2.5 text-xs transition-colors ${
                      isActive ? 'bg-gold/12 text-gold border border-gold/30' : 'text-fg-soft border border-transparent hover:text-gold hover:bg-gold/5'
                    }`}>
                    <item.icon size={15} strokeWidth={1.5}/>
                    <span className="truncate">{t(item.key)}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="px-3 pb-4 shrink-0">
        <div className="border border-line p-3 flex items-center gap-2.5">
          <span className="w-8 h-8 bg-gold/15 text-gold flex items-center justify-center text-xs font-bold shrink-0">IA</span>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-fg truncate">{user.name}</p>
            <p className="text-[10px] text-fg-mute truncate" dir="ltr">{user.email}</p>
          </div>
          <button onClick={logout} title={t('logout')} className="text-fg-mute hover:text-red-400 transition shrink-0">
            <LogOut size={14}/>
          </button>
        </div>
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-60 border-e border-line bg-ink-soft/60 shrink-0 sticky top-0 h-screen">
        {sidebar}
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div className="fixed inset-0 bg-black/60 z-40 lg:hidden"
              initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} onClick={() => setOpen(false)}/>
            <motion.aside className="fixed inset-y-0 start-0 w-64 bg-ink-soft border-e border-line z-50 lg:hidden"
              initial={{x: lang === 'ar' ? 300 : -300}} animate={{x: 0}} exit={{x: lang === 'ar' ? 300 : -300}}
              transition={{type: 'tween', duration: 0.22}}>
              <button onClick={() => setOpen(false)} className="absolute top-4 end-3 text-fg-mute hover:text-gold z-10"><X size={18}/></button>
              {sidebar}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main column */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="h-16 border-b border-line bg-ink/95 backdrop-blur sticky top-0 z-30 flex items-center justify-between gap-3 px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setOpen(true)} className="lg:hidden text-fg-soft hover:text-gold"><Menu size={20}/></button>
            <span className="hidden md:inline-flex items-center gap-1.5 px-2 py-1 border text-[10px] uppercase tracking-[0.12em]">
              <span className={`w-1.5 h-1.5 rounded-full pulse-dot ${mode === 'live' ? 'bg-emerald-400' : 'bg-gold'}`}/>
              <span className={mode === 'live' ? 'text-emerald-400' : 'text-gold'}>{mode === 'live' ? t('liveReal') : t('liveDemo')}</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <button onClick={() => setNotifOpen(!notifOpen)} className="h-9 w-9 flex items-center justify-center border border-line text-fg-soft hover:border-gold/50 hover:text-gold transition">
                <Bell size={14}/>
                <span className="absolute top-1.5 end-1.5 w-1.5 h-1.5 bg-gold rounded-full"/>
              </button>
              {notifOpen && (
                <div className="absolute end-0 top-11 w-72 bg-ink-card border border-line shadow-xl fade-up z-40">
                  <p className="text-[10px] uppercase tracking-[0.15em] text-fg-mute px-4 py-3 border-b border-line">{t('activityFeed')}</p>
                  <ul className="max-h-72 overflow-y-auto">
                    {[
                      {ar: 'طلب جديد #IA-9541 — 745 ر.س', en: 'New order #IA-9541 — 745 SAR'},
                      {ar: '«ذهب الملوك» على وشك النفاد', en: '"Royal Gold" almost out of stock'},
                      {ar: 'تقييم 5 نجوم جديد على «سرّ المسك»', en: 'New 5★ review on "Musk Secret"'},
                      {ar: 'تحويل بنكي 84,200 ر.س تم', en: 'Bank payout 84,200 SAR done'},
                    ].map((n, i) => (
                      <li key={i} className="px-4 py-3 border-b border-line/50 text-xs text-fg-soft hover:bg-gold/5">
                        {lang === 'ar' ? n.ar : n.en}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <button onClick={refresh} title={t('refresh')} className="h-9 px-3 flex items-center gap-1.5 text-[11px] uppercase tracking-[0.1em] text-fg-soft border border-line hover:border-gold/50 hover:text-gold transition">
              <RefreshCw size={13}/><span className="hidden sm:inline">{t('refresh')}</span>
            </button>
            <button onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')} className="h-9 px-3 flex items-center gap-1.5 text-[11px] uppercase tracking-[0.1em] text-fg-soft border border-line hover:border-gold/50 hover:text-gold transition">
              <Languages size={13}/>{lang === 'ar' ? 'EN' : 'AR'}
            </button>
            <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="h-9 w-9 flex items-center justify-center border border-line text-fg-soft hover:border-gold/50 hover:text-gold transition">
              {theme === 'dark' ? <Sun size={14}/> : <Moon size={14}/>}
            </button>
          </div>
        </header>

        <main className="flex-1 px-4 lg:px-6 py-7 max-w-[1500px] w-full mx-auto" key={loc.pathname}>
          <AnimatePresence mode="wait">
            <motion.div key={loc.pathname}
              initial={{opacity: 0, y: 8}} animate={{opacity: 1, y: 0}} exit={{opacity: 0}}
              transition={{duration: 0.18}}>
              {children}
            </motion.div>
          </AnimatePresence>
        </main>

        <footer className="border-t border-line py-4 text-center text-[10px] text-fg-mute/60 tracking-[0.15em] uppercase">
          Aura Suite © 2026 — {t('brand')}
        </footer>
      </div>
    </div>
  );
}
