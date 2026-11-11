import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { motion } from 'motion/react';

const data = [
  { month: 'Jan', profit: 85000, spend: 28000 },
  { month: 'Feb', profit: 92000, spend: 30000 },
  { month: 'Mar', profit: 88000, spend: 29000 },
  { month: 'Apr', profit: 105000, spend: 34000 },
  { month: 'May', profit: 118000, spend: 31000 },
  { month: 'Jun', profit: 124500, spend: 32100 },
];

const CircularProgress = ({ value, max, color, label, subLabel }: { value: number, max: number, color: string, label: string, subLabel: string }) => {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / max) * circumference;

  return (
    <div className="relative flex items-center justify-center">
      <svg className="transform -rotate-90 w-32 h-32">
        <circle
          cx="64"
          cy="64"
          r={radius}
          stroke="currentColor"
          strokeWidth="1.5"
          fill="transparent"
          className="text-gray-100"
        />
        <motion.circle
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
          cx="64"
          cy="64"
          r={radius}
          stroke={color}
          strokeWidth="2.5"
          fill="transparent"
          strokeDasharray={circumference}
          strokeLinecap="round"
          style={{ filter: `drop-shadow(0px 2px 6px ${color}30)` }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className="text-xl serif-number font-medium text-gray-900">{label}</span>
        <span className="text-[9px] uppercase tracking-[0.2em] text-gray-400 mt-0.5">{subLabel}</span>
      </div>
    </div>
  );
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-md border border-gray-100 p-5 rounded-2xl shadow-2xl shadow-black/5">
        <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-4">{label} 2026</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between gap-8 mb-3 last:mb-0">
            <div className="flex items-center gap-2.5 text-xs text-gray-500 uppercase tracking-wider">
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: entry.color }}></div>
              {entry.name === 'profit' ? 'Net Profit' : 'Ad Spend'}
            </div>
            <div className="font-serif text-gray-900 font-medium tracking-wide">
              ${entry.value.toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function App() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="noise-overlay"></div>
      
      {/* Header */}
      <header className="px-6 md:px-12 py-10 flex justify-between items-center max-w-7xl mx-auto relative z-10">
        <div className="text-xs md:text-sm uppercase tracking-[0.2em] font-medium text-gray-400">
          Aura <span className="text-gray-800">Analytics</span>
        </div>
        <div className="flex items-center gap-8 text-xs uppercase tracking-widest text-gray-500">
          <button className="hidden sm:block hover:text-gray-900 transition-colors">Reports</button>
          <button className="hidden sm:block hover:text-gray-900 transition-colors">Settings</button>
          <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-600 font-serif italic text-sm">
            M
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 md:px-12 pb-24 relative z-10">
        {/* Title Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mt-8 md:mt-12 mb-16 md:mb-20"
        >
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif text-gray-900 tracking-tight leading-[1.1]">
            Financial <br className="hidden sm:block"/> <span className="text-gray-400 italic">Overview</span>
          </h1>
          <p className="mt-6 text-xs md:text-sm uppercase tracking-[0.15em] text-gray-500">
            First Half, 2026
          </p>
        </motion.div>

        {/* Metrics Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-12 md:mb-16">
          {/* Net Profit Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
            className="matte-surface rounded-[2rem] p-8 md:p-10 flex items-center justify-between"
          >
            <div>
              <div className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-gray-400 mb-4">Net Profit</div>
              <div className="text-4xl md:text-5xl font-serif text-gray-900 mb-5 tracking-tight">$124,500</div>
              <div className="flex items-center gap-3 text-sm">
                <span className="flex items-center text-[#4A5D4E] bg-[#4A5D4E]/10 px-2.5 py-1 rounded-full text-xs font-medium tracking-wide">
                  <ArrowUpRight className="w-3.5 h-3.5 mr-1" />
                  14.2%
                </span>
                <span className="text-gray-400 text-xs">vs last period</span>
              </div>
            </div>
            <CircularProgress value={124500} max={150000} color="#C2A878" label="83%" subLabel="Target" />
          </motion.div>

          {/* Ad Spending Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="matte-surface rounded-[2rem] p-8 md:p-10 flex items-center justify-between"
          >
            <div>
              <div className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-gray-400 mb-4">Ad Spending</div>
              <div className="text-4xl md:text-5xl font-serif text-gray-900 mb-5 tracking-tight">$32,100</div>
              <div className="flex items-center gap-3 text-sm">
                <span className="flex items-center text-[#4A5D4E] bg-[#4A5D4E]/10 px-2.5 py-1 rounded-full text-xs font-medium tracking-wide">
                  <ArrowDownRight className="w-3.5 h-3.5 mr-1" />
                  4.1%
                </span>
                <span className="text-gray-400 text-xs">vs last period</span>
              </div>
            </div>
            <CircularProgress value={32100} max={50000} color="#D98A7A" label="64%" subLabel="Budget" />
          </motion.div>
        </div>

        {/* Chart Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          className="matte-surface rounded-[2rem] p-8 md:p-10"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-12 gap-6 sm:gap-0">
            <div>
              <h2 className="text-xl md:text-2xl font-serif text-gray-900">Performance Trajectory</h2>
              <p className="text-[10px] md:text-xs uppercase tracking-[0.15em] text-gray-400 mt-2">Profit vs Spending</p>
            </div>
            <div className="flex gap-6 text-[10px] md:text-xs uppercase tracking-widest">
              <div className="flex items-center gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#C2A878]"></div>
                <span className="text-gray-500">Net Profit</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#D98A7A]"></div>
                <span className="text-gray-500">Ad Spending</span>
              </div>
            </div>
          </div>
          
          <div className="h-[300px] md:h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <filter id="glowProfit" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="4" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                  <filter id="glowSpend" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="4" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F0" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#A0A0A0', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase' }} 
                  dy={15}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#A0A0A0', fontSize: 11, fontFamily: 'Playfair Display' }}
                  tickFormatter={(value) => `$${value / 1000}k`}
                />
                <Tooltip 
                  content={<CustomTooltip />}
                  cursor={{ stroke: '#EAEAEA', strokeWidth: 1, strokeDasharray: '4 4' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="profit" 
                  stroke="#C2A878" 
                  strokeWidth={2.5} 
                  dot={false} 
                  activeDot={{ r: 5, fill: '#C2A878', stroke: '#fff', strokeWidth: 2 }}
                  filter="url(#glowProfit)"
                  animationDuration={1500}
                />
                <Line 
                  type="monotone" 
                  dataKey="spend" 
                  stroke="#D98A7A" 
                  strokeWidth={2.5} 
                  dot={false} 
                  activeDot={{ r: 5, fill: '#D98A7A', stroke: '#fff', strokeWidth: 2 }}
                  filter="url(#glowSpend)"
                  animationDuration={1500}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
