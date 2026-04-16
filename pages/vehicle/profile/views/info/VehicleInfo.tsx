import { useAtom } from 'jotai';
import React, { useCallback, useContext, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { PrivilegeContext } from '../../../../../components/priviledge/PriviledgeProvider';
import useFetch from '../../../../../hooks/useFetch';
import FormGroup from '../../../../../layout/shared/form-group';
import { menuRoutes } from '../../../../../router/menu';
import { VehicleService } from '../../../../../services/vehicle/vehicleService';
import { VehicleApiResponse } from '../../../../../type/entities/vehicle-type';
import { doRefetchAtom } from '../../VehicleProfileLayout';
import { Input } from 'rizzui';

interface VehicleInfoInfoProps { }

const VehicleInfo: React.FC<VehicleInfoInfoProps> = () => {

    // STATES

    const [doRefetch, setDoRefetch] = useAtom(doRefetchAtom);

    // HOOKS

    const { id = '' } = useParams<{ id: string }>();
    const { userCan } = useContext(PrivilegeContext);
    const service = new VehicleService();

    // DATA FETCHING

    const [data, loading, error, refetch] = useFetch(useCallback(async () => {
        if (!id || id === '') return null;
        const response = await service.getVehicleById(id);
        return response.getResponseData() as VehicleApiResponse;
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
                    title="Datos del Vehículo"
                    description='Información del vehículo'
                    className='pt-4'
                    titleCols="@md:col-span-2"
                    childCols="@md:col-span-10"
                >
                    <div className="grid md:grid-cols-4 gap-8">

                        {/* Número de Bastidor */}

                        <Input
                            disabled
                            label="Número de Bastidor (Chasis)"
                            placeholder="Número de Bastidor (Chasis)"
                            value={data?.chassisNumber ?? ''}
                            inputClassName='!bg-[#a1b8f7]'
                        />

                        {/* Matrícula */}

                        <Input
                            disabled
                            label="Matrícula"
                            placeholder="Matrícula"
                            value={data?.plateNumber ?? ''}
                            inputClassName='!bg-[#a1b8f7]'
                        />

                        {/* Marca */}
                        <div>
                            <p className="text-sm tracking-wide text-black mb-1">
                                Marca
                            </p>
                            {data?.brand ? (
                                userCan('get_brands', 'brands') ? (
                                    <Link
                                        to={`${menuRoutes.brands.path}/${data.brand.id}/profile/${menuRoutes.brands.profile.info}`}
                                        className="text-primary font-medium hover:underline bg-[#a1b8f7] w-100 flex p-2 rounded"
                                    >
                                        {data.brand.name}
                                    </Link>
                                ) : (
                                    <p className="text-black font-medium bg-[#a1b8f7] rounded p-2">
                                        {data.brand.name}
                                    </p>
                                )
                            ) : (
                                <p className="text-black bg-[#a1b8f7] p-2 rounded">Sin marca asociada</p>
                            )}
                        </div>

                        {/* Modelo */}
                        <div>
                            <p className="text-sm tracking-wide text-black mb-1">
                                Modelo
                            </p>
                            {data?.model ? (
                                userCan('get_models', 'models') ? (
                                    <Link
                                        to={`${menuRoutes.models.path}/${data.model.id}/profile/${menuRoutes.models.profile.info}`}
                                        className="text-primary font-medium hover:underline bg-[#a1b8f7] w-100 flex p-2 rounded"
                                    >
                                        {data.model.name}
                                    </Link>
                                ) : (
                                    <p className="text-black font-medium bg-[#a1b8f7] rounded p-2">
                                        {data.model.name}
                                    </p>
                                )
                            ) : (
                                <p className="text-black bg-[#a1b8f7] rounded p-2">Sin modelo asociado</p>
                            )}
                        </div>

                        {/* TIPO DE VEHÍCULO (Dentro del modelo) */}
                        <div>
                            <p className="text-sm tracking-wide text-black mb-1">
                                Tipo de vehículo
                            </p>
                            {data?.model?.vehicleType ? (
                                userCan('get_vehicle_types', 'vehicle_types') ? (
                                    <Link
                                        to={`${menuRoutes.vehicleTypes.path}/${data.model.vehicleType.id}/profile/${menuRoutes.vehicleTypes.profile.info}`}
                                        className="text-primary font-medium hover:underline bg-[#a1b8f7] w-100 flex p-2 rounded"
                                    >
                                        {data.model.vehicleType.name}
                                    </Link>
                                ) : (
                                    <p className="text-black bg-[#a1b8f7] rounded p-2 font-medium">
                                        {data.model.vehicleType.name}
                                    </p>
                                )
                            ) : (
                                <p className="text-black bg-[#a1b8f7] rounded p-2">Sin tipo asociado</p>
                            )}
                        </div>

                        {/* SUBTIPO DE VEHÍCULO (Dentro del modelo) */}
                        <div>
                            <p className="text-sm tracking-wide text-black mb-1">
                                Subtipo de vehículo
                            </p>
                            {data?.model?.vehicleSubtype ? (
                                userCan('get_vehicle_subtypes', 'vehicle_subtypes') ? (
                                    <Link
                                        to={`${menuRoutes.vehicleSubTypes.path}/${data.model.vehicleSubtype.id}/profile/${menuRoutes.vehicleSubTypes.profile.info}`}
                                        className="text-primary font-medium hover:underline bg-[#a1b8f7] w-100 flex p-2 rounded"
                                    >
                                        {data.model.vehicleSubtype.name}
                                    </Link>
                                ) : (
                                    <p className="text-black font-medium bg-[#a1b8f7] rounded p-2">
                                        {data.model.vehicleSubtype.name}
                                    </p>
                                )
                            ) : (
                                <p className="text-black bg-[#a1b8f7] rounded p-2">Sin subtipo asociado</p>
                            )}
                        </div>

                        {/* Año de Fabricación */}
                        <div>
                            <p className="text-sm tracking-wide text-black mb-1">
                                Año de Fabricación
                            </p>
                            {data?.fabricationYear ? (
                                <p className="text-black font-medium bg-[#a1b8f7] rounded p-2">
                                    {data?.fabricationYear || '-'}
                                </p>
                            ) : (
                                <p className="text-black bg-[#a1b8f7] rounded p-2">Sin año de fabricación asociado</p>
                            )}
                        </div>

                    </div>
                </FormGroup>
            </div>
        </div>
    );
};

export default VehicleInfo;