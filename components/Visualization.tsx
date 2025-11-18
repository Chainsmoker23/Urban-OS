import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { ChartMetric } from '../types';

interface VisualizationProps {
  data: ChartMetric[];
  type?: 'bar' | 'area';
  isLoading?: boolean;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/90 backdrop-blur-md p-3 text-xs border border-emerald-200 text-slate-700 font-mono shadow-lg rounded-lg">
        <p className="mb-1 font-bold text-emerald-600">{label}</p>
        <p>{`${payload[0].value} ${payload[0].payload.unit || ''}`}</p>
      </div>
    );
  }
  return null;
};

const LoadingState = () => (
  <div className="w-full h-64 mt-4 relative overflow-hidden bg-slate-100 border border-slate-200 rounded-lg">
     {/* Animated Grid Background */}
     <div className="absolute inset-0 bg-[size:40px_40px] bg-grid-pattern opacity-20 animate-pulse-slow"></div>
     
     {/* Scanning Beam */}
     <div className="absolute top-0 left-0 w-full h-1 bg-emerald-400/50 shadow-[0_0_15px_#4ADE80] animate-scan z-10"></div>

     {/* Central Data Loader */}
     <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
        <div className="flex items-end space-x-1 mb-3 h-12">
          {[...Array(7)].map((_, i) => (
            <div 
              key={i} 
              className="w-1.5 bg-emerald-400 rounded-t-sm"
              style={{ 
                height: '30%',
                animation: `equalizer 1s ease-in-out infinite`,
                animationDelay: `${i * 0.1}s`
              }}
            ></div>
          ))}
        </div>
        <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-white border border-emerald-200 backdrop-blur-sm shadow-sm">
          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
          <span className="text-[10px] font-mono text-emerald-700 tracking-[0.2em] animate-pulse">ACQUIRING TELEMETRY</span>
        </div>
     </div>
  </div>
);

export const Visualization: React.FC<VisualizationProps> = ({ data, type = 'bar', isLoading = false }) => {
  if (isLoading) {
    return <LoadingState />;
  }

  if (!data || data.length === 0) return null;

  return (
    <div className="w-full h-64 mt-4">
      <ResponsiveContainer width="100%" height="100%">
        {type === 'bar' ? (
          <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#CBD5E1" opacity={0.4} vertical={false} />
            <XAxis 
              dataKey="label" 
              stroke="#64748B" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false}
              tick={{ fill: '#64748B', opacity: 0.8 }}
            />
            <YAxis 
              stroke="#64748B" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false}
              tick={{ fill: '#64748B', opacity: 0.8 }}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(34, 197, 94, 0.05)' }} />
            <Bar 
              dataKey="value" 
              fill="#22C55E" 
              opacity={0.8} 
              radius={[4, 4, 0, 0]}
              barSize={20}
            />
          </BarChart>
        ) : (
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
             <CartesianGrid strokeDasharray="3 3" stroke="#CBD5E1" opacity={0.4} vertical={false} />
             <XAxis 
              dataKey="label" 
              stroke="#64748B" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
             <defs>
                <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#22C55E" stopOpacity={0}/>
                </linearGradient>
              </defs>
             <Area 
              type="monotone" 
              dataKey="value" 
              stroke="#22C55E" 
              fillOpacity={1} 
              fill="url(#colorVal)" 
            />
          </AreaChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};