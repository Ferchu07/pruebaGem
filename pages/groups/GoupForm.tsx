import { useFormik } from 'formik';
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Textarea } from 'rizzui';
import * as yup from 'yup';
import RequiredInput from '../../components/forms/InputHOC';
import FormGroup from '../../layout/shared/form-group';
import { Group } from '../../type/entities/group-type';
import useEcus from '../../hooks/api-calls/useEcus';
import Page from '../../layout/Page/Page';
import FormFooter from '../_layout/_footers/form-footer';
import CustomSelect from '../../components/forms/CustomSelect';

interface CreateFormProps {
  isLoading: boolean;
  submit: Function;
  data?: Group | undefined;
}

const schema = yup.object({
  name: yup.string().required('Campo obligatorio').test('is-valid-name', 'Nombre inválido', (value) => {
    return /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ_-\s]+$/.test(value || '');
  }),
  orionName: yup.string().required('Campo obligatorio').test('is-valid-name', 'Nombre inválido', (value) => { 
    return /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ_-\s]+$/.test(value || '');
  }),
  orionId: yup.string().required('Campo obligatorio').test('is-numeric', 'ID inválido', (value) => {
    return /^[0-9]+$/.test(value || '');
  }),
  ecuId: yup.string().required('Campo obligatorio'),
  description: yup.string().nullable(),
});

const GroupForm: React.FC<CreateFormProps> = ({ isLoading, submit, data }) => {

  // HOOKS 

  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getEcuList } = useEcus();

  // STATES

  const mode = id ? 'Editar' : 'Crear';

  // FORMIK

  const formik = useFormik({
    initialValues: {
      name: data?.name ?? '',
      orionName: data?.orionName ?? '',
      orionId: data?.orionId ?? '',
      description: data?.description ?? '',
      ecuId: data?.ecu?.id ?? '',
    },
    validationSchema: schema,
    validateOnBlur: false,
    onSubmit: values => { submit(values); },
  });

  // RENDER

  const getContent = () => {
    return (
      <div className="@container">
        <form onSubmit={formik.handleSubmit}>
          <div className="mb-10 grid gap-4 divide-dashed divide-gray-200 @2xl:gap-9 @3xl:gap-11 font-medium">
            <FormGroup
              title="Información General"
              description="Datos principales del usuario"
              className='pt-6'
              titleCols="@md:col-span-2"
              childCols="@md:col-span-10 md:grid-cols-12"
            >
                  <RequiredInput
                    id='name'
                    label="Nombre"
                    className='md:col-span-3'
                    formik={formik}
                  />

                  <RequiredInput
                    id='orionName'
                    label="Nombre de Orion"
                    className='md:col-span-3'
                    formik={formik}
                  />

                  <RequiredInput
                    id='orionId'
                    label="ID de Orion"
                    className='md:col-span-3'
                    formik={formik}
                  />

                  <CustomSelect
                    id='ecuId'
                    label="ECU"
                    required
                    containerClassName='md:col-span-3'
                    isClearable={true} 
                    options={getEcuList() || []}
                    onChange={(value: any) => {
                        const ecuVal = value ? value.value : '';
                        formik.setFieldValue('ecuId', ecuVal);
                    }}
                    value={getEcuList()?.find((b: any) => b.value === formik.values.ecuId)}
                    error={formik.errors.ecuId}
                />

                <Textarea
                    id='description'
                    label="Descripción del grupo"
                    required={false}
                    className={`[&>label>span]:font-medium col-span-12`}
                    textareaClassName='bg-[#a1b8f7]'
                    rows={3}
                    onChange={formik.handleChange}
                    value={formik.values.description}
                    error={formik.errors.description}
                />
            </FormGroup>
          </div>
        </form>
      </div>
    )
  };

  return (
    <>
      <Page container="fluid">
        {(mode === "Editar" && data) && getContent()}
        {mode === "Crear" && getContent()}
      </Page>
      <FormFooter
        submitBtnText={mode + ' Grupo'}
        handleCancelBtn={() => navigate(-1)}
        handleSubmitBtn={formik.submitForm}
        isLoading={isLoading}
        customBg='bg-transparent'
      />
    </>
  )
};

export default GroupForm; 
