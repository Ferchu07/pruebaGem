// @/src/pages/vehicle/profile/views/metrics/NumericChart.tsx

import React from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatTimestamp } from './utils';

interface NumericChartProps {
  data: Record<string, any>[];
  dataKey: string;
  measureUnit: string;
  color?: string;
  fill?: string;
}

const NumericChart: React.FC<NumericChartProps> = ({ data, dataKey, measureUnit, color = "#3b82f6", fill = "#bfdbfe" }) => {
  return (
    <div className="bg-white border-2 border-slate-600 rounded-lg overflow-hidden p-2 h-[220px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={true} horizontal={true} />
          <XAxis
            dataKey="time_index"
            type="number"
            domain={['dataMin', 'dataMax']}
            tickFormatter={formatTimestamp}
            tick={{ fontSize: 10 }}
          />
          <YAxis
            label={{
              value: measureUnit,
              angle: -90,
              position: 'insideLeft',
              offset: 10,
              style: { textAnchor: 'middle', fill: '#6b7280', fontSize: 12 },
            }}
            tick={{ fontSize: 10 }}
            tickFormatter={(v) => (typeof v === 'number' ? v.toFixed(3) : String(v))}
          />
          <Tooltip
            labelFormatter={(value) => `Tiempo: ${formatTimestamp(value as number)}`}
            formatter={(value) => {
              const v = typeof value === 'number' ? value.toFixed(3) : value;
              return [measureUnit ? `${v} ${measureUnit}` : v];
            }}
            contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
          />
          <Area type="monotone" dataKey={dataKey} stroke={color} fill={fill} strokeWidth={2} fillOpacity={0.6} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default NumericChart;