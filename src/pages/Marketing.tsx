import {useState} from 'react';
import {Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis} from 'recharts';
import {Instagram, Mail, Megaphone, MessageSquare, Plus, Search, Ticket, Youtube} from 'lucide-react';
import {useStore} from '@/store';
import {Badge, Btn, Card, Empty, Input, Kpi, Modal, PageHead, Select, tooltipStyle} from '@/components/ui';
import {money, num, pct, dateFmt} from '@/lib/format';
import {campaigns as seedCampaigns, coupons as seedCoupons, trafficSources} from '@/lib/mock';

const CHANNEL_ICON: Record<string, React.ElementType> = {
  instagram: Instagram, tiktok: Youtube, google: Search, email: Mail, sms: MessageSquare, influencer: Megaphone,
};
const CHANNEL_TONE: Record<string, string> = {
  instagram: 'text-pink-400', tiktok: 'text-cyan-400', google: 'text-amber-400',
  email: 'text-blue-400', sms: 'text-violet-400', influencer: 'text-emerald-400',
};

export default function Marketing() {
  const {t, lang} = useStore();
  const [campaigns, setCampaigns] = useState(seedCampaigns);
  const [coupons, setCoupons] = useState(seedCoupons);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({code: '', value: 10, type: 'percent' as 'percent' | 'fixed'});

  const totalSpend = campaigns.reduce((s, c) => s + c.spend, 0);
  const totalRev = campaigns.reduce((s, c) => s + c.revenue, 0);
  const roas = Math.round((totalRev / totalSpend) * 10) / 10;
  const activeCount = campaigns.filter(c => c.active).length;

  const roasChart = campaigns.map(c => ({
    name: (lang === 'ar' ? c.name_ar : c.name_en).split(' ')[0],
    roas: Math.round((c.revenue / c.spend) * 10) / 10,
    active: c.active,
  }));

  const toggleCoupon = (code: string) =>
    setCoupons(cs => cs.map(c => c.code === code ? {...c, active: !c.active} : c));

  const toggleCampaign = (id: string) =>
    setCampaigns(cs => cs.map(c => c.id === id ? {...c, active: !c.active} : c));

  const addCoupon = () => {
    if (!form.code.trim()) return;
    setCoupons(cs => [...cs, {
      code: form.code.trim().toUpperCase(),
      type: form.type,
      value: form.value,
      used: 0,
      max_uses: null,
      expires: '2027-06-30',
      active: true,
    }]);
    setAdding(false);
    setForm({code: '', value: 10, type: 'percent'});
  };

  return (
    <div className="fade-up">
      <PageHead title={t('nav.marketing')} sub={`${activeCount}/${campaigns.length} ${t('campaigns')}`}
        actions={<Btn variant="gold" onClick={() => setAdding(true)}><Plus size={13}/>{t('newCoupon')}</Btn>}/>

      <section className="grid grid-cols-2 xl:grid-cols-4 gap-3 mb-4">
        <Kpi icon={Megaphone} label={t('spend')} value={money(totalSpend, lang)} sub={`${activeCount} ${t('campaigns')}`}/>
        <Kpi icon={Megaphone} label={t('revenue')} value={money(totalRev, lang)} delta={14.2} sub={t('vsPrev')}/>
        <Kpi icon={Ticket} label={t('roas')} value={`${roas}x`} delta={6.4} sub={t('vsPrev')}/>
        <Kpi icon={Ticket} label={t('couponsMgr')} value={num(coupons.filter(c => c.active).length, lang)} sub={`${num(coupons.reduce((s, c) => s + c.used, 0), lang)} ${t('usedTimes')}`}/>
      </section>

      {/* Campaigns table */}
      <Card title={t('campaigns')} className="mb-4" pad={false}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs min-w-[780px]">
            <thead>
              <tr className="text-[9px] uppercase tracking-[0.12em] text-fg-mute border-b border-line">
                <th className="text-start font-medium px-4 py-3">{t('campaignName')}</th>
                <th className="text-start font-medium px-4 py-3">{t('channel')}</th>
                <th className="text-end font-medium px-4 py-3">{t('spend')}</th>
                <th className="text-end font-medium px-4 py-3">{t('revenue')}</th>
                <th className="text-end font-medium px-4 py-3">{t('roas')}</th>
                <th className="text-end font-medium px-4 py-3 hidden md:table-cell">{t('clicks')}</th>
                <th className="text-end font-medium px-4 py-3 hidden lg:table-cell">{t('ctr')}</th>
                <th className="text-start font-medium px-4 py-3">{t('enableDisable')}</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map(c => {
                const Icon = CHANNEL_ICON[c.channel] ?? Megaphone;
                return (
                  <tr key={c.id} className={`border-b border-line/40 hover:bg-gold/5 transition-colors ${!c.active ? 'opacity-50' : ''}`}>
                    <td className="px-4 py-3 text-fg">{lang === 'ar' ? c.name_ar : c.name_en}</td>
                    <td className="px-4 py-3">
                      <span className={`flex items-center gap-1.5 ${CHANNEL_TONE[c.channel]}`}>
                        <Icon size={13}/><span className="text-fg-soft capitalize">{c.channel}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-end text-fg-mute" dir="ltr">{money(c.spend, lang)}</td>
                    <td className="px-4 py-3 text-end text-fg" dir="ltr">{money(c.revenue, lang)}</td>
                    <td className="px-4 py-3 text-end font-semibold" dir="ltr">
                      <span className={c.revenue / c.spend >= 5 ? 'text-emerald-400' : 'text-gold'}>{(c.revenue / c.spend).toFixed(1)}x</span>
                    </td>
                    <td className="px-4 py-3 text-end text-fg-mute hidden md:table-cell" dir="ltr">{num(c.clicks, lang)}</td>
                    <td className="px-4 py-3 text-end text-fg-mute hidden lg:table-cell" dir="ltr">{pct(c.clicks / c.impressions * 100, lang, 2)}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleCampaign(c.id)}
                        className={`w-9 h-5 border relative transition-colors ${c.active ? 'border-gold/50 bg-gold/20' : 'border-line'}`}>
                        <span className={`absolute top-0.5 h-3.5 w-3.5 transition-all ${c.active ? 'start-[calc(100%-16px)] bg-gold' : 'start-0.5 bg-fg-mute'}`}/>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ROAS chart + coupons */}
      <section className="grid lg:grid-cols-2 gap-3 mb-4">
        <Card title={t('channelRoi')}>
          <div className="h-60" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={roasChart} margin={{top: 5, right: 8, left: -18, bottom: 0}}>
                <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                <XAxis dataKey="name" tickLine={false} axisLine={false} angle={-16} textAnchor="end" height={50}/>
                <YAxis tickLine={false} axisLine={false} width={40}/>
                <Tooltip contentStyle={tooltipStyle} cursor={{fill: 'rgba(200,180,156,0.06)'}}
                  formatter={(v: any) => [`${v}x`, t('roas')]}/>
                <Bar dataKey="roas" radius={[2, 2, 0, 0]}>
                  {roasChart.map((c, i) => <Cell key={i} fill={c.active ? 'var(--gold)' : 'var(--line)'}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title={t('couponsMgr')}>
          <table className="w-full text-xs">
            <thead>
              <tr className="text-[9px] uppercase tracking-[0.12em] text-fg-mute border-b border-line">
                <th className="text-start font-medium pb-2">{t('code')}</th>
                <th className="text-start font-medium pb-2">{t('price')}</th>
                <th className="text-start font-medium pb-2">{t('usage')}</th>
                <th className="text-start font-medium pb-2 hidden sm:table-cell">{t('expires')}</th>
                <th className="pb-2"/>
              </tr>
            </thead>
            <tbody>
              {coupons.map(c => (
                <tr key={c.code} className="border-b border-line/40">
                  <td className="py-2.5">
                    <span className="text-gold font-semibold" dir="ltr">{c.code}</span>
                  </td>
                  <td className="py-2.5 text-fg-soft" dir="ltr">{c.type === 'percent' ? `${c.value}%` : `${c.value} SAR`}</td>
                  <td className="py-2.5 text-fg-mute" dir="ltr">{num(c.used, lang)}{c.max_uses ? ` / ${num(c.max_uses, lang)}` : ''}</td>
                  <td className="py-2.5 text-fg-mute hidden sm:table-cell">{dateFmt(c.expires, lang, {day: 'numeric', month: 'short', year: '2-digit'})}</td>
                  <td className="py-2.5 text-end">
                    <div className="flex items-center justify-end gap-2">
                      <Badge tone={c.active ? 'on' : 'off'}>{c.active ? 'ON' : 'OFF'}</Badge>
                      <button onClick={() => toggleCoupon(c.code)}
                        className={`w-9 h-5 border relative transition-colors shrink-0 ${c.active ? 'border-gold/50 bg-gold/20' : 'border-line'}`}>
                        <span className={`absolute top-0.5 h-3.5 w-3.5 transition-all ${c.active ? 'start-[calc(100%-16px)] bg-gold' : 'start-0.5 bg-fg-mute'}`}/>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {coupons.length === 0 && <Empty text={t('noData')}/>}
        </Card>
      </section>

      {/* Source performance */}
      <Card title={t('trafficSources')}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs min-w-[560px]">
            <thead>
              <tr className="text-[9px] uppercase tracking-[0.12em] text-fg-mute border-b border-line">
                <th className="text-start font-medium pb-2">{t('channel')}</th>
                <th className="text-end font-medium pb-2">{t('visits')}</th>
                <th className="text-end font-medium pb-2">{t('orders')}</th>
                <th className="text-end font-medium pb-2">{t('convRate')}</th>
                <th className="text-end font-medium pb-2">{t('revenue')}</th>
              </tr>
            </thead>
            <tbody>
              {trafficSources.map(s => {
                const conv = s.orders / s.visits * 100;
                return (
                  <tr key={s.name_en} className="border-b border-line/40">
                    <td className="py-2.5 text-fg-soft">{lang === 'ar' ? s.name_ar : s.name_en}</td>
                    <td className="py-2.5 text-end text-fg-mute" dir="ltr">{num(s.visits, lang)}</td>
                    <td className="py-2.5 text-end text-fg-mute" dir="ltr">{num(s.orders, lang)}</td>
                    <td className="py-2.5 text-end" dir="ltr">
                      <span className={conv > 5 ? 'text-emerald-400' : 'text-amber-400'}>{conv.toFixed(1)}%</span>
                    </td>
                    <td className="py-2.5 text-end text-fg" dir="ltr">{money(s.revenue, lang)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add coupon modal */}
      <Modal open={adding} onClose={() => setAdding(false)} title={t('newCoupon')}>
        <div className="space-y-4">
          <div>
            <label className="block text-[10px] uppercase tracking-[0.15em] text-fg-mute mb-2">{t('code')}</label>
            <Input value={form.code} onChange={e => setForm({...form, code: e.target.value.toUpperCase()})} placeholder="SUMMER25" dir="ltr"/>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] uppercase tracking-[0.15em] text-fg-mute mb-2">{t('price')}</label>
              <Input type="number" value={form.value} min={1} onChange={e => setForm({...form, value: Number(e.target.value)})} dir="ltr"/>
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-[0.15em] text-fg-mute mb-2">{t('filter')}</label>
              <Select value={form.type} onChange={e => setForm({...form, type: e.target.value as 'percent' | 'fixed'})} className="w-full">
                <option value="percent">%</option>
                <option value="fixed">SAR</option>
              </Select>
            </div>
          </div>
          <Btn variant="gold" onClick={addCoupon} className="w-full justify-center">{t('save')}</Btn>
        </div>
      </Modal>
    </div>
  );
}
