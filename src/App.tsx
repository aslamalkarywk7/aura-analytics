import {useCallback, useEffect, useState} from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Banknote,
  ChartPie,
  CircleDollarSign,
  Languages,
  LogOut,
  Package,
  RefreshCw,
  ShoppingCart,
  TriangleAlert,
  XCircle,
} from 'lucide-react';
import {api, ApiError, getToken, setToken} from '@/lib/api';

type Lang = 'ar' | 'en';

interface Analytics {
  kpis: {revenue: number; orders: number; aov: number; cancelled: number};
  daily: {date: string; revenue: number; orders: number; discount: number}[];
  status_breakdown: {status: string; count: number}[];
  family_revenue: {slug: string; name_ar: string; name_en: string; revenue: number; qty: number}[];
  top_products: {name_ar: string; name_en: string; qty_sold: number; revenue: number}[];
  payment_split: {method: string; count: number; revenue: number}[];
  coupons: {code: string; type: string; value: number; used_count: number; max_uses: number | null}[];
  stock_health: {out_of_stock: number; low_stock: number; healthy: number};
  generated_at: string;
}

const COPY = {
  ar: {
    brand: 'إسلام النشار',
    sub: 'لوحة التحليلات · AURA ANALYTICS',
    loginTitle: 'دخول لوحة التحليلات',
    loginSub: 'سجّل بحساب المدير لعرض بيانات المتجر الحيّة',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    signIn: 'دخول',
    signingIn: 'جارٍ الدخول…',
    demo: 'مدير: admin@aura.com / Admin@123',
    errInvalid: 'بيانات الدخول غير صحيحة أو الحساب ليس مديرًا',
    revenue: 'صافي الإيرادات',
    orders: 'الطلبات',
    aov: 'متوسط قيمة الطلب',
    cancelled: 'طلبات ملغاة/مستردة',
    dailyRevenue: 'الإيرادات آخر 14 يومًا',
    paymentSplit: 'توزيع طرق الدفع',
    familyRevenue: 'الإيرادات حسب العائلة العطرية',
    statusBreakdown: 'الطلبات حسب الحالة',
    topProducts: 'الأكثر مبيعًا',
    stockHealth: 'صحة المخزون',
    coupons: 'الكوبونات',
    healthy: 'متوفر',
    low: 'منخفض',
    out: 'نفد',
    sold: 'مبيع',
    usage: 'الاستخدام',
    refresh: 'تحديث',
    logout: 'خروج',
    updated: 'آخر تحديث',
    loading: 'جارٍ تحميل البيانات…',
    card: 'بطاقة',
    cod: 'عند الاستلام',
    noData: 'لا توجد بيانات بعد',
    status: {
      pending: 'بانتظار الدفع',
      paid: 'مدفوع',
      processing: 'قيد التجهيز',
      shipped: 'تم الشحن',
      delivered: 'تم التوصيل',
      cancelled: 'ملغي',
      refunded: 'مسترد',
    } as Record<string, string>,
  },
  en: {
    brand: 'Islam Al-Nashar',
    sub: 'Analytics dashboard · AURA ANALYTICS',
    loginTitle: 'Analytics sign in',
    loginSub: 'Sign in with an admin account to see live store data',
    email: 'Email',
    password: 'Password',
    signIn: 'Sign in',
    signingIn: 'Signing in…',
    demo: 'Admin: admin@aura.com / Admin@123',
    errInvalid: 'Invalid credentials or the account is not an admin',
    revenue: 'Net revenue',
    orders: 'Orders',
    aov: 'Avg. order value',
    cancelled: 'Cancelled / refunded',
    dailyRevenue: 'Revenue — last 14 days',
    paymentSplit: 'Payment method split',
    familyRevenue: 'Revenue by fragrance family',
    statusBreakdown: 'Orders by status',
    topProducts: 'Best sellers',
    stockHealth: 'Stock health',
    coupons: 'Coupons',
    healthy: 'Healthy',
    low: 'Low',
    out: 'Out',
    sold: 'sold',
    usage: 'Usage',
    refresh: 'Refresh',
    logout: 'Sign out',
    updated: 'Updated',
    loading: 'Loading data…',
    card: 'Card',
    cod: 'Cash',
    noData: 'No data yet',
    status: {
      pending: 'Pending',
      paid: 'Paid',
      processing: 'Processing',
      shipped: 'Shipped',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
      refunded: 'Refunded',
    } as Record<string, string>,
  },
};

const GOLD = '#c8b49c';
const GOLD_DEEP = '#a68d6d';
const PIE_COLORS = ['#c8b49c', '#8fae8b', '#7f9fbf', '#d1a36a', '#b87a7a', '#8a8a7e'];

function money(minor: number, lang: Lang): string {
  return new Intl.NumberFormat(lang === 'ar' ? 'ar-SA' : 'en-US', {
    style: 'currency',
    currency: 'SAR',
    maximumFractionDigits: 0,
  }).format(minor / 100);
}

export default function App() {
  const [lang, setLang] = useState<Lang>(() => ((localStorage.getItem('aura_lang') as Lang) ?? 'ar'));
  const t = COPY[lang];
  const [authenticated, setAuthenticated] = useState(Boolean(getToken()));
  const [email, setEmail] = useState('admin@aura.com');
  const [password, setPassword] = useState('Admin@123');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.title = lang === 'ar' ? 'لوحة التحليلات | Aura Analytics' : 'Aura Analytics';
    localStorage.setItem('aura_lang', lang);
  }, [lang]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await api<Analytics>('/admin/analytics');
      setData(r);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setToken(null);
        setAuthenticated(false);
      } else {
        setError(lang === 'ar' ? 'تعذر تحميل البيانات — تأكد من تشغيل متجر إسلام النشار على :3001' : 'Could not load data — make sure the store API runs on :3001');
      }
    } finally {
      setLoading(false);
    }
  }, [lang]);

  useEffect(() => {
    if (authenticated) load();
  }, [authenticated, load]);

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const r = await api<{token: string; user: {role: string}}>('/auth/login', {
        method: 'POST',
        body: {email: email.trim(), password},
      });
      if (r.user.role !== 'admin') throw new Error('not-admin');
      setToken(r.token);
      setAuthenticated(true);
    } catch {
      setError(t.errInvalid);
    } finally {
      setBusy(false);
    }
  };

  const logout = () => {
    setToken(null);
    setAuthenticated(false);
    setData(null);
  };

  /* ── Login screen ─────────────────────────────────────── */
  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <form onSubmit={signIn} className="w-full max-w-md bg-ink-card border border-line p-8 fade-up">
          <div className="text-center mb-8">
            <span className="inline-flex w-12 h-12 items-center justify-center border border-gold/40 text-gold mb-4">
              <ChartPie size={22} strokeWidth={1.5} />
            </span>
            <h1 className="text-xl font-semibold text-stone-100">{t.loginTitle}</h1>
            <p className="text-xs text-stone-500 mt-2 leading-relaxed">{t.loginSub}</p>
          </div>

          <label className="block text-[10px] uppercase tracking-[0.2em] text-stone-500 mb-2">{t.email}</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full h-11 bg-ink border border-line px-3 text-sm text-stone-200 mb-4 focus:outline-none focus:border-gold"
            dir="ltr"
            required
          />
          <label className="block text-[10px] uppercase tracking-[0.2em] text-stone-500 mb-2">{t.password}</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full h-11 bg-ink border border-line px-3 text-sm text-stone-200 mb-4 focus:outline-none focus:border-gold"
            dir="ltr"
            required
          />

          {error && <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-2 mb-4">{error}</p>}

          <button disabled={busy} className="w-full h-11 bg-gold text-ink font-semibold text-sm hover:bg-gold-deep transition disabled:opacity-60">
            {busy ? t.signingIn : t.signIn}
          </button>

          <p className="text-[10px] text-stone-600 text-center mt-5" dir="ltr">{t.demo}</p>
        </form>
      </div>
    );
  }

  /* ── Dashboard ────────────────────────────────────────── */
  const kpis = data?.kpis;
  const hasData = Boolean(data && data.daily.length > 0);
  const dailyChart = (data?.daily ?? []).map(d => ({
    ...d,
    label: new Date(d.date).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US', {day: 'numeric', month: 'short'}),
    revenueSar: Math.round(d.revenue / 100),
  }));
  const familyChart = (data?.family_revenue ?? [])
    .filter(f => f.revenue > 0)
    .map(f => ({name: lang === 'ar' ? f.name_ar : f.name_en, revenueSar: Math.round(f.revenue / 100)}));
  const paymentChart = (data?.payment_split ?? []).map(p => ({
    name: p.method === 'cod' ? t.cod : t.card,
    value: p.revenue / 100,
  }));

  return (
    <div className="min-h-screen pb-16">
      {/* Header */}
      <header className="border-b border-line bg-ink/95 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-5 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 border border-gold/40 text-gold flex items-center justify-center">
              <ChartPie size={17} strokeWidth={1.5} />
            </span>
            <div>
              <p className="text-sm font-semibold text-stone-100 leading-none">{t.brand}</p>
              <p className="text-[9px] uppercase tracking-[0.2em] text-stone-500 mt-1">{t.sub}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')} className="h-9 px-3 flex items-center gap-1.5 text-[11px] uppercase tracking-[0.1em] text-stone-400 border border-line hover:border-gold/50 hover:text-gold transition">
              <Languages size={13} /> {lang === 'ar' ? 'EN' : 'AR'}
            </button>
            <button onClick={load} disabled={loading} className="h-9 px-3 flex items-center gap-1.5 text-[11px] uppercase tracking-[0.1em] text-stone-400 border border-line hover:border-gold/50 hover:text-gold transition disabled:opacity-50">
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> {t.refresh}
            </button>
            <button onClick={logout} className="h-9 px-3 flex items-center gap-1.5 text-[11px] uppercase tracking-[0.1em] text-stone-400 border border-line hover:border-red-500/40 hover:text-red-400 transition">
              <LogOut size={13} /> {t.logout}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-5 pt-8 fade-up">
        {error && (
          <div className="mb-6 flex items-center gap-3 border border-red-500/25 bg-red-500/5 px-4 py-3 text-sm text-red-300">
            <TriangleAlert size={16} /> {error}
          </div>
        )}

        {!data ? (
          <p className="text-stone-500 text-sm py-24 text-center">{t.loading}</p>
        ) : (
          <>
            {/* KPIs */}
            <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
              {[
                {icon: CircleDollarSign, label: t.revenue, value: money(kpis!.revenue, lang)},
                {icon: ShoppingCart, label: t.orders, value: kpis!.orders.toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-US')},
                {icon: Banknote, label: t.aov, value: money(Math.round(kpis!.aov), lang)},
                {icon: XCircle, label: t.cancelled, value: kpis!.cancelled.toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-US')},
              ].map(({icon: Icon, label, value}) => (
                <div key={label} className="bg-ink-card border border-line p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] uppercase tracking-[0.15em] text-stone-500">{label}</span>
                    <Icon size={15} strokeWidth={1.5} className="text-gold" />
                  </div>
                  <p className="text-xl font-semibold text-stone-100" dir="ltr">{value}</p>
                </div>
              ))}
            </section>

            {/* Revenue + payments */}
            <section className="grid lg:grid-cols-3 gap-3 mb-3">
              <div className="lg:col-span-2 bg-ink-card border border-line p-5">
                <h2 className="text-[11px] uppercase tracking-[0.18em] text-stone-500 mb-4">{t.dailyRevenue}</h2>
                <div className="h-64" dir="ltr">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dailyChart} margin={{top: 5, right: 8, left: -12, bottom: 0}}>
                      <defs>
                        <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={GOLD} stopOpacity={0.45} />
                          <stop offset="100%" stopColor={GOLD} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="label" tickLine={false} axisLine={false} />
                      <YAxis tickLine={false} axisLine={false} width={45} />
                      <Tooltip
                        contentStyle={{background: '#1b1b17', border: '1px solid #33332c', borderRadius: 0, fontSize: 12}}
                        labelStyle={{color: '#c8b49c'}}
                        formatter={(v) => [`${Math.round(Number(v ?? 0))} SAR`, t.revenue]}
                      />
                      <Area type="monotone" dataKey="revenueSar" stroke={GOLD} strokeWidth={2} fill="url(#rev)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-ink-card border border-line p-5">
                <h2 className="text-[11px] uppercase tracking-[0.18em] text-stone-500 mb-4">{t.paymentSplit}</h2>
                <div className="h-64" dir="ltr">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={paymentChart} dataKey="value" nameKey="name" innerRadius={52} outerRadius={78} paddingAngle={3} stroke="none">
                        {paymentChart.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                      </Pie>
                      <Tooltip
                        contentStyle={{background: '#1b1b17', border: '1px solid #33332c', borderRadius: 0, fontSize: 12}}
                        formatter={(v) => [`${Math.round(Number(v ?? 0))} SAR`, '']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-4">
                  {paymentChart.map((p, i) => (
                    <span key={p.name} className="flex items-center gap-1.5 text-[11px] text-stone-400">
                      <span className="w-2 h-2" style={{background: PIE_COLORS[i % PIE_COLORS.length]}} /> {p.name}
                    </span>
                  ))}
                </div>
              </div>
            </section>

            {/* Families + top products */}
            <section className="grid lg:grid-cols-3 gap-3 mb-3">
              <div className="lg:col-span-2 bg-ink-card border border-line p-5">
                <h2 className="text-[11px] uppercase tracking-[0.18em] text-stone-500 mb-4">{t.familyRevenue}</h2>
                <div className="h-64" dir="ltr">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={familyChart} margin={{top: 5, right: 8, left: -12, bottom: 0}}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" tickLine={false} axisLine={false} interval={0} angle={-18} textAnchor="end" height={52} />
                      <YAxis tickLine={false} axisLine={false} width={45} />
                      <Tooltip
                        contentStyle={{background: '#1b1b17', border: '1px solid #33332c', borderRadius: 0, fontSize: 12}}
                        cursor={{fill: 'rgba(200,180,156,0.05)'}}
                        formatter={(v) => [`${Math.round(Number(v ?? 0))} SAR`, t.revenue]}
                      />
                      <Bar dataKey="revenueSar" fill={GOLD_DEEP} radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-ink-card border border-line p-5">
                <h2 className="text-[11px] uppercase tracking-[0.18em] text-stone-500 mb-4">{t.topProducts}</h2>
                <ul className="space-y-3">
                  {data.top_products.map((p, i) => {
                    const maxRev = data.top_products[0]?.revenue || 1;
                    return (
                      <li key={p.name_en}>
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span className="text-stone-300 line-clamp-1">{lang === 'ar' ? p.name_ar : p.name_en}</span>
                          <span className="text-stone-500 shrink-0 ms-2" dir="ltr">{money(p.revenue, lang)}</span>
                        </div>
                        <div className="h-1 bg-line">
                          <div className="h-1" style={{width: `${(p.revenue / maxRev) * 100}%`, background: i === 0 ? GOLD : '#6b6b5e'}} />
                        </div>
                        <p className="text-[10px] text-stone-600 mt-1">{p.qty_sold} {t.sold}</p>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </section>

            {/* Status + stock + coupons */}
            <section className="grid lg:grid-cols-3 gap-3">
              <div className="bg-ink-card border border-line p-5">
                <h2 className="text-[11px] uppercase tracking-[0.18em] text-stone-500 mb-4">{t.statusBreakdown}</h2>
                <ul className="space-y-2.5">
                  {data.status_breakdown.map(s => {
                    const total = data.status_breakdown.reduce((sum, x) => sum + x.count, 0) || 1;
                    return (
                      <li key={s.status} className="flex items-center gap-3 text-xs">
                        <span className="w-24 text-stone-400 shrink-0">{t.status[s.status] ?? s.status}</span>
                        <div className="flex-1 h-1.5 bg-line">
                          <div className="h-1.5 bg-gold/70" style={{width: `${(s.count / total) * 100}%`}} />
                        </div>
                        <span className="text-stone-500 w-7 text-end shrink-0">{s.count}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div className="bg-ink-card border border-line p-5">
                <h2 className="text-[11px] uppercase tracking-[0.18em] text-stone-500 mb-4">{t.stockHealth}</h2>
                <div className="grid grid-cols-3 gap-2 text-center">
                  {[
                    {label: t.healthy, value: data.stock_health.healthy, tone: 'text-emerald-400'},
                    {label: t.low, value: data.stock_health.low_stock, tone: 'text-amber-400'},
                    {label: t.out, value: data.stock_health.out_of_stock, tone: 'text-red-400'},
                  ].map(x => (
                    <div key={x.label} className="border border-line py-4">
                      <p className={`text-2xl font-semibold ${x.tone}`}>{x.value ?? 0}</p>
                      <p className="text-[10px] uppercase tracking-[0.12em] text-stone-500 mt-1">{x.label}</p>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-stone-600 mt-4">
                  {t.updated}: {new Date(data.generated_at).toLocaleString(lang === 'ar' ? 'ar-SA' : 'en-US')}
                </p>
              </div>

              <div className="bg-ink-card border border-line p-5">
                <h2 className="text-[11px] uppercase tracking-[0.18em] text-stone-500 mb-4">{t.coupons}</h2>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-[9px] uppercase tracking-[0.12em] text-stone-600">
                      <th className="text-start font-medium pb-2">Code</th>
                      <th className="text-start font-medium pb-2">{t.usage}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.coupons.map(c => (
                      <tr key={c.code} className="border-t border-line/60">
                        <td className="py-2 text-gold font-semibold" dir="ltr">{c.code}</td>
                        <td className="py-2 text-stone-400">{c.used_count}{c.max_uses ? ` / ${c.max_uses}` : ''}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {data.coupons.length === 0 && <p className="text-stone-600 text-xs">{t.noData}</p>}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
