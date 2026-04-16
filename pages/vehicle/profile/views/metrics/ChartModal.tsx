// @/src/pages/vehicle/profile/views/metrics/ChartModal.tsx
// PDF 2.2.4.2: Modal ampliado con zoom y brush para selección de periodo

import React, { useCallback, useState } from 'react';
import {
  Area,
  AreaChart,
  Brush,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { formatTimestamp } from './utils';
import StatusTimelineChart from './StatusTimelineChart';
import { getChartColorByUnit } from './utils/metadataUtils';

export interface ChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCompareClick?: () => void;
  title: string;
  dataKey: string;
  data: Record<string, any>[];
  isStatusType: boolean;
  statusKeys?: string[];
  measureUnit?: string;
}

const ZOOM_FACTOR = 1.3;

const ChartModal: React.FC<ChartModalProps> = ({
  isOpen,
  onClose,
  onCompareClick,
  title,
  dataKey,
  data,
  isStatusType,
  statusKeys = [],
  measureUnit = '',
}) => {
  const [zoomLevel, setZoomLevel] = useState(0);
  const [brushRange, setBrushRange] = useState<[number, number] | null>(null);

  const times = data.map((d) => d.time_index ?? d.time ?? 0).filter(Boolean);
  const dataMin = times.length ? Math.min(...times) : 0;
  const dataMax = times.length ? Math.max(...times) : 1;
  const span = dataMax - dataMin || 1;

  const getDomain = useCallback(() => {
    if (brushRange) {
      return brushRange;
    }
    const zoomFactor = Math.pow(ZOOM_FACTOR, zoomLevel);
    const zoomSpan = span / zoomFactor;
    const center = (dataMin + dataMax) / 2;
    const half = zoomSpan / 2;
    return [
      Math.max(dataMin, center - half),
      Math.min(dataMax, center + half),
    ] as [number, number];
  }, [brushRange, zoomLevel, span, dataMin, dataMax]);

  const domain = getDomain();
  const filteredData = data.filter(
    (d) => {
      const t = d.time_index ?? d.time ?? 0;
      return t >= domain[0] && t <= domain[1];
    }
  );

  const handleZoomIn = () => setZoomLevel((z) => z + 1);
  const handleZoomOut = () => {
    setZoomLevel((z) => Math.max(0, z - 1));
    if (zoomLevel <= 1) setBrushRange(null);
  };

  const handleBrushChange = (range: { startIndex?: number; endIndex?: number } | null) => {
    if (!range || range.startIndex == null || range.endIndex == null) {
      setBrushRange(null);
      return;
    }
    const sorted = [...data].sort(
      (a, b) => (a.time_index ?? a.time ?? 0) - (b.time_index ?? b.time ?? 0)
    );
    const start = sorted[range.startIndex]?.time_index ?? sorted[range.startIndex]?.time ?? dataMin;
    const end = sorted[range.endIndex]?.time_index ?? sorted[range.endIndex]?.time ?? dataMax;
    setBrushRange([start, end]);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  if (!isOpen) return null;

  const { stroke, fill } = getChartColorByUnit(measureUnit);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="chart-modal-title"
    >
      <div
        className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-2">
            {onCompareClick && !isStatusType && (
              <button
                type="button"
                onClick={onCompareClick}
                className="px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 transition"
              >
                Comparar
              </button>
            )}
            <h2 id="chart-modal-title" className="text-lg font-semibold text-gray-800">
              {title}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {!isStatusType && (
              <>
                <button
                  type="button"
                  onClick={handleZoomOut}
                  disabled={zoomLevel === 0 && !brushRange}
                  className="p-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  aria-label="Reducir zoom"
                >
                  <span className="text-lg font-bold">−</span>
                </button>
                <button
                  type="button"
                  onClick={handleZoomIn}
                  className="p-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition"
                  aria-label="Ampliar zoom"
                >
                  <span className="text-lg font-bold">+</span>
                </button>
              </>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition"
              aria-label="Cerrar"
            >
              <span className="text-lg font-bold">×</span>
            </button>
          </div>
        </div>

        <div className="flex-1 min-h-[400px] p-4 overflow-auto">
          {isStatusType ? (
            <StatusTimelineChart
              data={filteredData.length ? filteredData : data}
              statusKeys={statusKeys}
              dataKey={dataKey}
            />
          ) : (
            <div className="h-[450px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={filteredData.length ? filteredData : data}
                  margin={{ top: 10, right: 10, left: 10, bottom: 30 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="time_index"
                    type="number"
                    domain={domain}
                    tickFormatter={formatTimestamp}
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis
                    label={{
                      value: measureUnit,
                      angle: -90,
                      position: 'insideLeft',
                      style: { fill: '#6b7280', fontSize: 12 },
                    }}
                    tick={{ fontSize: 11 }}
                    tickFormatter={(v) => (typeof v === 'number' ? v.toFixed(3) : String(v))}
                  />
                  <Tooltip
                    labelFormatter={(value) =>
                      `Tiempo: ${formatTimestamp(value as number)}`
                    }
                    formatter={(value) => {
                      const v = typeof value === 'number' ? value.toFixed(3) : value;
                      return [measureUnit ? `${v} ${measureUnit}` : v];
                    }}
                    contentStyle={{
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                    }}
                  />
                  <Brush
                    dataKey="time_index"
                    height={30}
                    stroke={stroke}
                    fill={fill}
                    fillOpacity={0.3}
                    tickFormatter={formatTimestamp}
                    onChange={handleBrushChange}
                  />
                  <Area
                    type="monotone"
                    dataKey={dataKey}
                    stroke={stroke}
                    fill={fill}
                    strokeWidth={2}
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChartModal;
