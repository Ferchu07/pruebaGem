import { useFormik } from 'formik';
import moment from 'moment';
import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as yup from 'yup';
import { ReactComponent as VehiculoActivoIcon } from '../../assets/Iconos/Interfaz/vehiculo_activo.svg';
import { ReactComponent as VehiculoInactivoIcon } from '../../assets/Iconos/Interfaz/vehiculo_inactivo.svg';
import { ReactComponent as VehiculoMantenimientoIcon } from '../../assets/Iconos/Interfaz/vehiculo_pruebas.svg';
import { ReactComponent as VehiculoRetiradoIcon } from '../../assets/Iconos/Interfaz/vehiculo_retirado.svg';
import CustomSelect from '../../components/forms/CustomSelect';
import FormLabel from '../../components/forms/FormLabel';
import RequiredInput from '../../components/forms/InputHOC';
import { YearDatePicker } from '../../components/forms/YearDatePicker';
import { PrivilegeContext } from '../../components/priviledge/PriviledgeProvider';
import useCompanies from '../../hooks/api-calls/useCompanies';
import useBrands from '../../hooks/api-calls/useBrands';
import useModels from '../../hooks/api-calls/useModels';
import Page from '../../layout/Page/Page';
import { Vehicle } from '../../type/entities/vehicle-type';
import cn from '../../utils/classNames';
import FormFooter from '../_layout/_footers/form-footer';

interface FormProps {
    isLoading: boolean;
    submit: Function;
    data?: Vehicle | undefined;
}

const schema = yup.object({
    brandId: yup.string().required('La marca es obligatoria'),
    modelId: yup.string().required('El modelo es obligatorio'),
    chassisNumber: yup.string().required('El número de bastidor es obligatorio'),
    category: yup.number().required('La categoría es obligatoria'),
    status: yup.string().required('El estado es obligatorio'),
    subcategory: yup.number().when('category', {
        is: (category: number) => category === 1 || category === 2 || category === 5,
        then: (schema) => schema.required('La subcategoría es obligatoria para camiones, buses y vehículos comerciales ligeros'),
        otherwise: (schema) => schema.notRequired(),
    }),
});

export const VEHICLE_STATUSES = [
    { value: 0, label: 'Activo', color: '#1fd15e', backgroundColor: 'rgba(16, 185, 129, 0.1)', id: 0, icon: VehiculoActivoIcon },
    { value: 1, label: 'Inactivo', color: '#a5a5a5', backgroundColor: 'rgba(244, 147, 63, 0.1)', id: 1, icon: VehiculoInactivoIcon },
    { value: 2, label: 'Mantenimiento', color: '#ed9339', backgroundColor: 'rgba(0, 38, 255, 0.1)', id: 2, icon: VehiculoMantenimientoIcon },
    { value: 3, label: 'Retirado', color: '#ff0000', backgroundColor: 'rgba(255, 0, 0, 0.1)',id: 3, icon: VehiculoRetiradoIcon },
];

const VehicleForm: React.FC<FormProps> = ({ isLoading, submit, data }) => {

    const navigate = useNavigate();
    const mode = data ? 'Editar' : 'Crear';
    
    const { userCan } = useContext(PrivilegeContext);
    const { getCompaniesList } = useCompanies();
    const { fetchBrands, getBrandsList } = useBrands();
    const { fetchModels, getModelsList } = useModels();

    const formik = useFormik({
        initialValues: {
            vehicleId: data?.id || '',
            brandId: (typeof data?.brand === 'object' ? data?.brand?.id : data?.brand) || '', 
            modelId: (typeof data?.model === 'object' ? data?.model?.id : data?.model) || '',
            status: data?.status || 0,
            fabricationYear: data?.fabricationYear || null,
            plateNumber: data?.plateNumber || '',
            chassisNumber: data?.chassisNumber || '',
            category: data?.category || 0,
            subcategory: data?.subcategory || 0,
            company: data?.company?.id || '',
            isCreateMode: mode === 'Crear',
        },
        validationSchema: schema,
        validateOnBlur: false,
        onSubmit: values => { submit(values); },
    });

    useEffect(() => {
        if (userCan('get_brands_for_selects', 'brands')) {
            fetchBrands();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const selectedBrandId = formik.values.brandId;
        
        if (selectedBrandId && userCan('get_models_for_selects', 'models')) {
            fetchModels({ brands: [selectedBrandId] }); 
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formik.values.brandId]);

    return (
        <>
            <Page container="fluid">
                <div className="@container">
                    <form onSubmit={formik.handleSubmit}>
                        <div className="mb-10 grid gap-4 divide-y-2 divide-dashed divide-gray-200 @2xl:gap-9 @3xl:gap-11 font-medium">
                            <div className={cn(mode === 'Crear' ? 'md:col-span-12' : 'md:col-span-8')}>
                                <div className='md:grid md:grid-cols-3 gap-4'>
                                    
                                    {userCan('list_companies', 'companies') && (
                                        <CustomSelect
                                            id='company'
                                            label="Compañia"
                                            required
                                            containerClassName='mt-2'
                                            options={getCompaniesList()}
                                            onChange={(value: any) => {
                                                formik.setFieldValue('company', value?.value || '');
                                            }}
                                            key={`company-${formik.values.company}`}
                                            value={getCompaniesList()?.find((company: any) => company.value == formik.values.company)}
                                            error={formik.errors.company}
                                        />
                                    )}

                                    <RequiredInput
                                        id='chassisNumber'
                                        className='mt-2'
                                        label="Número de Bastidor"
                                        formik={formik}
                                        disabled={!formik.values.isCreateMode}
                                    />

                                    <RequiredInput
                                        id='plateNumber'
                                        className='mt-2'
                                        label="Matrícula"
                                        disabled={!formik.values.isCreateMode}
                                        formik={formik}
                                    />

                                    {/* --- SELECTOR DE MARCA MODIFICADO --- */}
                                    {userCan('get_brands_for_selects', 'brands') && (
                                        <CustomSelect
                                            id='brandId'
                                            label="Marca"
                                            required
                                            containerClassName='mt-2'
                                            // 1. Permite borrar (aparece la X)
                                            isClearable={true} 
                                            options={getBrandsList() || []}
                                            onChange={(value: any) => {
                                                // 2. Manejo seguro: si value es null (se borró), pasamos string vacío
                                                const brandVal = value ? value.value : '';
                                                formik.setFieldValue('brandId', brandVal);
                                                
                                                // 3. Siempre reseteamos el modelo al cambiar o borrar la marca
                                                formik.setFieldValue('modelId', ''); 
                                            }}
                                            value={getBrandsList()?.find((b: any) => b.value === formik.values.brandId)}
                                            error={formik.errors.brandId}
                                        />
                                    )}

                                    {/* --- SELECTOR DE MODELO MODIFICADO --- */}
                                    {userCan('get_models_for_selects', 'models') && (
                                        <CustomSelect
                                            // 4. KEY IMPORTANTE: 
                                            // Al cambiar el brandId, esta key cambia. Esto obliga a React a 
                                            // destruir y recrear este Select. Esto asegura que visualmente 
                                            // se limpie cualquier texto residual del modelo anterior.
                                            key={`model-select-${formik.values.brandId}`}
                                            
                                            id='modelId'
                                            label="Modelo"
                                            required
                                            containerClassName='mt-2'
                                            // Deshabilitado si no hay marca seleccionada (string vacío)
                                            isDisabled={!formik.values.brandId} 
                                            // Permite borrar el modelo individualmente
                                            isClearable={true}
                                            options={getModelsList() || []}
                                            onChange={(value: any) => {
                                                // Manejo seguro de null
                                                const modelVal = value ? value.value : '';
                                                formik.setFieldValue('modelId', modelVal);
                                            }}
                                            // Buscamos el objeto. Si modelId es '', find devuelve undefined y el select se ve vacío (correcto)
                                            value={getModelsList()?.find((m: any) => m.value === formik.values.modelId)}
                                            error={formik.errors.modelId}
                                        />
                                    )}

                                    <div className='flex flex-col text-sm mt-2'>
                                        <FormLabel label="Año de Fabricación" />
                                        <YearDatePicker
                                            id='fabricationYear'
                                            dateFormat="yyyy"
                                            placeholderText="Seleccione el año de fabricación"
                                            showYearPicker
                                            defaultValue={formik.values.fabricationYear ? moment(formik.values.fabricationYear, 'yyyy').toDate() : null}
                                            onChange={
                                                (value: any) => {
                                                    formik.setFieldValue('fabricationYear', value ? moment(value).year() : null);
                                                }
                                            }
                                        />
                                    </div>

                                    <CustomSelect
                                        id='status'
                                        label="Estado"
                                        required
                                        containerClassName={`mt-2 ${userCan('list_companies', 'companies') ? '' : 'col-span-2'}`}
                                        options={VEHICLE_STATUSES}
                                        formatOptionLabel={(option: any) => (
                                            <div className="flex flex-row items-center gap-2">
                                                {option.icon && <option.icon className="w-5 h-5" />}
                                                <span>{option.label}</span>
                                            </div>
                                        )}
                                        onChange={
                                            (value: any) => {
                                                formik.setFieldValue('status', value.value);
                                            }
                                        }
                                        value={VEHICLE_STATUSES.find((status: any) => status.value == formik.values.status)}
                                        error={formik.errors.status}
                                        customStyles={{
                                            control: (base: any) => {
                                                const selectedOption = VEHICLE_STATUSES.find((s: any) => s.value == formik.values.status);
                                                const bg = selectedOption ? (selectedOption.value === 0 ? '#86efac' : selectedOption?.backgroundColor?.replace('0.1', '1') || '#a1b8f7') : '#a1b8f7';
                                                
                                                return {
                                                ...base,
                                                backgroundColor: bg,
                                                borderColor: 'white',
                                                };
                                            },
                                            singleValue: (base: any) => ({
                                                ...base,
                                                color: 'black', // Text color
                                            })
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </Page>
            <FormFooter
                submitBtnText={mode + ' vehículo'}
                handleCancelBtn={() => navigate(-1)}
                handleSubmitBtn={formik.submitForm}
                isLoading={isLoading}
            />
        </>
    )
};

export default VehicleForm;