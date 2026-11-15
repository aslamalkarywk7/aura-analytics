import {useMemo} from 'react';
import {Download, PackageMinus, PackageSearch, Warehouse as WhIcon} from 'lucide-react';
import {Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis} from 'recharts';
import {useStore} from '@/store';
import {Badge, Btn, Card, Kpi, PageHead, ProgressRow, tooltipStyle} from '@/components/ui';
import {csvDownload, money, num} from '@/lib/format';
import {products, stockHealth, topProducts, warehouses} from '@/lib/mock';

export default function Inventory() {
  const {t, lang} = useStore();

  const stock = stockHealth();
  const soldMap = useMemo(() => new Map(topProducts(100, 'en').map(p => [p.name, p])), []);
  const lowList = useMemo(() =>
    products.filter(p => p.stock <= p.low_at)
      .sort((a, b) => a.stock - b.stock)
      .map(p => ({
        ...p,
        name: lang === 'ar' ? p.name_ar : p.name_en,
        suggest: p.stock === 0 ? 60 : Math.max(30, p.low_at * 4 - p.stock),
        velocity: soldMap.get(p.name_en)?.qty_sold ?? 0,
      })), [lang, soldMap]);

  const totalValue = products.reduce((s, p) => s + p.stock * p.cost, 0);
  const retailValue = products.reduce((s, p) => s + p.stock * p.price, 0);
  const velocity = useMemo(() => products.map(p => ({
    name: (lang === 'ar' ? p.name_ar : p.name_en).split(' ')[0],
    sold: soldMap.get(p.name_en)?.qty_sold ?? 0,
    daysCover: soldMap.get(p.name_en) ? Math.round((p.stock / Math.max(1, soldMap.get(p.name_en)!.qty_sold)) * 30) : 999,
  })).sort((a, b) => b.sold - a.sold).slice(0, 10), [lang, soldMap]);

  const exportCsv = () => csvDownload('restock_list.csv', [
    ['Product', 'SKU', 'Stock', 'Suggested qty', 'Cost SAR'],
    ...lowList.map(p => [p.name_en, p.sku, p.stock, p.suggest, p.cost * p.suggest]),
  ]);

  return (
    <div className="fade-up">
      <PageHead title={t('nav.inventory')} sub={`${num(products.length, lang)} SKU · ${warehouses.length} ${t('warehouses')}`}
        actions={<Btn onClick={exportCsv}><Download size={13}/>{t('export')}</Btn>}/>

      <section className="grid grid-cols-2 xl:grid-cols-4 gap-3 mb-4">
        <Kpi icon={WhIcon} label={t('inventoryValue')} value={money(totalValue, lang)} sub={`${money(retailValue, lang)} ${t('price')}`}/>
        <Kpi icon={PackageSearch} label={t('inStock')} value={num(stock.healthy, lang)} sub={`${t('total')}: ${num(products.length, lang)}`}/>
        <Kpi icon={PackageMinus} label={t('lowStock')} value={num(stock.low_stock, lang)} sub={t('restockSoon')}/>
        <Kpi icon={PackageMinus} label={t('outStock')} value={num(stock.out_of_stock, lang)} sub={t('restockSuggest')}/>
      </section>

      {/* Warehouses */}
      <section className="grid md:grid-cols-3 gap-3 mb-4">
        {warehouses.map(w => (
          <Card key={w.name_en}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 bg-gold/12 text-gold flex items-center justify-center"><WhIcon size={15}/></span>
                <div>
                  <p className="text-sm text-fg">{lang === 'ar' ? w.name_ar : w.name_en}</p>
                  <p className="text-[10px] text-fg-mute">{lang === 'ar' ? w.city_ar : w.city_en}</p>
                </div>
              </div>
              {w.pending_po > 0 && <Badge tone="pending">{w.pending_po} PO</Badge>}
            </div>
            <p className="text-[10px] uppercase tracking-[0.12em] text-fg-mute mb-2">{t('utilization')}</p>
            <ProgressRow label={`${w.utilization}%`} value={w.utilization} max={100} right={`${w.skus} SKU`}/>
            <p className="text-[10px] text-fg-mute mt-3">{t('pendingPo')}: {w.pending_po}</p>
          </Card>
        ))}
      </section>

      {/* Velocity chart + restock list */}
      <section className="grid lg:grid-cols-2 gap-3 mb-4">
        <Card title={t('turnoverRate') + ' — ' + t('bestSelling')}>
          <div className="h-64" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={velocity} margin={{top: 5, right: 8, left: -14, bottom: 0}}>
                <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                <XAxis dataKey="name" tickLine={false} axisLine={false} angle={-20} textAnchor="end" height={48}/>
                <YAxis tickLine={false} axisLine={false} width={38}/>
                <Tooltip contentStyle={tooltipStyle} cursor={{fill: 'rgba(200,180,156,0.06)'}}
                  formatter={(v: any, k2: any) => [num(Number(v), lang), k2 === 'sold' ? t('orders') : t('daysCover')]}/>
                <Bar dataKey="sold" fill="var(--gold-deep)" radius={[2, 2, 0, 0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title={t('restockSoon')}>
          <div className="overflow-x-auto max-h-72">
            <table className="w-full text-xs min-w-[420px]">
              <thead>
                <tr className="text-[9px] uppercase tracking-[0.12em] text-fg-mute border-b border-line">
                  <th className="text-start font-medium pb-2">{t('productName')}</th>
                  <th className="text-start font-medium pb-2">{t('stock')}</th>
                  <th className="text-end font-medium pb-2">{t('restockSuggest')}</th>
                  <th className="text-end font-medium pb-2">{t('cost')}</th>
                </tr>
              </thead>
              <tbody>
                {lowList.map(p => (
                  <tr key={p.id} className="border-b border-line/40">
                    <td className="py-2.5 text-fg-soft">
                      {p.name}
                      <span className="block text-[9px] text-fg-mute" dir="ltr">{p.sku}</span>
                    </td>
                    <td className="py-2.5">
                      {p.stock === 0 ? <Badge tone="out">0</Badge> : <Badge tone="low">{p.stock}</Badge>}
                    </td>
                    <td className="py-2.5 text-end text-gold" dir="ltr">+{p.suggest}</td>
                    <td className="py-2.5 text-end text-fg-mute" dir="ltr">{money(p.cost * p.suggest, lang)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </section>

      {/* Days of cover */}
      <Card title={t('daysCover')}>
        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-3.5">
          {velocity.map(v => (
            <ProgressRow key={v.name} label={v.name} value={Math.min(v.daysCover, 120)} max={120}
              right={`${v.daysCover >= 999 ? '—' : v.daysCover + 'd'}`}
              tone={v.daysCover < 14 ? '#b87a7a' : undefined}/>
          ))}
        </ul>
      </Card>
    </div>
  );
}
