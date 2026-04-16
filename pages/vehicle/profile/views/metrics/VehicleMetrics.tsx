import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import { ReactComponent as DeleteIcon } from "../../../../../assets/Iconos/Interfaz/borrar.svg";
import { ReactComponent as EditIcon } from "../../../../../assets/Iconos/Interfaz/editar.svg";
import { ReactComponent as EyeIcon } from "../../../../../assets/Iconos/Interfaz/ver.svg";
import AsyncImg from "../../../../../components/extras/AsyncImg";
import PlaceholderImage from "../../../../../components/extras/PlaceholderImage";
import CustomSelect from "../../../../../components/forms/CustomSelect";
import { useFiltersPR } from "../../../../../components/providers/FiltersProvider";
import { RootState } from "../../../../../redux/store";
import { MetricProfileService } from "../../../../../services/metrics/metricProfileService";
import { ModelService } from "../../../../../services/model/modelService";
import { UserService } from "../../../../../services/user/userService";
import { VehicleService } from "../../../../../services/vehicle/vehicleService";
import { buildMetadataFromModelMetrics } from "./utils/metadataUtils";
import SingleMetricChartCard from "./SingleMetricChartCard";
import { ComparisonProvider, useComparison } from "./ComparisonContext";
import ComparisonChartModal from "./ComparisonChartModal";
import { ECU_ICON_BY_KEY, resolveEcuIcon } from "./vehicleMetrics/ecuIcons";
import EcuImage from "./vehicleMetrics/EcuImage";
import {
  normalizeText,
  resolveUserId,
  toYmd,
  userBelongsToCompany,
} from "./vehicleMetrics/helpers";
import {
  extractEcuIdsFromProfileMetrics,
  extractMetricProfilesFromListResponse,
  extractUsersFromListResponse,
} from "./vehicleMetrics/profileDataUtils";
import { buildProfileDetailEcus } from "./vehicleMetrics/profileDetailHelpers";
import {
  EditorEcu,
  EditorGroup,
  MetricDataGroup,
  MetricProfileOption,
  MetricProfileSummary,
  ModelMetric,
  ModelContextState,
  ProfileDetailState,
  ProfileEditorState,
  ScreenMode,
  UserOption,
  VehicleMetricsView,
  ViewerEcu,
  ViewerState,
} from "./vehicleMetrics/types";

export type { VehicleMetricsView };

interface VehicleMetricsContentProps {
  view?: VehicleMetricsView;
}

const VehicleMetricsContent: React.FC<VehicleMetricsContentProps> = ({ view = "full" }) => {
  const {
    items,
    addOrToggle,
    remove,
    setEnabled,
    isSelected,
    showComparison,
    setShowComparison,
  } = useComparison();

  const { reloadMetrics } = useSelector((state: RootState) => state.vehicleProfile);
  const authUser: any = useSelector((state: RootState) => state.auth.user as any);
  const currentUserId = authUser?.id ?? authUser?.user_id ?? null;
  const loggedCompanyId =
      typeof authUser?.companyId === "string" && authUser.companyId.trim() !== ""
          ? String(authUser.companyId)
          : null;
  const { filters, updateFilters } = useFiltersPR();
  const canViewViewer = view !== "profiles-only";
  const canManageProfiles = view !== "viewer-only";
  const isViewerOnlyMode = view === "viewer-only";
  const isFullMode = view === "full";
  const initialMode: ScreenMode = view === "viewer-only" ? "viewer" : view === "profiles-only" ? "profiles-home" : "viewer";

  const buildMetricProfileService = () => new MetricProfileService();
  const buildVehicleService = () => new VehicleService();
  const buildModelService = () => new ModelService();
  const buildUserService = () => new UserService();
  const metricsAbortRef = useRef<AbortController | null>(null);

  const [mode, setMode] = useState<ScreenMode>(initialMode);
  const [modelContext, setModelContext] = useState<ModelContextState>({
    vehicle: null,
    model: null,
    modelMetrics: [],
    modelGroups: [],
    modelEcus: [],
    loading: true,
    error: null,
  });
  const [viewer, setViewer] = useState<ViewerState>({
    groups: [],
    metadata: {},
    profileOptions: [],
    selectedProfileId: null,
    loading: true,
    error: null,
    emptyMessage: null,
  });

  const [selectedEcuOrionId, setSelectedEcuOrionId] = useState<string | null>(null);
  const [groupIndexByEcu, setGroupIndexByEcu] = useState<Record<string, number>>({});
  const [ecuPage, setEcuPage] = useState(0);
  const [showEcuQuickList, setShowEcuQuickList] = useState(false);

  const [profilesLoading, setProfilesLoading] = useState(false);
  const [profilesError, setProfilesError] = useState<string | null>(null);
  const [profiles, setProfiles] = useState<MetricProfileSummary[]>([]);
  const [profileEcusMap, setProfileEcusMap] = useState<Record<string, string[]>>({});
  const [profileSearch, setProfileSearch] = useState("");
  const [profileHomePage, setProfileHomePage] = useState(0);
  const [profileDetail, setProfileDetail] = useState<ProfileDetailState>({
    profile: null,
    ecuIds: [],
    ecuDetails: [],
    loading: false,
    error: null,
  });
  const [profileDetailSelectedEcuId, setProfileDetailSelectedEcuId] = useState<string | null>(null);
  const [profileUserOptions, setProfileUserOptions] = useState<UserOption[]>([]);
  const [profileUsersLoading, setProfileUsersLoading] = useState(false);
  const [profileUsersError, setProfileUsersError] = useState<string | null>(null);

  const [editor, setEditor] = useState<ProfileEditorState | null>(null);
  const [editorMetricSearch, setEditorMetricSearch] = useState("");

  const vehicleId = filters.filter_filters?.vehicleId;
  const startDate = filters.filter_filters?.startDate;
  const endDate = filters.filter_filters?.endDate;
  const requestedMetricProfileId =
      typeof filters.filter_filters?.metricProfileId === "string"
          ? filters.filter_filters.metricProfileId
          : null;
  const vehicleCompanyId =
      modelContext.vehicle?.company?.id !== null && modelContext.vehicle?.company?.id !== undefined
          ? String(modelContext.vehicle.company.id)
          : null;
  const requestCompanyId = loggedCompanyId ?? vehicleCompanyId;
  const editorCompanyId = editor?.companyId ?? null;

  const profileSelectOptions = useMemo(
      () => viewer.profileOptions.map((profile) => ({ value: profile.value, label: profile.label })),
      [viewer.profileOptions]
  );

  const fetchModelContext = useCallback(async () => {
    if (!vehicleId) {
      setModelContext((prev) => ({
        ...prev,
        loading: false,
        error: "No se ha seleccionado un vehículo.",
      }));
      return;
    }

    setModelContext((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const vehicleRes = await buildVehicleService().getVehicleById(vehicleId);
      const vehicleData = vehicleRes.getResponseData();
      if (!vehicleData?.success && vehicleData?.message) {
        setModelContext((prev) => ({ ...prev, loading: false, error: vehicleData.message }));
        return;
      }

      const vehicle = vehicleData?.data ?? vehicleData;
      const modelId = vehicle?.model?.id;

      if (!modelId) {
        setModelContext((prev) => ({
          ...prev,
          vehicle,
          model: null,
          modelMetrics: [],
          modelGroups: [],
          modelEcus: [],
          loading: false,
          error: "El vehículo no tiene modelo asignado.",
        }));
        return;
      }

      const modelRes = await buildModelService().getModelById(modelId);
      const modelData = modelRes.getResponseData();
      if (!modelData?.success && modelData?.message) {
        setModelContext((prev) => ({ ...prev, loading: false, error: modelData.message }));
        return;
      }

      const model = modelData?.data ?? modelData;
      setModelContext({
        vehicle,
        model,
        modelMetrics: Array.isArray(model?.metrics) ? model.metrics : [],
        modelGroups: Array.isArray(model?.groups) ? model.groups : [],
        modelEcus: Array.isArray(model?.ecus) ? model.ecus : [],
        loading: false,
        error: null,
      });
    } catch (error: any) {
      setModelContext((prev) => ({
        ...prev,
        loading: false,
        error: error?.message || "Error al cargar información del modelo.",
      }));
    }
  }, [vehicleId]);

  const fetchViewerData = useCallback(async () => {
    if (!vehicleId) {
      setViewer((prev) => ({
        ...prev,
        loading: false,
        error: "No se ha seleccionado un vehículo.",
      }));
      return;
    }

    if (!requestCompanyId) {
      if (!modelContext.loading) {
        setViewer((prev) => ({
          ...prev,
          loading: false,
          error: "No se pudo resolver la compañía del vehículo para visualizar métricas.",
        }));
      }
      return;
    }

    metricsAbortRef.current?.abort();
    const controller = new AbortController();
    metricsAbortRef.current = controller;

    setViewer((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const requestCompanyPayload = requestCompanyId ? { company: requestCompanyId } : {};

      let profileOptions: MetricProfileOption[] = [];
      try {
        const profilesRes = await buildMetricProfileService().listMyEnabledProfiles({
          ...requestCompanyPayload,
          filter_filters: {
            vehicleId,
          },
        });
        const profilesData = profilesRes.getResponseData();
        const rawProfiles = extractMetricProfilesFromListResponse(profilesData);

        const parsedProfileOptions = rawProfiles
            .map((profile: any) => {
              const sourceProfile = profile?.metricProfile ?? profile?.metric_profile ?? profile;
              const profileId = sourceProfile?.id ?? profile?.id ?? null;
              const profileName = sourceProfile?.name ?? profile?.name ?? null;
              const profileImageId =
                  sourceProfile?.image?.id ??
                  sourceProfile?.imageId ??
                  sourceProfile?.image_id ??
                  profile?.image?.id ??
                  profile?.imageId ??
                  profile?.image_id ??
                  null;

              if (!profileId || !profileName) {
                return null;
              }

              return {
                value: String(profileId),
                label: String(profileName),
                imageId: profileImageId ? String(profileImageId) : null,
              } as MetricProfileOption;
            })
            .filter((profile): profile is MetricProfileOption => Boolean(profile));

        const deduplicatedProfileOptions = new Map<string, MetricProfileOption>();
        for (const profile of parsedProfileOptions) {
          const existing = deduplicatedProfileOptions.get(profile.value);
          if (!existing || (!existing.imageId && profile.imageId)) {
            deduplicatedProfileOptions.set(profile.value, profile);
          }
        }

        profileOptions = Array.from(deduplicatedProfileOptions.values());
      } catch (error) {
        console.warn("No se pudieron cargar los perfiles habilitados.", error);
      }

      let resolvedMetricProfileId = requestedMetricProfileId;
      if (profileOptions.length === 0) {
        resolvedMetricProfileId = null;
        if ((filters.filter_filters?.metricProfileId ?? null) !== null) {
          updateFilters({ metricProfileId: null });
        }
      } else {
        const profileExists = profileOptions.some((profile) => profile.value === resolvedMetricProfileId);
        if (!profileExists) {
          resolvedMetricProfileId = profileOptions[0].value;
          if (filters.filter_filters?.metricProfileId !== resolvedMetricProfileId) {
            updateFilters({ metricProfileId: resolvedMetricProfileId });
          }
        }
      }

      const payload: Record<string, any> = {
        vehicleId,
        startDate: toYmd(startDate),
        endDate: toYmd(endDate),
        ...requestCompanyPayload,
      };
      if (resolvedMetricProfileId) {
        payload.metricProfileId = resolvedMetricProfileId;
      }

      const metricsRes = await buildMetricProfileService().getVehicleMetricsData(controller.signal, payload);
      const metricsData = metricsRes.getResponseData();

      if (!metricsData?.success && metricsData?.message) {
        setViewer((prev) => ({ ...prev, loading: false, error: metricsData.message }));
        return;
      }

      const selectedProfileImageId =
          metricsData?.data?.metricProfile?.image?.id ??
          metricsData?.metricProfile?.image?.id ??
          null;
      const selectedProfileId =
          metricsData?.data?.metricProfile?.id ??
          metricsData?.metricProfile?.id ??
          null;
      if (selectedProfileId && selectedProfileImageId) {
        const selectedProfileIdAsString = String(selectedProfileId);
        const selectedProfileImageIdAsString = String(selectedProfileImageId);
        profileOptions = profileOptions.map((profileOption) => {
          if (profileOption.value !== selectedProfileIdAsString || profileOption.imageId) {
            return profileOption;
          }

          return {
            ...profileOption,
            imageId: selectedProfileImageIdAsString,
          };
        });
      }

      const rawGroups = Array.isArray(metricsData?.data?.groups) ? metricsData.data.groups : [];
      const groups: MetricDataGroup[] = rawGroups.map((groupData: any, index: number) => {
        const groupName = String(groupData?.group || "Sin grupo");
        const ecuOrionId = groupData?.ecuOrionId ?? null;
        const key = `${groupName}|${String(ecuOrionId ?? index)}`;
        return {
          key,
          name: groupName,
          ecuOrionId,
          fields: Array.isArray(groupData?.fields)
              ? groupData.fields.map((field: any) => String(field).toLowerCase())
              : [],
          metrics: Array.isArray(groupData?.metrics) ? groupData.metrics : [],
          data: Array.isArray(groupData?.data) ? groupData.data : [],
        };
      });

      const metadataMetrics = groups
          .flatMap((group) => group.metrics)
          .map((metric) => {
            const metricKey = String(metric.orionName || metric.value || metric.name || "").trim();
            if (!metricKey) return null;
            return {
              id: metric.id,
              name: metricKey,
              orion_name: metricKey,
              metadata_label: metric.metadataLabel ?? metric.name ?? metricKey,
              metadata_type: metric.metadataType ?? metric.type ?? null,
              metadata_unit: metric.metadataUnit ?? null,
            };
          })
          .filter((metric): metric is NonNullable<typeof metric> => Boolean(metric));

      setViewer({
        groups,
        metadata: buildMetadataFromModelMetrics(metadataMetrics as any[]),
        profileOptions,
        selectedProfileId: resolvedMetricProfileId,
        loading: false,
        error: null,
        emptyMessage:
            groups.length === 0
                ? metricsData?.message || "No hay métricas disponibles para este perfil y vehículo."
                : null,
      });
    } catch (error: any) {
      if (error?.name !== "AbortError") {
        setViewer((prev) => ({
          ...prev,
          loading: false,
          error: error?.message || "Error al obtener los datos de métricas.",
        }));
      }
    }
  }, [
    vehicleId,
    startDate,
    endDate,
    requestedMetricProfileId,
    filters.filter_filters?.metricProfileId,
    updateFilters,
    requestCompanyId,
    modelContext.loading,
  ]);

  useEffect(() => {
    fetchModelContext();
  }, [fetchModelContext]);

  useEffect(() => {
    if (view === "profiles-only" && !["profiles-home", "profiles", "profile-detail", "editor"].includes(mode)) {
      setMode("profiles-home");
      return;
    }

    if (view === "viewer-only" && mode !== "viewer") {
      setMode("viewer");
    }
  }, [view, mode]);

  useEffect(() => {
    if (!canViewViewer) {
      metricsAbortRef.current?.abort();
      return;
    }

    let isMounted = true;
    let intervalId: ReturnType<typeof setInterval> | undefined;

    const run = async () => {
      await fetchViewerData();
      if (reloadMetrics && mode === "viewer" && isMounted) {
        intervalId = setInterval(fetchViewerData, 10000);
      }
    };

    run();

    return () => {
      isMounted = false;
      metricsAbortRef.current?.abort();
      if (intervalId) clearInterval(intervalId);
    };
  }, [fetchViewerData, reloadMetrics, mode, canViewViewer]);

  const ecuNameByOrionId = useMemo(() => {
    const map: Record<string, string> = {};
    for (const ecu of modelContext.modelEcus) {
      if (ecu.orion_id === null || ecu.orion_id === undefined) continue;
      map[String(ecu.orion_id)] = ecu.name || `ECU ${ecu.orion_id}`;
    }
    return map;
  }, [modelContext.modelEcus]);

  const ecuImageIdByOrionId = useMemo(() => {
    const map: Record<string, string> = {};
    for (const ecu of modelContext.modelEcus) {
      if (ecu.orion_id === null || ecu.orion_id === undefined) continue;
      const imageId = ecu?.image?.id;
      if (imageId !== null && imageId !== undefined) {
        map[String(ecu.orion_id)] = String(imageId);
      }
    }
    return map;
  }, [modelContext.modelEcus]);

  const viewerEcus = useMemo<ViewerEcu[]>(() => {
    const seen = new Set<string>();
    const result: ViewerEcu[] = [];

    for (const group of viewer.groups) {
      if (group.ecuOrionId === null || group.ecuOrionId === undefined) continue;
      const key = String(group.ecuOrionId);
      if (seen.has(key)) continue;
      seen.add(key);

      const name = ecuNameByOrionId[key] || `ECU ${key}`;
      result.push({
        ecuOrionId: key,
        name,
        imageId: ecuImageIdByOrionId[key] ?? null,
        icon: resolveEcuIcon(name),
      });
    }

    result.sort((a, b) => {
      const aIndex = modelContext.modelEcus.findIndex((ecu) => String(ecu.orion_id) === a.ecuOrionId);
      const bIndex = modelContext.modelEcus.findIndex((ecu) => String(ecu.orion_id) === b.ecuOrionId);
      if (aIndex === -1 && bIndex === -1) return a.name.localeCompare(b.name);
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    });

    return result;
  }, [viewer.groups, ecuNameByOrionId, ecuImageIdByOrionId, modelContext.modelEcus]);

  const ecuSelectOptions = useMemo(
      () => viewerEcus.map((ecu) => ({ value: ecu.ecuOrionId, label: ecu.name })),
      [viewerEcus]
  );

  useEffect(() => {
    if (viewerEcus.length === 0) {
      setSelectedEcuOrionId(null);
      return;
    }
    if (!selectedEcuOrionId || !viewerEcus.some((ecu) => ecu.ecuOrionId === selectedEcuOrionId)) {
      setSelectedEcuOrionId(viewerEcus[0].ecuOrionId);
      setEcuPage(0);
      setShowEcuQuickList(false);
    }
  }, [viewerEcus, selectedEcuOrionId]);

  const currentViewerGroupContextKey = isFullMode
      ? `profile:${viewer.selectedProfileId ?? "all"}`
      : selectedEcuOrionId
          ? `ecu:${selectedEcuOrionId}`
          : null;

  const selectedViewerGroups = useMemo(() => {
    if (isFullMode) return viewer.groups;
    if (!selectedEcuOrionId) return [];
    return viewer.groups.filter((group) => String(group.ecuOrionId) === selectedEcuOrionId);
  }, [viewer.groups, selectedEcuOrionId, isFullMode]);

  const selectedViewerGroupIndex = useMemo(() => {
    if (!currentViewerGroupContextKey) return 0;
    return groupIndexByEcu[currentViewerGroupContextKey] ?? 0;
  }, [groupIndexByEcu, currentViewerGroupContextKey]);

  useEffect(() => {
    if (!currentViewerGroupContextKey) return;
    const maxIndex = Math.max(0, selectedViewerGroups.length - 1);
    if (selectedViewerGroupIndex > maxIndex) {
      setGroupIndexByEcu((prev) => ({ ...prev, [currentViewerGroupContextKey]: 0 }));
    }
  }, [currentViewerGroupContextKey, selectedViewerGroups.length, selectedViewerGroupIndex]);

  const currentGroup = selectedViewerGroups[selectedViewerGroupIndex];
  const currentGroupData = currentGroup?.data ?? [];
  const currentPgn = currentGroupData[0]?.["pgn"] ?? currentGroupData[0]?.["PGN"] ?? null;
  const currentGroupEcuName =
      currentGroup?.ecuOrionId !== null && currentGroup?.ecuOrionId !== undefined
          ? ecuNameByOrionId[String(currentGroup.ecuOrionId)] || `ECU ${currentGroup.ecuOrionId}`
          : null;

  const RESERVED_KEYS = useMemo(
      () => new Set(["time_index", "pgn", "viun", "entity_id", "entity_type", "instanceid", "refecu"]),
      []
  );

  const numericKeys = useMemo(() => {
    if (!currentGroup) return [];

    const fields = (currentGroup.fields || []).filter((key) => {
      const normalized = key.toLowerCase();
      if (RESERVED_KEYS.has(normalized)) return false;
      return true;
    });
    if (fields.length > 0) return fields;
    if (!currentGroupData.length) return [];

    const first = currentGroupData[0];
    const hasNumericInAnyRow = (key: string) =>
        currentGroupData.some((row: any) => {
          const value = row?.[key];
          return typeof value === "number" || (typeof value === "string" && value !== "" && !isNaN(Number(value)));
        });

    return Object.keys(first).filter((key) => {
      const normalized = key.toLowerCase();
      if (RESERVED_KEYS.has(normalized)) return false;
      return hasNumericInAnyRow(key);
    });
  }, [currentGroup, currentGroupData, RESERVED_KEYS]);

  const viewerProfileTiles = useMemo(() => {
    const custom = canManageProfiles
        ? [
          {
            type: "customize" as const,
            key: "customize",
            title: "PERSONALIZAR",
            icon: ECU_ICON_BY_KEY.PERSONALIZAR.active,
            profileId: null as string | null,
          },
        ]
        : [];

    const profiles = viewer.profileOptions.map((profile) => ({
      type: "profile" as const,
      key: `profile-${profile.value}`,
      title: profile.label,
      icon: ECU_ICON_BY_KEY.PERSONALIZAR.active,
      profileId: profile.value,
      profileImageId: profile.imageId ?? null,
    }));

    return [...custom, ...profiles];
  }, [viewer.profileOptions, canManageProfiles]);

  const viewerTilePageSize = 6;
  const viewerPageCount = Math.max(1, Math.ceil(viewerProfileTiles.length / viewerTilePageSize));
  const currentViewerTiles = useMemo(() => {
    const start = ecuPage * viewerTilePageSize;
    return viewerProfileTiles.slice(start, start + viewerTilePageSize);
  }, [viewerProfileTiles, ecuPage]);

  useEffect(() => {
    if (ecuPage >= viewerPageCount) {
      setEcuPage(0);
    }
  }, [ecuPage, viewerPageCount]);

  const handlePrevGroup = () => {
    if (!currentViewerGroupContextKey) return;
    setGroupIndexByEcu((prev) => ({
      ...prev,
      [currentViewerGroupContextKey]: Math.max(0, (prev[currentViewerGroupContextKey] ?? 0) - 1),
    }));
  };

  const handleNextGroup = () => {
    if (!currentViewerGroupContextKey) return;
    setGroupIndexByEcu((prev) => ({
      ...prev,
      [currentViewerGroupContextKey]: Math.min(selectedViewerGroups.length - 1, (prev[currentViewerGroupContextKey] ?? 0) + 1),
    }));
  };

  const sortEcuIdsByModel = useCallback((ecuIds: string[]): string[] => {
    return [...ecuIds].sort((a: string, b: string) => {
      const aIndex = modelContext.modelEcus.findIndex((ecu) => String(ecu.orion_id) === a);
      const bIndex = modelContext.modelEcus.findIndex((ecu) => String(ecu.orion_id) === b);
      if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    });
  }, [modelContext.modelEcus]);

  const loadProfilesForManager = useCallback(async () => {
    setProfilesLoading(true);
    setProfilesError(null);
    try {
      if (!requestCompanyId) {
        setProfilesLoading(false);
        setProfilesError("No se pudo resolver la compañía del vehículo.");
        return;
      }

      if (!vehicleId) {
        setProfilesLoading(false);
        setProfilesError("No se ha seleccionado un vehículo.");
        return;
      }

      const profilesResponse = await buildMetricProfileService().listMetricProfiles({
        company: requestCompanyId,
        page: 1,
        limit: 9999,
        filter_filters: {
          vehicleId,
        },
      });

      const profilesData = profilesResponse.getResponseData();
      if (!profilesData?.success && profilesData?.message) {
        setProfilesLoading(false);
        setProfilesError(profilesData.message);
        return;
      }

      const rawProfiles = extractMetricProfilesFromListResponse(profilesData);

      const uniqueProfiles = Array.from(
          rawProfiles.reduce((acc: Map<string, any>, profile: any) => {
            if (profile?.id) {
              acc.set(String(profile.id), profile);
            }
            return acc;
          }, new Map<string, any>())
              .values()
      );

      const parsedProfiles: MetricProfileSummary[] = uniqueProfiles
          .map((profile: any) => ({
            id: String(profile.id),
            name: String(profile.name),
            description: profile.description ?? null,
            image: profile?.image?.id
                ? {
                  id: String(profile.image.id),
                  originalName: profile.image.originalName ?? null,
                  extension: profile.image.extension ?? null,
                  fileName: profile.image.fileName ?? null,
                  subdirectory: profile.image.subdirectory ?? null,
                }
                : null,
            isActive: profile.isActive ?? true,
            companyId: profile?.company?.id ? String(profile.company.id) : requestCompanyId,
            vehicleId: profile?.vehicle?.id ? String(profile.vehicle.id) : vehicleId,
          }))
          .sort((a, b) => a.name.localeCompare(b.name, "es", { sensitivity: "base" }));
      setProfiles(parsedProfiles);

      const profileById = uniqueProfiles.reduce((acc: Record<string, any>, profile: any) => {
        acc[String(profile.id)] = profile;
        return acc;
      }, {});

      const ecuMap: Record<string, string[]> = {};
      for (const profile of parsedProfiles) {
        const rawProfile = profileById[profile.id];
        ecuMap[profile.id] = sortEcuIdsByModel(extractEcuIdsFromProfileMetrics(rawProfile));
      }

      setProfileEcusMap(ecuMap);
      setProfilesLoading(false);
    } catch (error: any) {
      setProfilesLoading(false);
      setProfilesError(error?.message || "Error al obtener perfiles.");
    }
  }, [requestCompanyId, vehicleId, sortEcuIdsByModel]);

  useEffect(() => {
    if (mode === "profiles-home" || mode === "profiles" || mode === "profile-detail") {
      loadProfilesForManager();
    }
  }, [mode, loadProfilesForManager]);

  useEffect(() => {
    if (mode !== "editor") {
      setProfileUserOptions([]);
      setProfileUsersLoading(false);
      setProfileUsersError(null);
      return;
    }

    const companyIdForUsers = editorCompanyId ?? requestCompanyId;
    if (!companyIdForUsers) {
      setProfileUserOptions([]);
      setProfileUsersLoading(false);
      setProfileUsersError("No se pudo resolver la compañía del perfil.");
      return;
    }

    let isMounted = true;
    const fetchUsersForEditor = async () => {
      setProfileUsersLoading(true);
      setProfileUsersError(null);
      try {
        const usersResponse = await buildUserService().listUsers({
          page: 1,
          limit: 9999,
          filter_filters: {
            active: true,
            company: companyIdForUsers,
            companyId: companyIdForUsers,
          },
        });
        const usersData = usersResponse.getResponseData();
        if (!usersData?.success && usersData?.message) {
          if (!isMounted) return;
          setProfileUsersLoading(false);
          setProfileUsersError(usersData.message);
          setProfileUserOptions([]);
          return;
        }

        const rawUsers = extractUsersFromListResponse(usersData);

        const uniqueUsers = new Map<string, UserOption>();
        for (const rawUser of rawUsers) {
          if (!userBelongsToCompany(rawUser, companyIdForUsers)) continue;
          const userId = resolveUserId(rawUser);
          if (!userId) continue;

          const name = String(rawUser?.name ?? "").trim();
          const lastName = String(rawUser?.lastName ?? "").trim();
          const email = String(rawUser?.email ?? "").trim();
          const fullName = `${name} ${lastName}`.trim();
          const label = fullName && email ? `${fullName} - ${email}` : fullName || email || `Usuario ${userId}`;

          if (!uniqueUsers.has(userId)) {
            uniqueUsers.set(userId, {
              value: userId,
              label,
            });
          }
        }

        const userOptions = Array.from(uniqueUsers.values()).sort((a, b) =>
            a.label.localeCompare(b.label, "es", { sensitivity: "base" })
        );

        if (!isMounted) return;
        setProfileUserOptions(userOptions);
        setEditor((prev) => {
          if (!prev) return prev;
          const validUserIds = new Set(userOptions.map((user) => user.value));
          const filteredUserIds = prev.selectedUserIds.filter((userId) => validUserIds.has(userId));
          if (filteredUserIds.length === prev.selectedUserIds.length) return prev;
          return { ...prev, selectedUserIds: filteredUserIds };
        });
        setProfileUsersLoading(false);
      } catch (error: any) {
        if (!isMounted) return;
        setProfileUsersLoading(false);
        setProfileUsersError(error?.message || "No se pudieron cargar los usuarios.");
        setProfileUserOptions([]);
      }
    };

    fetchUsersForEditor();

    return () => {
      isMounted = false;
    };
  }, [mode, editorCompanyId, requestCompanyId]);

  const editorEcus = useMemo<EditorEcu[]>(() => {
    const metrics = modelContext.modelMetrics;
    const ecuNameMap = ecuNameByOrionId;

    const groupsByEcu: Record<string, Record<string, EditorGroup>> = {};

    for (const metric of metrics) {
      const ecuOrionId = metric.group_ecu_orion_id;
      if (ecuOrionId === null || ecuOrionId === undefined) continue;

      const ecuKey = String(ecuOrionId);
      const groupId = String(metric.group_id ?? `${metric.group_name}-${metric.group_orion_id ?? ""}`);

      if (!groupsByEcu[ecuKey]) groupsByEcu[ecuKey] = {};
      if (!groupsByEcu[ecuKey][groupId]) {
        groupsByEcu[ecuKey][groupId] = {
          id: groupId,
          name: metric.group_name || "Grupo",
          orionId: metric.group_orion_id ?? null,
          metrics: [],
        };
      }

      groupsByEcu[ecuKey][groupId].metrics.push(metric);
    }

    const ecuKeys = Object.keys(groupsByEcu);
    const data: EditorEcu[] = ecuKeys.map((ecuKey) => {
      const name = ecuNameMap[ecuKey] || `ECU ${ecuKey}`;
      const groups = Object.values(groupsByEcu[ecuKey]).sort((a, b) => a.name.localeCompare(b.name));

      return {
        ecuOrionId: ecuKey,
        name,
        imageId: ecuImageIdByOrionId[ecuKey] ?? null,
        icon: resolveEcuIcon(name),
        groups,
      };
    });

    data.sort((a, b) => {
      const aIndex = modelContext.modelEcus.findIndex((ecu) => String(ecu.orion_id) === a.ecuOrionId);
      const bIndex = modelContext.modelEcus.findIndex((ecu) => String(ecu.orion_id) === b.ecuOrionId);
      if (aIndex === -1 && bIndex === -1) return a.name.localeCompare(b.name);
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    });

    return data;
  }, [modelContext.modelMetrics, modelContext.modelEcus, ecuNameByOrionId, ecuImageIdByOrionId]);

  const editorMetricById = useMemo(() => {
    const map: Record<string, ModelMetric> = {};
    for (const metric of modelContext.modelMetrics) {
      map[metric.id] = metric;
    }
    return map;
  }, [modelContext.modelMetrics]);

  const startCreateProfile = (initialEcuOrionId?: string | null) => {
    if (modelContext.modelMetrics.length === 0) {
      toast.error("No hay métricas disponibles en el modelo del vehículo.");
      return;
    }

    if (!vehicleId) {
      toast.error("No se ha seleccionado un vehículo.");
      return;
    }

    if (!requestCompanyId) {
      toast.error("No se pudo resolver la compañía del vehículo.");
      return;
    }

    const firstEcu = editorEcus[0]?.ecuOrionId ?? null;

    setEditor({
      metricProfileId: null,
      companyId: requestCompanyId,
      vehicleId: String(vehicleId),
      selectedUserIds: currentUserId ? [String(currentUserId)] : [],
      name: "",
      description: "",
      selectedMetricIds: [],
      image: null,
      imageFile: null,
      imagePreviewUrl: null,
      removeCurrentImage: false,
      activeEcuOrionId: initialEcuOrionId ?? firstEcu,
      loading: false,
      saving: false,
    });
    setEditorMetricSearch("");
    setMode("editor");
  };

  const startEditProfile = async (profileId: string) => {
    if (!vehicleId) {
      toast.error("No se ha seleccionado un vehículo.");
      return;
    }

    if (!requestCompanyId) {
      toast.error("No se pudo resolver la compañía del vehículo.");
      return;
    }

    setEditor({
      metricProfileId: profileId,
      companyId: requestCompanyId,
      vehicleId: String(vehicleId),
      selectedUserIds: [],
      name: "",
      description: "",
      selectedMetricIds: [],
      image: null,
      imageFile: null,
      imagePreviewUrl: null,
      removeCurrentImage: false,
      activeEcuOrionId: editorEcus[0]?.ecuOrionId ?? null,
      loading: true,
      saving: false,
    });
    setEditorMetricSearch("");
    setMode("editor");

    try {
      const response = await buildMetricProfileService().getMetricProfile(profileId, requestCompanyId, vehicleId);
      const responseData = response.getResponseData();
      if (!responseData?.success && responseData?.message) {
        toast.error(responseData.message);
        setEditor((prev) => (prev ? { ...prev, loading: false } : prev));
        return;
      }

      const profile = responseData?.data ?? {};
      const metrics = Array.isArray(profile?.metrics) ? profile.metrics : [];
      const selectedMetricIds = metrics
          .map((metric: any) => String(metric.id))
          .filter((metricId: string) => Boolean(editorMetricById[metricId]));

      const firstMetric = selectedMetricIds[0] ? editorMetricById[selectedMetricIds[0]] : null;
      const firstEcuOrionId =
          firstMetric?.group_ecu_orion_id !== null && firstMetric?.group_ecu_orion_id !== undefined
              ? String(firstMetric.group_ecu_orion_id)
              : editorEcus[0]?.ecuOrionId ?? null;
      const profileCompanyId = profile?.company?.id
          ? String(profile.company.id)
          : requestCompanyId;
      const profileVehicleId = profile?.vehicle?.id
          ? String(profile.vehicle.id)
          : vehicleId
              ? String(vehicleId)
              : null;
      let selectedUserIds = Array.isArray(profile?.users)
          ? profile.users
              .map((user: any) => resolveUserId(user))
              .filter((userId: string | null): userId is string => Boolean(userId))
          : [];

      if (selectedUserIds.length === 0) {
        try {
          const enabledUsersResponse = await buildMetricProfileService().listEnabledUsers(profileId, profileCompanyId);
          const enabledUsersData = enabledUsersResponse.getResponseData();
          const enabledUsers = Array.isArray(enabledUsersData?.data?.users)
              ? enabledUsersData.data.users
              : Array.isArray(enabledUsersData?.users)
                  ? enabledUsersData.users
                  : Array.isArray(enabledUsersData?.data)
                      ? enabledUsersData.data
                      : [];

          selectedUserIds = enabledUsers
              .map((user: any) => resolveUserId(user))
              .filter((userId: string | null): userId is string => Boolean(userId));
        } catch (_error) {
          selectedUserIds = [];
        }
      }

      setEditor({
        metricProfileId: profileId,
        companyId: profileCompanyId,
        vehicleId: profileVehicleId,
        selectedUserIds: Array.from(new Set(selectedUserIds)),
        name: profile?.name || "",
        description: profile?.description || "",
        selectedMetricIds,
        image: profile?.image?.id
            ? {
              id: String(profile.image.id),
              originalName: profile.image.originalName ?? null,
              extension: profile.image.extension ?? null,
              fileName: profile.image.fileName ?? null,
              subdirectory: profile.image.subdirectory ?? null,
            }
            : null,
        imageFile: null,
        imagePreviewUrl: null,
        removeCurrentImage: false,
        activeEcuOrionId: firstEcuOrionId,
        loading: false,
        saving: false,
      });
    } catch (error: any) {
      toast.error(error?.message || "No se pudo cargar el perfil.");
      setEditor((prev) => (prev ? { ...prev, loading: false } : prev));
    }
  };

  const handleDeleteProfile = async (profileId: string) => {
    if (!window.confirm("¿Quieres eliminar este perfil de métricas?")) return;

    try {
      const response = await buildMetricProfileService().deleteMetricProfile(profileId);
      const responseData = response.getResponseData();
      if (!responseData?.success) {
        toast.error(responseData?.message || "No se pudo eliminar el perfil.");
        return;
      }

      toast.success("Perfil eliminado correctamente.");
      if ((requestedMetricProfileId ?? viewer.selectedProfileId) === profileId) {
        updateFilters({ metricProfileId: null });
      }
      const refreshTasks = [loadProfilesForManager()];
      if (canViewViewer) {
        refreshTasks.push(fetchViewerData());
      }
      await Promise.all(refreshTasks);
    } catch (error: any) {
      toast.error(error?.message || "No se pudo eliminar el perfil.");
    }
  };

  const selectedMetricSet = useMemo(
      () => new Set(editor?.selectedMetricIds ?? []),
      [editor?.selectedMetricIds]
  );

  useEffect(() => {
    if (mode !== "editor") return;

    const activeEcuOrionId = editor?.activeEcuOrionId ?? null;
    const activeEcuExists = activeEcuOrionId
        ? editorEcus.some((ecu) => ecu.ecuOrionId === activeEcuOrionId)
        : false;

    if (activeEcuExists) return;

    const nextActiveEcuOrionId = editorEcus[0]?.ecuOrionId ?? null;
    if (activeEcuOrionId === nextActiveEcuOrionId) return;

    setEditor((prev) =>
        prev
            ? {
              ...prev,
              activeEcuOrionId: nextActiveEcuOrionId,
            }
            : prev
    );
  }, [mode, editor?.activeEcuOrionId, editorEcus]);

  const activeEditorEcu = useMemo(() => {
    if (!editor?.activeEcuOrionId) return null;
    return editorEcus.find((ecu) => ecu.ecuOrionId === editor.activeEcuOrionId) || null;
  }, [editor?.activeEcuOrionId, editorEcus]);

  useEffect(() => {
    const previewUrl = editor?.imagePreviewUrl ?? null;
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [editor?.imagePreviewUrl]);

  const handleProfileImageSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setEditor((prev) => {
      if (!prev) return prev;

      if (prev.imagePreviewUrl) {
        URL.revokeObjectURL(prev.imagePreviewUrl);
      }

      return {
        ...prev,
        imageFile: file,
        imagePreviewUrl: URL.createObjectURL(file),
        removeCurrentImage: false,
      };
    });

    event.target.value = "";
  };

  const clearProfileImageSelection = () => {
    setEditor((prev) => {
      if (!prev) return prev;
      if (prev.imagePreviewUrl) {
        URL.revokeObjectURL(prev.imagePreviewUrl);
      }

      return {
        ...prev,
        imageFile: null,
        imagePreviewUrl: null,
        removeCurrentImage: prev.image ? true : false,
      };
    });
  };

  const setActiveEcuForEditor = (ecuOrionId: string) => {
    setEditor((prev) =>
        prev
            ? {
              ...prev,
              activeEcuOrionId: ecuOrionId,
            }
            : prev
    );
  };

  const toggleEcuForEditor = (ecuOrionId: string) => {
    if (!editor) return;
    const ecu = editorEcus.find((item) => item.ecuOrionId === ecuOrionId);
    if (!ecu) return;

    const ecuMetricIds = ecu.groups.flatMap((group) => group.metrics.map((metric) => metric.id));
    const allSelected = ecuMetricIds.every((metricId) => selectedMetricSet.has(metricId));

    if (allSelected) {
      setEditor((prev) =>
          prev
              ? {
                ...prev,
                selectedMetricIds: prev.selectedMetricIds.filter((metricId) => !ecuMetricIds.includes(metricId)),
              }
              : prev
      );
    } else {
      setEditor((prev) =>
          prev
              ? {
                ...prev,
                selectedMetricIds: Array.from(new Set([...prev.selectedMetricIds, ...ecuMetricIds])),
                activeEcuOrionId: ecuOrionId,
              }
              : prev
      );
    }
  };

  const toggleGroupForEditor = (group: EditorGroup) => {
    if (!editor) return;
    const groupMetricIds = group.metrics.map((metric) => metric.id);
    const allSelected = groupMetricIds.every((metricId) => selectedMetricSet.has(metricId));

    if (allSelected) {
      setEditor((prev) =>
          prev
              ? {
                ...prev,
                selectedMetricIds: prev.selectedMetricIds.filter((metricId) => !groupMetricIds.includes(metricId)),
              }
              : prev
      );
      return;
    }

    setEditor((prev) =>
        prev
            ? {
              ...prev,
              selectedMetricIds: Array.from(new Set([...prev.selectedMetricIds, ...groupMetricIds])),
            }
            : prev
    );
  };

  const toggleMetricForEditor = (metricId: string) => {
    if (!editor) return;
    if (selectedMetricSet.has(metricId)) {
      setEditor((prev) =>
          prev
              ? {
                ...prev,
                selectedMetricIds: prev.selectedMetricIds.filter((id) => id !== metricId),
              }
              : prev
      );
    } else {
      setEditor((prev) =>
          prev
              ? {
                ...prev,
                selectedMetricIds: Array.from(new Set([...prev.selectedMetricIds, metricId])),
              }
              : prev
      );
    }
  };

  const selectAllEditorMetrics = () => {
    if (!editor) return;
    setEditor((prev) =>
        prev
            ? {
              ...prev,
              selectedMetricIds: modelContext.modelMetrics.map((metric) => metric.id),
            }
            : prev
    );
  };

  const clearAllEditorMetrics = () => {
    if (!editor) return;
    setEditor((prev) =>
        prev
            ? {
              ...prev,
              selectedMetricIds: [],
            }
            : prev
    );
  };

  const saveProfile = async () => {
    if (!editor) return;
    const companyIdForRequest = editor.companyId ?? requestCompanyId;
    const vehicleIdForRequest = editor.vehicleId ?? (vehicleId ? String(vehicleId) : null);

    if (!companyIdForRequest) {
      toast.error("No se pudo resolver la compañía del perfil.");
      return;
    }

    if (!vehicleIdForRequest) {
      toast.error("No se pudo resolver el vehículo del perfil.");
      return;
    }

    const profileName = editor.name.trim();
    if (!profileName) {
      toast.error("El nombre del perfil es obligatorio.");
      return;
    }

    setEditor((prev) => (prev ? { ...prev, saving: true } : prev));
    try {
      let responseData: any;
      let metricProfileId = editor.metricProfileId;
      if (editor.metricProfileId) {
        const response = await buildMetricProfileService().editMetricProfile({
          metricProfileId: editor.metricProfileId,
          company: companyIdForRequest,
          vehicleId: vehicleIdForRequest,
          name: profileName,
          description: editor.description || null,
          metrics: editor.selectedMetricIds,
        });
        responseData = response.getResponseData();
        if (responseData?.success) {
          const syncUsersResponse = await buildMetricProfileService().syncMetricProfileUsers({
            metricProfileId: editor.metricProfileId,
            company: companyIdForRequest,
            usersIds: editor.selectedUserIds,
          });
          const syncUsersData = syncUsersResponse.getResponseData();
          if (!syncUsersData?.success) {
            toast.error(syncUsersData?.message || "No se pudieron vincular los usuarios al perfil.");
            setEditor((prev) => (prev ? { ...prev, saving: false } : prev));
            return;
          }
        }
      } else {
        const response = await buildMetricProfileService().createMetricProfile({
          company: companyIdForRequest,
          vehicleId: vehicleIdForRequest,
          name: profileName,
          description: editor.description || null,
          metrics: editor.selectedMetricIds,
          usersIds: editor.selectedUserIds,
        });
        responseData = response.getResponseData();
        metricProfileId = responseData?.data?.metricProfileId
            ? String(responseData.data.metricProfileId)
            : null;
      }

      if (!responseData?.success) {
        toast.error(responseData?.message || "No se pudo guardar el perfil.");
        setEditor((prev) => (prev ? { ...prev, saving: false } : prev));
        return;
      }

      if (!metricProfileId) {
        toast.error("No se pudo resolver el identificador del perfil tras guardar.");
        setEditor((prev) => (prev ? { ...prev, saving: false } : prev));
        return;
      }

      if (editor.imageFile) {
        const imageResponse = await buildMetricProfileService().addMetricProfileImage(metricProfileId, editor.imageFile);
        const imageResponseData = imageResponse.getResponseData();
        if (!imageResponseData?.success) {
          toast.error(imageResponseData?.message || "No se pudo guardar la imagen del perfil.");
          setEditor((prev) => (prev ? { ...prev, saving: false } : prev));
          return;
        }
      } else if (editor.removeCurrentImage) {
        const deleteImageResponse = await buildMetricProfileService().deleteMetricProfileImage(metricProfileId);
        const deleteImageData = deleteImageResponse.getResponseData();
        if (!deleteImageData?.success) {
          toast.error(deleteImageData?.message || "No se pudo eliminar la imagen del perfil.");
          setEditor((prev) => (prev ? { ...prev, saving: false } : prev));
          return;
        }
      }

      toast.success(editor.metricProfileId ? "Perfil actualizado correctamente." : "Perfil creado correctamente.");
      setEditor(null);
      setMode("profiles");
      const refreshTasks = [loadProfilesForManager()];
      if (canViewViewer) {
        refreshTasks.push(fetchViewerData());
      }
      await Promise.all(refreshTasks);
    } catch (error: any) {
      toast.error(error?.message || "No se pudo guardar el perfil.");
      setEditor((prev) => (prev ? { ...prev, saving: false } : prev));
    }
  };

  const filteredProfiles = useMemo(() => {
    const query = normalizeText(profileSearch);
    if (!query) return profiles;
    return profiles.filter((profile) => normalizeText(profile.name).includes(query));
  }, [profiles, profileSearch]);

  const profilesHomeTiles = useMemo(() => {
    const customizationTile = {
      type: "customize" as const,
      key: "customize",
      title: "PERSONALIZAR",
      icon: ECU_ICON_BY_KEY.PERSONALIZAR.active,
      profileId: null as string | null,
    };

    const profileTiles = profiles.map((profile) => {
      return {
        type: "profile" as const,
        key: `profile-${profile.id}`,
        title: profile.name.toUpperCase(),
        icon: ECU_ICON_BY_KEY.PERSONALIZAR.active,
        profileId: profile.id,
        profileImageId: profile.image?.id ? String(profile.image.id) : null,
      };
    });

    return [customizationTile, ...profileTiles];
  }, [profiles]);

  const profilesHomePageSize = 6;
  const profilesHomePageCount = Math.max(1, Math.ceil(profilesHomeTiles.length / profilesHomePageSize));
  const currentProfilesHomeTiles = useMemo(() => {
    const start = profileHomePage * profilesHomePageSize;
    return profilesHomeTiles.slice(start, start + profilesHomePageSize);
  }, [profileHomePage, profilesHomeTiles]);

  useEffect(() => {
    if (profileHomePage >= profilesHomePageCount) {
      setProfileHomePage(0);
    }
  }, [profileHomePage, profilesHomePageCount]);

  useEffect(() => {
    if (profileDetail.ecuIds.length === 0) {
      setProfileDetailSelectedEcuId(null);
      return;
    }

    if (!profileDetailSelectedEcuId || !profileDetail.ecuIds.includes(profileDetailSelectedEcuId)) {
      setProfileDetailSelectedEcuId(profileDetail.ecuIds[0]);
    }
  }, [profileDetail.ecuIds, profileDetailSelectedEcuId]);

  const openProfileDetail = async (profileId: string) => {
    const profileSummary = profiles.find((profile) => profile.id === profileId) || null;
    setMode("profile-detail");
    setProfileDetailSelectedEcuId(null);
    setProfileDetail({
      profile: profileSummary,
      ecuIds: [],
      ecuDetails: [],
      loading: true,
      error: null,
    });

    try {
      const detailResponse = await buildMetricProfileService().getMetricProfile(
          profileId,
          requestCompanyId,
          vehicleId,
          true
      );
      const detailData = detailResponse.getResponseData();
      if (!detailData?.success && detailData?.message) {
        setProfileDetail({
          profile: profileSummary,
          ecuIds: [],
          ecuDetails: [],
          loading: false,
          error: detailData.message,
        });
        return;
      }

      const profileData = detailData?.data ?? {};
      const profileMetrics = Array.isArray(profileData?.metrics) ? profileData.metrics : [];
      const { ecuIds, ecuDetails } = buildProfileDetailEcus({
        profileMetrics,
        modelEcus: modelContext.modelEcus,
        ecuNameByOrionId,
        ecuImageIdByOrionId,
      });

      setProfileDetail({
        profile: {
          id: String(profileData?.id || profileId),
          name: String(profileData?.name || profileSummary?.name || "Perfil"),
          description: profileData?.description ?? profileSummary?.description ?? null,
          image: profileData?.image?.id
              ? {
                id: String(profileData.image.id),
                originalName: profileData.image.originalName ?? null,
                extension: profileData.image.extension ?? null,
                fileName: profileData.image.fileName ?? null,
                subdirectory: profileData.image.subdirectory ?? null,
              }
              : (profileSummary?.image ?? null),
          isActive: profileData?.isActive ?? profileSummary?.isActive ?? true,
          companyId: profileData?.company?.id ? String(profileData.company.id) : requestCompanyId,
          vehicleId: profileData?.vehicle?.id ? String(profileData.vehicle.id) : (vehicleId ? String(vehicleId) : null),
        },
        ecuIds,
        ecuDetails,
        loading: false,
        error: null,
      });
    } catch (error: any) {
      setProfileDetail({
        profile: profileSummary,
        ecuIds: [],
        ecuDetails: [],
        loading: false,
        error: error?.message || "No se pudo obtener el detalle del perfil.",
      });
    }
  };

  const filteredActiveEcuGroups = useMemo(() => {
    if (!activeEditorEcu) return [];
    const query = normalizeText(editorMetricSearch);
    if (!query) return activeEditorEcu.groups;

    return activeEditorEcu.groups
        .map((group) => ({
          ...group,
          metrics: group.metrics.filter((metric) => {
            const label = `${metric.metadata_label || metric.name || ""} ${metric.name || ""} ${metric.orion_name || ""}`;
            return normalizeText(label).includes(query);
          }),
        }))
        .filter((group) => group.metrics.length > 0);
  }, [activeEditorEcu, editorMetricSearch]);

  const renderComparisonFloatingList = () => {
    if (mode !== "viewer" || items.length === 0) return null;
    return (
        <div className="fixed top-24 right-6 z-40 bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-xs max-h-[300px] overflow-auto">
          <p className="text-sm font-semibold text-gray-700 mb-2">Gráficas para comparar</p>
          <ul className="space-y-1 mb-3">
            {items.map((item) => (
                <li key={item.dataKey} className="flex items-center gap-2">
                  <input
                      type="checkbox"
                      checked={item.enabled}
                      onChange={(e) => setEnabled(item.dataKey, e.target.checked)}
                      className="rounded"
                  />
                  <span className="text-sm text-gray-600 truncate flex-1">{item.title}</span>
                </li>
            ))}
          </ul>
          <div className="flex gap-2">
            <button
                type="button"
                onClick={() => setShowComparison(true)}
                disabled={items.filter((item) => item.enabled).length < 2}
                className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Ver comparación
            </button>
            <button
                type="button"
                onClick={() => items.forEach((item) => remove(item.dataKey))}
                className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Limpiar
            </button>
          </div>
        </div>
    );
  };

  const renderViewer = () => {
    if (modelContext.loading || viewer.loading) {
      return <div className="flex items-center justify-center text-gray-500 h-[70vh]">Cargando métricas...</div>;
    }

    if (modelContext.error) {
      return <div className="flex items-center justify-center text-gray-500 h-[70vh]">{modelContext.error}</div>;
    }

    if (viewer.error) {
      return <div className="flex items-center justify-center text-gray-500 h-[70vh]">{viewer.error}</div>;
    }

    return (
        <div className="pt-4 relative">
          <div className="flex flex-col lg:flex-row lg:items-end gap-3 mb-4">
            {isViewerOnlyMode && (
                <div className="w-full lg:max-w-sm">
                  <CustomSelect
                      id="metricProfileId"
                      label="Perfil de métricas"
                      isSearchable
                      isClearable={false}
                      isDisabled={viewer.profileOptions.length === 0}
                      options={profileSelectOptions}
                      value={profileSelectOptions.find((option) => option.value === viewer.selectedProfileId) || null}
                      placeholder="perfil de métricas"
                      noOption={() => "No hay perfiles habilitados"}
                      onChange={(selected: any) => {
                        const nextProfileId = selected?.value ?? null;
                        if ((filters.filter_filters?.metricProfileId ?? null) !== nextProfileId) {
                          updateFilters({ metricProfileId: nextProfileId });
                        }
                      }}
                  />
                  {viewer.profileOptions.length === 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        Sin perfiles asignados: se muestran todas las métricas del vehículo.
                      </p>
                  )}
                </div>
            )}
            <div className="flex items-center gap-2">
              {canManageProfiles && (
                  <button
                      type="button"
                      onClick={() => setMode("profiles")}
                      className="px-3 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-100 text-sm font-semibold text-gray-700"
                  >
                    Gestionar perfiles
                  </button>
              )}
            </div>
          </div>

          {!isViewerOnlyMode && (
              <div className="bg-[#edf1f8] border border-[#d7deeb] rounded-xl p-4 mb-6">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <button
                      type="button"
                      onClick={() => setEcuPage((prev) => Math.max(0, prev - 1))}
                      disabled={ecuPage === 0}
                      className="w-9 h-9 rounded-full border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="text-xl leading-none">‹</span>
                  </button>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 flex-1">
                    {currentViewerTiles.map((tile, index) => {
                      if (tile.type === "customize") {
                        return (
                            <button
                                key={`custom-${index}`}
                                type="button"
                                onClick={() => setMode("profiles")}
                                className="rounded-xl min-h-[145px] bg-[#b8c6e8] border border-[#b8c6e8] p-4 text-center hover:shadow-md transition"
                            >
                              <p className="font-bold text-gray-800 text-sm mb-3">PERSONALIZAR</p>
                              <img src={tile.icon} alt="Personalizar" className="h-16 mx-auto object-contain" />
                            </button>
                        );
                      }

                      const selected = tile.profileId === viewer.selectedProfileId;
                      return (
                          <button
                              key={tile.key}
                              type="button"
                              onClick={() => {
                                if ((filters.filter_filters?.metricProfileId ?? null) !== tile.profileId) {
                                  updateFilters({ metricProfileId: tile.profileId });
                                }
                                setShowEcuQuickList(false);
                              }}
                              className={`rounded-xl min-h-[145px] p-4 text-center border transition ${
                                  selected
                                      ? "bg-[#b8c6e8] border-[#b8c6e8] shadow-sm"
                                      : "bg-[#c8ced8] border-[#c8ced8] hover:bg-[#bec5d0]"
                              }`}
                          >
                            <p className="font-bold text-gray-800 text-sm mb-3">{tile.title.toUpperCase()}</p>
                            {tile.profileImageId ? (
                                <div className="h-16 w-16 mx-auto rounded-lg border border-gray-300 bg-white overflow-hidden">
                                  <AsyncImg id={tile.profileImageId} className="h-full w-full object-cover" />
                                </div>
                            ) : (
                                <img
                                    src={tile.icon}
                                    alt={tile.title}
                                    className="h-16 mx-auto object-contain"
                                />
                            )}
                          </button>
                      );
                    })}
                  </div>

                  <button
                      type="button"
                      onClick={() => setEcuPage((prev) => Math.min(viewerPageCount - 1, prev + 1))}
                      disabled={ecuPage >= viewerPageCount - 1}
                      className="w-9 h-9 rounded-full border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="text-xl leading-none">›</span>
                  </button>
                </div>

                {viewerPageCount > 1 && (
                    <div className="flex justify-center items-center gap-1">
                      {Array.from({ length: viewerPageCount }).map((_, idx) => (
                          <button
                              key={`dot-${idx}`}
                              type="button"
                              onClick={() => setEcuPage(idx)}
                              className={`w-2.5 h-2.5 rounded-full ${idx === ecuPage ? "bg-gray-700" : "bg-gray-300"}`}
                              aria-label={`Página ${idx + 1}`}
                          />
                      ))}
                    </div>
                )}
              </div>
          )}

          {viewer.groups.length === 0 ? (
              <div className="flex items-center justify-center text-gray-500 py-12">
                {viewer.emptyMessage || "No hay métricas disponibles para visualizar."}
              </div>
          ) : (
              <>
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-4">
                  {isViewerOnlyMode ? (
                      <div className="w-full lg:max-w-sm">
                        <CustomSelect
                            id="viewerEcuId"
                            label="ECU"
                            isSearchable
                            isClearable={false}
                            isDisabled={ecuSelectOptions.length === 0}
                            options={ecuSelectOptions}
                            value={ecuSelectOptions.find((option) => option.value === selectedEcuOrionId) || null}
                            placeholder="ECU"
                            noOption={() => "No hay ECUs disponibles"}
                            onChange={(selected: any) => {
                              const nextEcuId = selected?.value ? String(selected.value) : null;
                              if (!nextEcuId || nextEcuId === selectedEcuOrionId) return;
                              setSelectedEcuOrionId(nextEcuId);
                            }}
                        />
                      </div>
                  ) : (
                      <div className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm font-semibold text-gray-800 min-w-[240px]">
                        Perfil: {profileSelectOptions.find((option) => option.value === viewer.selectedProfileId)?.label || "Todas las métricas"}
                      </div>
                  )}

                  <div className="flex items-center justify-center gap-4">
                    <button
                        type="button"
                        onClick={handlePrevGroup}
                        disabled={selectedViewerGroupIndex === 0}
                        className="p-2 rounded-lg border border-gray-300 bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                    >
                      <span className="text-lg font-semibold">‹</span>
                    </button>
                    <h3 className="text-base font-semibold text-gray-800 min-w-[240px] text-center">
                      {currentGroup?.name || "Sin PGN"}
                      {currentPgn !== null && currentPgn !== undefined ? ` (PGN_${currentPgn})` : ""}
                      {!isViewerOnlyMode && currentGroupEcuName ? ` - ${currentGroupEcuName}` : ""}
                    </h3>
                    <button
                        type="button"
                        onClick={handleNextGroup}
                        disabled={selectedViewerGroupIndex >= selectedViewerGroups.length - 1}
                        className="p-2 rounded-lg border border-gray-300 bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                    >
                      <span className="text-lg font-semibold">›</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {numericKeys.length === 0 ? (
                      <div className="col-span-full flex items-center justify-center text-gray-500 py-12">
                        {currentGroupData.length
                            ? "No hay métricas configuradas para este grupo."
                            : "No hay datos disponibles para este grupo."}
                      </div>
                  ) : (
                      numericKeys.map((dataKey) => (
                          <SingleMetricChartCard
                              key={dataKey}
                              dataKey={dataKey}
                              data={currentGroupData}
                              metadata={viewer.metadata}
                              onAddToComparison={(item) => addOrToggle(item)}
                              onRemoveFromComparison={remove}
                              isSelectedForComparison={isSelected(dataKey)}
                          />
                      ))
                  )}
                </div>
              </>
          )}
        </div>
    );
  };

  const renderProfilesHome = () => {
    return (
        <div className="pt-4">
          <div className="flex items-center justify-between gap-3 mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Selección de perfiles</h3>
          </div>

          <div className="bg-[#edf1f8] border border-[#d7deeb] rounded-xl p-4 mb-4">
            {profilesLoading ? (
                <div className="text-gray-500 py-8 text-center">Cargando perfiles...</div>
            ) : profilesError ? (
                <div className="text-gray-500 py-8 text-center">{profilesError}</div>
            ) : (
                <>
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <button
                        type="button"
                        onClick={() => setProfileHomePage((prev) => Math.max(0, prev - 1))}
                        disabled={profileHomePage === 0}
                        className="w-9 h-9 rounded-full border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="text-xl leading-none">‹</span>
                    </button>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 flex-1">
                      {currentProfilesHomeTiles.map((tile) => (
                          <button
                              key={`profile-home-${tile.key}`}
                              type="button"
                              onClick={() => {
                                if (tile.type === "customize") {
                                  setMode("profiles");
                                  return;
                                }
                                if (tile.profileId) {
                                  openProfileDetail(tile.profileId);
                                }
                              }}
                              className={`rounded-xl min-h-[145px] border p-4 text-center transition ${
                                  tile.type === "customize"
                                      ? "bg-[#b8c6e8] border-[#b8c6e8] hover:shadow-md"
                                      : "bg-[#c8ced8] border-[#c8ced8] hover:bg-[#bec5d0]"
                              }`}
                          >
                            <p className="font-bold text-gray-800 text-sm mb-3">{tile.title}</p>
                            {tile.type === "profile" && tile.profileImageId ? (
                                <div className="h-16 w-16 mx-auto rounded-lg border border-gray-300 bg-white overflow-hidden">
                                  <AsyncImg id={tile.profileImageId} className="h-full w-full object-cover" />
                                </div>
                            ) : (
                                <img src={tile.icon} alt={tile.title} className="h-16 mx-auto object-contain" />
                            )}
                          </button>
                      ))}
                    </div>

                    <button
                        type="button"
                        onClick={() => setProfileHomePage((prev) => Math.min(profilesHomePageCount - 1, prev + 1))}
                        disabled={profileHomePage >= profilesHomePageCount - 1}
                        className="w-9 h-9 rounded-full border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="text-xl leading-none">›</span>
                    </button>
                  </div>

                  {profilesHomePageCount > 1 && (
                      <div className="flex justify-center items-center gap-1">
                        {Array.from({ length: profilesHomePageCount }).map((_, idx) => (
                            <button
                                key={`profile-home-dot-${idx}`}
                                type="button"
                                onClick={() => setProfileHomePage(idx)}
                                className={`w-2.5 h-2.5 rounded-full ${idx === profileHomePage ? "bg-gray-700" : "bg-gray-300"}`}
                                aria-label={`Página ${idx + 1}`}
                            />
                        ))}
                      </div>
                  )}

                  {!profilesLoading && profilesHomeTiles.length <= 1 && (
                      <p className="text-sm text-gray-600 mt-4 text-center">
                        No hay perfiles de métricas disponibles en este vehículo.
                      </p>
                  )}
                </>
            )}
          </div>
        </div>
    );
  };

  const renderProfileDetail = () => {
    if (profileDetail.loading) {
      return <div className="flex items-center justify-center text-gray-500 h-[70vh]">Cargando perfil...</div>;
    }

    const selectedProfile = profileDetail.profile;
    const fallbackIcon = resolveEcuIcon(selectedProfile?.name || "perfil");
    const profileDetailEcuOptions = profileDetail.ecuDetails.map((ecuDetail) => ({
      value: ecuDetail.ecuOrionId,
      label: ecuDetail.name,
    }));
    const selectedProfileDetailEcu = profileDetail.ecuDetails.find(
        (ecuDetail) => ecuDetail.ecuOrionId === profileDetailSelectedEcuId
    ) || null;

    return (
        <div className="pt-4">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-lg border border-gray-300 bg-white overflow-hidden flex items-center justify-center">
                {selectedProfile?.image?.id ? (
                    <AsyncImg id={selectedProfile.image.id} className="w-full h-full object-cover" />
                ) : (
                    <img src={fallbackIcon.inactive} alt="Perfil" className="h-9 object-contain" />
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{selectedProfile?.name || "Detalle de perfil"}</h3>
                {selectedProfile?.description && (
                    <p className="text-sm text-gray-600">{selectedProfile.description}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {selectedProfile && (
                  <button
                      type="button"
                      onClick={() => startEditProfile(selectedProfile.id)}
                      className="px-3 py-2 rounded-lg border border-blue-700 bg-blue-700 text-white text-sm font-semibold hover:bg-blue-800"
                  >
                    Editar perfil
                  </button>
              )}
              <button
                  type="button"
                  onClick={() => setMode(view === "profiles-only" ? "profiles-home" : "profiles")}
                  className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm font-semibold hover:bg-gray-100"
              >
                Volver
              </button>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4">
            {profileDetail.error ? (
                <div className="text-gray-500 py-8 text-center">{profileDetail.error}</div>
            ) : profileDetail.ecuDetails.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-gray-500">
                  <img src={fallbackIcon.inactive} alt="Sin métricas" className="h-16 object-contain mb-3" />
                  Este perfil no tiene métricas asociadas a ECUs.
                </div>
            ) : (
                <div className="space-y-4">
                  <div className="w-full lg:max-w-md">
                    <CustomSelect
                        id="profileDetailEcu"
                        label="ECU"
                        isSearchable
                        isClearable={false}
                        isDisabled={profileDetailEcuOptions.length === 0}
                        options={profileDetailEcuOptions}
                        value={profileDetailEcuOptions.find((option) => option.value === profileDetailSelectedEcuId) || null}
                        placeholder="ECU"
                        noOption={() => "No hay ECUs disponibles"}
                        onChange={(selected: any) => {
                          const nextEcuId = selected?.value ? String(selected.value) : null;
                          if (!nextEcuId) return;
                          setProfileDetailSelectedEcuId(nextEcuId);
                        }}
                    />
                  </div>

                  {!selectedProfileDetailEcu ? (
                      <div className="text-sm text-gray-500 py-4">No hay ECU seleccionada.</div>
                  ) : (
                      <article
                          key={`detail-ecu-${selectedProfileDetailEcu.ecuOrionId}`}
                          className="rounded-xl border border-gray-200 bg-[#f3f6fb] p-4"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-12 h-12 rounded-lg border border-gray-300 bg-white overflow-hidden">
                            <EcuImage
                                imageId={selectedProfileDetailEcu.imageId ?? null}
                                fallbackSrc={resolveEcuIcon(selectedProfileDetailEcu.name).active}
                                alt={selectedProfileDetailEcu.name}
                                className="w-full h-full object-contain"
                            />
                          </div>
                          <h4 className="font-bold text-gray-800 text-sm">{selectedProfileDetailEcu.name.toUpperCase()}</h4>
                        </div>

                        {selectedProfileDetailEcu.groups.length === 0 ? (
                            <p className="text-xs text-gray-500">Sin grupos en esta ECU.</p>
                        ) : (
                            <div className="space-y-3">
                              {selectedProfileDetailEcu.groups.map((group) => (
                                  <section
                                      key={`detail-ecu-${selectedProfileDetailEcu.ecuOrionId}-group-${group.id}`}
                                      className="rounded-lg border border-[#d0d8e8] bg-white p-3"
                                  >
                                    <h5 className="text-sm font-semibold text-gray-800 mb-2">
                                      {group.name}
                                      {group.orionId !== null && group.orionId !== undefined ? ` (PGN_${group.orionId})` : ""}
                                    </h5>

                                    {group.metrics.length === 0 ? (
                                        <p className="text-xs text-gray-500">Sin métricas en este grupo.</p>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                                          {group.metrics.map((metric) => (
                                              <article
                                                  key={`detail-ecu-${selectedProfileDetailEcu.ecuOrionId}-group-${group.id}-metric-${metric.id}`}
                                                  className="rounded-xl border border-[#d0d8e8] bg-[#e7edf9] p-3 text-center min-h-[140px] flex flex-col justify-between"
                                              >
                                                <p className="text-xs font-semibold text-gray-800">
                                                  {metric.label}
                                                  {metric.code ? ` (${metric.code.toUpperCase()})` : ""}
                                                </p>
                                                <p className="mt-2 text-lg font-bold text-gray-900">
                                                  {metric.displayValue || "Sin dato en Orion"}
                                                </p>
                                                {metric.metricType === "STATUS" &&
                                                    metric.currentValue === null &&
                                                    metric.defaultValue !== null &&
                                                    metric.defaultValue !== undefined && (
                                                        <p className="text-[11px] text-gray-600 mt-1">
                                                          Valor por defecto: {String(metric.defaultValue)}
                                                        </p>
                                                    )}
                                                {metric.imageId ? (
                                                    <div className="w-full h-36 mt-3 rounded-lg border border-gray-300 bg-white overflow-hidden p-2">
                                                      <AsyncImg id={metric.imageId} className="h-full w-full object-contain" />
                                                    </div>
                                                ) : metric.image ? (
                                                    <div className="w-full h-36 mt-3 rounded-lg border border-gray-300 bg-white/70 overflow-hidden p-2">
                                                      <img
                                                          src={metric.image}
                                                          alt={metric.label}
                                                          className="w-full h-full object-contain"
                                                      />
                                                    </div>
                                                ) : (
                                                    <div className="w-full h-36 mt-3 rounded-lg border border-gray-300 bg-white/70 flex items-center justify-center text-xs text-gray-500">
                                                      Sin imagen
                                                    </div>
                                                )}
                                              </article>
                                          ))}
                                        </div>
                                    )}
                                  </section>
                              ))}
                            </div>
                        )}
                      </article>
                  )}
                </div>
            )}
          </div>
        </div>
    );
  };

  const renderProfilesManager = () => {
    return (
        <div className="pt-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Perfiles personalizados</h3>
            <div className="flex items-center gap-2">
              <button
                  type="button"
                  onClick={() => startCreateProfile()}
                  className="px-3 py-2 rounded-lg border border-blue-700 bg-blue-700 text-white text-sm font-semibold hover:bg-blue-800"
              >
                Crear perfil
              </button>
              <button
                  type="button"
                  onClick={() => setMode(canViewViewer ? "viewer" : "profiles-home")}
                  className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm font-semibold hover:bg-gray-100"
              >
                Volver
              </button>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="mb-3">
              <input
                  type="text"
                  value={profileSearch}
                  onChange={(e) => setProfileSearch(e.target.value)}
                  placeholder="Buscar perfil..."
                  className="w-full md:max-w-md px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            {!requestCompanyId ? (
                <div className="text-gray-500 py-8 text-center">No se pudo resolver la compañía del vehículo.</div>
            ) : profilesLoading ? (
                <div className="text-gray-500 py-8 text-center">Cargando perfiles...</div>
            ) : profilesError ? (
                <div className="text-gray-500 py-8 text-center">{profilesError}</div>
            ) : filteredProfiles.length === 0 ? (
                <div className="text-gray-500 py-8 text-center">No hay perfiles disponibles.</div>
            ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full border-collapse">
                    <thead>
                    <tr className="bg-[#dfe6f4] text-left text-xs uppercase text-gray-700">
                      <th className="px-3 py-2 border border-[#d0d8e8]">Nombre del perfil</th>
                      <th className="px-3 py-2 border border-[#d0d8e8]">Componentes seleccionados</th>
                      <th className="px-3 py-2 border border-[#d0d8e8]">Acciones</th>
                    </tr>
                    </thead>
                    <tbody>
                    {filteredProfiles.map((profile) => {
                      const ecuIds = profileEcusMap[profile.id] || [];
                      return (
                          <tr key={profile.id} className="text-sm">
                            <td className="px-3 py-2 border border-[#d0d8e8] bg-[#b8c6e8]/60 font-semibold text-gray-800">
                              <div className="flex items-center gap-2">
                                <div className="w-9 h-9 rounded-md border border-gray-300 bg-white overflow-hidden flex items-center justify-center">
                                  {profile.image?.id ? (
                                      <AsyncImg id={profile.image.id} className="w-full h-full object-cover" />
                                  ) : (
                                      <PlaceholderImage width={28} height={28} />
                                  )}
                                </div>
                                <span>{profile.name}</span>
                              </div>
                            </td>
                            <td className="px-3 py-2 border border-[#d0d8e8] bg-[#b8c6e8]/40">
                              <div className="flex items-center gap-2 flex-wrap">
                                {ecuIds.length === 0 ? (
                                    <span className="text-gray-500 text-xs">Sin componentes</span>
                                ) : (
                                    ecuIds.map((ecuOrionId) => {
                                      const name = ecuNameByOrionId[ecuOrionId] || `ECU ${ecuOrionId}`;
                                      const icon = resolveEcuIcon(name);
                                      return (
                                          <div
                                              key={`${profile.id}-${ecuOrionId}`}
                                              className="w-9 h-9 rounded-md border border-gray-300 bg-white p-1"
                                              title={name}
                                          >
                                            <EcuImage
                                                imageId={ecuImageIdByOrionId[ecuOrionId] ?? null}
                                                fallbackSrc={icon.active}
                                                alt={name}
                                                className="w-full h-full object-contain"
                                            />
                                          </div>
                                      );
                                    })
                                )}
                              </div>
                            </td>
                            <td className="px-3 py-2 border border-[#d0d8e8] bg-[#b8c6e8]/40">
                              <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    title="Ver perfil"
                                    onClick={() => {
                                      openProfileDetail(profile.id);
                                    }}
                                    className="w-7 h-7 rounded border border-gray-300 bg-white hover:bg-gray-100 flex items-center justify-center"
                                >
                                  <EyeIcon className="w-4 h-4" />
                                </button>
                                <button
                                    type="button"
                                    title="Editar perfil"
                                    onClick={() => startEditProfile(profile.id)}
                                    className="w-7 h-7 rounded border border-gray-300 bg-white hover:bg-gray-100 flex items-center justify-center"
                                >
                                  <EditIcon className="w-4 h-4" />
                                </button>
                                <button
                                    type="button"
                                    title="Eliminar perfil"
                                    onClick={() => handleDeleteProfile(profile.id)}
                                    className="w-7 h-7 rounded border border-gray-300 bg-white hover:bg-gray-100 flex items-center justify-center"
                                >
                                  <DeleteIcon className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                      );
                    })}
                    </tbody>
                  </table>
                </div>
            )}
          </div>
        </div>
    );
  };

  const renderProfileEditor = () => {
    if (!editor) return null;
    if (editor.loading) {
      return <div className="flex items-center justify-center text-gray-500 h-[70vh]">Cargando perfil...</div>;
    }

    return (
        <div className="pt-4">
          <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4">
            <p className="text-xs text-gray-600 mb-3">
              Vehículo asociado: {modelContext.vehicle?.plateNumber || modelContext.vehicle?.id || "N/D"}
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre del perfil <span className="text-red">*</span></label>
                <input
                    type="text"
                    value={editor.name}
                    onChange={(e) => setEditor((prev) => (prev ? { ...prev, name: e.target.value } : prev))}
                    placeholder="Ej: Perfil conducción urbana"
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-[#a1b8f7]"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Descripción del perfil</label>
                <input
                    type="text"
                    value={editor.description}
                    onChange={(e) => setEditor((prev) => (prev ? { ...prev, description: e.target.value } : prev))}
                    placeholder="Descripción opcional"
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-[#a1b8f7]"
                />
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-[120px,1fr] gap-2 items-start">
              <div className="w-[120px] h-[120px] rounded-lg border border-gray-300 bg-[#f5f7fb] overflow-hidden flex items-center justify-center">
                {editor.imagePreviewUrl ? (
                    <img
                        src={editor.imagePreviewUrl}
                        alt="Previsualización del perfil"
                        className="w-full h-full object-cover"
                    />
                ) : editor.image && !editor.removeCurrentImage ? (
                    <AsyncImg
                        id={editor.image.id}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <PlaceholderImage width={120} height={120} />
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Imagen del perfil</label>
                <input
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp,image/jpg,image/svg+xml"
                    onChange={handleProfileImageSelection}
                    className="block w-full text-sm text-gray-700 file:mr-3 file:rounded-md file:border file:border-gray-300 file:bg-white file:px-3 file:py-1.5 file:text-sm file:font-semibold hover:file:bg-gray-100"
                />
                <button
                    type="button"
                    onClick={clearProfileImageSelection}
                    disabled={!editor.imageFile && (!editor.image || editor.removeCurrentImage)}
                    className="px-3 py-1.5 rounded-md border border-gray-300 bg-white text-xs font-semibold hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Quitar imagen
                </button>
              </div>
            </div>

            <div className="mt-3">
              <CustomSelect
                  id="profileUsers"
                  label="Usuarios vinculados"
                  isSearchable
                  isMulti
                  isClearable={false}
                  isLoading={profileUsersLoading}
                  isDisabled={!editor.companyId}
                  options={profileUserOptions}
                  value={profileUserOptions.filter((option) => editor.selectedUserIds.includes(option.value))}
                  placeholder="usuarios"
                  noOption={() =>
                      profileUsersError || "No hay usuarios disponibles para esta empresa"
                  }
                  onChange={(selected: any) => {
                    const selectedOptions = Array.isArray(selected) ? selected : [];
                    const selectedUserIds = selectedOptions
                        .map((option: any) => option?.value)
                        .filter((value: any) => value !== null && value !== undefined)
                        .map((value: any) => String(value));

                    setEditor((prev) =>
                        prev
                            ? {
                              ...prev,
                              selectedUserIds,
                            }
                            : prev
                    );
                  }}
              />
            </div>

            {profileUsersError && (
                <p className="text-sm text-red-500 mt-2">
                  {profileUsersError}
                </p>
            )}
            {!profileUsersLoading &&
                !profileUsersError &&
                Boolean(editor.companyId) &&
                profileUserOptions.length === 0 && (
                    <p className="text-sm text-gray-500 mt-2">
                      No hay usuarios activos disponibles para vincular.
                    </p>
                )}

            <div className="flex flex-wrap items-center gap-2 mt-3">
              <button
                  type="button"
                  onClick={selectAllEditorMetrics}
                  className="px-3 py-1.5 rounded-full bg-blue-700 text-white text-xs font-semibold hover:bg-blue-800"
              >
                Seleccionar todos
              </button>
              <button
                  type="button"
                  onClick={clearAllEditorMetrics}
                  className="px-3 py-1.5 rounded-full bg-gray-600 text-white text-xs font-semibold hover:bg-gray-700"
              >
                Desmarcar todos
              </button>
              <span className="text-xs text-gray-600">
              {editor.selectedMetricIds.length} métricas seleccionadas
            </span>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <aside className="lg:col-span-4 rounded-xl border border-[#d0d8e8] bg-[#edf1f8] p-3">
                <h4 className="text-sm font-semibold text-gray-800 mb-3">Sistemas electrónicos</h4>
                {editorEcus.length === 0 ? (
                    <p className="text-sm text-gray-500 py-2">No hay sistemas electrónicos disponibles en este modelo.</p>
                ) : (
                    <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
                      {editorEcus.map((ecu) => {
                        const ecuMetricIds = ecu.groups.flatMap((group) => group.metrics.map((metric) => metric.id));
                        const selectedCount = ecuMetricIds.filter((metricId) => selectedMetricSet.has(metricId)).length;
                        const hasSelectedMetrics = selectedCount > 0;
                        const allSelected = ecuMetricIds.length > 0 && selectedCount === ecuMetricIds.length;
                        const isActive = editor.activeEcuOrionId === ecu.ecuOrionId;

                        return (
                            <div
                                key={`editor-ecu-${ecu.ecuOrionId}`}
                                className={`rounded-lg border p-2 ${
                                    isActive
                                        ? "border-blue-500 bg-[#dbe5f7]"
                                        : hasSelectedMetrics
                                            ? "border-[#b8c6e8] bg-[#e7edf9]"
                                            : "border-[#d0d8e8] bg-white"
                                }`}
                            >
                              <button
                                  type="button"
                                  onClick={() => setActiveEcuForEditor(ecu.ecuOrionId)}
                                  className="w-full flex items-center gap-2 text-left"
                              >
                                <EcuImage
                                    imageId={ecu.imageId ?? null}
                                    fallbackSrc={hasSelectedMetrics ? ecu.icon.active : ecu.icon.inactive}
                                    alt={ecu.name}
                                    className="w-10 h-10 object-contain"
                                />
                                <div className="min-w-0">
                                  <p className="text-xs font-semibold text-gray-800 truncate">{ecu.name.toUpperCase()}</p>
                                  <p className="text-[11px] text-gray-600">
                                    {selectedCount}/{ecuMetricIds.length} métricas
                                  </p>
                                </div>
                              </button>

                              <button
                                  type="button"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    toggleEcuForEditor(ecu.ecuOrionId);
                                  }}
                                  className="mt-2 w-full px-2 py-1 rounded-md bg-white border border-gray-300 text-[11px] font-semibold hover:bg-gray-100"
                              >
                                {allSelected ? "Desmarcar todo" : "Seleccionar todo"}
                              </button>
                            </div>
                        );
                      })}
                    </div>
                )}
              </aside>

              <section className="lg:col-span-8 rounded-xl border border-[#d0d8e8] bg-white p-3">
                {!activeEditorEcu ? (
                    <div className="text-gray-500 text-center py-6">
                        Selecciona un sistema para gestionar sus parámetros.
                    </div>
                ) : (
                    <>
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-3">
                        <h4 className="text-base font-semibold text-gray-800">
                          Parámetros de {activeEditorEcu.name.toUpperCase()}
                        </h4>
                        <input
                            type="text"
                            value={editorMetricSearch}
                            onChange={(e) => setEditorMetricSearch(e.target.value)}
                            placeholder="Buscar parámetro..."
                            className="w-full md:max-w-sm px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                      </div>

                      <div className="max-h-[520px] overflow-y-auto pr-1">
                        {filteredActiveEcuGroups.length === 0 ? (
                            <div className="text-sm text-gray-500 py-4">No hay parámetros para este filtro.</div>
                        ) : (
                            filteredActiveEcuGroups.map((group) => {
                              const groupMetricIds = group.metrics.map((metric) => metric.id);
                              const selectedCount = groupMetricIds.filter((metricId) => selectedMetricSet.has(metricId)).length;
                              const allSelected = groupMetricIds.length > 0 && selectedCount === groupMetricIds.length;

                              return (
                                  <details key={`editor-group-${group.id}`} open className="mb-2 border border-[#d0d8e8] rounded-lg overflow-hidden">
                                    <summary className="cursor-pointer list-none bg-[#b8c6e8] px-3 py-2 flex items-center justify-between">
                              <span className="font-semibold text-sm text-gray-800">
                                {group.name} {group.orionId !== null && group.orionId !== undefined ? `(PGN_${group.orionId})` : ""}
                              </span>
                                      <label className="flex items-center gap-2 text-xs font-semibold text-gray-700">
                                        <input
                                            type="checkbox"
                                            checked={allSelected}
                                            onChange={() => toggleGroupForEditor(group)}
                                        />
                                        Seleccionar PGN
                                      </label>
                                    </summary>
                                    <div className="bg-[#dbe5f7]">
                                      {group.metrics.map((metric) => {
                                        const metricLabel =
                                            metric.metadata_label || metric.name || metric.orion_name || `Métrica ${metric.id}`;
                                        const metricCode = metric.orion_name || metric.name || "";
                                        const checked = selectedMetricSet.has(metric.id);

                                        return (
                                            <label
                                                key={`editor-metric-${metric.id}`}
                                                className="flex items-center justify-between gap-3 px-3 py-2 border-t border-[#c9d4ea] text-sm hover:bg-[#cdd9f2]"
                                            >
                                    <span className="text-gray-800">
                                      {metricLabel}
                                      {metricCode ? ` (${metricCode.toUpperCase()})` : ""}
                                    </span>
                                              <input
                                                  type="checkbox"
                                                  checked={checked}
                                                  onChange={() => toggleMetricForEditor(metric.id)}
                                              />
                                            </label>
                                        );
                                      })}
                                    </div>
                                  </details>
                              );
                            })
                        )}
                      </div>
                    </>
                )}
              </section>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2">
            <button
                type="button"
                onClick={() => {
                  setEditor(null);
                  setMode("profiles");
                }}
                className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm font-semibold hover:bg-gray-100"
            >
              Cancelar
            </button>
            <button
                type="button"
                onClick={saveProfile}
                disabled={editor.saving}
                className="px-3 py-2 rounded-lg border border-blue-700 bg-blue-700 text-white text-sm font-semibold hover:bg-blue-800 disabled:opacity-50"
            >
              {editor.saving ? "Guardando..." : editor.metricProfileId ? "Guardar cambios" : "Crear perfil"}
            </button>
          </div>
        </div>
    );
  };

  return (
      <div className="relative">
        {renderComparisonFloatingList()}

        {canViewViewer && mode === "viewer" && renderViewer()}
        {canManageProfiles && mode === "profiles-home" && renderProfilesHome()}
        {canManageProfiles && mode === "profiles" && renderProfilesManager()}
        {canManageProfiles && mode === "profile-detail" && renderProfileDetail()}
        {canManageProfiles && mode === "editor" && renderProfileEditor()}

        <ComparisonChartModal isOpen={showComparison} onClose={() => setShowComparison(false)} items={items} />
      </div>
  );
};

interface VehicleMetricsProps {
  view?: VehicleMetricsView;
}

const VehicleMetrics: React.FC<VehicleMetricsProps> = ({ view = "full" }) => (
    <ComparisonProvider>
      <VehicleMetricsContent view={view} />
    </ComparisonProvider>
);

export default VehicleMetrics;
