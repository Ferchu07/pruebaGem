import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import NumericChart from './NumericChart';
import StatusTimelineChart from './StatusTimelineChart';
import ChartModal from './ChartModal';
import { getChartColorByUnit } from './utils/metadataUtils';
import type { ComparisonItem } from './ComparisonContext';

export interface SingleMetricChartCardProps {
  dataKey: string;
  data?: Record<string, any>[];
  metadata?: Record<string, any>;
  onAddToComparison?: (item: Omit<ComparisonItem, 'enabled'>) => void;
  onRemoveFromComparison?: (dataKey: string) => void;
  isSelectedForComparison?: boolean;
}

/**
 * Renders a single metric (SPN) card for the 3x3 grid layout.
 * One card per SPN with light blue background per design reference.
 * PDF 2.2.4.2: Click opens modal ampliado.
 */
const SingleMetricChartCard: React.FC<SingleMetricChartCardProps> = ({
  dataKey,
  data,
  metadata,
  onAddToComparison,
  onRemoveFromComparison,
  isSelectedForComparison,
}) => {
  const { t } = useTranslation();
  const [modalOpen, setModalOpen] = useState(false);

  const isStatusType = metadata?.[dataKey.toUpperCase()]?.SP_type === 'status';

  const processedData = useMemo(() => {
    if (!data || !data.length) return [];
    const meta = metadata?.[dataKey.toUpperCase()] ?? metadata?.[dataKey.replace(/\s+/g, '_').toUpperCase()];
    // VIPN_5680: el valor ya viene en segundos, no aplicar escala
    const scale = /5680/i.test(dataKey) ? 1 : ((meta?.scale != null && meta.scale !== 0) ? meta.scale : 1);
    const offset = meta?.offset ?? 0;
    const roundTo3 = (n: number) => Math.round(n * 1000) / 1000;
    return data
      .map(item => {
        const newItem = { ...item } as any;
        Object.keys(newItem).forEach(key => {
          const val = newItem[key];
          if (key === dataKey && (typeof val === 'number' || (typeof val === 'string' && val !== '' && !isNaN(Number(val))))) {
            const num = typeof val === 'number' ? val : Number(val);
            // Status types use raw integer values (0,1,2,3...) - do NOT apply scale/offset
            newItem[key] = isStatusType ? Math.round(num) : roundTo3(num * scale + offset);
          } else if (typeof val === 'string' && !isNaN(Number(val)) && key !== 'time_index' && key !== 'pgn') {
            newItem[key] = Number(val);
          }
        });
        return newItem;
      })
      .filter(item => item[dataKey] != null);
  }, [data, dataKey, metadata, isStatusType]);

  const metadataLabel = metadata?.[dataKey.toUpperCase()]?.metadata?.SP_label?.value;
  const title = metadataLabel
    ? t(metadataLabel).toString().replace(/^(.)(.*)$/, (_: any, first: any, rest: any) => first.toUpperCase() + rest)
    : dataKey.toUpperCase();

  const statusKeys = metadata?.[dataKey.toUpperCase()]?.metadata?.values || [];
  const measureUnit = metadata?.[dataKey.toUpperCase()]?.metadata?.unit || '';

  const hasData = processedData?.length > 0 && processedData.some((item: any) => item[dataKey] != null);

  const handleChartClick = () => {
    if (!hasData) return;
    if (isSelectedForComparison && onRemoveFromComparison) {
      onRemoveFromComparison(dataKey);
      return;
    }
    setModalOpen(true);
  };

  const handleCompareClick = () => {
    if (!onAddToComparison) return;
    setModalOpen(false);
    onAddToComparison({
      dataKey,
      data: processedData,
      metadata: metadata || {},
      measureUnit,
      title,
      isStatusType,
      statusKeys,
    });
  };

  return (
    <>
      <div
        className={`bg-[#a8c5e8] rounded-lg shadow-md p-4 flex flex-col items-center min-w-[200px] min-h-[200px] transition hover:shadow-lg ${
          isSelectedForComparison ? 'ring-2 ring-green-500 ring-offset-2' : ''
        }`}
      >
        <h4 className="text-md text-center font-semibold mb-3 text-gray-800">
          {title} ({dataKey.toUpperCase()})
        </h4>
        <div
          className="w-full flex-1 bg-white border border-gray-300 rounded-lg p-3 overflow-hidden cursor-pointer hover:border-blue-400 transition"
          onClick={handleChartClick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && handleChartClick()}
          aria-label={`Ampliar gráfica ${title}`}
        >
          {!hasData ? (
            <div className="flex items-center justify-center h-full text-gray-500 text-sm">N/A</div>
          ) : isStatusType ? (
            <StatusTimelineChart data={processedData} statusKeys={statusKeys} dataKey={dataKey} />
          ) : (
            <NumericChart
              data={processedData}
              dataKey={dataKey}
              measureUnit={measureUnit}
              color={getChartColorByUnit(measureUnit).stroke}
              fill={getChartColorByUnit(measureUnit).fill}
            />
          )}
        </div>
      </div>

      <ChartModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onCompareClick={onAddToComparison ? handleCompareClick : undefined}
        title={`${title} (${dataKey.toUpperCase()})`}
        dataKey={dataKey}
        data={processedData}
        isStatusType={isStatusType}
        statusKeys={statusKeys}
        measureUnit={measureUnit}
      />
    </>
  );
};

export default SingleMetricChartCard;
