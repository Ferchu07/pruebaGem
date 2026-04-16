import { useFormik } from 'formik';
import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import * as yup from 'yup';
import RequiredInput from '../../components/forms/InputHOC';
import { PrivilegeContext } from '../../components/priviledge/PriviledgeProvider';
import Page from '../../layout/Page/Page';
import cn from '../../utils/classNames';
import FormFooter from '../_layout/_footers/form-footer';
import { Brand } from '../../type/entities/brand-type';
import { Textarea } from 'rizzui';

interface FormProps {
    isLoading: boolean;
    submit: Function;
    data?: Brand | undefined;
    brandImg?: any;
}


const schema = yup.object({
    name: yup.string().required('El nombre es onligatorio')
});

export const BRAND_STATUSES = [
    { value: false, label: 'Inactiva', color: '#d11f1fff', id: 0 },
    { value: true, label: 'Activa', color: '#2bf11cff', id: 1 },
    { value: null, label: 'Todos', color: '#e2d8cfff', id: 2 }
];

const BrandForm: React.FC<FormProps> = ({ isLoading, submit, data }) => {

    // HOOKS
    const navigate = useNavigate();
    const mode = data ? 'Editar' : 'Crear';
    const { userCan } = useContext(PrivilegeContext);

    // FORMIK
    const formik = useFormik({
        initialValues: {
            brandId: data?.id || '',
            name: data?.name || '',
            orionName: data?.orionName || '',
            orionId: data?.orionId || '',
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
                                        className='mt-2 md:col-span-2'
                                        label="Nombre"
                                        formik={formik}
                                    />

                                    <RequiredInput
                                        id='orionName'
                                        className='mt-2 md:col-span-2'
                                        label="Nombre en Orion"
                                        formik={formik}
                                    />

                                    <RequiredInput
                                        id='orionId'
                                        className='mt-2 md:col-span-2'
                                        label="ID en Orion"
                                        formik={formik}
                                    />

                                    <Textarea
                                        id='description'
                                        label="Descripción de la marca"
                                        textareaClassName='bg-[#a1b8f7]'
                                        required={false}
                                        className={`[&>label>span]:font-medium ${userCan('list_companies', 'companies') ? 'col-span-6' : 'col-span-9'}`}
                                        rows={3}
                                        onChange={formik.handleChange}
                                        value={formik.values.description}
                                        error={formik.errors.description}
                                    />
                                </div>
                            </div>
                        </div>
                        <FormFooter
                            submitBtnText={mode + ' marca'}
                            customBg='bg-transparent mt-2'
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

export default BrandForm;