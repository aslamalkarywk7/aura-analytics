import {useMemo, useState} from 'react';
import {Download, Plus, Search, Star} from 'lucide-react';
import {Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis} from 'recharts';
import {useStore} from '@/store';
import {Badge, Btn, Card, Empty, Input, Kpi, Modal, PageHead, ProgressRow, Select, tooltipStyle} from '@/components/ui';
import {csvDownload, dateFmt, money, num} from '@/lib/format';
import {products, topProducts, type Product} from '@/lib/mock';

export default function Products() {
  const {t, lang} = useStore();
  const [q, setQ] = useState('');
  const [fam, setFam] = useState('all');
  const [stockF, setStockF] = useState('all');
  const [sort, setSort] = useState('revenue');
  const [sel, setSel] = useState<Product | null>(null);

  const FAM_LABEL: Record<string, [string, string]> = {
    oud: ['عود', 'Oud'], amber: ['عنبر', 'Amber'], rose: ['ورد', 'Rose'],
    musk: ['مسك', 'Musk'], citrus: ['حمضيات', 'Citrus'], woody: ['خشبي', 'Woody'],
  };

  const soldMap = useMemo(() => new Map(topProducts(100, 'en').map(p => [p.name, p])), []);

  const rows = useMemo(() => {
    let list = products.filter(p => {
      if (fam !== 'all' && p.family !== fam) return false;
      if (stockF === 'out' && p.stock !== 0) return false;
      if (stockF === 'low' && !(p.stock > 0 && p.stock <= p.low_at)) return false;
      if (stockF === 'ok' && p.stock <= p.low_at) return false;
      if (q) {
        const s = q.trim().toLowerCase();
        if (!p.name_ar.includes(q.trim()) && !p.name_en.toLowerCase().includes(s) && !p.sku.toLowerCase().includes(s)) return false;
      }
      return true;
    });
    const rev = (p: Product) => soldMap.get(p.name_en)?.revenue ?? 0;
    list = [...list].sort((a, b) => {
      if (sort === 'revenue') return rev(b) - rev(a);
      if (sort === 'price') return b.price - a.price;
      if (sort === 'stock') return a.stock - b.stock;
      if (sort === 'rating') return b.rating - a.rating;
      return 0;
    });
    return list;
  }, [q, fam, stockF, sort, soldMap]);

  const totalValue = products.reduce((s, p) => s + p.stock * p.cost, 0);
  const avgMargin = Math.round(products.reduce((s, p) => s + (p.price - p.cost) / p.price, 0) / products.length * 1000) / 10;
  const chartData = useMemo(() => topProducts(8, lang), [lang]);

  const exportCsv = () => csvDownload('products.csv', [
    ['SKU', 'Name', 'Family', 'Size ml', 'Price SAR', 'Cost SAR', 'Stock', 'Rating', 'Active'],
    ...rows.map(p => [p.sku, p.name_en, p.family, p.size_ml, p.price, p.cost, p.stock, p.rating, p.active ? 'yes' : 'no']),
  ]);

  const stockBadge = (p: Product) => p.stock === 0
    ? <Badge tone="out">{t('outStock')}</Badge>
    : p.stock <= p.low_at
      ? <Badge tone="low">{t('lowStock')}</Badge>
      : <span className="text-fg-soft">{num(p.stock, lang)}</span>;

  return (
    <div className="fade-up">
      <PageHead title={t('nav.products')} sub={`${num(products.length, lang)} ${t('productCount')}`}
        actions={
          <>
            <Btn onClick={exportCsv}><Download size={13}/>{t('export')}</Btn>
            <Btn variant="gold"><Plus size={13}/>{t('addProduct')}</Btn>
          </>
        }/>

      <section className="grid grid-cols-2 xl:grid-cols-4 gap-3 mb-4">
        <Kpi icon={Star} label={t('active')} value={num(products.filter(p => p.active).length, lang)} sub={`${num(products.filter(p => !p.active).length, lang)} ${t('inactive')}`}/>
        <Kpi icon={Star} label={t('inventoryValue')} value={money(totalValue, lang)} sub={t('cost')}/>
        <Kpi icon={Star} label={t('margin')} value={`${avgMargin}%`} sub={t('marginUnit')}/>
        <Kpi icon={Star} label={t('outStock')} value={num(products.filter(p => p.stock === 0).length, lang)} sub={`${num(products.filter(p => p.stock > 0 && p.stock <= p.low_at).length, lang)} ${t('lowStock')}`}/>
      </section>

      <Card title={t('bestSelling')} className="mb-4">
        <div className="h-52" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{top: 5, right: 8, left: -8, bottom: 0}}>
              <CartesianGrid strokeDasharray="3 3" vertical={false}/>
              <XAxis dataKey="name" tickLine={false} axisLine={false} interval={0} angle={-16} textAnchor="end" height={54}/>
              <YAxis tickLine={false} axisLine={false} width={48} tickFormatter={v => `${Math.round(Number(v) / 1000)}k`}/>
              <Tooltip contentStyle={tooltipStyle} cursor={{fill: 'rgba(200,180,156,0.06)'}}
                formatter={(v: any) => [money(Number(v), lang), t('revenue')]}/>
              <Bar dataKey="revenue" fill="var(--gold-deep)" radius={[2, 2, 0, 0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="relative flex-1 min-w-52 max-w-sm">
          <Search size={14} className="absolute top-1/2 -translate-y-1/2 start-3 text-fg-mute"/>
          <Input value={q} onChange={e => setQ(e.target.value)} placeholder={t('search')} className="ps-9 h-9 text-xs"/>
        </div>
        <Select value={fam} onChange={e => setFam(e.target.value)}>
          <option value="all">{t('all')} — {t('family')}</option>
          {Object.entries(FAM_LABEL).map(([k, v]) => <option key={k} value={k}>{lang === 'ar' ? v[0] : v[1]}</option>)}
        </Select>
        <Select value={stockF} onChange={e => setStockF(e.target.value)}>
          <option value="all">{t('all')} — {t('stock')}</option>
          <option value="ok">{t('inStock')}</option>
          <option value="low">{t('lowStock')}</option>
          <option value="out">{t('outStock')}</option>
        </Select>
        <Select value={sort} onChange={e => setSort(e.target.value)}>
          <option value="revenue">{t('revenue')} ↓</option>
          <option value="price">{t('price')} ↓</option>
          <option value="stock">{t('stock')} ↑</option>
          <option value="rating">{t('rating')} ↓</option>
        </Select>
      </div>

      <Card pad={false}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs min-w-[820px]">
            <thead>
              <tr className="text-[9px] uppercase tracking-[0.12em] text-fg-mute border-b border-line">
                <th className="text-start font-medium px-4 py-3">{t('productName')}</th>
                <th className="text-start font-medium px-4 py-3">{t('sku')}</th>
                <th className="text-start font-medium px-4 py-3 hidden md:table-cell">{t('family')}</th>
                <th className="text-end font-medium px-4 py-3">{t('price')}</th>
                <th className="text-end font-medium px-4 py-3 hidden lg:table-cell">{t('marginUnit')}</th>
                <th className="text-start font-medium px-4 py-3">{t('stock')}</th>
                <th className="text-start font-medium px-4 py-3 hidden sm:table-cell">{t('rating')}</th>
                <th className="text-start font-medium px-4 py-3 hidden xl:table-cell">{t('revenue')}</th>
                <th className="px-4 py-3"/>
              </tr>
            </thead>
            <tbody>
              {rows.map(p => {
                const sold = soldMap.get(p.name_en);
                const marginPct = Math.round(((p.price - p.cost) / p.price) * 100);
                return (
                  <tr key={p.id} className="border-b border-line/40 hover:bg-gold/5 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <span className="w-7 h-7 bg-gold/12 text-gold flex items-center justify-center text-[10px] font-bold shrink-0">
                          {(lang === 'ar' ? p.name_ar : p.name_en).slice(0, 2)}
                        </span>
                        <div>
                          <p className="text-fg">{lang === 'ar' ? p.name_ar : p.name_en}</p>
                          <p className="text-[10px] text-fg-mute" dir="ltr">{p.size_ml}ml · {p.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-fg-mute hidden md:table-cell" dir="ltr">{p.sku}</td>
                    <td className="px-4 py-3 text-fg-mute hidden md:table-cell">{lang === 'ar' ? FAM_LABEL[p.family][0] : FAM_LABEL[p.family][1]}</td>
                    <td className="px-4 py-3 text-end text-fg" dir="ltr">{money(p.price, lang)}</td>
                    <td className="px-4 py-3 text-end hidden lg:table-cell">
                      <span className={marginPct >= 55 ? 'text-emerald-400' : 'text-amber-400'} dir="ltr">{marginPct}%</span>
                    </td>
                    <td className="px-4 py-3">{stockBadge(p)}</td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="flex items-center gap-1 text-fg-soft">
                        <Star size={11} className="text-gold fill-gold"/>{p.rating} <span className="text-fg-mute">({p.reviews})</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden xl:table-cell text-fg-soft" dir="ltr">{sold ? money(sold.revenue, lang) : '—'}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => setSel(p)} className="text-[10px] uppercase tracking-[0.1em] text-gold hover:underline">{t('view')}</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {rows.length === 0 && <Empty text={t('noData')}/>}
      </Card>

      {/* Product detail */}
      <Modal open={Boolean(sel)} onClose={() => setSel(null)} title={t('productDetails')}>
        {sel && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <span className="w-12 h-12 bg-gold/12 text-gold flex items-center justify-center text-sm font-bold">
                  {(lang === 'ar' ? sel.name_ar : sel.name_en).slice(0, 2)}
                </span>
                <div>
                  <p className="text-sm text-fg font-semibold">{lang === 'ar' ? sel.name_ar : sel.name_en}</p>
                  <p className="text-[10px] text-fg-mute" dir="ltr">{sel.sku} · {sel.size_ml}ml</p>
                </div>
              </div>
              {sel.active ? <Badge tone="on">{t('active')}</Badge> : <Badge tone="off">{t('inactive')}</Badge>}
            </div>

            <dl className="text-xs space-y-2.5 mb-6">
              {[
                [t('family'), lang === 'ar' ? FAM_LABEL[sel.family][0] : FAM_LABEL[sel.family][1]],
                [t('price'), money(sel.price, lang)],
                [t('cost'), money(sel.cost, lang)],
                [t('marginUnit'), `${Math.round(((sel.price - sel.cost) / sel.price) * 100)}%`],
                [t('rating'), `${sel.rating} ★ (${sel.reviews} ${t('reviews')})`],
                [t('launched'), dateFmt(sel.launched, lang, {day: 'numeric', month: 'long', year: 'numeric'})],
              ].map(([k2, v]) => (
                <div key={k2} className="flex justify-between border-b border-line/40 pb-2">
                  <dt className="text-fg-mute">{k2}</dt>
                  <dd className="text-fg-soft" dir="auto">{v}</dd>
                </div>
              ))}
            </dl>

            <h4 className="text-[10px] uppercase tracking-[0.15em] text-fg-mute mb-3">{t('stock')}</h4>
            <ProgressRow label={sel.name_en} value={sel.stock} max={250} right={`${sel.stock} / 250`}/>
            <p className="text-[10px] text-fg-mute mt-3">
              {sel.stock === 0 ? t('outStock') : sel.stock <= sel.low_at ? t('lowStock') : t('inStock')}
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}
