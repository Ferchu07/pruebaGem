import { useAtom } from 'jotai';
import React, { useCallback, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Input } from 'rizzui';
import StatusDropdown from '../../../../../components/forms/StatusDropdown';
import useFetch from '../../../../../hooks/useFetch';
import FormGroup from '../../../../../layout/shared/form-group';
import { DeviceService } from '../../../../../services/device/deviceService';
import { DeviceApiResponse } from '../../../../../type/entities/device-type';
import { DEVICE_STATUSES } from '../../../DeviceForm';
import { doRefetchAtom } from '../../DeviceProfileLayout';
import VehicleIconSelector from '../../../../../components/icon/VehicleIconSelector';

interface DeviceInfoProps { }

const DeviceInfo: React.FC<DeviceInfoProps> = () => {

    // STATES

    const [doRefetch, setDoRefetch] = useAtom(doRefetchAtom);

    // HOOKS

    const { id = '' } = useParams<{ id: string }>();
    const service = new DeviceService();

    // DATA FETCHING

    const [data, loading, error, refetch] = useFetch(useCallback(async () => {
        if (!id || id === '') return null;
        const response = await service.getDeviceById(id);
        return response.getResponseData() as DeviceApiResponse;
    }, [id]));

    // USE EFFECT

    useEffect(() => {
        if (doRefetch) {
            refetch();
            setDoRefetch(false);
        }
    }, [doRefetch]);

    // RENDER

    return (
        <div className="@container">
            <div className="grid divide-dashed divide-gray-200 gap-6">
                <FormGroup
                    title="Datos del Dispositivo"
                    description='Información del dispositivo'
                    className='pt-3 pb-4'
                    titleCols="@md:col-span-2"
                    childCols="@md:col-span-10 md:grid-cols-3"
                >
                    <div className='md:col-span-3 md:grid md:grid-cols-12 gap-4'>
                        <Input
                            disabled
                            label="Número de Serie"
                            placeholder="Número de serie"
                            value={data?.serialNumber ?? ''}
                            className="md:col-span-6"
                            inputClassName='!bg-[#a1b8f7]'
                        />

                        <Input
                            disabled
                            label="Modelo"
                            placeholder="Modelo"
                            value={data?.model ?? ''}
                            className="md:col-span-6"
                            inputClassName='!bg-[#a1b8f7]'
                        />

                        <Input
                            disabled
                            label="Versión de firmware"
                            placeholder='Versión de Firmware'
                            value={data?.firmwareVersion ?? ''}
                            className="md:col-span-6"
                            inputClassName='!bg-[#a1b8f7]'
                        />

                        {data && (
                            <div className='md:col-span-6 mt-1'>
                                <div className='flex justify-between'>
                                    <span className='rizzui-input-label block text-sm mb-1.5 font-medium text-muted-foreground'>Estado del Dispositivo</span>
                                </div>
                                <StatusDropdown
                                    key={data?.status}
                                    fullWidth={true}
                                    entityId={data?.id}
                                    title="¿Estas seguro de cambiar el estado?"
                                    statesOptions={DEVICE_STATUSES}
                                    currentState={DEVICE_STATUSES.find((status) => status.value === data.status)}
                                    hasComments={false}
                                    handleStateChange={(entityId: string, statusId: string) => { }}
                                    disabled
                                />
                            </div>
                        )}

                        {data?.deviceVehicles && data.deviceVehicles.length > 0
                            ? (
                                <div className="md:col-span-12     ">
                                    <div className="text-sm font-medium text-gray-900 mb-2">
                                        Vehículos Asignados
                                    </div>
                                    {data.deviceVehicles?.map((vehicle: any) => (
                                        <div key={vehicle.id} className="md:col-span-3 flex items-center justify-start">
                                            <div className="text-sm font-[600] !bg-[#a1b8f7] p-2 rounded-md text-black flex items-center mb-2">
                                                <VehicleIconSelector 
                                                    category={vehicle.vehicle.model?.vehicleType?.name} 
                                                    subcategory={vehicle.vehicle.model?.vehicleSubtype?.name} 
                                                    className='w-8 h-8 me-2'
                                                />
                                                <span className='me-1'>{vehicle.vehicle.plateNumber}</span> {vehicle.vehicle?.brand?.name || '-'} {vehicle.vehicle.model?.name || '-'}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )
                            : (
                                <div className="md:col-span-6">
                                    <div className="text-sm font-medium text-gray-500">
                                        No hay vehículos asignados
                                    </div>
                                </div>
                            )}
                    </div>
                </FormGroup>
            </div>
        </div>
    );
};

export default DeviceInfo;