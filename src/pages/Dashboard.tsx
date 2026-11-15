import {useMemo, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import {
  Banknote, Bell, CircleDollarSign, Gauge, PackageCheck, ShoppingCart, Target, TrendingUp, Users, XCircle,
} from 'lucide-react';
import {useStore} from '@/store';
import {Badge, Btn, Card, CHART_COLORS, Kpi, ProgressRow, RangeSwitch, tooltipStyle} from '@/components/ui';
import {csvDownload, dateFmt, money, moneyMinor, num, relTime} from '@/lib/format';
import {activity, daily, familyRevenue, kpiBundle, orders, paymentSplit, stockHealth, topProducts} from '@/lib/mock';

const DAY_OPT = {day: 'numeric', month: 'short'} as const;

export default function Dashboard() {
  const {t, lang, refreshedAt} = useStore();
  const nav = useNavigate();
  const [range, setRange] = useState('30');

  const k = useMemo(() => kpiBundle(Number(range)), [range]);
  const series = useMemo(() => {
    const slice = daily.slice(-Number(range));
    return slice.map(d => ({
      ...d,
      label: dateFmt(d.date, lang, DAY_OPT),
      revenueSar: d.revenue,
    }));
  }, [range, lang]);

  const families = useMemo(() => familyRevenue(lang).slice(0, 6).map(f => ({...f, k: Math.round(f.revenue)})), [lang]);
  const top = useMemo(() => topProducts(6, lang), [lang]);
  const pay = useMemo(() => paymentSplit().map(p => ({
    name: p.method === 'cod' ? t('cod') : p.method === 'card' ? t('card') : t('applepay'),
    value: p.revenue,
  })), [t]);
  const stock = stockHealth();
  const recent = orders.slice(0, 7);
  const goalTarget = 250000;
  const goalPct = Math.min(100, Math.round((k.revenue / goalTarget) * 100));

  return (
    <div className="fade-up">
      {/* KPI row */}
      <section className="grid grid-cols-2 xl:grid-cols-4 gap-3 mb-4">
        <Kpi icon={CircleDollarSign} label={t('revenue')} value={money(k.revenue, lang)} delta={k.revDelta} sub={t('vsPrev')}/>
        <Kpi icon={ShoppingCart} label={t('orders')} value={num(k.orders, lang)} delta={k.ordDelta} sub={t('vsPrev')}/>
        <Kpi icon={Banknote} label={t('aov')} value={money(k.aov, lang)} delta={k.aovDelta} sub={t('vsPrev')}/>
        <Kpi icon={XCircle} label={t('cancelled')} value={`${k.cancelRate.toFixed(1)}%`} sub={`${k.orders} ${t('orders')}`}/>
      </section>

      {/* Revenue + goal + payments */}
      <section className="grid lg:grid-cols-3 gap-3 mb-3">
        <div className="lg:col-span-2 bg-ink-card border border-line p-5">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h2 className="text-[11px] uppercase tracking-[0.18em] text-fg-mute">{t('dailyRevenue')}</h2>
            <RangeSwitch value={range} onChange={setRange} options={[
              {key: '7', label: '7D'}, {key: '14', label: '14D'}, {key: '30', label: '30D'}, {key: '90', label: '90D'},
            ]}/>
          </div>
          <div className="h-64" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={series} margin={{top: 5, right: 8, left: -8, bottom: 0}}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#c8b49c" stopOpacity={0.45}/>
                    <stop offset="100%" stopColor="#c8b49c" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                <XAxis dataKey="label" tickLine={false} axisLine={false} minTickGap={28}/>
                <YAxis tickLine={false} axisLine={false} width={48} tickFormatter={v => `${Math.round(Number(v) / 1000)}k`}/>
                <Tooltip contentStyle={tooltipStyle} labelStyle={{color: 'var(--gold)'}}
                  formatter={(v: any) => [money(Number(v), lang), t('revenue')]}/>
                <Area type="monotone" dataKey="revenueSar" stroke="#c8b49c" strokeWidth={2} fill="url(#rev)"/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="bg-ink-card border border-line p-5 flex-1">
            <h2 className="text-[11px] uppercase tracking-[0.18em] text-fg-mute mb-4 flex items-center gap-2">
              <Target size={13} className="text-gold"/>{t('goalProgress')}
            </h2>
            <div className="flex items-end justify-between mb-3">
              <p className="text-2xl font-semibold text-fg" dir="ltr">{goalPct}%</p>
              <p className="text-xs text-fg-mute" dir="ltr">{money(k.revenue, lang)} / {money(goalTarget, lang)}</p>
            </div>
            <div className="h-2 bg-line mb-4">
              <div className="h-2 bg-gold transition-all duration-700" style={{width: `${goalPct}%`}}/>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="border border-line p-3">
                <p className="text-[10px] uppercase tracking-[0.12em] text-fg-mute">{t('profit')}</p>
                <p className="text-sm font-semibold text-emerald-400 mt-1" dir="ltr">{money(k.profit, lang)}</p>
              </div>
              <div className="border border-line p-3">
                <p className="text-[10px] uppercase tracking-[0.12em] text-fg-mute">{t('margin')}</p>
                <p className="text-sm font-semibold text-gold mt-1" dir="ltr">{k.margin}%</p>
              </div>
            </div>
            <p className="text-[10px] text-fg-mute mt-3">{t('goalHint')}</p>
          </div>

          <div className="bg-ink-card border border-line p-5">
            <h2 className="text-[11px] uppercase tracking-[0.18em] text-fg-mute mb-3">{t('paymentSplit')}</h2>
            <div className="h-36" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pay} dataKey="value" nameKey="name" innerRadius={34} outerRadius={55} paddingAngle={3} stroke="none">
                    {pay.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]}/>)}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => [money(Number(v), lang), '']}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-3 mt-1">
              {pay.map((p, i) => (
                <span key={p.name} className="flex items-center gap-1.5 text-[10px] text-fg-soft">
                  <span className="w-2 h-2" style={{background: CHART_COLORS[i % CHART_COLORS.length]}}/>{p.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Families + top products + activity */}
      <section className="grid lg:grid-cols-3 gap-3 mb-3">
        <div className="bg-ink-card border border-line p-5">
          <h2 className="text-[11px] uppercase tracking-[0.18em] text-fg-mute mb-4">{t('familyRevenue')}</h2>
          <div className="h-56" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={families} layout="vertical" margin={{top: 0, right: 10, left: 4, bottom: 0}}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false}/>
                <XAxis type="number" hide/>
                <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} width={lang === 'ar' ? 48 : 56}/>
                <Tooltip contentStyle={tooltipStyle} cursor={{fill: 'rgba(200,180,156,0.06)'}}
                  formatter={(v: any) => [money(Number(v), lang), t('revenue')]}/>
                <Bar dataKey="k" fill="#a68d6d" radius={[0, 2, 2, 0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-ink-card border border-line p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[11px] uppercase tracking-[0.18em] text-fg-mute">{t('topProducts')}</h2>
            <button onClick={() => nav('/products')} className="text-[10px] text-gold hover:underline">{t('view')}</button>
          </div>
          <ul className="space-y-3.5">
            {top.map((p, i) => (
              <li key={p.name}>
                <ProgressRow
                  label={<span className="line-clamp-1">{p.name}</span>}
                  value={p.revenue} max={top[0].revenue}
                  right={money(p.revenue, lang)}
                  tone={i === 0 ? '#c8b49c' : undefined}
                />
                <p className="text-[10px] text-fg-mute mt-1">{num(p.qty_sold, lang)} {t('bestSelling').toLowerCase() === 'best selling' ? 'sold' : 'مبيع'}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-ink-card border border-line p-5">
          <h2 className="text-[11px] uppercase tracking-[0.18em] text-fg-mute mb-4 flex items-center gap-2">
            <Bell size={13} className="text-gold"/>{t('activityFeed')}
          </h2>
          <ul className="space-y-3">
            {activity.map(a => (
              <li key={a.id} className="flex gap-3 text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-gold/70 mt-1.5 shrink-0 pulse-dot"/>
                <div className="min-w-0">
                  <p className="text-fg-soft leading-relaxed line-clamp-2">{lang === 'ar' ? a.text_ar : a.text_en}</p>
                  <p className="text-[10px] text-fg-mute mt-0.5">{relTime(a.at, lang)}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Recent orders + stock */}
      <section className="grid lg:grid-cols-3 gap-3">
        <div className="lg:col-span-2 bg-ink-card border border-line p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[11px] uppercase tracking-[0.18em] text-fg-mute">{t('recentOrders')}</h2>
            <button onClick={() => nav('/orders')} className="text-[10px] text-gold hover:underline">{t('view')}</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs min-w-[520px]">
              <thead>
                <tr className="text-[9px] uppercase tracking-[0.12em] text-fg-mute">
                  <th className="text-start font-medium pb-2">{t('orderId')}</th>
                  <th className="text-start font-medium pb-2">{t('customer')}</th>
                  <th className="text-start font-medium pb-2">{t('status')}</th>
                  <th className="text-start font-medium pb-2">{t('payment')}</th>
                  <th className="text-end font-medium pb-2">{t('amount')}</th>
                </tr>
              </thead>
              <tbody>
                {recent.map(o => (
                  <tr key={o.id} className="border-t border-line/50 hover:bg-gold/5 transition-colors">
                    <td className="py-2.5 text-gold font-semibold" dir="ltr">{o.id}</td>
                    <td className="py-2.5 text-fg-soft">{o.customer}</td>
                    <td className="py-2.5"><Badge tone={o.status}>{t(`st.${o.status}`)}</Badge></td>
                    <td className="py-2.5 text-fg-mute">{o.payment === 'cod' ? t('cod') : o.payment === 'card' ? t('card') : t('applepay')}</td>
                    <td className="py-2.5 text-end text-fg" dir="ltr">{money(o.total, lang)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-ink-card border border-line p-5">
          <h2 className="text-[11px] uppercase tracking-[0.18em] text-fg-mute mb-4 flex items-center gap-2">
            <PackageCheck size={13} className="text-gold"/>{t('stockHealth')}
          </h2>
          <div className="grid grid-cols-3 gap-2 text-center mb-5">
            {[
              {label: t('inStock'), value: stock.healthy, tone: 'text-emerald-400'},
              {label: t('lowStock'), value: stock.low_stock, tone: 'text-amber-400'},
              {label: t('outStock'), value: stock.out_of_stock, tone: 'text-red-400'},
            ].map(x => (
              <div key={x.label} className="border border-line py-4">
                <p className={`text-2xl font-semibold ${x.tone}`}>{x.value}</p>
                <p className="text-[10px] uppercase tracking-[0.12em] text-fg-mute mt-1">{x.label}</p>
              </div>
            ))}
          </div>
          <div className="space-y-3">
            <ProgressRow label={t('visitors')} value={k.visitors} max={k.visitors} right={num(k.visitors, lang)} tone="#7f9fbf"/>
            <ProgressRow label={t('convRate')} value={k.convRate} max={5} right={`${k.convRate}%`} tone="#8fae8b"/>
          </div>
          <p className="text-[10px] text-fg-mute mt-5">{t('updated')}: {refreshedAt.toLocaleString(lang === 'ar' ? 'ar-SA-u-nu-latn-ca-gregory' : 'en-US')}</p>
        </div>
      </section>
    </div>
  );
}
