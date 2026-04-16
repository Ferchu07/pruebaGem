import React from 'react';
import FormGroup from '../../../../layout/shared/form-group';
import AsyncImg from '../../../../components/extras/AsyncImg';
import PlaceholderImage from '../../../../components/extras/PlaceholderImage';
import { Input, Loader, Textarea } from 'rizzui';

interface BrandInfoProps {
    brand: any;
}

const BrandInfo: React.FC<BrandInfoProps> = ({ brand }) => {

    // RENDER

    return (
        <> 
            {brand !== null && brand !== undefined ? (
                <div className="@container">
                    <div className="grid gap-8">

                        <FormGroup
                            title="Datos de la marca"
                            description="Información detallada de la marca"
                            className="pt-4"
                            titleCols="@md:col-span-2"
                            childCols="@md:col-span-10"
                        >
                            <div className="grid md:grid-cols-12 gap-10 items-start">

                                {/* INFORMACIÓN */}
                                <div className="md:col-span-6 grid md:grid-cols-2 gap-8">

                                    <Input
                                        disabled
                                        label="Nombre"
                                        placeholder="Nombre"
                                        value={brand?.name ?? ''}
                                        inputClassName='!bg-[#a1b8f7]'
                                    />


                                    {/* Estado */}
                                    <div className='flex flex-col'>
                                        <p className="text-xs tracking-wide text-black mb-1">
                                            Estado
                                        </p>
                                        <span
                                            className={`inline-flex items-center px-3 py-2 rounded text-xs font-medium mt-2 text-center ${
                                                brand?.isActive
                                                    ? 'bg-green-200 text-green-700 font-[600]'
                                                    : 'bg-red-100 text-red-700 font-[600]'
                                            }`}
                                        >
                                            <span className='mx-auto'>{brand?.isActive ? 'Activa' : 'Inactiva'}</span>
                                        </span>
                                    </div>

                                    <Input
                                        disabled
                                        label="Orion Id"
                                        placeholder="Orion Id"
                                        value={brand?.orionId ?? ''}    
                                        inputClassName='!bg-[#a1b8f7]'
                                    />

                                    <Input
                                        disabled
                                        label="Orion Name"
                                        placeholder="Orion name"
                                        value={brand?.orionName ?? ''}
                                        inputClassName='!bg-[#a1b8f7]'
                                    />

                                    {/* Descripción */}

                                    <div className="md:col-span-2">
                                        <Textarea
                                            id='description'
                                            label="Descripción de la marca"
                                            textareaClassName='bg-[#a1b8f7]'
                                            required={false}
                                            className={`[&>label>span]:font-medium`}
                                            rows={3}
                                            value={brand?.description ?? ''}
                                        />
                                    </div>

                                    <div>
                                        <Input
                                            disabled
                                            label="Fecha de creación"
                                            placeholder="Fecha de creación"
                                            value={brand?.createdAt?.date
                                                ? new Date(brand.createdAt.date).toLocaleString()
                                                : '-'}
                                            inputClassName='!bg-[#a1b8f7]'
                                        />
                                    </div>

                                    <div>
                                        <Input
                                            disabled
                                            label="Última actualización"
                                            placeholder="Última actualización"
                                            value={brand?.updatedAt?.date
                                                ? new Date(brand.updatedAt.date).toLocaleString()
                                                : 'Sin modificaciones'}
                                            inputClassName='!bg-[#a1b8f7]'
                                        />
                                    </div>
                                </div>

                                {/* IMAGEN */}
                                <div className="md:col-span-4 flex flex-col items-center">

                                    {brand?.brandImg ? (
                                        <AsyncImg
                                            id={brand.brandImg.id}
                                            isBackground
                                            className="rounded-xl shadow-sm w-[240px] h-[240px] object-cover"
                                        />
                                    ) : (
                                        <PlaceholderImage
                                            width={240}
                                            height={240}
                                            className="rounded-xl shadow-sm"
                                        />
                                    )}

                                </div>

                            </div>
                        </FormGroup>


                    </div>
                </div> 
            ) : (
                <Loader height='60vh' />
            )}
        </>
    );
};

export default BrandInfo;
