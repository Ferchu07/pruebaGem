import { useFormik } from 'formik';
import React, { useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import * as yup from 'yup';
import RequiredInput from '../../components/forms/InputHOC';
import { PrivilegeContext } from '../../components/priviledge/PriviledgeProvider';
import Page from '../../layout/Page/Page';
import cn from '../../utils/classNames';
import FormFooter from '../_layout/_footers/form-footer';
import { Textarea } from 'rizzui';
import { Model } from '../../type/entities/model-type';
import CustomSelectApiHookForm from '../../components/forms/CustomSelectApiHookForms';
import useBrands from '../../hooks/api-calls/useBrands';
import useVehicleTypes from '../../hooks/api-calls/useVehicleTypes';
import { useState } from 'react';
import { useEffect } from 'react';
import { VehicleTypeService } from '../../services/vehicleType/vehicleTypeService';

interface FormProps {
    isLoading: boolean;
    submit: Function;
    data?: Model | undefined;
}

export const MODEL_STATUSES = [
    { value: false, label: 'Inactivo', color: '#d11f1fff', id: 0 },
    { value: true, label: 'Activo', color: '#2bf11cff', id: 1 },
    { value: null, label: 'Todos', color: '#e2d8cfff', id: 2 }
];

const ModelForm: React.FC<FormProps> = ({ isLoading, submit, data }) => {
    // HOOKS
    const navigate = useNavigate();
    const mode = data ? 'Editar' : 'Crear';
    const { userCan } = useContext(PrivilegeContext);

    // API CALLS
    const { fetchBrands } = useBrands({ active: true });
    // Importante: No destructuramos rawVehicleTypes aquí directamente si queremos control total, 
    // pero tu hook ya lo expone, así que lo usaremos.
    const { fetchVehicleTypes, rawVehicleTypes } = useVehicleTypes({ active: true });
    const [isSubtypeRequired, setIsSubtypeRequired] = useState<boolean>(false);
    
    // STATE
    const [vehicleSubtypes, setVehicleSubtypes] = useState<any[]>([]);

    // REF (Para que fetchOptions lea siempre el valor real actual)
    const vehicleSubtypesRef = useRef<any[]>([]);

    const validationSchema = yup.object({
        name: yup.string().required('El nombre es obligatorio'),
        description: yup.string(),
        brandId: yup.string().required('La marca es obligatoria'),
        orionName: yup.string().required('El nombre de orion es obligatorio'),
        orionId: yup.number().required('El id de orion es obligatorio'),
        vehicleTypeId: yup.string().required('El tipo de vehículo es obligatorio'),
        vehicleSubtypeId: yup.string().when('vehicleTypeId', {
            is: (vehicleTypeId: string) => {
                if (!vehicleTypeId) return false;

                const selectedType = rawVehicleTypes.find(
                    (vt: any) => vt.id === vehicleTypeId
                );

                return (selectedType?.vehicleSubTypes?.length ?? 0) > 0;
            },
            then: (schema) => schema.required('El subtipo es obligatorio'),
            otherwise: (schema) => schema.nullable().notRequired(),
        }),
    });

    // FORMIK
    const formik = useFormik({
        initialValues: {
            modelId: data?.id || '',
            brandId: data?.brand?.id || '',
            vehicleTypeId: data?.vehicleType?.id || '',
            vehicleSubtypeId: data?.vehicleSubtype?.id || '',
            name: data?.name || '',
            orionName: data?.orionName || '',
            orionId: data?.orionId || '',
            description: data?.description || '',
            isCreateMode: mode === 'Crear',
        },
        validationSchema: validationSchema,
        validateOnBlur: false,
        onSubmit: values => { submit(values); },
    });

    // 1. Carga inicial de los tipos de vehículos
    useEffect(() => {
        fetchVehicleTypes();
    }, []);

    // 2. Limpieza de subtipos al cambiar el tipo
    useEffect(() => {
        if (formik.values.vehicleTypeId !== data?.vehicleType?.id) {
             formik.setFieldValue('vehicleSubtypeId', '');
        }
        
        // Nota: No ponemos [data] en dependencias para evitar loops, solo nos interesa cuando cambia el input.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formik.values.vehicleTypeId]);

    // 3. CALCULO DE SUBTIPOS (Actualiza Estado y REF)
    useEffect(() => {
        if (!formik.values.vehicleTypeId || rawVehicleTypes.length === 0) {
            setVehicleSubtypes([]);
            setIsSubtypeRequired(false);
            vehicleSubtypesRef.current = []; // Limpiamos Ref
            return;
        }

        const selectedType = rawVehicleTypes.find(
            (vt: any) => vt.id === formik.values.vehicleTypeId
        );

        if (!selectedType?.vehicleSubTypes || selectedType.vehicleSubTypes.length === 0) {
            formik.setFieldValue('vehicleSubtypeId', '');
            setIsSubtypeRequired(false);
        }

        if (selectedType?.vehicleSubTypes) {
            const mapped = selectedType.vehicleSubTypes.map((sub: any) => ({
                value: sub.id,
                label: `${sub.name} (${sub.orionName})`,
            }));
            
            // ACTUALIZAMOS AMBOS
            setVehicleSubtypes(mapped);
            setIsSubtypeRequired(true);
            vehicleSubtypesRef.current = mapped; // <--- CLAVE DEL ÉXITO
        } else {
            setVehicleSubtypes([]);
            vehicleSubtypesRef.current = [];
        }

    }, [formik.values.vehicleTypeId, rawVehicleTypes]);

    // RENDER
    return (
        <>
            <Page container="fluid">
                <div className="@container">
                    <form onSubmit={formik.handleSubmit}>
                        <div className="mb-10 grid gap-4 divide-y-2 divide-dashed divide-gray-200 @2xl:gap-9 @3xl:gap-11 font-medium">
                            <div className={cn(mode === 'Crear' ? 'md:col-span-12' : 'md:col-span-8')}>
                                <div className='md:grid md:grid-cols-3 gap-4'>
                                    <CustomSelectApiHookForm
                                        id="brandId"
                                        label="Marca"
                                        required={true}
                                        formik={formik}
                                        fetchOptions={async (searchText: string | null) => {
                                            if (data?.brand && !searchText) {
                                                return [
                                                    {
                                                        value: data.brand.id,
                                                        label: data.brand.name
                                                    }
                                                ];
                                            }

                                            return fetchBrands({ search_text: searchText }) as any;
                                        }}
                                        error={
                                            (formik.touched.brandId || formik.submitCount > 0)
                                                ? formik.errors.brandId
                                                : undefined
                                        }
                                        containerClassName={cn('md:col-span-4')}
                                    />

                                    {/* VEHICLE TYPE */}
                                    <CustomSelectApiHookForm
                                        id="vehicleTypeId"
                                        label="Tipo de vehículo"
                                        required={true}
                                        formik={formik}
                                        // HEMOS QUITADO LA PROP onChange QUE DABA ERROR
                                        fetchOptions={async (searchText: string | null) => {
                                            // Pre-load en edición
                                            if (data?.vehicleType && !searchText && formik.values.vehicleTypeId === data.vehicleType.id) {
                                                return [{ 
                                                    value: data.vehicleType.id, 
                                                    label: `${data.vehicleType.name} (${data.vehicleType.orionName})` 
                                                }];
                                            }
                                            // Busqueda normal
                                            return fetchVehicleTypes({ search_text: searchText }) as any;
                                        }}
                                        error={
                                            (formik.touched.vehicleTypeId || formik.submitCount > 0)
                                                ? formik.errors.vehicleTypeId
                                                : undefined
                                        }
                                        containerClassName="md:col-span-4"
                                    />

                                    {/* VEHICLE SUBTYPE (CORREGIDO) */}
                                <CustomSelectApiHookForm
                                    key={`subtype-${formik.values.vehicleTypeId}`} 
                                    id="vehicleSubtypeId"
                                    label="Subtipo de vehículo"
                                    required={isSubtypeRequired}
                                    formik={formik}
                                    minInputLength={0}
                                    isDisabled={!formik.values.vehicleTypeId}
                                    error={
                                        (formik.touched.vehicleSubtypeId || formik.submitCount > 0)
                                            ? formik.errors.vehicleSubtypeId
                                            : undefined
                                    }
                                    containerClassName="md:col-span-4"
                                    fetchOptions={async (searchText: string | null) => {
                                        // 1. LEEMOS DESDE EL REF (Siempre tiene el dato fresco)
                                        const currentOptions = vehicleSubtypesRef.current;
                                        
                                        // 2. Lógica para visualizar valor inicial (Edición)
                                        // Si tenemos un ID seleccionado, pero no está en la lista actual (quizás la lista aun no cargó o estamos iniciando)
                                        // forzamos mostrar el dato guardado en `data`.
                                        if (data?.vehicleSubtype && formik.values.vehicleSubtypeId === data.vehicleSubtype.id) {
                                            const existsInList = currentOptions.find(o => o.value === data.vehicleSubtype?.id);
                                            
                                            // Si la lista está vacía o no contiene el elemento, devolvemos el "fake" inicial
                                            if (!existsInList) {
                                                return [{
                                                    value: data.vehicleSubtype.id,
                                                    label: `${data.vehicleSubtype.name} (${data.vehicleSubtype.orionName || ''})`
                                                }];
                                            }
                                        }

                                        // 3. Filtrado Local sobre el REF
                                        if (!searchText) return currentOptions;
                                        
                                        return currentOptions.filter(item => 
                                            item.label.toLowerCase().includes(searchText.toLowerCase())
                                        );
                                    }}
                                />

                                <RequiredInput
                                    id='name'
                                    className='mt-2'
                                    label="Nombre"
                                    formik={formik}
                                />

                                <RequiredInput
                                    id='orionName'
                                    className='mt-2'
                                    label="Nombre de Orion"
                                    formik={formik}
                                />

                                <RequiredInput
                                    id='orionId'
                                    className='mt-2'
                                    label="Id de Orion"
                                    formik={formik}
                                />

                                <Textarea
                                    id='description'
                                    label="Descripción del modelo"
                                    required={false}
                                    className={`[&>label>span]:font-medium col-span-9`}
                                    textareaClassName='bg-[#a1b8f7]'
                                    rows={3}
                                    onChange={formik.handleChange}
                                    value={formik.values.description}
                                    error={formik.errors.description}
                                />
                                </div>
                            </div>
                        </div>
                        <FormFooter
                            submitBtnText={mode + ' modelo'}
                            customBg='bg-transparent'
                            handleCancelBtn={() => navigate(-1)}
                            handleSubmitBtn={formik.submitForm}
                            isLoading={isLoading}
                        />
                    </form>
                </div>
            </Page>
        </>
    )
};

export default ModelForm;