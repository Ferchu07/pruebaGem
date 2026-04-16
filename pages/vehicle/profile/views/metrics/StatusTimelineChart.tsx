// @/src/pages/vehicle/profile/views/metrics/StatusTimelineChart.tsx
// PDF 2.2.4.1: Timeline-style chart for status parameters - horizontal bars per state

import React, { useMemo } from 'react';
import {
  ComposedChart,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
  CartesianGrid,
  Line,
} from 'recharts';
import { formatTimestamp } from './utils';

/**
 * Semantic colors per protocol (iconos):
 * - Rojo: apagado/no activo/no operativo
 * - Verde: encendido/activo/operativo
 * - Amarillo: aviso/funcionalidad limitada/permisos restringidos
 * - Rojo oscuro: error
 * - Gris: reservado/no disponible/otros
 */
const getStatusColor = (stateLabel: string): string => {
  const lower = (stateLabel || '').toLowerCase();
  if (/error|fallo|avería|indicación de error|no funciona|not functioning/i.test(lower)) {
    return '#991b1b'; // rojo oscuro - error
  }
  if (/reservado|reserved|no disponible|no instalado|n\/a|temporalmente/i.test(lower)) {
    return '#6b7280'; // gris - reservado/no disponible (antes de rojo para prioridad)
  }
  if (/apagado|off|no activo|not active|no operativo|not operational|no encendido|desactiva|anula|no está listo/i.test(lower)) {
    return '#ef4444'; // rojo - off/no activo
  }
  if (/aviso|warning|limitado|limited|restringido|restricted|permisos restringidos|incompleto|incomplete|colisión frontal con frenado|colisión frontal activo|sensibilidad limitada/i.test(lower)) {
    return '#eab308'; // amarillo - aviso/limitado
  }
  if (/encendido|on|activo|active|operativo|operational|listo y activado|presionado|pressed|frenado de emergencia.*activo/i.test(lower)) {
    return '#22c55e'; // verde - on/activo
  }
  return '#6b7280'; // gris - reservado/no disponible/otros
};

interface Segment {
  start: number;
  end: number;
  stateIndex: number;
  stateLabel: string;
  fill: string;
}

interface StatusTimelineChartProps {
  data: Record<string, any>[];
  statusKeys: string[];
  dataKey: string;
}

const StatusTimelineChart: React.FC<StatusTimelineChartProps> = ({
  data,
  statusKeys,
  dataKey,
}) => {
  const segments = useMemo(() => {
    if (!data?.length || !statusKeys?.length) return [];

    const result: Segment[] = [];
    let currentState: number | null = null;
    let segmentStart: number | null = null;

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const time = row.time_index ?? row.time ?? i;
      const val = row[dataKey];
      const stateIndex =
        typeof val === 'number' ? val : parseInt(String(val), 10);
      const stateLabel =
        statusKeys[stateIndex] ?? `Estado ${stateIndex}`;
      const fill = getStatusColor(stateLabel);

      if (currentState !== stateIndex) {
        if (segmentStart !== null && currentState !== null) {
          const prevLabel =
            statusKeys[currentState] ?? `Estado ${currentState}`;
          result.push({
            start: segmentStart,
            end: time,
            stateIndex: currentState,
            stateLabel: prevLabel,
            fill: getStatusColor(prevLabel),
          });
        }
        segmentStart = time;
        currentState = stateIndex;
      }
    }

    if (segmentStart !== null && currentState !== null && data.length > 0) {
      const lastTime =
        data[data.length - 1]?.time_index ??
        data[data.length - 1]?.time ??
        data.length - 1;
      const lastLabel =
        statusKeys[currentState] ?? `Estado ${currentState}`;
      const end = Math.max(lastTime, segmentStart + 1);
      result.push({
        start: segmentStart,
        end,
        stateIndex: currentState,
        stateLabel: lastLabel,
        fill: getStatusColor(lastLabel),
      });
    }

    return result;
  }, [data, dataKey, statusKeys]);

  const yTicks = useMemo(
    () => statusKeys.map((_, i) => i),
    [statusKeys]
  );

  const formatYAxisTick = (value: number) => statusKeys[value] ?? '';

  if (!statusKeys?.length) {
    return (
      <div className="text-center text-gray-500 py-12">
        No hay definición de estados disponible
      </div>
    );
  }

  const hasManyOptions = statusKeys.length > 8;
  const sampledTicks = hasManyOptions
    ? yTicks.filter(
        (_, i) => i % Math.max(1, Math.ceil(statusKeys.length / 6)) === 0
      )
    : yTicks;

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs text-gray-600">
        Gráfico de estados en el tiempo. El eje Y muestra cada estado posible; las barras horizontales indican cuándo estuvo activo cada estado.
      </p>
      <div className="bg-white border-2 border-slate-600 rounded-lg overflow-hidden p-2 h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="time_index"
              type="number"
              domain={['dataMin', 'dataMax']}
              tickFormatter={formatTimestamp}
              tick={{ fontSize: 10 }}
            />
            <YAxis
              type="number"
              domain={[0, Math.max(0, statusKeys.length - 1)]}
              ticks={sampledTicks}
              tickFormatter={formatYAxisTick}
              width={hasManyOptions ? 220 : 120}
              interval={0}
              tick={{ fontSize: hasManyOptions ? 8 : 10 }}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload?.length || label == null) return null;
                const val = payload[0]?.value;
                const idx = Number(val);
                const labelText = statusKeys[idx] ?? `Desconocido`;
                return (
                  <div
                    className="bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2 text-sm"
                    style={{ minWidth: 200 }}
                  >
                    <div className="font-semibold text-gray-700 border-b border-gray-100 pb-1 mb-1">
                      Tiempo: {formatTimestamp(label as number)}
                    </div>
                    <div className="text-gray-800">
                      <span className="font-medium">Valor del estado: </span>
                      <span className="font-mono text-blue-600">{idx}</span>
                      <span className="text-gray-600"> — {labelText}</span>
                    </div>
                  </div>
                );
              }}
            />
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke="transparent"
              strokeWidth={0}
              dot={false}
              isAnimationActive={false}
            />
            {segments.map((seg, idx) => (
              <ReferenceArea
                key={`${seg.start}-${seg.end}-${seg.stateIndex}-${idx}`}
                x1={seg.start}
                x2={seg.end}
                y1={seg.stateIndex - 0.45}
                y2={seg.stateIndex + 0.45}
                fill={seg.fill}
                fillOpacity={0.9}
                stroke={seg.fill}
              />
            ))}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <div className={`border border-gray-200 rounded p-3 bg-gray-50 ${hasManyOptions ? 'max-h-[140px] overflow-y-auto' : ''}`}>
        <p className="text-xs font-semibold text-gray-600 mb-1">
          Referencia de estados (cada barra muestra el valor en ese intervalo):
        </p>
        <ul className="text-xs text-gray-700 space-y-1">
          {statusKeys.map((label, i) => (
            <li key={i} className="flex items-center gap-2">
              <span
                className="inline-block w-3 h-3 rounded-sm flex-shrink-0"
                style={{ backgroundColor: getStatusColor(label) }}
                aria-hidden
              />
              <span>
                <span className="font-semibold text-gray-800">Estado {i}:</span> {label}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default StatusTimelineChart;
