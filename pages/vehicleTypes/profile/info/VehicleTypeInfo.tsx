import React from 'react';
import FormGroup from '../../../../layout/shared/form-group';
import { Input, Textarea } from 'rizzui';
import VehicleIconSelector from '../../../../components/icon/VehicleIconSelector';

interface VehicleTypeInfoProps { 
    vehicleType: any;
}

const VehicleTypeInfo: React.FC<VehicleTypeInfoProps> = ({ vehicleType }) => {

    // RENDER

    return (
        <div className="@container">
            <div className="grid gap-8">

                <FormGroup
                    title="Datos del tipo de vehículo"
                    description="Información detallada del tipo de vehículo"
                    className="pt-4"
                    titleCols="@md:col-span-2"
                    childCols="@md:col-span-10"
                >
                    <div className="grid md:grid-cols-12 gap-10 items-start">

                        {/* INFO */}

                        <div className="md:col-span-12 grid md:grid-cols-2 gap-8">

                            {/* NAME */}

                             <Input
                                disabled
                                label="Nombre"
                                placeholder="Nombre"
                                value={vehicleType?.name ?? ''}
                                inputClassName='!bg-[#a1b8f7]'
                            />

                            {/* ORION NAME */}

                            <Input
                                disabled
                                label="Nombre en Orion"
                                placeholder="Nombre en Orion"
                                value={vehicleType?.orionName ?? ''}
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
                                    value={vehicleType?.description ?? ''}
                                />
                            </div>

                            {/* Subtipos vinculados */}
                            <div className="">
                                <p className="text-sm tracking-wide text-black mb-1">
                                    Subtipos vinculados
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {vehicleType?.vehicleSubTypes && vehicleType.vehicleSubTypes.length > 0 ? (
                                        vehicleType.vehicleSubTypes.map((subtype: any) => (
                                            <span 
                                                key={subtype.id} 
                                                className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                                            >
                                                <VehicleIconSelector
                                                    category={null} 
                                                    subcategory={subtype?.name} 
                                                    className='w-8 h-8 me-2'
                                                />
                                                {subtype.name}
                                            </span>
                                        ))
                                    ) : (
                                        <p className="text-gray-500 italic">No hay subtipos vinculados</p>
                                    )}
                                </div>
                            </div>

                            <div className='grid md:grid-cols-2 gap-8'>
                                <div>
                                    <Input
                                        disabled
                                        label="Fecha de creación"
                                        placeholder="Fecha de creación"
                                        value={vehicleType?.createdAt?.date
                                            ? new Date(vehicleType.createdAt.date).toLocaleString()
                                            : 'Sin modificaciones'}
                                        inputClassName='!bg-[#a1b8f7]'
                                    />
                                </div>
                                <div>
                                    <Input
                                        disabled
                                        label="Última actualización"
                                        placeholder="Última actualización"
                                        value={vehicleType?.updatedAt?.date
                                            ? new Date(vehicleType.updatedAt.date).toLocaleString()
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

export default VehicleTypeInfo;
