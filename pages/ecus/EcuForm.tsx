import classNames from 'classnames';
import { useFormik } from 'formik';
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FileInput, Textarea } from 'rizzui';
import { toast } from 'sonner';
import * as yup from 'yup';
import DeletePopover from '../../components/buttons/DeletePopover';
import AsyncImg from '../../components/extras/AsyncImg';
import PlaceholderImage from '../../components/extras/PlaceholderImage';
import RequiredInput from '../../components/forms/InputHOC';
import Page from '../../layout/Page/Page';
import FormGroup from '../../layout/shared/form-group';
import cn from '../../utils/classNames';
import FormFooter from '../_layout/_footers/form-footer';
import { EcuService } from '../../services/metrics/ecuService';
import { Ecu } from '../../type/entities/ecu-type';

interface CreateFormProps {
  isLoading: boolean;
  submit: Function;
  data?: Ecu | undefined;
  image?: any;
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
  description: yup.string().nullable(),
});

const EcuForm: React.FC<CreateFormProps> = ({ isLoading, submit, data, image }) => {

  // HOOKS 

  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const service = new EcuService();

  // STATES

  const mode = id ? 'Editar' : 'Crear';
  const [selectedImage, setSelectedImage] = useState<any>(null);
  
  const currentImage = image || data?.image;

  // FUNCTIONS

  // --------------------------------------------------------------------------------------
  /**
   * @ES MANEJA LA SUBIDA DE UNA IMAGEN DE PERFIL.
   * @EN HANDLES THE UPLOAD OF A USER PROFILE IMAGE.
   * 
   * @param event 
   */
  // --------------------------------------------------------------------------------------
  const handleImageUpload = async (event: React.ChangeEvent<any>) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result);
    };
    reader.readAsDataURL(file);

    try {
      const response = await service.editEcuImg(id, file);
      const responseData = response.getResponseData();
      if (responseData.success) {
        setTimeout(() => {
          toast.success('Imagen de la ECU actualizada');
        }, 100);
      } else {
        toast.error(responseData.message);
        setSelectedImage(null);
      }
    } catch (error: any) {
      toast.error("Formato de imagen incorrecto");
      setSelectedImage(null);
    }
  };
  // --------------------------------------------------------------------------------------

  // --------------------------------------------------------------------------------------
  /**
   * @ES MANEJA LA ELIMINACIÓN DE UNA IMAGEN DE PERFIL.
   * @EN HANDLES THE DELETION OF A USER PROFILE IMAGE.
   * 
   */
  // --------------------------------------------------------------------------------------
  const deleteImage = async () => {
    try {
      const response = await service.deleteEcuImg(id);
      const responseData = response.getResponseData();
      if (responseData.success) {
        setSelectedImage(null);
        window.location.reload();
      }
    } catch (error: any) {
      toast.error("Error al eliminar la imagen");
    }
  };
  // --------------------------------------------------------------------------------------

  // FORMIK

  const formik = useFormik({
    initialValues: {
      ecuId: data?.id ?? '',
      name: data?.name ?? '',
      orionName: data?.orionName ?? '',
      orionId: data?.orionId ?? '',
      description: data?.description ?? '',
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
          <div className="mb-10 grid gap-4 divide-y-2 divide-dashed divide-gray-200 @2xl:gap-9 @3xl:gap-11 font-medium">
            <FormGroup
              title="Información General"
              description="Datos principales del usuario"
              className='pt-6'
              titleCols="@md:col-span-2"
              childCols="@md:col-span-10 md:grid-cols-12"
            >
              <div className={cn(mode === 'Crear' ? 'md:col-span-12' : 'md:col-span-8')}>
                <div className='md:grid md:grid-cols-12 gap-4'>
                  <RequiredInput
                    id='name'
                    label="Nombre"
                    className={cn(mode === 'Crear' ? 'md:col-span-4' : 'md:col-span-3')}
                    formik={formik}
                  />

                  <RequiredInput
                    id='orionName'
                    label="Nombre de Orion"
                    className={cn(mode === 'Crear' ? 'md:col-span-4' : 'md:col-span-3')}
                    formik={formik}
                  />

                  <RequiredInput
                    id='orionId'
                    label="ID de Orion"
                    className={cn(mode === 'Crear' ? 'md:col-span-4' : 'md:col-span-3')}
                    formik={formik}
                  />
                </div>
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

              <div className={classNames('md:col-span-4', { 'hidden': mode === 'Crear' })}>
                {selectedImage
                  ? <div style={{ height: "200px", width: "200px" }}>
                    <img src={selectedImage} alt="selected" className='mx-auto d-block img-fluid rounded object-cover w-[220px] h-[220px]' />
                  </div>
                  : currentImage
                    ? <AsyncImg id={currentImage.id} isBackground className="mx-auto d-block img-fluid rounded w-[220px] h-[220px] object-cover" />
                    : <PlaceholderImage width={200} height={200} className='mx-auto d-block img-fluid rounded' />
                }
                <div className={'flex justify-start items-center mt-4'}>
                  <FileInput onChange={(e: React.ChangeEvent<any>) => handleImageUpload(e)} autoComplete='photo' placeholder={"Cambiar imagen"} className='me-3' />
                  <DeletePopover
                    title={`Eliminar imagen`}
                    description={`¿Estás seguro de que deseas eliminar la imagen?`}
                    onDelete={deleteImage}
                    size={32}
                    className={classNames({ 'hidden': !currentImage?.id })}
                  />
                </div>
              </div>
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
        submitBtnText={mode + ' ECU'}
        handleCancelBtn={() => navigate(-1)}
        handleSubmitBtn={formik.submitForm}
        isLoading={isLoading}
        customBg='bg-transparent'
      />
    </>
  )
};

export default EcuForm;
