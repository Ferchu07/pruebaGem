import { useFormik } from 'formik';
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from 'rizzui';
import * as yup from 'yup';
import RequiredInput from '../../components/forms/InputHOC';
import FormGroup from '../../layout/shared/form-group';
import Page from '../../layout/Page/Page';
import FormFooter from '../_layout/_footers/form-footer';
import CustomSelect from '../../components/forms/CustomSelect';
import { Metric } from '../../type/entities/metric-type';
import useGroups from '../../hooks/api-calls/useGroups';
import { ReactComponent as DeleteIcon } from '../../assets/Iconos/Interfaz/borrar.svg';
import AsyncImg from '../../components/extras/AsyncImg';

interface CreateFormProps {
  isLoading: boolean;
  submit: Function;
  data?: Metric | undefined;
}

const schema = yup.object({
  name: yup.string().required('Campo obligatorio').test('is-valid-name', 'Nombre inválido', (value) => {
    return /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ_-\s]+$/.test(value || '');
  }),
  orionName: yup.string().required('Campo obligatorio').test('is-valid-name', 'Nombre inválido', (value) => { 
    return /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ_-\s]+$/.test(value || '');
  }),
  groupId: yup.string().required('Campo obligatorio'),
  type: yup.string().required('Campo obligatorio'),
  value: yup.string().required('Campo obligatorio'),
  metadataType: yup.string().nullable(),
  scale: yup.number().nullable().when('metadataType', {
    is: 'MEASURED',
    then: (schema) => schema.required('Campo obligatorio'),
  }),
  offset: yup.number().nullable().when('metadataType', {
    is: 'MEASURED',
    then: (schema) => schema.required('Campo obligatorio'),
  }),
  from: yup.number().nullable().when('metadataType', {
    is: 'MEASURED',
    then: (schema) => schema.required('Campo obligatorio'),
  }),
  to: yup.number().nullable().when('metadataType', {
    is: 'MEASURED',
    then: (schema) => schema.required('Campo obligatorio'),
  }),
  metadataUnit: yup.string().nullable().when('metadataType', {
    is: 'MEASURED',
    then: (schema) => schema.required('Campo obligatorio'),
  }),
  options: yup.array().when('metadataType', {
    is: 'STATUS',
    then: (schema) => schema.of(
      yup.object().shape({
        label: yup.string().required('Label requerido'),
        value: yup.string().required('Valor requerido'),
      })
    ).min(1, 'Debe haber al menos una opción'),
    otherwise: (schema) => schema.nullable()
  })
});

const METADATA_TYPES = [
    { label: 'Measured', value: 'MEASURED' },
    { label: 'Status', value: 'STATUS' }
];

const MetricForm: React.FC<CreateFormProps> = ({ isLoading, submit, data }) => {

  // HOOKS 

  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getGroupList } = useGroups();

  // STATES

  const mode = id ? 'Editar' : 'Crear';

  // FORMIK

  const getInitialOptions = () => {
    if (!data) return [];
    
    // Si tenemos metadataUnit y el tipo es STATUS, parseamos las opciones
    if (data.metadataUnit && data.metadataType === 'STATUS') {
        const optionsStr = data.metadataUnit;
        return optionsStr.split(',').map((optionStr: string) => {
            const parts = optionStr.split(':');
            const value = parts[0]?.trim();
            const label = parts.slice(1).join(':').trim(); // Handle potential colons in label

            // Buscamos si ya existe una opción guardada con este valor para recuperar la imagen
            const existingOption = data.metricOptions?.find((o: any) => o.value === value);

            return {
                label: label || value, // Fallback si no hay label
                value: value,
                image: existingOption?.image || null,
                imageUrl: null
            };
        });
    }

    // Fallback: Si no hay metadataUnit pero hay opciones guardadas (legacy o error)
    if (data.metricOptions && data.metricOptions.length > 0) {
        return data.metricOptions.map((o: any) => ({ 
            label: o.label, 
            value: o.value,
            image: o.image, 
            imageUrl: null
        }));
    }

    return [];
  };

  const formik = useFormik({
    initialValues: {
      metricId: data?.id ?? '',
      name: data?.name ?? '',
      orionName: data?.orionName ?? '',
      orionId: data?.orionId ?? '',
      groupId: data?.groups?.id ?? '',
      type: data?.type ?? '',
      value: data?.value ?? '',
      metadataType: data?.metadataType ?? '',
      scale: data?.scale ?? '',
      offset: data?.offset ?? '',
      from: data?.from ?? '',
      to: data?.to ?? '',
      metadataUnit: data?.metadataUnit ?? '',
      options: getInitialOptions(),
      profileImg: null as File | null,
      profileImgUrl: null as string | null
    },
    validationSchema: schema,
    validateOnBlur: false,
    onSubmit: values => { 
      const cleanedValues = Object.entries(values).reduce((acc, [key, value]) => {
        // Para strings vacíos, convertimos a null
        // EXCEPCIÓN: Si el valor es "0" (string), lo mantenemos tal cual, ya que es un valor válido para opciones de estado
        if (value === '' || value === undefined) {
             acc[key] = null;
        } else {
             acc[key] = value;
        }
        return acc;
      }, {} as any);
      submit(cleanedValues); 
    },
  });

  const handleProfileImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      formik.setFieldValue('profileImg', file);
      formik.setFieldValue('profileImgUrl', URL.createObjectURL(file));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (file) {
        // Store File object instead of Base64
        formik.setFieldValue(`options[${index}].image`, file);
        // Create preview URL
        formik.setFieldValue(`options[${index}].imageUrl`, URL.createObjectURL(file));
    }
  };

  const handleOptionChange = (index: number, field: string, value: string) => {
    const newOptions = [...(formik.values.options || [])];
    if (newOptions[index]) {
        newOptions[index] = { ...newOptions[index], [field]: value };
        formik.setFieldValue('options', newOptions);
        
        // Actualizar el string metadataUnit
        const newMetadataUnit = newOptions.map((o: any) => `${o.value}:${o.label}`).join(',');
        formik.setFieldValue('metadataUnit', newMetadataUnit);
    }
  };

  const addOption = () => {
    // Al añadir manualmente, actualizamos el array de opciones
    const options = [...(formik.values.options || []), { label: '', value: '', image: null, imageUrl: null }];
    formik.setFieldValue('options', options);
    
    // Y actualizamos el string de metadataUnit para reflejar el cambio
    const newMetadataUnit = options.map(o => `${o.value}:${o.label}`).join(',');
    formik.setFieldValue('metadataUnit', newMetadataUnit);
  };

  const removeOption = (index: number) => {
    const options = [...(formik.values.options || [])];
    options.splice(index, 1);
    formik.setFieldValue('options', options);

    // Actualizamos el string de metadataUnit
    const newMetadataUnit = options.map(o => `${o.value}:${o.label}`).join(',');
    formik.setFieldValue('metadataUnit', newMetadataUnit);
  };

  console.log(formik.errors);

  // RENDER

  return (
    <>
      <Page container="fluid">
        {((mode === "Editar" && data) || mode === "Crear") && (
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
                            className='md:col-span-4'
                            formik={formik}
                        />

                        <RequiredInput
                            id='orionName'
                            label="Nombre de Orion"
                            className='md:col-span-4'
                            formik={formik}
                        />

                        <CustomSelect
                            id='groupId'
                            label="Grupo"
                            required
                            containerClassName='md:col-span-4'
                            isClearable={true} 
                            options={getGroupList() || []}
                            onChange={(value: any) => {
                                const groupVal = value ? value.value : '';
                                formik.setFieldValue('groupId', groupVal);
                            }}
                            value={getGroupList()?.find((b: any) => b.value == formik.values.groupId)}
                            error={formik.errors.groupId}
                        />

                        <div className="col-span-full md:col-span-12">
                            <label className="block text-sm font-medium mb-1 text-gray-700">Imagen de Perfil</label>
                            <input 
                                type="file" 
                                accept="image/*" 
                                onChange={handleProfileImageUpload}
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                            {formik.values.profileImgUrl ? (
                                <div className="mt-2">
                                    <img src={formik.values.profileImgUrl} alt="Preview" className="h-32 w-auto object-contain rounded border bg-white" />
                                </div>
                            ) : data?.profileImg?.id ? (
                                <div className="mt-2">
                                    <AsyncImg id={data.profileImg.id} className="h-32 w-auto object-contain rounded border bg-white" />
                                </div>
                            ) : null}
                        </div>
                    </FormGroup>

                    <FormGroup
                    title="Detalles de la Métrica"
                    description="Configuración específica"
                    className='pt-6'
                    titleCols="@md:col-span-2"
                    childCols="@md:col-span-10 md:grid-cols-12"
                    >
                        <RequiredInput
                            id='type'
                            label="Tipo"
                            className='md:col-span-4'
                            formik={formik}
                        />
                        <RequiredInput
                            id='value'
                            label="Valor"
                            className='md:col-span-4'
                            formik={formik}
                        />
                        <CustomSelect
                            id='metadataType'
                            label="Tipo de Metadato"
                            containerClassName='md:col-span-4'
                            options={METADATA_TYPES}
                            onChange={(value: any) => formik.setFieldValue('metadataType', value?.value)}
                            value={METADATA_TYPES.find(t => t.value === formik.values.metadataType)}
                            error={formik.errors.metadataType}
                        />
                    </FormGroup>

                    {formik.values.metadataType === 'MEASURED' && (
                        <FormGroup
                        title="Configuración de Medición"
                        description="Parámetros para métricas medidas"
                        className='pt-6'
                        titleCols="@md:col-span-2"
                        childCols="@md:col-span-10 md:grid-cols-12"
                        >
                            <RequiredInput
                                id='scale'
                                label="Escala"
                                type="number"
                                className='md:col-span-3'
                                formik={formik}
                            />
                            <RequiredInput
                                id='offset'
                                label="Offset"
                                type="number"
                                className='md:col-span-3'
                                formik={formik}
                            />
                            <RequiredInput
                                id='from'
                                label="Desde"
                                type="number"
                                className='md:col-span-3'
                                formik={formik}
                            />
                            <RequiredInput
                                id='to'
                                label="Hasta"
                                type="number"
                                className='md:col-span-3'
                                formik={formik}
                            />
                             <RequiredInput
                                id='metadataUnit'
                                label="Unidad"
                                className='md:col-span-12'
                                formik={formik}
                            />
                        </FormGroup>
                    )}

                    {formik.values.metadataType === 'STATUS' && (
                        <FormGroup
                        title="Opciones de Estado"
                        description="Define los valores y etiquetas para el estado"
                        className='pt-6'
                        titleCols="@md:col-span-2"
                        childCols="@md:col-span-10"
                        >
                            <RequiredInput
                                id='metadataUnit'
                                label="Opciones (Formato: valor:etiqueta, separado por comas)"
                                placeholder="Ej: 0:Inactivo, 1:Activo, 2:Error"
                                className='col-span-full mb-4'
                                formik={formik}
                                value={formik.values.metadataUnit} // Asegurar que el input refleje el estado
                                onChange={(e) => {
                                    const newValue = e.target.value;
                                    formik.setFieldValue('metadataUnit', newValue);

                                    // Parse options from the string
                                    if (newValue) {
                                        const parsedOptions = newValue.split(',').map((optionStr: string) => {
                                            const parts = optionStr.split(':');
                                            const val = parts[0]?.trim();
                                            const lab = parts.slice(1).join(':').trim();
                                            
                                            // Preserve existing image/url if value matches
                                            const existingOption = formik.values.options?.find((o: any) => o.value === val);

                                            return {
                                                label: lab || val,
                                                value: val,
                                                image: existingOption?.image || null,
                                                imageUrl: existingOption?.imageUrl || null
                                            };
                                        }).filter((o: any) => o.value !== ""); // Basic filter to avoid empty entries while typing
                                        
                                        formik.setFieldValue('options', parsedOptions);
                                    } else {
                                        formik.setFieldValue('options', []);
                                    }
                                }}
                            />
                            <div className="col-span-full md:grid md:grid-cols-2 md:gap-4">
                                {formik.values.options?.map((option: any, index: number) => (
                                    <div key={index} className="flex gap-4 items-start border p-4 rounded-md relative bg-gray-50">
                                        <div className="grid grid-cols-2 gap-4 flex-1">
                                            <RequiredInput
                                                id={`options[${index}].value`}
                                                label="Valor"
                                                formik={formik}
                                                value={option.value}
                                                onChange={(e) => handleOptionChange(index, 'value', e.target.value)}
                                            />
                                            <RequiredInput
                                                id={`options[${index}].label`}
                                                label="Etiqueta"
                                                formik={formik}
                                                value={option.label}
                                                onChange={(e) => handleOptionChange(index, 'label', e.target.value)}
                                            />
                                            <div className="col-span-2">
                                                <label className="block text-sm font-medium mb-1 text-gray-700">Imagen</label>
                                                <input 
                                                    type="file" 
                                                    accept="image/*" 
                                                    onChange={(e) => handleImageUpload(e, index)}
                                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                                />
                                                {option.imageUrl ? (
                                                    <div className="mt-2">
                                                        <img src={option.imageUrl} alt="Preview" className="h-20 w-auto object-contain rounded border bg-white" />
                                                    </div>
                                                ) : option.image?.id ? (
                                                    <div className="mt-2">
                                                        <AsyncImg id={option.image.id} className="h-20 w-auto object-contain rounded border bg-white" />
                                                    </div>
                                                ) : null}
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeOption(index)}
                                            className="text-red-500 hover:text-red-700 p-2"
                                            title="Eliminar opción"
                                        >
                                            <DeleteIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            {typeof formik.errors.options === 'string' && (
                                <div className="text-red-500 text-sm mt-1">{formik.errors.options}</div>
                            )}
                            <Button type="button" onClick={addOption} variant="outline" className="w-full bg-primary text-white hover:text-white">
                                Agregar Opción
                            </Button>
                        </FormGroup>
                    )}
                </div>
                </form>
            </div>
        )}
      </Page>
      <FormFooter
        submitBtnText={mode + ' Métrica'}
        handleCancelBtn={() => navigate(-1)}
        handleSubmitBtn={formik.submitForm}
        isLoading={isLoading}
        customBg='bg-transparent'
      />
    </>
  )
};

export default MetricForm; 
