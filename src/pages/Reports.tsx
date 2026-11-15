import {useMemo} from 'react';
import {Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis} from 'recharts';
import {Download, FileBarChart, FileSpreadsheet, Landmark, Percent, Truck} from 'lucide-react';
import {useStore} from '@/store';
import {Btn, Card, Kpi, PageHead, ProgressRow, tooltipStyle} from '@/components/ui';
import {csvDownload, money, num} from '@/lib/format';
import {daily, kpiBundle, orders, products} from '@/lib/mock';

export default function Reports() {
  const {t, lang} = useStore();
  const k = kpiBundle(30);

  const monthly = useMemo(() => {
    const byMonth = new Map<string, {revenue: number; orders: number; discount: number}>();
    for (const d of daily) {
      const key = d.date.slice(0, 7);
      const s = byMonth.get(key) ?? {revenue: 0, orders: 0, discount: 0};
      s.revenue += d.revenue; s.orders += d.orders; s.discount += d.discount;
      byMonth.set(key, s);
    }
    return [...byMonth.entries()].map(([month, s]) => ({
      month,
      label: new Date(`${month}-01`).toLocaleDateString(lang === 'ar' ? 'ar-SA-u-nu-latn-ca-gregory' : 'en-US', {month: 'short'}),
      ...s,
    }));
  }, [lang]);

  const delivered = orders.filter(o => o.status === 'delivered');
  const shipDays = delivered.filter(o => o.shipped_at)
    .map(o => (+new Date(o.shipped_at!) - +new Date(o.placed)) / 864e5);
  const avgShip = (shipDays.reduce((s, d) => s + d, 0) / Math.max(1, shipDays.length)).toFixed(1);
  const deliveredRate = Math.round((delivered.length / orders.length) * 1000) / 10;
  const refundRate = Math.round((orders.filter(o => o.status === 'refunded').length / orders.length) * 1000) / 10;
  const taxRate = 15;
  const vatEstimate = Math.round(k.revenue / (1 + taxRate / 100) * (taxRate / 100));

  const REPORTS = [
    {icon: FileSpreadsheet, key: 'orders', desc: '342', file: 'orders.csv', rows: () => csvDownload('orders.csv', [
      ['ID', 'Customer', 'Status', 'Payment', 'Total SAR', 'Placed'],
      ...orders.map(o => [o.id, o.customer, o.status, o.payment, o.total, o.placed]),
    ])},
    {icon: FileSpreadsheet, key: 'products', desc: '24', file: 'products.csv', rows: () => csvDownload('products.csv', [
      ['SKU', 'Name', 'Price', 'Cost', 'Stock'],
      ...products.map(p => [p.sku, p.name_en, p.price, p.cost, p.stock]),
    ])},
    {icon: FileSpreadsheet, key: 'monthlySummary', desc: `${monthly.length}M`, file: 'monthly_summary.csv', rows: () => csvDownload('monthly_summary.csv', [
      ['Month', 'Revenue SAR', 'Orders', 'Discount SAR'],
      ...monthly.map(m => [m.month, m.revenue, m.orders, m.discount]),
    ])},
    {icon: FileSpreadsheet, key: 'financial', desc: `VAT ${vatEstimate.toLocaleString('en')}`, file: 'financial.csv', rows: () => csvDownload('financial.csv', [
      ['Indicator', 'Value SAR'],
      ['Revenue', k.revenue], ['Est. profit', k.profit], ['VAT estimate (15%)', vatEstimate], ['Marketing spend', 92500],
    ])},
  ];

  return (
    <div className="fade-up">
      <PageHead title={t('nav.reports')} sub={t('exportHint')}/>

      <section className="grid grid-cols-2 xl:grid-cols-4 gap-3 mb-4">
        <Kpi icon={Truck} label={t('avgShipDays')} value={`${avgShip}d`} sub={t('fulfillment')}/>
        <Kpi icon={Truck} label={t('deliveredRate')} value={`${deliveredRate}%`} sub={`${num(delivered.length, lang)} ${t('orders')}`}/>
        <Kpi icon={Percent} label={t('refundRate')} value={`${refundRate}%`} sub={t('cancelled')}/>
        <Kpi icon={Landmark} label={`VAT (15%)`} value={money(vatEstimate, lang)} sub={t('monthlySummary')}/>
      </section>

      <Card title={t('monthlySummary')} className="mb-4">
        <div className="h-60" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthly} margin={{top: 5, right: 8, left: -4, bottom: 0}}>
              <defs>
                <linearGradient id="mrev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#c8b49c" stopOpacity={0.45}/>
                  <stop offset="100%" stopColor="#c8b49c" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false}/>
              <XAxis dataKey="label" tickLine={false} axisLine={false}/>
              <YAxis tickLine={false} axisLine={false} width={52} tickFormatter={v => `${Math.round(Number(v) / 1000)}k`}/>
              <Tooltip contentStyle={tooltipStyle} labelStyle={{color: 'var(--gold)'}}
                formatter={(v: any, key: any) => [money(Number(v), lang), key === 'revenue' ? t('revenue') : t('orders')]}/>
              <Area type="monotone" dataKey="revenue" stroke="#c8b49c" strokeWidth={2} fill="url(#mrev)"/>
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-xs min-w-[480px]">
            <thead>
              <tr className="text-[9px] uppercase tracking-[0.12em] text-fg-mute border-b border-line">
                <th className="text-start font-medium pb-2">Month</th>
                <th className="text-end font-medium pb-2">{t('revenue')}</th>
                <th className="text-end font-medium pb-2">{t('orders')}</th>
                <th className="text-end font-medium pb-2">{t('aov')}</th>
              </tr>
            </thead>
            <tbody>
              {monthly.map(m => (
                <tr key={m.month} className="border-b border-line/40">
                  <td className="py-2.5 text-gold font-semibold" dir="ltr">{m.month}</td>
                  <td className="py-2.5 text-end text-fg" dir="ltr">{money(m.revenue, lang)}</td>
                  <td className="py-2.5 text-end text-fg-mute" dir="ltr">{num(m.orders, lang)}</td>
                  <td className="py-2.5 text-end text-fg-mute" dir="ltr">{money(Math.round(m.revenue / m.orders), lang)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card title={t('exportData')}>
        <div className="grid sm:grid-cols-2 gap-3">
          {REPORTS.map(r => (
            <button key={r.key} onClick={r.rows}
              className="flex items-center gap-4 border border-line p-4 text-start hover:border-gold/50 hover:bg-gold/5 transition group">
              <span className="w-10 h-10 bg-gold/12 text-gold flex items-center justify-center shrink-0 group-hover:bg-gold/20 transition">
                <r.icon size={17}/>
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-fg font-semibold">{t(r.key)}</p>
                <p className="text-[10px] text-fg-mute mt-0.5 truncate">{r.desc} · {r.file}</p>
              </div>
              <Download size={14} className="text-fg-mute group-hover:text-gold transition shrink-0"/>
            </button>
          ))}
        </div>
      </Card>

      <div className="mt-4 flex items-center gap-2 text-[10px] text-fg-mute">
        <FileBarChart size={13} className="text-gold"/>
        Aura Suite — {t('financial')}: {money(k.revenue, lang)} → {money(k.profit, lang)} ({k.margin}%)
      </div>
    </div>
  );
}
