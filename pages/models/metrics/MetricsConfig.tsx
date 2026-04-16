import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import DualListBox, { DualListOption } from '../../../components/forms/DualListBox';
import Page from '../../../layout/Page/Page';
import { EcuService } from '../../../services/metrics/ecuService';
import { GroupService } from '../../../services/metrics/groupService';
import { MetricService } from '../../../services/metrics/metricService';
import { ModelService } from '../../../services/model/modelService';
import Button from '../../../components/bootstrap/Button';
import { FaSave } from 'react-icons/fa';
import { PrivilegeContext } from '../../../components/priviledge/PriviledgeProvider';
import { useSetAtom } from 'jotai';
import { headerConfigAtom } from '../../../atoms/headerAtoms';
import { ReactComponent as ModelsIcon } from '../../../assets/Iconos/Interfaz/listado_dispositivos.svg';

const HighlightedJson = ({ data }: { data: any }) => {
    if (!data || (Array.isArray(data) && data.length === 0)) return null;
    
    // WE USE 3 SPACES FOR INDENTATION
    
    const json = JSON.stringify(data, null, 3);
    
    // REGEX TO HIGHLIGHT JSON KEYS AND VALUES
    // GROUP 1: STRING (KEY OR VALUE)
    // GROUP 3: COLON AND SPACES (IF IT'S A KEY)
    // GROUP 4: BOOLEANS
    // GROUP 6: NUMBERS

    const regex = /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*")(\s*:\s*)?|(\b(true|false|null)\b)|(-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g;
    
    const html = json.replace(regex, (match, str, charEsc, colon, boolWrapper, boolInner, num) => {
        if (colon) { // REMOVE SPACE AFTER COLON
            return `<span class="text-purple-400">${str}</span><span class="text-gray-500">:</span>`;
        }
        
        // IF IT'S A STRING (NO COLON), IT'S A VALUE

        if (str) {
            return `<span class="text-green-400">${str}</span>`;
        }
        
        // BOOLEANS AND NUMBERS ARE ALSO IN GREEN (SAME COLOR FOR ALL VALUES)

        if (boolWrapper || num) {
            return `<span class="text-green-400">${match}</span>`;
        }
        
        return match;
    });

    return (
        <pre 
            className="text-sm font-mono whitespace-pre-wrap text-gray-300" 
            dangerouslySetInnerHTML={{ __html: html }} 
        />
    );
};

const MetricsConfig = () => {
        
    // ATOMS

    const setHeaderConfig = useSetAtom(headerConfigAtom);
        
    // HOOKS
        
    const { userCan } = useContext(PrivilegeContext);
    const navigate = useNavigate();
    const { id: modelId } = useParams();
    const ecuService = new EcuService();
    const groupService = new GroupService();
    const metricService = new MetricService();
    const modelService = new ModelService();

    // RENDER
    
    const [ecus, setEcus] = useState<DualListOption[]>([]);
    const [groups, setGroups] = useState<DualListOption[]>([]);
    const [metrics, setMetrics] = useState<DualListOption[]>([]);
    const [addedEcus, setAddedEcus] = useState<DualListOption[]>([]);
    const [addedGroups, setAddedGroups] = useState<DualListOption[]>([]);
    const [addedMetrics, setAddedMetrics] = useState<DualListOption[]>([]);
    const [loadingEcus, setLoadingEcus] = useState(false);
    const [loadingGroups, setLoadingGroups] = useState(false);
    const [loadingMetrics, setLoadingMetrics] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // FUNCTIONS

    // ------------------------------------------------------------------------------------
    /**
     * @ES MANEJA EL ENVIO DEL FORMULARIO DE CONFIGURACIÓN DE MÉTRICAS.
     * @EN HANDLES THE SUBMISSION OF THE METRICS CONFIGURATION FORM.
     * 
     * @param valuess
     */
    // ------------------------------------------------------------------------------------
    const handleSave = async () => {
        if (!modelId) return;

        setIsSaving(true);
        try {
            const payload = {
                modelId: modelId,
                ecus: addedEcus.map(e => e.value),
                groups: addedGroups.map(g => g.value),
                metrics: addedMetrics.map(m => m.value)
            };

            const response = await modelService.adminModelMetrics(payload);
            
            if (response.getResponseData().success) {
                toast.success('Configuración guardada correctamente');
            } else {
                toast.error('Error al guardar la configuración');
            }
        } catch (error) {
            console.error("Error saving configuration:", error);
            toast.error('Error al guardar la configuración');
        } finally {
            setIsSaving(false);
        }
    };
    // ------------------------------------------------------------------------------------

    // ------------------------------------------------------------------------------------
    /**
     * @ES GENERA UN PREVISUALIZACIÓN EN FORMATO JSON DE LA CONFIGURACIÓN SELECCIONADA.
     * @EN GENERATES A JSON PREVIEW OF THE SELECTED CONFIGURATION.
     */
    // ------------------------------------------------------------------------------------
    const getJsonPreview = () => {

        // BUILD HIERARCHY BASED ON SELECTED ITEMS

        const groupsToDisplay = addedGroups;
        const validGroups = groupsToDisplay.filter(group => {

            // FIND METRICS FOR THIS GROUP

            if (!group.original) return false;
            const groupMetrics = addedMetrics.filter(m => m.original?.groupId === group.value);
            return groupMetrics.length > 0;
        });

        const jsonStructure = validGroups.map(group => {
            
            // FIND METRICS FOR THIS GROUP

            const groupMetrics = addedMetrics.filter(m => m.original?.groupId === group.value);
            
            // FIND PARENT ECU

            const parentEcu = addedEcus.find(e => e.value === group.ecuId);
            
            // DETERMINE ECU ORION ID:
            // 1. FROM PARENT ECU OBJECT (IF LINKED)
            // 2. FROM GROUP'S STORED ecuOrionId (FROM BACKEND)
            // 3. FALLBACK

            const ecuOrionId = (parentEcu?.original?.orionId) 
                ?? (group.original?.ecuOrionId) 
                ?? "{ecuOrionId}";

            const groupOrionName = group.original?.orionName || group.label;

            return {
                type: groupOrionName,
                id: `urn:ngsi-ld:VEHICLE:{:vehicleChassisNumber:}:ECU:${ecuOrionId}:${groupOrionName}`,
                refECU: {
                    type: "Relationship",
                    value: `urn:ngsi-ld:VEHICLE:{:vehicleChassisNumber:}:ECU:${ecuOrionId}`
                },
                VIUN: {
                    type: "Number",
                    value: group.original?.orionId ?? 0
                },
                ...groupMetrics.reduce((acc: any, metric: any) => {
                    const metricName = metric.original?.orionName || metric.label;

                    const metaLabel = metric.original?.metadataLabel;
                    const metaType = metric.original?.metadataType;
                    const metaUnit = metric.original?.metadataUnit;

                    const metricType = metric.original?.type || "Property";
                    const isNumber = metricType === "Number" || metricType === "Integer" || metricType === "Float" || metricType === "Double";

                    // IF METRIC TYPE IMPLIES NUMBER, USE 0 AS PLACEHOLDER, OTHERWISE STRING

                    const placeholderValue = isNumber ? 0 : "{value}";

                    acc[metricName] = {
                        type: metricType,
                        value: placeholderValue,
                        ...(metaLabel || metaType || metaUnit ? {
                            metadata: {
                                ...(metaLabel ? {
                                    VIP_label: {
                                        type: "Text",
                                        value: metaLabel
                                    }
                                } : {}),
                                ...(metaType ? {
                                    VIP_type: {
                                        type: "Text",
                                        value: metaType
                                    }
                                } : {}),
                                ...(metaUnit ? {
                                    unit: {
                                        type: "Text",
                                        value: metaUnit
                                    }
                                } : {})
                            }
                        } : {})
                    };
                    return acc;
                }, {})
            };
        });

        return jsonStructure;
    };

    // USE EFFECT

    useEffect(() => {
    
        // CONFIGURE HEADER TITLE AND ICON
    
        setHeaderConfig({
            title: "CONFIGURACIÓN DE GRUPOS, METRICAS Y ECUS DEL MODELO",
            icon: <ModelsIcon className="app-sub-icon w-9 h-9" />,
            breadcrumbs: [
                { 
                    label: 'Inicio', 
                    path: '/' 
                },
                {
                    label: "Modelos",
                    path: "/models"
                },
                {
                    label: "Configuración",
                    path: undefined,
                    active: true
                }
            ]
        });
    
        // CLEANUP EFFECT
    
        return () => {
            setHeaderConfig(null);
        };
    
    }, [userCan, setHeaderConfig]);

    // FETCH EXISTING CONFIGURATION ON MOUNT

    useEffect(() => {
        const fetchConfiguration = async () => {
            if (!modelId) return;
            
            try {
                const response = await modelService.getModelById(modelId);
                if (response.getResponseData().success) {
                    const data = response.getResponseData().data;
                    
                    // MAP ECUS

                    if (data.ecus) {
                        setAddedEcus(data.ecus.map((item: any) => ({
                            label: item.name,
                            value: item.id,
                            original: {
                                ...item,
                                orionId: item.orionId ?? item.orion_id,
                                orionName: item.orionName ?? item.orion_name
                            }
                        })));
                    }

                    // MAP GROUPS

                    if (data.groups) {
                        setAddedGroups(data.groups.map((item: any) => ({
                            label: item.name,
                            value: item.id,
                            ecuId: item.ecu?.id ?? item.ecu_id,
                            original: {
                                ...item,
                                orionId: item.orionId ?? item.orion_id,
                                orionName: item.orionName ?? item.orion_name,
                                ecuOrionId: item.ecu?.orionId ?? item.ecu_orion_id
                            }
                        })));
                    }

                    // MAP METRICS

                    if (data.metrics) {
                        setAddedMetrics(data.metrics.map((item: any) => ({
                            label: item.name,
                            value: item.id,
                            groupId: item.groups?.id ?? item.group?.id ?? item.group_id ?? item.groupId,
                            original: {
                                ...item,
                                groupId: item.groups?.id ?? item.group?.id ?? item.group_id ?? item.groupId,
                                orionName: item.orionName ?? item.orion_name,
                                groupName: item.groups?.name ?? item.group?.name ?? item.group_name,
                                groupOrionId: item.groups?.orionId ?? item.group?.orionId ?? item.group_orion_id,
                                groupEcuOrionId: item.groups?.ecu?.orionId ?? item.group?.ecu?.orionId ?? item.group_ecu_orion_id,
                                metadataLabel: item.metadataLabel ?? item.metadata_label,
                                metadataType: item.metadataType ?? item.metadata_type,
                                metadataUnit: item.metadataUnit ?? item.metadata_unit
                            }
                        })));
                    }
                }
            } catch (error) {
                console.error("Error loading configuration:", error);
                toast.error("Error al cargar la configuración existente");
            }
        };

        fetchConfiguration();
    }, [modelId]);

    // FETCH ECUS ON MOUNT

    useEffect(() => {
        const fetchEcus = async () => {
            setLoadingEcus(true);
            try {
                const response = await ecuService.listEcusForSelect();
                if (response.getResponseData().success) {
                    const data = response.getResponseData().data;
                    const options = data.ecus?.map((item: any) => ({
                        label: item.label || item.name,
                        value: item.id || item.value,
                        original: {
                            ...item,
                            orionId: item.orionId ?? item.orion_id,
                            orionName: item.orionName ?? item.orion_name
                        }
                    }));
                    setEcus(options);
                } else {
                    toast.error('Error fetching ECUs');
                }
            } catch (error) {
                console.error(error);
                toast.error('Error fetching ECUs');
            } finally {
                setLoadingEcus(false);
            }
        };
        fetchEcus();
    }, []);

    // FETCH GROUPS WHEN ECUS CHANGE

    useEffect(() => {

        // REMOVE GROUPS THAT ARE NO LONGER IN THE SELECTED ECUS
        
        setAddedGroups(prev => prev.filter(g => addedEcus.some(e => e.value === g.ecuId)));

        const fetchGroups = async () => {
            if (addedEcus.length === 0) {
                setGroups([]);
                return;
            }
            setLoadingGroups(true);
            try {
                // Backend expects 'filter_filters' with 'ecus' array
                const response = await groupService.listGroupsForSelect({ 
                    filter_filters: {
                        ecus: addedEcus.map(e => e.value)
                    },
                    limit: 1000 // Increase limit to avoid pagination issues
                });
                if (response.getResponseData().success) {
                    const data = response.getResponseData().data;
                    const options = data.groups?.map((item: any) => ({
                        label: item.label || item.name,
                        value: item.id || item.value,
                        ecuId: item.ecu?.id,
                        original: {
                            ...item,
                            orionId: item.orionId ?? item.orion_id,
                            orionName: item.orionName ?? item.orion_name,
                            ecuOrionId: item.ecu?.orionId ?? item.ecu?.orion_id
                        }
                    }));
                    setGroups(options);
                } else {
                    toast.error('Error fetching groups');
                }
            } catch (error) {
                console.error(error);
                toast.error('Error fetching groups');
            } finally {
                setLoadingGroups(false);
            }
        };

        fetchGroups();
    }, [addedEcus]);

    // Fetch Metrics when Groups change
    useEffect(() => {
        // Cascade filter: Remove selected metrics that are no longer in the selected Groups
        setAddedMetrics(prev => prev.filter(m => addedGroups.some(g => g.value === m.groupId)));

        const fetchMetrics = async () => {
            if (addedGroups.length === 0) {
                setMetrics([]);
                return;
            }
            setLoadingMetrics(true);
            try {
                const response = await metricService.listMetricsForSelect({
                    filter_filters: {
                        groups: addedGroups.map(g => g.value)
                    },
                    limit: 1000 // Increase limit
                });
                if (response.getResponseData().success) {
                    const data = response.getResponseData().data;
                    const options = data.metrics?.map((item: any) => ({
                        label: item.label || item.name,
                        value: item.id || item.value,
                        groupId: item.groups?.id ?? item.group?.id,
                        original: {
                            ...item,
                            groupId: item.groups?.id ?? item.group?.id,
                            orionName: item.orionName ?? item.orion_name,
                            groupName: item.groups?.name ?? item.group?.name,
                            groupOrionId: item.groups?.orionId ?? item.group?.orionId,
                            groupEcuOrionId: item.groups?.ecu?.orionId ?? item.group?.ecu?.orionId,
                            metadataLabel: item.metadataLabel ?? item.metadata_label,
                            metadataType: item.metadataType ?? item.metadata_type,
                            metadataUnit: item.metadataUnit ?? item.metadata_unit
                        }
                    }));
                    setMetrics(options);
                } else {
                    toast.error('Error fetching metrics');
                }
            } catch (error) {
                console.error(error);
                toast.error('Error fetching metrics');
            } finally {
                setLoadingMetrics(false);
            }
        };

        fetchMetrics();
    }, [addedGroups]);

    // Safer sync: Only update metadata of existing selected metrics if found in new options
    // This ensures that if backend metadata changes, it reflects in the JSON without reload,
    // but prevents replacing valid selected objects with potentially incomplete options or undefined.
    useEffect(() => {
        if (metrics.length === 0) return;
        
        setAddedMetrics(prev => {
            return prev.map(selected => {
                const freshOption = metrics.find(opt => opt.value === selected.value);
                if (freshOption) {
                    // Merge fresh metadata into the existing selected item
                    return {
                        ...selected,
                        groupId: freshOption.groupId ?? selected.groupId, // Update groupId if available
                        original: {
                            ...selected.original,
                            groupId: freshOption.original.groupId ?? selected.original.groupId,
                            metadataLabel: freshOption.original.metadataLabel,
                            metadataType: freshOption.original.metadataType,
                            metadataUnit: freshOption.original.metadataUnit,
                            type: freshOption.original.type, // Update type as well
                            orionName: freshOption.original.orionName, // Update orionName
                            groupOrionId: freshOption.original.groupOrionId ?? selected.original.groupOrionId,
                            groupEcuOrionId: freshOption.original.groupEcuOrionId ?? selected.original.groupEcuOrionId,
                        }
                    };
                }
                return selected;
            });
        });
    }, [metrics]);

    // Sync Groups metadata
    useEffect(() => {
        if (groups.length === 0) return;
        
        setAddedGroups(prev => {
            return prev.map(selected => {
                const freshOption = groups.find(opt => opt.value === selected.value);
                if (freshOption) {
                    return {
                        ...selected,
                        ecuId: freshOption.ecuId ?? selected.ecuId,
                        original: {
                            ...selected.original,
                            ...freshOption.original
                        }
                    };
                }
                return selected;
            });
        });
    }, [groups]);

    // Sync ECUs metadata
    useEffect(() => {
        if (ecus.length === 0) return;
        
        setAddedEcus(prev => {
            return prev.map(selected => {
                const freshOption = ecus.find(opt => opt.value === selected.value);
                if (freshOption) {
                    return {
                        ...selected,
                        original: {
                            ...selected.original,
                            ...freshOption.original
                        }
                    };
                }
                return selected;
            });
        });
    }, [ecus]);

    // RENDER

    return (
        <Page>
            <div className="row mb-4">
                <div className="col-12">
                    <h1 className="h3">Configuración de Métricas</h1>
                </div>
            </div>
            <div className="grid grid-cols-12 gap-6">
                {/* Left Column: Configuration */}
                <div className="col-span-12 lg:col-span-7 space-y-6">
                    
                    {/* ECUs Section */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                        <h2 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">1. Seleccionar ECUs</h2>
                        <DualListBox
                            options={ecus}
                            selected={addedEcus}
                            onChange={setAddedEcus}
                            titleLeft="ECUs Disponibles"
                            titleRight="ECUs Seleccionadas"
                            isLoading={loadingEcus}
                        />
                    </div>

                    {/* Groups Section */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                        <h2 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">2. Seleccionar Grupos</h2>
                        <div className="mb-2 text-sm text-gray-500">
                            Mostrando grupos pertenecientes a las ECUs seleccionadas.
                        </div>
                        <DualListBox
                            options={groups}
                            selected={addedGroups}
                            onChange={setAddedGroups}
                            titleLeft="Grupos Disponibles"
                            titleRight="Grupos Seleccionados"
                            isLoading={loadingGroups}
                            disabled={addedEcus.length === 0}
                        />
                    </div>

                    {/* Metrics Section */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                        <h2 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">3. Seleccionar Métricas</h2>
                        <div className="mb-2 text-sm text-gray-500">
                            Mostrando métricas pertenecientes a los grupos seleccionados.
                        </div>
                        <DualListBox
                            options={metrics}
                            selected={addedMetrics}
                            onChange={setAddedMetrics}
                            titleLeft="Métricas Disponibles"
                            titleRight="Métricas Seleccionadas"
                            isLoading={loadingMetrics}
                            disabled={addedGroups.length === 0}
                        />
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button
                            className='flex items-center bg-primary text-white p-2 rounded'
                            onClick={handleSave}
                            isDisable={isSaving}
                        >
                            <FaSave className="mr-2" />
                            {isSaving ? 'Guardando...' : 'Guardar Configuración'}
                        </Button>
                    </div>
                </div>

                {/* Right Column: JSON Preview */}
                <div className="col-span-12 lg:col-span-5">
                    <div className="sticky top-6 bg-gray-900 rounded-lg shadow-lg overflow-hidden">
                        <div className="bg-gray-800 px-4 py-3 border-b border-gray-700 flex justify-between items-center">
                            <h3 className="text-gray-100 font-medium">Previsualización JSON</h3>
                            <span className="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded">NGSI-LD</span>
                        </div>
                        <div className="p-4 overflow-auto max-h-[calc(100vh-12rem)]">
                            {addedMetrics.length > 0 ? (
                                <HighlightedJson data={getJsonPreview()} />
                            ) : (
                                <div className="text-gray-500 text-sm text-center py-8">
                                    Selecciona métricas para ver la estructura JSON resultante
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Page>
    );
};

export default MetricsConfig;
