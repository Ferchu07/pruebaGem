import { ModelEcu, ProfileDetailEcu, ProfileDetailGroup, ProfileDetailMetric } from "./types";

export const resolveImageUrl = (rawImage: any): string | null => {
  if (typeof rawImage === "string" && rawImage.trim() !== "") return rawImage;
  if (typeof rawImage?.url === "string" && rawImage.url.trim() !== "") return rawImage.url;
  if (typeof rawImage?.path === "string" && rawImage.path.trim() !== "") return rawImage.path;
  if (typeof rawImage?.src === "string" && rawImage.src.trim() !== "") return rawImage.src;
  return null;
};

export const resolveImageId = (rawImage: any): string | null => {
  if (typeof rawImage?.id === "string" && rawImage.id.trim() !== "") return rawImage.id;
  if (rawImage?.id !== null && rawImage?.id !== undefined) return String(rawImage.id);
  return null;
};

const toDisplayMetricValue = (value: any): string | null => {
  if (value === null || value === undefined) return null;
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    const normalized = String(value).trim();
    return normalized === "" ? null : normalized;
  }
  return null;
};

const toComparableMetricValue = (value: any): string | null => {
  const normalizedValue = toDisplayMetricValue(value);
  return normalizedValue ? normalizedValue.toLowerCase() : null;
};

const valuesMatch = (leftValue: any, rightValue: any): boolean => {
  const leftComparable = toComparableMetricValue(leftValue);
  const rightComparable = toComparableMetricValue(rightValue);
  if (leftComparable === null || rightComparable === null) return false;
  if (leftComparable === rightComparable) return true;

  const leftNumeric = Number(leftComparable);
  const rightNumeric = Number(rightComparable);
  if (!Number.isNaN(leftNumeric) && !Number.isNaN(rightNumeric)) {
    return leftNumeric === rightNumeric;
  }

  return false;
};

const resolveMetricOptionByValue = (metric: any, currentValue: any, defaultValue: any): any | null => {
  const metricOptions = Array.isArray(metric?.metric_options)
    ? metric.metric_options
    : Array.isArray(metric?.metricOptions)
      ? metric.metricOptions
      : [];

  if (metricOptions.length === 0) return null;

  const comparableCurrentValue = toComparableMetricValue(currentValue) ?? toComparableMetricValue(defaultValue);
  if (comparableCurrentValue === null) return null;

  return (
    metricOptions.find((option: any) => valuesMatch(option?.value, comparableCurrentValue)) || null
  );
};

const resolveMetricDisplayImage = (metric: any, currentValue: any, defaultValue: any): any => {
  const metadataType = String(metric?.metadata_type ?? metric?.metadataType ?? metric?.type ?? "")
    .trim()
    .toUpperCase();
  if (metadataType === "STATUS") {
    const optionMatch = resolveMetricOptionByValue(metric, currentValue, defaultValue);
    if (optionMatch?.image) return optionMatch.image;
  }

  return metric?.image ?? null;
};

const resolveMetricDisplayValue = (metric: any, currentValue: any, defaultValue: any): string => {
  const metadataType = String(metric?.metadata_type ?? metric?.metadataType ?? metric?.type ?? "")
    .trim()
    .toUpperCase();
  const displayCurrentValue = toDisplayMetricValue(currentValue);
  const displayDefaultValue = toDisplayMetricValue(defaultValue);
  const resolvedValue = displayCurrentValue ?? displayDefaultValue;

  if (metadataType === "STATUS") {
    const optionMatch = resolveMetricOptionByValue(metric, currentValue, defaultValue);
    if (optionMatch?.label) return String(optionMatch.label);
    return resolvedValue ?? "Sin dato en Orion";
  }

  if (metadataType === "MEASURED") {
    const unit = toDisplayMetricValue(metric?.metadata_unit ?? metric?.metadataUnit);
    if (!resolvedValue) return "Sin dato en Orion";
    return unit ? `${resolvedValue} ${unit}` : resolvedValue;
  }

  return resolvedValue ?? "Sin dato en Orion";
};

interface BuildProfileDetailEcusInput {
  profileMetrics: any[];
  modelEcus: ModelEcu[];
  ecuNameByOrionId: Record<string, string>;
  ecuImageIdByOrionId: Record<string, string>;
}

type ProfileDetailGroupDraft = {
  id: string;
  name: string;
  orionId: number | string | null;
  metricsById: Record<string, ProfileDetailMetric>;
};

type ProfileDetailEcuDraft = {
  ecuOrionId: string;
  name: string;
  imageId: string | null;
  groupsById: Record<string, ProfileDetailGroupDraft>;
};

export const buildProfileDetailEcus = ({
  profileMetrics,
  modelEcus,
  ecuNameByOrionId,
  ecuImageIdByOrionId,
}: BuildProfileDetailEcusInput): { ecuIds: string[]; ecuDetails: ProfileDetailEcu[] } => {
  const ecusMap: Record<string, ProfileDetailEcuDraft> = profileMetrics.reduce((
    acc: Record<string, ProfileDetailEcuDraft>,
    metric: any
  ) => {
    const ecuOrionId = metric?.ecu?.orion_id ?? metric?.group_ecu_orion_id ?? null;
    if (ecuOrionId === null || ecuOrionId === undefined) {
      return acc;
    }

    const ecuKey = String(ecuOrionId);
    const ecuName = metric?.ecu?.name
      ? String(metric.ecu.name)
      : ecuNameByOrionId[ecuKey] || `ECU ${ecuKey}`;
    const ecuImageIdFromMetric = resolveImageId(metric?.ecu?.image);

    if (!acc[ecuKey]) {
      acc[ecuKey] = {
        ecuOrionId: ecuKey,
        name: ecuName,
        imageId: ecuImageIdFromMetric ?? ecuImageIdByOrionId[ecuKey] ?? null,
        groupsById: {},
      };
    }

    if (!acc[ecuKey].imageId && ecuImageIdFromMetric) {
      acc[ecuKey].imageId = ecuImageIdFromMetric;
    }

    const groupOrionId = metric?.group?.orion_id ?? metric?.group_orion_id ?? null;
    const groupName = metric?.group?.name ?? metric?.group_name ?? "Grupo";
    const groupId = String(metric?.group?.id ?? metric?.group_id ?? `${groupName}-${groupOrionId ?? "sin-id"}`);

    if (!acc[ecuKey].groupsById[groupId]) {
      acc[ecuKey].groupsById[groupId] = {
        id: groupId,
        name: String(groupName),
        orionId: groupOrionId,
        metricsById: {},
      };
    }

    const metricId = metric?.id ? String(metric.id) : `${groupId}-${String(metric?.orion_name ?? metric?.name ?? "metric")}`;
    if (!acc[ecuKey].groupsById[groupId].metricsById[metricId]) {
      const rawOrionValue = metric?.orion_value;
      const parsedCurrentValue =
        rawOrionValue === null || rawOrionValue === undefined
          ? null
          : typeof rawOrionValue === "string" || typeof rawOrionValue === "number" || typeof rawOrionValue === "boolean"
            ? rawOrionValue
            : JSON.stringify(rawOrionValue);

      const rawDefaultValue = metric?.value;
      const parsedDefaultValue =
        rawDefaultValue === null || rawDefaultValue === undefined
          ? null
          : typeof rawDefaultValue === "string" || typeof rawDefaultValue === "number" || typeof rawDefaultValue === "boolean"
            ? rawDefaultValue
            : JSON.stringify(rawDefaultValue);

      const metricType = String(metric?.metadata_type ?? metric?.metadataType ?? metric?.type ?? "")
        .trim()
        .toUpperCase();
      const metadataUnit = metric?.metadata_unit ?? metric?.metadataUnit ?? null;
      const displayImage = resolveMetricDisplayImage(metric, parsedCurrentValue, parsedDefaultValue);
      const displayValue = resolveMetricDisplayValue(metric, parsedCurrentValue, parsedDefaultValue);

      acc[ecuKey].groupsById[groupId].metricsById[metricId] = {
        id: metricId,
        label: String(metric?.metadata_label ?? metric?.name ?? metric?.orion_name ?? `Métrica ${metricId}`),
        code: String(metric?.orion_name ?? metric?.name ?? ""),
        image: resolveImageUrl(displayImage),
        imageId: resolveImageId(displayImage),
        metricType: metricType || null,
        metadataUnit: metadataUnit !== null && metadataUnit !== undefined ? String(metadataUnit) : null,
        displayValue,
        currentValue: parsedCurrentValue,
        defaultValue: parsedDefaultValue,
      };
    }

    return acc;
  }, {} as Record<string, ProfileDetailEcuDraft>);

  const ecuIds = Object.keys(ecusMap).sort((a: string, b: string) => {
    const aIndex = modelEcus.findIndex((ecu) => String(ecu.orion_id) === a);
    const bIndex = modelEcus.findIndex((ecu) => String(ecu.orion_id) === b);
    if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });

  const ecuDetails: ProfileDetailEcu[] = ecuIds.map((ecuOrionId) => {
    const ecuData = ecusMap[ecuOrionId];
    const groups: ProfileDetailGroup[] = Object.values(ecuData.groupsById)
      .map((groupData) => {
        const metrics: ProfileDetailMetric[] = Object.values(groupData.metricsById)
          .sort((a, b) => String(a.label).localeCompare(String(b.label), "es", { sensitivity: "base" }));

        return {
          id: groupData.id,
          name: groupData.name,
          orionId: groupData.orionId ?? null,
          metrics,
        };
      })
      .sort((a, b) => String(a.name).localeCompare(String(b.name), "es", { sensitivity: "base" }));

    return {
      ecuOrionId,
      name: ecuData.name || ecuNameByOrionId[ecuOrionId] || `ECU ${ecuOrionId}`,
      imageId: ecuData.imageId ?? ecuImageIdByOrionId[ecuOrionId] ?? null,
      groups,
    };
  });

  return {
    ecuIds,
    ecuDetails,
  };
};
