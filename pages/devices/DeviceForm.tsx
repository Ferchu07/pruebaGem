import { useFormik } from 'formik';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from 'rizzui';
import * as yup from 'yup';
import { ReactComponent as DispositivoActivoIcon } from '../../assets/Iconos/Interfaz/dispositivo_inalambrico_activo_02.svg';
import { ReactComponent as DispositivoAsignadoIcon } from '../../assets/Iconos/Interfaz/dispositivo_inalambrico_asignado.svg';
import { ReactComponent as DispositivoPruebaIcon } from '../../assets/Iconos/Interfaz/dispositivo_inalambrico_prueba.svg';
import { ReactComponent as DispositivoRetiradoIcon } from '../../assets/Iconos/Interfaz/dispositivo_inalambrico_retirado.svg';
import CustomSelect from '../../components/forms/CustomSelect';
import RequiredInput from '../../components/forms/InputHOC';
import Page from '../../layout/Page/Page';
import { Device } from '../../type/entities/device-type';
import cn from '../../utils/classNames';
import FormFooter from '../_layout/_footers/form-footer';

interface FormProps {
  isLoading: boolean;
  submit: Function;
  data?: Device | undefined;
}

const schema = yup.object({
  serialNumber: yup.string().required('El número de serie es requerido').test(
    'no-spaces',
    'El número de serie no puede contener espacios',
    (value) => {
      if (!value) {
        return false;
      }
      return !/\s/.test(value);
    }
  ),
  model: yup.string().required('El modelo es requerido'),
  status: yup.string().required('El estado es requerido'),
  firmwareVersion: yup.string().nullable(),
  privateKey: yup.string().required('La clave privada es requerida'),
});

export const DEVICE_STATUSES = [
  { value: 0, label: 'Activo', color: '#1fd15e', id: 0, backgroundColor: 'rgba(16, 185, 129, 0.1)', icon: DispositivoActivoIcon },
  { value: 1, label: 'Prueba', color: '#ed9339', id: 1, backgroundColor: 'rgba(242, 180, 138, 0.1)', icon: DispositivoPruebaIcon },
  { value: 2, label: 'Asignado', color: '#0026ff', id: 2, backgroundColor: 'rgba(128, 132, 255, 0.1)', icon: DispositivoAsignadoIcon },
  { value: 3, label: 'Fuera de servicio', color: '#ff0000', id: 3, backgroundColor: 'rgba(255, 128, 128, 0.1)', icon: DispositivoRetiradoIcon },
];

const DeviceForm: React.FC<FormProps> = ({ isLoading, submit, data }) => {

  // HOOKS

  const navigate = useNavigate();
  const mode = data ? 'Editar' : 'Crear';

  // FORMIK

  const formik = useFormik({
    initialValues: {
      deviceId: data?.id || '',
      serialNumber: data?.serialNumber || '',
      model: data?.model || '',
      status: data?.status == 0 ? '0' : data?.status || '3',
      firmwareVersion: data?.firmwareVersion || '',
      privateKey: data?.privateKey || '',
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
                    id='serialNumber'
                    className='mt-2'
                    label="Número de serie"
                    disabled={!formik.values.isCreateMode}
                    formik={formik}
                  />

                  <RequiredInput
                    id='model'
                    className='mt-2'
                    label="Modelo"
                    formik={formik}
                  />

                  <Input
                    id='firmwareVersion'
                    className='mt-2'
                    inputClassName='bg-[#a1b8f7] border-transparent focus:ring-0 focus:border-primary'
                    label="Versión de firmware"
                    value={formik.values.firmwareVersion}
                    onChange={
                      (value: any) => {
                        formik.setFieldValue('firmwareVersion', value.target.value);
                      }
                    }
                  />
                </div>

                <div className='md:grid md:grid-cols-3 gap-4'>

                  <div className="mt-4 md:col-span-2">
                    <CustomSelect
                      id='status'
                      label="Estado"
                      required
                      containerClassName='mt-2'
                      options={DEVICE_STATUSES}
                      formatOptionLabel={(option: any) => (
                        <div className="flex flex-row items-center gap-2">
                          {option.icon && <option.icon className="w-5 h-5" />}
                          <span>{option.label}</span>
                        </div>
                      )}
                      onChange={(e: any) => { formik.setFieldValue('status', e.value) }}
                      value={DEVICE_STATUSES.find((status: any) => status.value == formik.values.status)}
                      error={formik.errors.status}
                      customStyles={{
                        control: (base: any) => {
                          const selectedOption = DEVICE_STATUSES.find((s: any) => s.value == formik.values.status);
                          const bg = selectedOption ? (selectedOption.value === 0 ? '#86efac' : selectedOption.backgroundColor?.replace('0.1', '1') || '#a1b8f7') : '#a1b8f7';
                          
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

                  <div className="mt-4">
                    <RequiredInput
                      id='privateKey'
                      className='mt-2'
                      label="Clave privada"
                      formik={formik}
                    />
                  </div>

                </div>

              </div>
            </div>
          </form>
        </div>
      </Page>
      <FormFooter
        submitBtnText={mode + ' dispositivo'}
        handleCancelBtn={() => navigate(-1)}
        handleSubmitBtn={formik.submitForm}
        isLoading={isLoading}
      />
    </>
  )
};

export default DeviceForm;