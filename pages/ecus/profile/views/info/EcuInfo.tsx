import React from 'react';
import { Input, Textarea } from 'rizzui';
import AsyncImg from '../../../../../components/extras/AsyncImg';
import PlaceholderImage from '../../../../../components/extras/PlaceholderImage';
import FormGroup from '../../../../../layout/shared/form-group';

interface EcuInfoProps { 
    data?: any;
}

const EcuInfo: React.FC<EcuInfoProps> = ({ data }) => {
    
    // RENDER

    return (
        <div className="@container">
            <div className="grid divide-y-2 divide-dashed divide-gray-200 gap-6">
                <FormGroup
                    title="Datos Personales"
                    description='Información de la ECU'
                    className='pt-3 pb-4'
                    titleCols="@md:col-span-2"
                    childCols="@md:col-span-10 md:grid-cols-4"
                >
                    <div className='md:col-span-3 md:grid md:grid-cols-12 gap-4'>

                        <Input
                            disabled
                            label="Nombre"
                            placeholder="Nombre de la ECU"
                            value={data?.name ?? ''}
                            className="md:col-span-4"
                            inputClassName='!bg-[#a1b8f7]'

                        />

                        <Input
                            disabled
                            label="Nombre en Orion"
                            placeholder="Nombre en Orion"
                            value={data?.orionName ?? ''}   
                            className="md:col-span-4"
                            inputClassName='!bg-[#a1b8f7]'
                        />

                        <Input
                            disabled
                            label="ID en Orion"
                            placeholder="ID en Orion"
                            value={data?.orionId ?? ''}
                            className="md:col-span-4"
                            inputClassName='!bg-[#a1b8f7]'
                        />

                        <Textarea
                            disabled
                            label="Descripción"
                            placeholder="Descripción de la ECU"
                            value={data?.description ?? ''}
                            className="md:col-span-12"
                            textareaClassName='!bg-[#a1b8f7]'
                        />


                    </div>

                    {data?.image?.id
                        ? <AsyncImg id={data?.image?.id} isBackground className="mx-auto d-block img-fluid rounded w-[220px] h-[220px] object-cover" />
                        : <PlaceholderImage width={200} height={200} className='mx-auto d-block img-fluid rounded !bg-[#a1b8f7]' />
                    }
                </FormGroup>
            </div>
        </div>
    );
};

export default EcuInfo;
