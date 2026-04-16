import React from 'react';
import FormGroup from '../../../../layout/shared/form-group';
import { Input, Textarea } from 'rizzui';
import VehicleIconSelector from '../../../../components/icon/VehicleIconSelector';

interface VehicleSubTypeInfoProps { 
    vehicleSubType?: any;
}

const VehicleSubTypeInfo: React.FC<VehicleSubTypeInfoProps> = ({ vehicleSubType }) => {

    // RENDER

    return (
        <div className="@container">
            <div className="grid gap-8">

                <FormGroup
                    title="Datos del subtipo de vehículo"
                    description="Información detallada del subtipo de vehículo"
                    className="pt-4"
                    titleCols="@md:col-span-2"
                    childCols="@md:col-span-10"
                >
                    <div className="grid md:grid-cols-12 gap-10 items-start">

                        {/* INFORMACIÓN */}
                        <div className="md:col-span-12 grid md:grid-cols-2 gap-8">

                            {/* NAME */}

                             <Input
                                disabled
                                label="Nombre"
                                placeholder="Nombre"
                                value={vehicleSubType?.name ?? ''}
                                inputClassName='!bg-[#a1b8f7]'
                            />

                            {/* ORION NAME */}

                            <Input
                                disabled
                                label="Nombre en Orion"
                                placeholder="Nombre en Orion"
                                value={vehicleSubType?.orionName ?? ''}
                                inputClassName='!bg-[#a1b8f7]'
                            />

                            {/* DESCRIPTION */}

                             <div className="md:col-span-2">
                                <Textarea
                                    id='description'
                                    label="Descripción"
                                    textareaClassName='bg-[#a1b8f7]'
                                    required={false}
                                    className={`[&>label>span]:font-medium`}
                                    rows={3}
                                    value={vehicleSubType?.description ?? ''}
                                />
                            </div>


                            {/* Tipos vinculados */}
                            <div className="">
                                <p className="text-sm tracking-wide text-black mb-1">
                                    Tipos vinculados
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {vehicleSubType?.types && vehicleSubType.types.length > 0 ? (
                                        vehicleSubType.types.map((type: any) => (
                                            <span 
                                                key={type.id} 
                                                className="inline-flex items-center px-2.5 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800"
                                            >
                                                <VehicleIconSelector
                                                    category={type?.name} 
                                                    subcategory={null} 
                                                    className='w-6 h-6 me-2'
                                                />
                                                {type.name}
                                            </span>
                                        ))
                                    ) : (
                                        <p className="text-gray-500 italic">No hay tipos vinculados</p>
                                    )}
                                </div>
                            </div>

                            <div className='grid md:grid-cols-2 gap-8'>
                                <div>
                                    <Input
                                        disabled
                                        label="Fecha de creación"
                                        placeholder="Fecha de creación"
                                        value={vehicleSubType?.createdAt?.date
                                            ? new Date(vehicleSubType.createdAt.date).toLocaleString()
                                            : 'Sin modificaciones'}
                                        inputClassName='!bg-[#a1b8f7]'
                                    />
                                </div>
                                <div>
                                    <Input
                                        disabled
                                        label="Última actualización"
                                        placeholder="Última actualización"
                                        value={vehicleSubType?.updatedAt?.date
                                            ? new Date(vehicleSubType.updatedAt.date).toLocaleString()
                                            : 'Sin modificaciones'}
                                        inputClassName='!bg-[#a1b8f7]'
                                    />
                                </div>
                            </div>
                        </div>

                    </div>
                </FormGroup>


            </div>
        </div>
    );
};

export default VehicleSubTypeInfo;
