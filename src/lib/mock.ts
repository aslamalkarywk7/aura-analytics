/* Deterministic demo dataset — a full commerce universe for Aura Analytics.
   Seeded PRNG keeps every render identical so charts never flicker. */

function mulberry32(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rnd = mulberry32(20261115);
const pick = <T,>(arr: T[]): T => arr[Math.floor(rnd() * arr.length)];
const between = (a: number, b: number) => a + rnd() * (b - a);
const int = (a: number, b: number) => Math.floor(between(a, b + 1));

/* ── Catalog ─────────────────────────────────────────────── */
export interface Product {
  id: string; sku: string; name_ar: string; name_en: string;
  family: string; size_ml: number; price: number; cost: number;
  stock: number; low_at: number; rating: number; reviews: number;
  launched: string; active: boolean;
}

const FAMILIES = [
  {slug: 'oud', ar: 'عود', en: 'Oud'},
  {slug: 'amber', ar: 'عنبر', en: 'Amber'},
  {slug: 'rose', ar: 'ورد', en: 'Rose'},
  {slug: 'musk', ar: 'مسك', en: 'Musk'},
  {slug: 'citrus', ar: 'حمضيات', en: 'Citrus'},
  {slug: 'woody', ar: 'خشبي', en: 'Woody'},
];

const BASE_NAMES = [
  ['ليلة الشرق', 'Laylat Al-Sharq'], ['ذهب الملوك', 'Royal Gold'], ['همس الورد', 'Rose Whisper'],
  ['سرّ المسك', 'Musk Secret'], ['نسمة الحمضيات', 'Citrus Breeze'], ['ظلّ العود', 'Oud Shadow'],
  ['تاج العنبر', 'Amber Crown'], ['ريحان نجد', 'Najd Basil'], ['سمر البادية', 'Desert Night'],
  ['قطرة ندى', 'Dew Drop'], ['عيون الغزال', 'Gazelle Eyes'], ['همس الياسمين', 'Jasmine Whisper'],
  ['فجر مكة', 'Makkah Dawn'], ['أرض النخيل', 'Palm Land'], ['نسيم البحر', 'Sea Breeze'],
  ['سيف الجزيرة', 'Island Sword'], ['لؤلؤة الخليج', 'Gulf Pearl'], ['غيمة الصحراء', 'Desert Cloud'],
  ['شمس الأصيل', 'Golden Sun'], ['أمواج جدة', 'Jeddah Waves'], ['دفء الشتاء', 'Winter Warmth'],
  ['لغز الليل', 'Night Riddle'], ['بستان العطور', 'Perfume Garden'], ['ملك الطيب', 'Attar King'],
];

export const products: Product[] = BASE_NAMES.map((n, i) => {
  const family = FAMILIES[i % FAMILIES.length];
  const price = int(89, 1490);
  return {
    id: `p${i + 1}`,
    sku: `IAN-${String(1000 + i * 7)}`,
    name_ar: n[0],
    name_en: n[1],
    family: family.slug,
    size_ml: pick([30, 50, 75, 100]),
    price,
    cost: Math.round(price * between(0.32, 0.55)),
    stock: rnd() < 0.08 ? 0 : rnd() < 0.22 ? int(1, 9) : int(10, 240),
    low_at: 12,
    rating: Math.round(between(3.6, 5) * 10) / 10,
    reviews: int(4, 410),
    launched: new Date(2023 + int(0, 2), int(0, 11), int(1, 28)).toISOString(),
    active: rnd() > 0.06,
  };
});

/* ── Customers ───────────────────────────────────────────── */
export interface Customer {
  id: string; name: string; email: string; phone: string; city_ar: string; city_en: string;
  orders: number; spend: number; first_order: string; last_order: string;
  segment: 'vip' | 'loyal' | 'regular' | 'new';
}

const CITIES: [string, string][] = [
  ['الرياض', 'Riyadh'], ['جدة', 'Jeddah'], ['الدمام', 'Dammam'], ['مكة المكرمة', 'Makkah'],
  ['المدينة المنورة', 'Madinah'], ['الخبر', 'Khobar'], ['أبها', 'Abha'], ['تبوك', 'Tabuk'],
  ['بريدة', 'Buraidah'], ['الطائف', 'Taif'],
];
const FIRST = ['محمد', 'أحمد', 'عبدالله', 'سارة', 'نورة', 'فهد', 'خالد', 'ريم', 'لطيفة', 'سلطان', 'هند', 'بدر', 'منى', 'طلال', 'جواهر'];
const LAST = ['العتيبي', 'القحطاني', 'الشمري', 'الحربي', 'الدوسري', 'الغامدي', 'الزهراني', 'المطيري', 'السبيعي', 'البلوي'];

export const customers: Customer[] = Array.from({length: 168}, (_, i) => {
  const orders = int(1, 42);
  const spend = orders * between(140, 720);
  const first = new Date(2024, int(0, 22), int(1, 28));
  return {
    id: `c${i + 1}`,
    name: `${pick(FIRST)} ${pick(LAST)}`,
    email: `customer${i + 1}@mail.com`,
    phone: `05${int(10000000, 59999999)}`,
    city_ar: pick(CITIES)[0],
    city_en: pick(CITIES)[1],
    orders,
    spend: Math.round(spend),
    first_order: first.toISOString(),
    last_order: new Date(2026, int(8, 10), int(1, 28)).toISOString(),
    segment: spend > 12000 ? 'vip' : spend > 5000 ? 'loyal' : orders > 2 ? 'regular' : 'new',
  };
});

/* ── Orders ──────────────────────────────────────────────── */
export type OrderStatus = 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
export interface OrderLine {product: string; qty: number; price: number}
export interface Order {
  id: string; customer_id: string; customer: string; city_ar: string; city_en: string;
  status: OrderStatus; payment: 'card' | 'cod' | 'applepay'; total: number; items: OrderLine[];
  coupon?: string; placed: string; shipped_at?: string; delivered_at?: string;
}

export const orders: Order[] = Array.from({length: 342}, (_, i) => {
  const cust = pick(customers);
  const nLines = rnd() < 0.55 ? 1 : rnd() < 0.85 ? 2 : 3;
  const items: OrderLine[] = Array.from({length: nLines}, () => {
    const p = pick(products);
    return {product: p.name_en, qty: rnd() < 0.78 ? 1 : int(2, 3), price: p.price};
  });
  const status = pick<OrderStatus>([
    'pending', 'pending', 'paid', 'paid', 'paid', 'processing', 'processing',
    'shipped', 'shipped', 'shipped', 'delivered', 'delivered', 'delivered', 'delivered',
    'delivered', 'delivered', 'delivered', 'cancelled', 'refunded',
  ]);
  const placed = new Date(2026, 10, 1 + Math.floor((10 - i / 40) * 2.6), int(8, 23), int(0, 59));
  const subtotal = items.reduce((s, l) => s + l.qty * l.price, 0);
  const coupon = rnd() < 0.22 ? pick(['AURA10', 'OUD20', 'EID50', 'WELCOME']) : undefined;
  const discount = coupon === 'AURA10' ? Math.round(subtotal * 0.1) : coupon === 'OUD20' ? Math.round(subtotal * 0.2) : coupon === 'EID50' ? 50 : coupon ? 25 : 0;
  return {
    id: `#IA-${9200 + i}`,
    customer_id: cust.id,
    customer: cust.name,
    city_ar: cust.city_ar,
    city_en: cust.city_en,
    status,
    payment: pick(['card', 'card', 'card', 'cod', 'cod', 'applepay']) as Order['payment'],
    total: subtotal - discount + (subtotal > 300 ? 0 : 25),
    items,
    coupon,
    placed: placed.toISOString(),
    shipped_at: ['shipped', 'delivered'].includes(status) ? new Date(placed.getTime() + 864e5).toISOString() : undefined,
    delivered_at: status === 'delivered' ? new Date(placed.getTime() + 3 * 864e5).toISOString() : undefined,
  };
}).sort((a, b) => +new Date(b.placed) - +new Date(a.placed));

/* ── Time series (last 90 days) ──────────────────────────── */
export interface DailyPoint {date: string; revenue: number; orders: number; visitors: number; discount: number}

export const daily: DailyPoint[] = Array.from({length: 90}, (_, i) => {
  const d = new Date(2026, 10, 15);
  d.setDate(d.getDate() - (89 - i));
  const dow = d.getDay();
  const weekendBoost = dow === 4 || dow === 5 ? 1.35 : 1;
  const trend = 1 + i * 0.006;
  const ordersN = Math.max(2, Math.round(between(4, 14) * weekendBoost * trend));
  return {
    date: d.toISOString().slice(0, 10),
    revenue: Math.round(ordersN * between(180, 540)),
    orders: ordersN,
    visitors: Math.round(ordersN * between(22, 38)),
    discount: Math.round(ordersN * between(8, 34)),
  };
});

/* ── Marketing ───────────────────────────────────────────── */
export interface Campaign {
  id: string; name_ar: string; name_en: string; channel: 'instagram' | 'tiktok' | 'google' | 'email' | 'sms' | 'influencer';
  spend: number; revenue: number; clicks: number; impressions: number; active: boolean;
}

export const campaigns: Campaign[] = [
  {id: 'cp1', name_ar: 'إطلاق مجموعة العود الملكي', name_en: 'Royal Oud Collection Launch', channel: 'instagram', spend: 18400, revenue: 91250, clicks: 41200, impressions: 1240000, active: true},
  {id: 'cp2', name_ar: 'عرض الجمعة البيضاء', name_en: 'White Friday Deal', channel: 'google', spend: 26100, revenue: 184300, clicks: 68400, impressions: 2210000, active: true},
  {id: 'cp3', name_ar: 'محتوى صنّاع الترند', name_en: 'TikTok Creators Wave', channel: 'tiktok', spend: 12900, revenue: 61700, clicks: 92800, impressions: 3410000, active: true},
  {id: 'cp4', name_ar: 'نشرة العملاء الأوفياء', name_en: 'VIP Loyalists Newsletter', channel: 'email', spend: 1400, revenue: 38200, clicks: 12100, impressions: 46200, active: true},
  {id: 'cp5', name_ar: 'تذكير السلة المتروكة', name_en: 'Abandoned Cart SMS', channel: 'sms', spend: 2200, revenue: 29600, clicks: 8300, impressions: 31000, active: true},
  {id: 'cp6', name_ar: 'مراجعة مؤثري العطور', name_en: 'Perfume Influencer Reviews', channel: 'influencer', spend: 31500, revenue: 121800, clicks: 54900, impressions: 1890000, active: false},
];

export interface Coupon {
  code: string; type: 'percent' | 'fixed'; value: number; used: number; max_uses: number | null;
  expires: string; active: boolean;
}

export const coupons: Coupon[] = [
  {code: 'AURA10', type: 'percent', value: 10, used: 214, max_uses: null, expires: '2026-12-31', active: true},
  {code: 'OUD20', type: 'percent', value: 20, used: 96, max_uses: 150, expires: '2026-11-30', active: true},
  {code: 'EID50', type: 'fixed', value: 50, used: 341, max_uses: 500, expires: '2026-12-15', active: true},
  {code: 'WELCOME', type: 'fixed', value: 25, used: 488, max_uses: null, expires: '2027-01-01', active: true},
  {code: 'SUMMER15', type: 'percent', value: 15, used: 500, max_uses: 500, expires: '2026-08-31', active: false},
];

/* ── Traffic & funnels ───────────────────────────────────── */
export const trafficSources = [
  {name_ar: 'بحث جوجل', name_en: 'Google Search', visits: 48200, orders: 2140, revenue: 842000},
  {name_ar: 'إنستغرام', name_en: 'Instagram', visits: 36100, orders: 1290, revenue: 512000},
  {name_ar: 'تيك توك', name_en: 'TikTok', visits: 29400, orders: 860, revenue: 334000},
  {name_ar: 'مباشر / علامة', name_en: 'Direct / Brand', visits: 21300, orders: 1180, revenue: 468000},
  {name_ar: 'البريد الإلكتروني', name_en: 'Email', visits: 8600, orders: 640, revenue: 261000},
  {name_ar: 'إحالات المؤثرين', name_en: 'Influencer Referrals', visits: 6900, orders: 310, revenue: 147000},
];

export const funnel = [
  {stage_ar: 'زيارات', stage_en: 'Visits', count: 150500},
  {stage_ar: 'مشاهدة منتج', stage_en: 'Product view', count: 78200},
  {stage_ar: 'إضافة للسلة', stage_en: 'Add to cart', count: 24600},
  {stage_ar: 'بدء الدفع', stage_en: 'Checkout start', count: 9840},
  {stage_ar: 'شراء مكتمل', stage_en: 'Purchase', count: 6420},
];

export const devices = [
  {name: 'Mobile', value: 68}, {name: 'Desktop', value: 24}, {name: 'Tablet', value: 8},
];

export const hourlyHeat = Array.from({length: 7 }, (_, d) =>
  Array.from({length: 12 }, (_, h) => {
    const evening = h >= 5 ? 1.5 : 0.7; // hours 16-23 in 12x2 grid
    const weekend = d >= 4 ? 1.3 : 1;
    return Math.round(between(4, 18) * evening * weekend);
  }),
);

/* Monthly cohorts: retention % by month since signup */
export const cohorts = [
  {cohort: '2026-05', size: 182, retention: [100, 42, 31, 27, 24, 22]},
  {cohort: '2026-06', size: 214, retention: [100, 45, 34, 29, 26, 0]},
  {cohort: '2026-07', size: 241, retention: [100, 47, 36, 31, 0, 0]},
  {cohort: '2026-08', size: 268, retention: [100, 44, 33, 0, 0, 0]},
  {cohort: '2026-09', size: 305, retention: [100, 49, 0, 0, 0, 0]},
  {cohort: '2026-10', size: 348, retention: [100, 0, 0, 0, 0, 0]},
];

/* ── Inventory specifics ─────────────────────────────────── */
export interface Warehouse {name_ar: string; name_en: string; city_ar: string; city_en: string; utilization: number; skus: number; pending_po: number}

export const warehouses: Warehouse[] = [
  {name_ar: 'المستودع الرئيسي', name_en: 'Main Warehouse', city_ar: 'الرياض', city_en: 'Riyadh', utilization: 78, skus: 24, pending_po: 3},
  {name_ar: 'مستودع الغرب', name_en: 'West Depot', city_ar: 'جدة', city_en: 'Jeddah', utilization: 52, skus: 18, pending_po: 1},
  {name_ar: 'مستودع الشرق', name_en: 'East Depot', city_ar: 'الدمام', city_en: 'Dammam', utilization: 41, skus: 12, pending_po: 0},
];

/* ── Notifications feed ──────────────────────────────────── */
export interface Activity {id: string; kind: 'order' | 'stock' | 'review' | 'payout' | 'goal'; text_ar: string; text_en: string; at: string}

export const activity: Activity[] = [
  {id: 'a1', kind: 'order', text_ar: 'طلب جديد #IA-9541 بقيمة 745 ر.س من الرياض', text_en: 'New order #IA-9541 worth 745 SAR from Riyadh', at: new Date(Date.now() - 6 * 6e4).toISOString()},
  {id: 'a2', kind: 'stock', text_ar: '«ذهب الملوك» على وشك النفاد — 4 قطع متبقية', text_en: '"Royal Gold" almost out — 4 units left', at: new Date(Date.now() - 42 * 6e4).toISOString()},
  {id: 'a3', kind: 'review', text_ar: 'تقييم 5 نجوم جديد على «سرّ المسك»', text_en: 'New 5-star review on "Musk Secret"', at: new Date(Date.now() - 2 * 36e5).toISOString()},
  {id: 'a4', kind: 'payout', text_ar: 'تحويل مبيعات بطاقات بقيمة 84,200 ر.س إلى الحساب البنكي', text_en: 'Card payouts of 84,200 SAR wired to bank account', at: new Date(Date.now() - 7 * 36e5).toISOString()},
  {id: 'a5', kind: 'goal', text_ar: 'تم تجاوز هدف نوفمبر بنسبة 78% قبل نهاية الشهر', text_en: 'November goal 78% reached before month end', at: new Date(Date.now() - 19 * 36e5).toISOString()},
];

/* ── Derived KPI bundle ──────────────────────────────────── */
export interface KpiBundle {
  revenue: number; orders: number; aov: number; cancelRate: number;
  profit: number; margin: number; visitors: number; convRate: number;
  revDelta: number; ordDelta: number; aovDelta: number; visDelta: number;
}

export function kpiBundle(days = 30): KpiBundle {
  const slice = daily.slice(-days);
  const prev = daily.slice(-days * 2, -days);
  const sum = (arr: DailyPoint[], k: keyof DailyPoint) => arr.reduce((s, d) => s + (d[k] as number), 0);
  const revenue = sum(slice, 'revenue');
  const ordersN = sum(slice, 'orders');
  const visitors = sum(slice, 'visitors');
  const prevRevenue = sum(prev, 'revenue') || 1;
  const prevOrders = sum(prev, 'orders') || 1;
  const prevVisitors = sum(prev, 'visitors') || 1;
  const delivered = orders.filter(o => o.status === 'delivered');
  const cancelled = orders.filter(o => ['cancelled', 'refunded'].includes(o.status));
  const costRatio = 0.46;
  return {
    revenue, orders: ordersN, visitors,
    aov: Math.round(revenue / Math.max(1, ordersN)),
    cancelRate: Math.round((cancelled.length / orders.length) * 1000) / 10,
    profit: Math.round(revenue * (1 - costRatio)),
    margin: Math.round((1 - costRatio) * 1000) / 10,
    convRate: Math.round((ordersN / Math.max(1, visitors)) * 10000) / 100,
    revDelta: Math.round(((revenue - prevRevenue) / prevRevenue) * 1000) / 10,
    ordDelta: Math.round(((ordersN - prevOrders) / prevOrders) * 1000) / 10,
    aovDelta: Math.round(((revenue / ordersN - prevRevenue / prevOrders) / (prevRevenue / prevOrders)) * 1000) / 10,
    visDelta: Math.round(((visitors - prevVisitors) / prevVisitors) * 1000) / 10,
    delivered: delivered.length,
  } as KpiBundle;
}

export function topProducts(limit = 8, lang: 'ar' | 'en' = 'en') {
  const sales = new Map<string, {qty: number; revenue: number}>();
  for (const o of orders) {
    for (const l of o.items) {
      const s = sales.get(l.product) ?? {qty: 0, revenue: 0};
      s.qty += l.qty; s.revenue += l.qty * l.price;
      sales.set(l.product, s);
    }
  }
  const byName = new Map(products.map(p => [p.name_en, p]));
  return [...sales.entries()]
    .sort((a, b) => b[1].revenue - a[1].revenue)
    .slice(0, limit)
    .map(([name, s]) => ({
      name: lang === 'ar' ? (byName.get(name)?.name_ar ?? name) : name,
      qty_sold: s.qty,
      revenue: s.revenue,
    }));
}

export function familyRevenue(lang: 'ar' | 'en' = 'en') {
  const byFamily = new Map(products.map(p => [p.id, p.family]));
  const rev = new Map<string, number>();
  for (const o of orders) {
    for (const l of o.items) {
      const p = products.find(pp => pp.name_en === l.product);
      const f = FAMILIES.find(ff => ff.slug === (p?.family ?? 'musk'))!;
      rev.set(f.slug, (rev.get(f.slug) ?? 0) + l.qty * l.price);
    }
  }
  return FAMILIES.map(f => ({
    slug: f.slug,
    name: lang === 'ar' ? f.ar : f.en,
    revenue: rev.get(f.slug) ?? 0,
  })).filter(f => f.revenue > 0).sort((a, b) => b.revenue - a.revenue);
}

export function statusBreakdown() {
  const counts = new Map<OrderStatus, number>();
  for (const o of orders) counts.set(o.status, (counts.get(o.status) ?? 0) + 1);
  return [...counts.entries()].map(([status, count]) => ({status, count}));
}

export function cityStats(lang: 'ar' | 'en' = 'en') {
  const map = new Map<string, {orders: number; revenue: number}>();
  for (const o of orders) {
    const key = lang === 'ar' ? o.city_ar : o.city_en;
    const s = map.get(key) ?? {orders: 0, revenue: 0};
    s.orders++; s.revenue += o.total;
    map.set(key, s);
  }
  return [...map.entries()].map(([city, s]) => ({city, ...s})).sort((a, b) => b.revenue - a.revenue);
}

export function paymentSplit() {
  const map = new Map<string, {count: number; revenue: number}>();
  for (const o of orders) {
    const s = map.get(o.payment) ?? {count: 0, revenue: 0};
    s.count++; s.revenue += o.total;
    map.set(o.payment, s);
  }
  return [...map.entries()].map(([method, s]) => ({method, ...s}));
}

export const stockHealth = () => ({
  out_of_stock: products.filter(p => p.stock === 0).length,
  low_stock: products.filter(p => p.stock > 0 && p.stock <= p.low_at).length,
  healthy: products.filter(p => p.stock > p.low_at).length,
});
