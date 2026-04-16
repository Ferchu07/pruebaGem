// @/src/pages/vehicle/profile/views/metrics/ComparisonContext.tsx
// PDF 2.2.4.2: Estado para modo comparación entre gráficas

import React, { createContext, useCallback, useContext, useState } from 'react';

export interface ComparisonItem {
  dataKey: string;
  data: Record<string, any>[];
  metadata: Record<string, any>;
  measureUnit: string;
  title: string;
  isStatusType: boolean;
  statusKeys: string[];
  enabled: boolean;
}

interface ComparisonContextValue {
  items: ComparisonItem[];
  addOrToggle: (item: Omit<ComparisonItem, 'enabled'>) => void;
  remove: (dataKey: string) => void;
  setEnabled: (dataKey: string, enabled: boolean) => void;
  clear: () => void;
  isSelected: (dataKey: string) => boolean;
  showComparison: boolean;
  setShowComparison: (show: boolean) => void;
}

const ComparisonContext = createContext<ComparisonContextValue | null>(null);

export const ComparisonProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [items, setItems] = useState<ComparisonItem[]>([]);
  const [showComparison, setShowComparison] = useState(false);

  const addOrToggle = useCallback((item: Omit<ComparisonItem, 'enabled'>) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.dataKey === item.dataKey);
      if (existing) {
        return prev.filter((i) => i.dataKey !== item.dataKey);
      }
      return [...prev, { ...item, enabled: true }];
    });
  }, []);

  const remove = useCallback((dataKey: string) => {
    setItems((prev) => prev.filter((i) => i.dataKey !== dataKey));
  }, []);

  const setEnabled = useCallback((dataKey: string, enabled: boolean) => {
    setItems((prev) =>
      prev.map((i) => (i.dataKey === dataKey ? { ...i, enabled } : i))
    );
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const isSelected = useCallback(
    (dataKey: string) => items.some((i) => i.dataKey === dataKey),
    [items]
  );

  const value: ComparisonContextValue = {
    items,
    addOrToggle,
    remove,
    setEnabled,
    clear,
    isSelected,
    showComparison,
    setShowComparison,
  };

  return (
    <ComparisonContext.Provider value={value}>
      {children}
    </ComparisonContext.Provider>
  );
};

export const useComparison = (): ComparisonContextValue => {
  const ctx = useContext(ComparisonContext);
  if (!ctx) {
    throw new Error('useComparison must be used within ComparisonProvider');
  }
  return ctx;
};
