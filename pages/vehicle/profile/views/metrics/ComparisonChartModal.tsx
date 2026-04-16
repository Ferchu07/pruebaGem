// @/src/pages/vehicle/profile/views/metrics/ComparisonChartModal.tsx
// PDF 2.2.4.2: Vista comparación - solo líneas, leyenda con colores y unidades

import React, { useMemo } from 'react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { formatTimestamp } from './utils';
import { getChartColorByUnit } from './utils/metadataUtils';
import type { ComparisonItem } from './ComparisonContext';

interface ComparisonChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: ComparisonItem[];
}

const COLORS = [
  '#3b82f6',
  '#22c55e',
  '#ef4444',
  '#eab308',
  '#a855f7',
  '#f97316',
  '#ec4899',
  '#0ea5e9',
  '#8b5cf6',
];

const ComparisonChartModal: React.FC<ComparisonChartModalProps> = ({
  isOpen,
  onClose,
  items,
}) => {
  const enabledItems = useMemo(
    () => items.filter((i) => i.enabled && !i.isStatusType),
    [items]
  );

  const mergedData = useMemo(() => {
    if (enabledItems.length === 0) return [];

    const timeSet = new Set<number>();
    enabledItems.forEach((item) => {
      item.data.forEach((row) => {
        const t = row.time_index ?? row.time ?? 0;
        timeSet.add(t);
      });
    });

    const times = Array.from(timeSet).sort((a, b) => a - b);

    return times.map((time) => {
      const point: Record<string, any> = { time_index: time };
      enabledItems.forEach((item) => {
        const row = item.data.find(
          (r) => (r.time_index ?? r.time) === time
        );
        point[item.dataKey] = row?.[item.dataKey] ?? null;
      });
      return point;
    });
  }, [enabledItems]);

  const seriesWithColors = useMemo(() => {
    return enabledItems.map((item, idx) => {
      const { stroke } = getChartColorByUnit(item.measureUnit);
      const color = COLORS[idx % COLORS.length];
      const displayColor = item.measureUnit ? stroke : color;
      const label = item.measureUnit
        ? `${item.title} (${item.measureUnit})`
        : item.title;
      return {
        ...item,
        color: displayColor,
        label,
      };
    });
  }, [enabledItems]);

  const hasDifferentUnits = useMemo(() => {
    const units = new Set(
      enabledItems.map((i) => (i.measureUnit || '').trim()).filter(Boolean)
    );
    return units.size > 1;
  }, [enabledItems]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-800">
            Comparación de gráficas
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50"
            aria-label="Cerrar"
          >
            <span className="text-lg font-bold">×</span>
          </button>
        </div>

        <div className="flex-1 min-h-[450px] p-4">
          <ResponsiveContainer width="100%" height={450}>
            <LineChart
              data={mergedData}
              margin={{ top: 10, right: 30, left: 10, bottom: 30 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="time_index"
                type="number"
                domain={['dataMin', 'dataMax']}
                tickFormatter={formatTimestamp}
                tick={{ fontSize: 11 }}
              />
              <YAxis
                yAxisId="left"
                tick={{ fontSize: 11 }}
                tickFormatter={(v) => (typeof v === 'number' ? v.toFixed(3) : String(v))}
                label={{
                  value: hasDifferentUnits
                    ? 'Valores (ver leyenda para unidades)'
                    : seriesWithColors[0]?.measureUnit || '',
                  angle: -90,
                  position: 'insideLeft',
                  style: { fill: '#6b7280', fontSize: 12 },
                }}
              />
              <Tooltip
                labelFormatter={(value) =>
                  `Tiempo: ${formatTimestamp(value as number)}`
                }
                formatter={(value: any, name: string) => {
                  const item = seriesWithColors.find((s) => s.dataKey === name);
                  const unit = item?.measureUnit || '';
                  const v = typeof value === 'number' ? value.toFixed(3) : value;
                  return [unit ? `${v} ${unit}` : v, item?.title ?? name];
                }}
                contentStyle={{
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                }}
              />
              <Legend
                formatter={(value, entry: any) => {
                  const item = seriesWithColors.find(
                    (s) => s.dataKey === entry.dataKey
                  );
                  return (
                    <span style={{ color: entry.color }}>
                      {item?.title ?? value}
                      {item?.measureUnit && ` (${item.measureUnit})`}
                    </span>
                  );
                }}
              />
              {seriesWithColors.map((s) => (
                <Line
                  key={s.dataKey}
                  yAxisId="left"
                  type="monotone"
                  dataKey={s.dataKey}
                  stroke={s.color}
                  strokeWidth={2}
                  dot={false}
                  connectNulls
                  name={s.title}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ComparisonChartModal;
