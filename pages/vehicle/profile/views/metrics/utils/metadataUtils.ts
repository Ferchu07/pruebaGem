/**
 * Parses status metadata_unit format "0:label1, 1:label2, 2:label3" into array of labels.
 * @param metadataUnit - string or object with value/description
 * @returns array of labels in order, e.g. ["Pedal no presionado", "Pedal presionado", "Error", "No disponible"]
 */
export const parseStatusValues = (metadataUnit: string | Record<string, any> | null | undefined): string[] => {
  if (!metadataUnit) return [];
  let str: string;
  if (typeof metadataUnit === 'object') {
    str = (metadataUnit as any).value ?? (metadataUnit as any).description ?? '';
    if (typeof str !== 'string') return [];
  } else {
    str = metadataUnit;
  }

  return str.split(',').map(part => {
    const colonIdx = part.indexOf(':');
    if (colonIdx >= 0) {
      return part.substring(colonIdx + 1).trim();
    }
    return part.trim();
  }).filter(Boolean);
};

/**
 * Extracts short unit from metadata_unit for measured metrics.
 * Examples:
 *   " 0 a 1250 kPa en escala de 5kPa" -> "kPa"
 *   " 0 a 100 % en escala de 0.4%" -> "%"
 *   " 0 a 250.99609375 km/h en escala de 0.00390625km/h" -> "km/h"
 *   "kPa" -> "kPa"
 * @param metadataUnit - full metadata_unit string
 * @returns extracted unit string or original if no pattern match
 */
export const extractUnitFromMetadata = (metadataUnit: string | null | undefined): string => {
  if (!metadataUnit || typeof metadataUnit !== 'string') return '';

  const trimmed = metadataUnit.trim();

  // Common units to look for (longest first to match "km/h" before "km", "m/s²" before "m/s")
  const unitPatterns = [
    /\b(km\/h)\b/i,
    /\b(m\/s²)\b/i,
    /\b(m\/s)\b/i,
    /\b(rad\/s)\b/i,
    /\b(rad)\b/i,
    /\b(kPa)\b/i,
    /\b(bar)\b/i,
    /\b(%)\b/,
    /\b(°C)\b/i,
    /\b(°F)\b/i,
    /\b(rpm)\b/i,
    /\b(Nm)\b/i,
    /\b(kg)\b/i,
    /\b(L)\b/i,
    /\b(V)\b/i,
    /\b(A)\b/i,
    /\b(ohm)\b/i,
    /\b(km)\b/i,
    /\b(segundos?)\b/i,
    /\b(seg\.?)\b/i,
    /\b(s)\b/,
  ];

  for (const pattern of unitPatterns) {
    const match = trimmed.match(pattern);
    if (match) return match[1];
  }

  // Fallback: if it's a short string (< 10 chars) assume it's already a unit
  if (trimmed.length < 15 && !trimmed.includes(':')) {
    return trimmed;
  }

  return trimmed;
};

/**
 * Extracts scale from metadata_unit for measured metrics.
 * Examples: "0 a 12.5 s en escala de 0.05s" -> 0.05, "0 a 1250 kPa en escala de 5kPa" -> 5
 * Also handles object format: { scale: 0.05, description: "..." }
 * @returns scale number or 1 if not found
 */
export const extractScaleFromMetadata = (metadataUnit: string | Record<string, any> | null | undefined): number => {
  if (!metadataUnit) return 1;
  if (typeof metadataUnit === 'object' && metadataUnit !== null) {
    const obj = metadataUnit as Record<string, any>;
    const s = obj.scale ?? obj.value?.scale;
    if (typeof s === 'number' && s !== 0) return s;
    const desc = obj.description ?? obj.value?.description ?? obj.value;
    if (typeof desc === 'string') return extractScaleFromMetadata(desc);
    return 1;
  }
  if (typeof metadataUnit !== 'string') return 1;
  const match = metadataUnit.match(/escala\s+de\s+([\d.]+)/i);
  if (match) {
    const n = parseFloat(match[1]);
    return !isNaN(n) && n !== 0 ? n : 1;
  }
  return 1;
};

/**
 * Returns chart stroke and fill colors based on measure unit (PDF 2.2.4.1).
 * - No unit: blue
 * - %: green
 * - km/h: red
 * - kPa: yellow
 * - m/s²: purple
 * - rpm: orange
 * - rad, rad/s: pink
 * - kg: light blue (sky blue)
 * - s: violet
 */
const M_S2_COLOR = { stroke: '#CEC9E1', fill: '#CEC9E1' };

export const getChartColorByUnit = (unit: string | null | undefined): { stroke: string; fill: string } => {
  const u = (unit || '').trim().toLowerCase();
  // m/s²: match exact and common variants (², 2, spaces)
  if (/m\/s\s*[²2]/.test(u) || u === 'm/s²' || u === 'm/s2') {
    return M_S2_COLOR;
  }
  const colors: Record<string, { stroke: string; fill: string }> = {
    '%': { stroke: '#22c55e', fill: '#bbf7d0' },
    'km/h': { stroke: '#ef4444', fill: '#fecaca' },
    'kpa': { stroke: '#eab308', fill: '#fef08a' },
    'rpm': { stroke: '#f97316', fill: '#fed7aa' },
    'rad': { stroke: '#ec4899', fill: '#fbcfe8' },
    'rad/s': { stroke: '#ec4899', fill: '#fbcfe8' },
    'kg': { stroke: '#0ea5e9', fill: '#bae6fd' },
    's': { stroke: '#D549F2', fill: '#E15CFA' },
    'seg': { stroke: '#D549F2', fill: '#E15CFA' },
    'segundos': { stroke: '#D549F2', fill: '#E15CFA' },
  };
  const match = colors[u] ?? { stroke: '#3b82f6', fill: '#bfdbfe' };
  return match;
};

export interface ModelMetric {
  id: string;
  name: string;
  orion_name: string;
  metadata_label: string | null;
  metadata_type: string | null;
  metadata_unit: string | null;
  scale_value?: number | null;
  offset_value?: number | null;
  group_id?: string;
  group_name?: string;
}

/**
 * Builds metadata object for MetricChartCard from model.metrics.
 * Format: { [SPN_XXX]: { metadata: { SP_label: { value }, values?, unit }, SP_type } }
 */
export const buildMetadataFromModelMetrics = (metrics: ModelMetric[] | null | undefined): Record<string, any> => {
  if (!metrics || !Array.isArray(metrics)) return {};

  const result: Record<string, any> = {};

  for (const m of metrics) {
    const rawKey = (m.name || m.orion_name || '').trim();
    if (!rawKey) continue;

    const key = rawKey.toUpperCase();
    const keyNorm = key.replace(/\s+/g, '_');

    const metadataType = (m.metadata_type || '').toLowerCase();
    const isStatus = metadataType === 'status';

    let scale = m.scale_value ?? (m as any).scale ?? extractScaleFromMetadata(m.metadata_unit);
    const offset = m.offset_value ?? (m as any).offset ?? 0;
    // scale=0 would zero all values (3, 33, 333 → 0); use metadata or 1 as fallback
    if (scale == null || scale === 0) {
      scale = extractScaleFromMetadata(m.metadata_unit);
      if (scale == null || scale === 0) scale = 1;
    }

    const entry = {
      metadata: {
        SP_label: { value: m.metadata_label || key },
        unit: isStatus ? (m.metadata_unit || '') : extractUnitFromMetadata(m.metadata_unit),
        ...(isStatus && {
          values: parseStatusValues(m.metadata_unit),
        }),
      },
      SP_type: isStatus ? 'status' : 'measured',
      scale,
      offset: offset != null ? offset : 0,
    };

    result[key] = entry;
    if (keyNorm !== key) result[keyNorm] = entry;
  }

  return result;
};
