import moment from "moment";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Text, Title, cn } from "rizzui";
import { ReactComponent as DispositivoInalambricoIcon } from '../../../../../assets/Iconos/Interfaz/dispositivo_inalambrico.svg';
import { useWindowDimensions } from "../../../../../hooks/useWindowDimensions";
import { VehicleService } from "../../../../../services/vehicle/vehicleService";
import { DEVICE_STATUSES } from "../../../../devices/DeviceForm";

const PASTEL_COLORS: Record<number, string> = {
    0: 'rgba(187, 247, 208, 0.97)', // Activo - Green
    1: 'rgba(247, 185, 131, 0.97)', // Prueba - Orange
    2: 'rgba(191, 219, 254, 0.97)', // Asignado - Blue
    3: 'rgba(254, 202, 202, 0.97)', // Fuera de servicio - Red
};

const VehicleDevicesHistory = () => {

    // STATES
    
    const [timelineData, setTimelineData] = useState<any>(null);

    // HOOKS 

    const { id = '' } = useParams<{ id: string }>();
    const { width } = useWindowDimensions();
    // METHODS

    // -----------------------------------------------------------------------------------------------------
    /**
     * @ES OBTIENE EL HISTORIAL DE DISPOSITIVOS DE UN VEHICULO
     * @EN GETS THE DEVICE HISTORY OF A VEHICLE
     */
    // -----------------------------------------------------------------------------------------------------
    const fetchDeviceHistory = useCallback(async () => {
        if (!id) return null;
        const vehicleService = new VehicleService();
        const response = await (await vehicleService.showVehicleDeviceHistory(id)).getResponseData();
        if (response.success) {
            setTimelineData(response.data);
        } else {
            setTimelineData([]);
        }
    }, [id]);
    // -----------------------------------------------------------------------------------------------------

    // USE EFFECT

    useEffect(() => {
        fetchDeviceHistory();
    }, [fetchDeviceHistory]);

    // RENDER

    return (
        <div className="relative @container md:mt-4">
            <div className="gap-y-6 max-w-3xl mx-auto">
                <div key={'devices'} className="px-4">
                    <Title as="h2" className={cn("mb-8 text-lg font-semibold text-center", { "mt-10": width < 768 })}>
                        Historial de Dispositivos
                    </Title>
                    <div className='flex flex-col gap-4'>
                        {timelineData && timelineData.length > 0 ? (
                            timelineData.map((device: any, index: number) => {
                                const status = DEVICE_STATUSES.find(s => s.value == device.deviceStatus) || DEVICE_STATUSES[3];
                                const StatusIcon = status.icon;
                                const isActive = device.isActive;

                                return (
                                    <div 
                                        key={`history-${device.serialNumber}-${index}`}
                                        className="bg-[#a1b8f7] rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center shadow-sm gap-4"
                                    >
                                        {/* Left Side: Dates */}
                                        <div className="flex flex-col gap-2">
                                            <Text className="text-gray-900 font-medium">
                                                {device?.linkedToDeviceAt ? moment(device?.linkedToDeviceAt).format('DD/MM/YYYY HH:mm') : '-'}
                                            </Text>
                                            
                                            <div 
                                                className={cn(
                                                    "rounded-md px-3 py-1.5 w-fit flex items-center justify-center min-w-[140px]"
                                                )}
                                                style={{ 
                                                    backgroundColor: (PASTEL_COLORS[status.value] || PASTEL_COLORS[3]),
                                                    color: status.color
                                                }}
                                            >
                                                {isActive ? (
                                                    <StatusIcon className="w-6 h-6 text-green-600" />
                                                ) : (
                                                    <span className="text-xs font-semibold text-gray-900">
                                                        {device?.unlinkedToDeviceAt ? moment(device?.unlinkedToDeviceAt).format('DD/MM/YYYY HH:mm') : '-'}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Right Side: Device Info */}
                                        <div className="flex flex-col items-start sm:items-end gap-1 w-full sm:w-auto">
                                            <div className="flex items-center gap-2">
                                                <DispositivoInalambricoIcon className="w-5 h-5 text-gray-700" />
                                                <Text className="text-gray-700 font-medium">
                                                    {device.firmwareVersion || 'v0.0.0.1'}
                                                </Text>
                                            </div>
                                            
                                            <Text className="text-gray-800 font-medium text-sm">
                                                {device.model} {device.serialNumber}
                                            </Text>
                                            
                                            <div className="flex items-center gap-2 mt-2">
                                                <Text className="text-gray-800 text-sm">Estado del dispositivo:</Text>
                                                <div 
                                                    className="rounded-full px-3 py-1 flex items-center justify-center"
                                                    style={{ backgroundColor: PASTEL_COLORS[status.value] || PASTEL_COLORS[3] }}
                                                >
                                                    <StatusIcon className="w-5 h-5 text-white" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="flex items-center justify-center py-10">
                                <Text as="span" className="text-gray-500 font-semibold">
                                    Sin dispositivos asociados
                                </Text>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VehicleDevicesHistory;
