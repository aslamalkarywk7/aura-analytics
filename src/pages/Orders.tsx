import {useMemo, useState} from 'react';
import {CheckCircle2, ChevronLeft, ChevronRight, Clock, Download, Package, PackageCheck, Search, Truck, XCircle} from 'lucide-react';
import {useStore} from '@/store';
import {Badge, Btn, Card, Empty, Input, Modal, PageHead, Select} from '@/components/ui';
import {csvDownload, dateTimeFmt, money, num} from '@/lib/format';
import {orders as allOrders, type Order} from '@/lib/mock';

const STATUSES = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
const PER_PAGE = 12;

export default function Orders() {
  const {t, lang} = useStore();
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('all');
  const [pay, setPay] = useState('all');
  const [page, setPage] = useState(0);
  const [sel, setSel] = useState<Order | null>(null);

  const filtered = useMemo(() => {
    return allOrders.filter(o => {
      if (status !== 'all' && o.status !== status) return false;
      if (pay !== 'all' && o.payment !== pay) return false;
      if (q) {
        const s = q.trim().toLowerCase();
        if (!o.id.toLowerCase().includes(s) && !o.customer.includes(q.trim()) && !o.customer_id.includes(s)) return false;
      }
      return true;
    });
  }, [q, status, pay]);

  const pages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const cur = Math.min(page, pages - 1);
  const rows = filtered.slice(cur * PER_PAGE, cur * PER_PAGE + PER_PAGE);
  const totalRev = filtered.reduce((s, o) => s + o.total, 0);

  const exportCsv = () => csvDownload('orders.csv', [
    ['ID', 'Customer', 'City', 'Status', 'Payment', 'Total SAR', 'Placed'],
    ...filtered.map(o => [o.id, o.customer, o.city_en, o.status, o.payment, o.total, o.placed]),
  ]);

  const payName = (m: string) => m === 'cod' ? t('cod') : m === 'card' ? t('card') : t('applepay');

  const timeline = sel && [
    {icon: Clock, label: t('placedAt'), at: sel.placed, done: true},
    {icon: CheckCircle2, label: t('st.paid'), at: sel.status !== 'pending' ? sel.placed : undefined, done: !['pending'].includes(sel.status)},
    {icon: Package, label: t('st.processing'), at: undefined, done: ['processing', 'shipped', 'delivered'].includes(sel.status)},
    {icon: Truck, label: t('st.shipped'), at: sel.shipped_at, done: ['shipped', 'delivered'].includes(sel.status)},
    {icon: PackageCheck, label: t('st.delivered'), at: sel.delivered_at, done: sel.status === 'delivered'},
  ];

  return (
    <div className="fade-up">
      <PageHead
        title={t('nav.orders')}
        sub={`${num(filtered.length, lang)} ${t('results')} · ${money(totalRev, lang)}`}
        actions={<Btn onClick={exportCsv}><Download size={13}/>{t('export')}</Btn>}
      />

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2 mb-5">
        <div className="relative flex-1 min-w-52 max-w-sm">
          <Search size={14} className="absolute top-1/2 -translate-y-1/2 start-3 text-fg-mute"/>
          <Input value={q} onChange={e => {setQ(e.target.value); setPage(0);}} placeholder={t('search')} className="ps-9 h-9 text-xs"/>
        </div>
        <Select value={status} onChange={e => {setStatus(e.target.value); setPage(0);}}>
          <option value="all">{t('all')} — {t('status')}</option>
          {STATUSES.map(s => <option key={s} value={s}>{t(`st.${s}`)}</option>)}
        </Select>
        <Select value={pay} onChange={e => {setPay(e.target.value); setPage(0);}}>
          <option value="all">{t('all')} — {t('payment')}</option>
          <option value="card">{t('card')}</option>
          <option value="cod">{t('cod')}</option>
          <option value="applepay">{t('applepay')}</option>
        </Select>
      </div>

      {/* Table */}
      <Card pad={false}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs min-w-[760px]">
            <thead>
              <tr className="text-[9px] uppercase tracking-[0.12em] text-fg-mute border-b border-line">
                <th className="text-start font-medium px-4 py-3">{t('orderId')}</th>
                <th className="text-start font-medium px-4 py-3">{t('customer')}</th>
                <th className="text-start font-medium px-4 py-3 hidden md:table-cell">{t('city')}</th>
                <th className="text-start font-medium px-4 py-3">{t('status')}</th>
                <th className="text-start font-medium px-4 py-3 hidden sm:table-cell">{t('payment')}</th>
                <th className="text-start font-medium px-4 py-3">{t('placedAt')}</th>
                <th className="text-end font-medium px-4 py-3">{t('amount')}</th>
                <th className="px-4 py-3"/>
              </tr>
            </thead>
            <tbody>
              {rows.map(o => (
                <tr key={o.id} className="border-b border-line/40 hover:bg-gold/5 transition-colors">
                  <td className="px-4 py-3 text-gold font-semibold" dir="ltr">{o.id}</td>
                  <td className="px-4 py-3 text-fg-soft">{o.customer}</td>
                  <td className="px-4 py-3 text-fg-mute hidden md:table-cell">{lang === 'ar' ? o.city_ar : o.city_en}</td>
                  <td className="px-4 py-3"><Badge tone={o.status}>{t(`st.${o.status}`)}</Badge></td>
                  <td className="px-4 py-3 text-fg-mute hidden sm:table-cell">{payName(o.payment)}</td>
                  <td className="px-4 py-3 text-fg-mute">{dateTimeFmt(o.placed, lang)}</td>
                  <td className="px-4 py-3 text-end text-fg" dir="ltr">{money(o.total, lang)}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => setSel(o)} className="text-[10px] uppercase tracking-[0.1em] text-gold hover:underline">{t('view')}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {rows.length === 0 && <Empty text={t('noData')}/>}

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-line">
          <p className="text-[10px] text-fg-mute">{cur + 1} / {pages}</p>
          <div className="flex items-center gap-1.5">
            <button onClick={() => setPage(Math.max(0, cur - 1))} disabled={cur === 0}
              className="h-7 w-7 flex items-center justify-center border border-line text-fg-soft hover:border-gold/50 hover:text-gold disabled:opacity-40 transition">
              <ChevronLeft size={13}/>
            </button>
            <button onClick={() => setPage(Math.min(pages - 1, cur + 1))} disabled={cur >= pages - 1}
              className="h-7 w-7 flex items-center justify-center border border-line text-fg-soft hover:border-gold/50 hover:text-gold disabled:opacity-40 transition">
              <ChevronRight size={13}/>
            </button>
          </div>
        </div>
      </Card>

      {/* Detail modal */}
      <Modal open={Boolean(sel)} onClose={() => setSel(null)} title={`${t('orderDetails')} — ${sel?.id ?? ''}`} wide>
        {sel && (
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <Badge tone={sel.status}>{t(`st.${sel.status}`)}</Badge>
                <p className="text-lg font-semibold text-fg" dir="ltr">{money(sel.total, lang)}</p>
              </div>
              <dl className="text-xs space-y-2.5 mb-5">
                {[
                  [t('customer'), sel.customer],
                  [t('city'), lang === 'ar' ? sel.city_ar : sel.city_en],
                  [t('payment'), payName(sel.payment)],
                  [t('placedAt'), dateTimeFmt(sel.placed, lang)],
                  ...(sel.coupon ? [[t('coupon'), sel.coupon]] : []),
                ].map(([k2, v]) => (
                  <div key={k2 as string} className="flex justify-between gap-4 border-b border-line/40 pb-2">
                    <dt className="text-fg-mute">{k2}</dt>
                    <dd className="text-fg-soft text-end">{v as string}</dd>
                  </div>
                ))}
              </dl>
              <h4 className="text-[10px] uppercase tracking-[0.15em] text-fg-mute mb-2.5">{t('items')}</h4>
              <ul className="space-y-2">
                {sel.items.map((l, i) => (
                  <li key={i} className="flex justify-between text-xs border border-line px-3 py-2.5">
                    <span className="text-fg-soft">{l.product}</span>
                    <span className="text-fg-mute" dir="ltr">×{l.qty} · {money(l.qty * l.price, lang)}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-[10px] uppercase tracking-[0.15em] text-fg-mute mb-4">{t('timeline')}</h4>
              <ol className="relative ms-3 border-s border-line space-y-6">
                {timeline!.map((s, i) => (
                  <li key={i} className="ps-5 relative">
                    <span className={`absolute -start-[15px] top-0 w-[30px] h-[30px] flex items-center justify-center border ${
                      s.done ? 'border-gold/40 text-gold bg-ink-card' : 'border-line text-fg-mute bg-ink-card'
                    }`}>
                      <s.icon size={13}/>
                    </span>
                    <p className={`text-xs ${s.done ? 'text-fg' : 'text-fg-mute'}`}>{s.label}</p>
                    {s.at && <p className="text-[10px] text-fg-mute mt-1">{dateTimeFmt(s.at, lang)}</p>}
                    {!s.done && s.at === undefined && i === timeline!.length - 1 && <XCircle size={12} className="text-red-400/50 mt-1"/>}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
