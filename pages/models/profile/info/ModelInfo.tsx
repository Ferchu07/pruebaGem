import React, { useCallback, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import useFetch from '../../../../hooks/useFetch';
import FormGroup from '../../../../layout/shared/form-group';
import { ModelService } from '../../../../services/model/modelService';
import { ModelApiResponse } from '../../../../type/entities/model-type';
import { PrivilegeContext } from '../../../../components/priviledge/PriviledgeProvider';
import { menuRoutes } from '../../../../router/menu';
import { Input, Textarea } from 'rizzui';
import VehicleIconSelector from '../../../../components/icon/VehicleIconSelector';

interface ModelInfoProps { 
    model?: any;
}

const ModelInfo: React.FC<ModelInfoProps> = ({ model }) => {

    // HOOKS

    const { userCan } = useContext(PrivilegeContext);

    // RENDER

    return (
        <div className="@container">
            <div className="grid gap-8">

                <FormGroup
                    title="Datos del modelo"
                    description="Información detallada del modelo"
                    className="pt-4"
                    titleCols="@md:col-span-2"
                    childCols="@md:col-span-10"
                >
                    <div className="grid md:grid-cols-2 gap-8">

                        {/* Nombre */}

                        <Input
                            disabled
                            label="Nombre"
                            placeholder="Nombre"
                            value={model?.name ?? ''}
                            inputClassName='!bg-[#a1b8f7]'
                        />      

                        {/* Tipo de vehículo */}
                        <div>
                            <p className="text-sm tracking-wide text-black mb-2">
                                Tipo de vehículo
                            </p>

                            {model?.vehicleType ? (
                                userCan('get_vehicle_types', 'vehicle_types') ? (
                                    <Link
                                        to={`${menuRoutes.vehicleTypes.path}/${model.vehicleType.id}/profile/${menuRoutes.vehicleTypes.profile.info}`}
                                        className="text-primary font-medium hover:underline !bg-[#a1b8f7] p-2 rounded flex items-end"
                                    >
                                        <VehicleIconSelector
                                            category={model.vehicleType.name} 
                                            subcategory={null} 
                                            className='w-6 h-6 me-2'
                                        />
                                        {model.vehicleType.name} ({model.vehicleType.orionName})
                                    </Link>
                                ) : (
                                    <p className="text-black font-medium !bg-[#a1b8f7] p-2 rounded flex items-end">
                                        <VehicleIconSelector
                                            category={model.vehicleType.name} 
                                            subcategory={null} 
                                            className='w-6 h-6 me-2'
                                        />
                                        {model.vehicleType.name} ({model.vehicleType.orionName})
                                    </p>
                                )
                            ) : (
                                <p className="text-gray-500">Sin tipo asociado</p>
                            )}
                        </div>

                        {/* Subtipo de vehículo */}
                        <div>
                            <p className="text-sm tracking-wide text-black mb-2">
                                Subtipo de vehículo
                            </p>

                            {model?.vehicleSubtype ? (
                                userCan('get_vehicle_subtypes', 'vehicle_subtypes') ? (
                                    <Link
                                        to={`${menuRoutes.vehicleSubTypes.path}/${model.vehicleSubtype.id}/profile/${menuRoutes.vehicleSubTypes.profile.info}`}
                                        className="text-primary font-medium hover:underline  !bg-[#a1b8f7] p-2 rounded flex items-end"
                                    >
                                        <VehicleIconSelector
                                            category={null} 
                                            subcategory={model.vehicleSubtype.name} 
                                            className='w-6 h-6 me-2'
                                        />
                                        {model.vehicleSubtype.name} ({model.vehicleSubtype.orionName})
                                    </Link>
                                ) : (
                                    <p className="text-black font-medium !bg-[#a1b8f7] p-2 rounded flex items-end">
                                        <VehicleIconSelector
                                            category={null} 
                                            subcategory={model.vehicleSubtype.name} 
                                            className='w-6 h-6 me-2'
                                        />
                                        {model.vehicleSubtype.name} ({model.vehicleSubtype.orionName})
                                    </p>
                                )
                            ) : (
                                <p className="text-gray-500">Sin subtipo asociado</p>
                            )}
                        </div>

                        {/* Marca */}
                        <div>
                            <p className="text-sm tracking-wide text-black mb-4">
                                Marca
                            </p>

                            {model?.brand ? (
                                userCan('get_brands', 'brands') ? (
                                    <Link
                                        to={`${menuRoutes.brands.path}/${model.brand.id}/profile/${menuRoutes.brands.profile.info}`}
                                        className="text-primary font-medium hover:underline !bg-[#a1b8f7] p-2 rounded"
                                    >
                                        {model.brand.name}
                                    </Link>
                                ) : (
                                    <p className="text-black font-medium !bg-[#a1b8f7] p-2 rounded">
                                        {model.brand.name}
                                    </p>
                                )
                            ) : (
                                <p className="text-gray-500">Sin marca asociada</p>
                            )}
                        </div>

                        {/* Descripción - ocupa ancho completo */}
                        <div className="md:col-span-2">
                            <Textarea
                                id='description'
                                label="Descripción"
                                textareaClassName='bg-[#a1b8f7]'
                                required={false}
                                className={`[&>label>span]:font-medium`}
                                rows={3}
                                value={model?.description ?? ''}
                            />
                        </div>

                    </div>
                </FormGroup>

            </div>
        </div>
    );
};

export default ModelInfo;
