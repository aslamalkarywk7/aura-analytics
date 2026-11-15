import {useMemo, useState} from 'react';
import {
  Area, AreaChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import {Activity, Globe2, MonitorSmartphone, MousePointerClick, Users} from 'lucide-react';
import {useStore} from '@/store';
import {Btn, Card, CHART_COLORS, Kpi, PageHead, ProgressRow, RangeSwitch, tooltipStyle} from '@/components/ui';
import {csvDownload, money, num, pct} from '@/lib/format';
import {cohorts, daily, devices, funnel, hourlyHeat, trafficSources} from '@/lib/mock';

const DAYS_AR = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
const DAYS_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const HOURS = ['2p', '4p', '6p', '8p', '10p', '12a', '2a', '4a', '6a', '8a', '10a', '12p'];

export default function Analytics() {
  const {t, lang} = useStore();
  const [range, setRange] = useState('30');

  const series = useMemo(() => {
    const slice = daily.slice(-Number(range));
    return slice.map(d => ({
      ...d,
      label: new Date(d.date).toLocaleDateString(lang === 'ar' ? 'ar-SA-u-nu-latn' : 'en-US', {day: 'numeric', month: 'short'}),
      conv: Math.round((d.orders / d.visitors) * 10000) / 100,
    }));
  }, [range, lang]);

  const src = useMemo(() => trafficSources.map(s => ({
    ...s,
    name: lang === 'ar' ? s.name_ar : s.name_en,
    conv: Math.round((s.orders / s.visits) * 1000) / 10,
  })), [lang]);

  const maxVisit = src[0].visits;
  const maxFunnel = funnel[0].count;
  const heatMax = Math.max(...hourlyHeat.flat());

  const cohortRows = cohorts.map((c, i) => ({cohort: c.cohort, size: c.size, retention: c.retention.slice(0, cohorts.length - i)}));

  const exportCsv = () => csvDownload('traffic_sources.csv', [
    ['Source', 'Visits', 'Orders', 'Revenue SAR', 'Conv %'],
    ...src.map(s => [s.name, s.visits, s.orders, s.revenue, s.conv]),
  ]);

  return (
    <div className="fade-up">
      <PageHead title={t('nav.analytics')} sub={t('trafficSources') + ' · ROAS · ' + t('retention')}
        actions={
          <>
            <RangeSwitch value={range} onChange={setRange} options={[{key: '7', label: '7D'}, {key: '30', label: '30D'}, {key: '90', label: '90D'}]}/>
            <Btn onClick={exportCsv}>CSV</Btn>
          </>
        }/>

      <section className="grid grid-cols-2 xl:grid-cols-4 gap-3 mb-4">
        <Kpi icon={Globe2} label={t('visits')} value={num(series.reduce((s, d) => s + d.visitors, 0), lang)} delta={12.4} sub={t('vsPrev')}/>
        <Kpi icon={MousePointerClick} label={t('convRate')} value={`${(series.reduce((s, d) => s + d.conv, 0) / series.length).toFixed(2)}%`} delta={3.1} sub={t('vsPrev')}/>
        <Kpi icon={Users} label={t('orders')} value={num(series.reduce((s, d) => s + d.orders, 0), lang)} delta={8.7} sub={t('vsPrev')}/>
        <Kpi icon={Activity} label={t('aov')} value={money(Math.round(series.reduce((s, d) => s + d.revenue, 0) / series.reduce((s, d) => s + d.orders, 0)), lang)} delta={-1.8} sub={t('vsPrev')}/>
      </section>

      {/* Traffic + conversion trend */}
      <section className="grid lg:grid-cols-3 gap-3 mb-3">
        <Card title={t('convRate') + ' — ' + t('visits')} className="lg:col-span-2">
          <div className="h-60" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={series} margin={{top: 5, right: 8, left: -8, bottom: 0}}>
                <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                <XAxis dataKey="label" tickLine={false} axisLine={false} minTickGap={30}/>
                <YAxis yAxisId="l" tickLine={false} axisLine={false} width={44}/>
                <YAxis yAxisId="r" orientation="right" tickLine={false} axisLine={false} width={36} tickFormatter={v => `${v}%`}/>
                <Tooltip contentStyle={tooltipStyle}/>
                <Legend wrapperStyle={{fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em'}}/>
                <Area yAxisId="l" type="monotone" dataKey="visitors" name={t('visits')} stroke="#7f9fbf" fill="#7f9fbf22" strokeWidth={2}/>
                <Line yAxisId="r" type="monotone" dataKey="conv" name={t('convRate')} stroke="#c8b49c" strokeWidth={2} dot={false}/>
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title={t('devices')}>
          <div className="h-44" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={devices} dataKey="value" nameKey="name" innerRadius={40} outerRadius={64} paddingAngle={3} stroke="none">
                  {devices.map((_, i) => <Cell key={i} fill={CHART_COLORS[i]}/>)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => [`${v}%`, '']}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-2">
            {devices.map((d, i) => (
              <span key={d.name} className="flex items-center gap-1.5 text-[11px] text-fg-soft">
                <span className="w-2 h-2" style={{background: CHART_COLORS[i]}}/>{d.name} {d.value}%
              </span>
            ))}
          </div>
          <div className="border-t border-line mt-4 pt-4">
            <p className="flex items-center gap-2 text-[11px] text-fg-mute"><MonitorSmartphone size={13} className="text-gold"/> iOS 71% · Android 29%</p>
          </div>
        </Card>
      </section>

      {/* Sources + funnel */}
      <section className="grid lg:grid-cols-2 gap-3 mb-3">
        <Card title={t('trafficSources')}>
          <ul className="space-y-4">
            {src.map(s => (
              <li key={s.name}>
                <ProgressRow label={s.name} value={s.visits} max={maxVisit}
                  right={`${num(s.visits, lang)} · ${pct(s.conv / 100, lang, 1)}`}/>
                <p className="text-[10px] text-fg-mute mt-1" dir="ltr">{money(s.revenue, lang)} · {num(s.orders, lang)} {t('orders')}</p>
              </li>
            ))}
          </ul>
        </Card>

        <Card title={t('conversionFunnel')}>
          <div className="space-y-3">
            {funnel.map((f, i) => {
              const label = lang === 'ar' ? f.stage_ar : f.stage_en;
              const width = (f.count / maxFunnel) * 100;
              const drop = i > 0 ? Math.round((1 - f.count / funnel[i - 1].count) * 100) : 0;
              return (
                <div key={label}>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-fg-soft">{label}</span>
                    <span className="text-fg-mute" dir="ltr">{num(f.count, lang)}{drop > 0 && <span className="text-red-400/80"> −{drop}%</span>}</span>
                  </div>
                  <div className="h-7 bg-line relative overflow-hidden">
                    <div className="h-7 flex items-center justify-end px-2 transition-all duration-500"
                      style={{width: `${width}%`, background: `color-mix(in srgb, var(--gold) ${90 - i * 12}%, var(--line))`}}/>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-[10px] text-fg-mute mt-4">{t('ctr')}: 3.4% · CAC: 42 SAR</p>
        </Card>
      </section>

      {/* Hourly heat */}
      <Card title={t('hourly')} className="mb-3">
        <div className="overflow-x-auto" dir="ltr">
          <div className="min-w-[640px]">
            <div className="grid grid-cols-[52px_repeat(12,1fr)] gap-1 mb-1">
              <span/>
              {HOURS.map(h => <span key={h} className="text-[9px] text-fg-mute text-center">{h}</span>)}
            </div>
            {hourlyHeat.map((row, d) => (
              <div key={d} className="grid grid-cols-[52px_repeat(12,1fr)] gap-1 mb-1">
                <span className="text-[10px] text-fg-mute flex items-center">{lang === 'ar' ? DAYS_AR[d] : DAYS_EN[d]}</span>
                {row.map((v, h) => (
                  <div key={h} title={`${v} ${t('orders')}`}
                    className="h-6 rounded-[1px] transition-transform hover:scale-110"
                    style={{background: `color-mix(in srgb, var(--gold) ${Math.round((v / heatMax) * 88) + 6}%, var(--line))`, opacity: 0.55 + (v / heatMax) * 0.45}}/>
                ))}
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Cohorts */}
      <Card title={t('retention')}>
        <div className="overflow-x-auto" dir="ltr">
          <table className="w-full min-w-[560px] text-xs">
            <thead>
              <tr className="text-[9px] uppercase tracking-[0.12em] text-fg-mute">
                <th className="text-start font-medium pb-2 pe-4">Cohort</th>
                <th className="text-start font-medium pb-2 pe-4">Size</th>
                {['M0', 'M1', 'M2', 'M3', 'M4', 'M5'].map(m => <th key={m} className="font-medium pb-2 text-center w-16">{m}</th>)}
              </tr>
            </thead>
            <tbody>
              {cohortRows.map(r => (
                <tr key={r.cohort} className="border-t border-line/40">
                  <td className="py-1.5 pe-4 text-gold font-semibold">{r.cohort}</td>
                  <td className="py-1.5 pe-4 text-fg-mute">{r.size}</td>
                  {Array.from({length: 6}, (_, m) => {
                    const v = r.retention[m];
                    return (
                      <td key={m} className="p-0.5">
                        {v === undefined ? <div className="h-8"/> : (
                          <div className="h-8 flex items-center justify-center text-[10px] font-semibold"
                            style={{
                              background: v === 100 ? 'color-mix(in srgb, var(--gold) 22%, transparent)' : `color-mix(in srgb, var(--gold) ${Math.round(v / 3)}%, transparent)`,
                              color: v >= 40 ? 'var(--fg)' : 'var(--fg-soft)',
                            }}>
                            {v === 100 ? '—' : `${v}%`}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
