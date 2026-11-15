import {useMemo, useState} from 'react';
import {Crown, Download, Repeat, Search, Users as UsersIcon} from 'lucide-react';
import {Cell, Pie, PieChart, ResponsiveContainer, Tooltip} from 'recharts';
import {useStore} from '@/store';
import {Badge, Btn, Card, CHART_COLORS, Empty, Input, Kpi, PageHead, ProgressRow, Select, tooltipStyle} from '@/components/ui';
import {csvDownload, dateFmt, money, num} from '@/lib/format';
import {cityStats, customers, type Customer} from '@/lib/mock';

const SEG_TONE: Record<Customer['segment'], string> = {vip: 'vip', loyal: 'loyal', regular: 'regular', new: 'new'};

export default function Customers() {
  const {t, lang} = useStore();
  const [q, setQ] = useState('');
  const [seg, setSeg] = useState('all');

  const rows = useMemo(() => customers.filter(c => {
    if (seg !== 'all' && c.segment !== seg) return false;
    if (q) {
      const s = q.trim().toLowerCase();
      if (!c.name.includes(q.trim()) && !c.email.toLowerCase().includes(s) && !c.phone.includes(s)) return false;
    }
    return true;
  }).sort((a, b) => b.spend - a.spend), [q, seg]);

  const segs = useMemo(() => {
    const m = new Map<string, number>();
    for (const c of customers) m.set(c.segment, (m.get(c.segment) ?? 0) + 1);
    return ['vip', 'loyal', 'regular', 'new'].map(s => ({key: s, count: m.get(s) ?? 0}));
  }, []);

  const cities = useMemo(() => cityStats(lang).slice(0, 8), [lang]);
  const repeat = Math.round(customers.filter(c => c.orders > 1).length / customers.length * 100);
  const totalSpend = customers.reduce((s, c) => s + c.spend, 0);
  const avgLtv = Math.round(totalSpend / customers.length);

  const exportCsv = () => csvDownload('customers.csv', [
    ['Name', 'Email', 'Phone', 'City', 'Segment', 'Orders', 'Spend SAR', 'Last order'],
    ...rows.map(c => [c.name, c.email, c.phone, c.city_en, c.segment, c.orders, c.spend, c.last_order]),
  ]);

  return (
    <div className="fade-up">
      <PageHead title={t('nav.customers')} sub={`${num(customers.length, lang)} ${t('customerName')}`}
        actions={<Btn onClick={exportCsv}><Download size={13}/>{t('export')}</Btn>}/>

      <section className="grid grid-cols-2 xl:grid-cols-4 gap-3 mb-4">
        <Kpi icon={UsersIcon} label={t('nav.customers')} value={num(customers.length, lang)} sub={t('total')}/>
        <Kpi icon={Crown} label={t('vip')} value={num(segs[0].count, lang)} sub={`${money(segs[0].count * 14200, lang)} LTV`}/>
        <Kpi icon={Repeat} label={t('repeatRate')} value={`${repeat}%`} sub={t('orders')}/>
        <Kpi icon={UsersIcon} label={t('ltv')} value={money(avgLtv, lang)} sub={t('avg') ?? 'Ø'}/>
      </section>

      <section className="grid lg:grid-cols-3 gap-3 mb-4">
        <Card title={t('segments')}>
          <div className="h-44" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={segs.map(s => ({name: t(s.key === 'new' ? 'newSeg' : s.key), value: s.count}))}
                  dataKey="value" nameKey="name" innerRadius={38} outerRadius={62} paddingAngle={3} stroke="none">
                  {segs.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]}/>)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {segs.map((s, i) => (
              <span key={s.key} className="flex items-center gap-1.5 text-[11px] text-fg-soft">
                <span className="w-2 h-2" style={{background: CHART_COLORS[i % CHART_COLORS.length]}}/>
                {t(s.key === 'new' ? 'newSeg' : s.key)} — {s.count}
              </span>
            ))}
          </div>
        </Card>

        <Card title={t('cityDist')} className="lg:col-span-2">
          <ul className="space-y-3.5">
            {cities.map(c => (
              <ProgressRow key={c.city} label={c.city} value={c.revenue} max={cities[0].revenue}
                right={`${money(c.revenue, lang)} · ${num(c.orders, lang)} ${t('orders')}`}/>
            ))}
          </ul>
        </Card>
      </section>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="relative flex-1 min-w-52 max-w-sm">
          <Search size={14} className="absolute top-1/2 -translate-y-1/2 start-3 text-fg-mute"/>
          <Input value={q} onChange={e => setQ(e.target.value)} placeholder={t('search')} className="ps-9 h-9 text-xs"/>
        </div>
        <Select value={seg} onChange={e => setSeg(e.target.value)}>
          <option value="all">{t('all')} — {t('segment')}</option>
          <option value="vip">{t('vip')}</option>
          <option value="loyal">{t('loyal')}</option>
          <option value="regular">{t('regular')}</option>
          <option value="new">{t('newSeg')}</option>
        </Select>
      </div>

      <Card pad={false}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs min-w-[760px]">
            <thead>
              <tr className="text-[9px] uppercase tracking-[0.12em] text-fg-mute border-b border-line">
                <th className="text-start font-medium px-4 py-3">{t('customerName')}</th>
                <th className="text-start font-medium px-4 py-3">{t('city')}</th>
                <th className="text-start font-medium px-4 py-3">{t('segment')}</th>
                <th className="text-end font-medium px-4 py-3">{t('ordersCount')}</th>
                <th className="text-end font-medium px-4 py-3">{t('spend')}</th>
                <th className="text-start font-medium px-4 py-3 hidden md:table-cell">{t('lastOrder')}</th>
                <th className="text-start font-medium px-4 py-3 hidden lg:table-cell" dir="ltr">{t('joined')}</th>
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, 20).map(c => (
                <tr key={c.id} className="border-b border-line/40 hover:bg-gold/5 transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-fg">{c.name}</p>
                    <p className="text-[10px] text-fg-mute" dir="ltr">{c.email}</p>
                  </td>
                  <td className="px-4 py-3 text-fg-mute">{lang === 'ar' ? c.city_ar : c.city_en}</td>
                  <td className="px-4 py-3"><Badge tone={SEG_TONE[c.segment]}>{t(c.segment === 'new' ? 'newSeg' : c.segment)}</Badge></td>
                  <td className="px-4 py-3 text-end text-fg-soft" dir="ltr">{num(c.orders, lang)}</td>
                  <td className="px-4 py-3 text-end text-fg" dir="ltr">{money(c.spend, lang)}</td>
                  <td className="px-4 py-3 text-fg-mute hidden md:table-cell">{dateFmt(c.last_order, lang)}</td>
                  <td className="px-4 py-3 text-fg-mute hidden lg:table-cell" dir="ltr">{dateFmt(c.first_order, lang, {month: 'short', year: 'numeric'})}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {rows.length > 20 && (
          <p className="text-center text-[10px] text-fg-mute py-3 border-t border-line">
            {num(rows.length - 20, lang)}+ {t('results')}
          </p>
        )}
        {rows.length === 0 && <Empty text={t('noData')}/>}
      </Card>
    </div>
  );
}
