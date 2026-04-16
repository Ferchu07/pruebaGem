import { useFormik } from 'formik';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import * as yup from 'yup';
import RequiredInput from '../../components/forms/InputHOC';
import Page from '../../layout/Page/Page';
import cn from '../../utils/classNames';
import FormFooter from '../_layout/_footers/form-footer';
import { Textarea } from 'rizzui';
import { VehicleType } from '../../type/entities/vehicle-type-type';

interface FormProps {
    isLoading: boolean;
    submit: Function;
    data?: VehicleType | undefined;
}

const schema = yup.object({
    name: yup.string().required('El nombre es onligatorio'),
    orionName: yup.string().required('El nombre de Orion es onligatorio'),
    description: yup.string(),
});

const VehicleTypesForm: React.FC<FormProps> = ({ isLoading, submit, data }) => {

    // HOOKS
    
    const navigate = useNavigate();
    const mode = data ? 'Editar' : 'Crear';

    // FORMIK

    const formik = useFormik({
        initialValues: {
            vehicleTypeId: data?.id || '',
            name: data?.name || '',
            orionName: data?.orionName || '',
            description: data?.description || '',
            isCreateMode: mode === 'Crear',
        },
        validationSchema: schema,
        validateOnBlur: false,
        onSubmit: values => { submit(values); },
    });

    // RENDER

    return (
        <>
            <Page container="fluid">
                <div className="@container">
                    <form onSubmit={formik.handleSubmit}>
                        <div className="mb-10 grid gap-4 divide-y-2 divide-dashed divide-gray-200 @2xl:gap-9 @3xl:gap-11 font-medium">
                            <div className={cn(mode === 'Crear' ? 'md:col-span-12' : 'md:col-span-8')}>
                                <div className='md:grid md:grid-cols-3 gap-4'>
                                    
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
                                        label="ID de Orion"
                                        formik={formik}
                                    />

                                    <Textarea
                                        id='description'
                                        label="Descripción del modelo"
                                        required={false}
                                        className={`[&>label>span]:font-medium col-span-3`}
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
                            submitBtnText={mode + ' tipo de vehículo'}
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

export default VehicleTypesForm;
