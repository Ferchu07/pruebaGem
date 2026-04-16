import classNames from 'classnames';
import { useFormik } from 'formik';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { FileInput, Password, Switch, Tooltip } from 'rizzui';
import { toast } from 'sonner';
import * as yup from 'yup';
import DeletePopover from '../../components/buttons/DeletePopover';
import AsyncImg from '../../components/extras/AsyncImg';
import PlaceholderImage from '../../components/extras/PlaceholderImage';
import CustomSelect from '../../components/forms/CustomSelect';
import CustomSelectApiHookForm from '../../components/forms/CustomSelectApiHookForms';
import RequiredInput from '../../components/forms/InputHOC';
import { isUser } from '../../components/priviledge/PriviledgeProvider';
import useRolesByUser from '../../hooks/api-calls/useRolesByUser';
import Page from '../../layout/Page/Page';
import FormGroup from '../../layout/shared/form-group';
import { RootState } from '../../redux/store';
import { UserService } from '../../services/user/userService';
import { User } from '../../type/entities/user-type';
import cn from '../../utils/classNames';
import FormFooter from '../_layout/_footers/form-footer';
import { Email, Info } from '../../components/icon/material-icons';

interface CreateFormProps {
  isLoading: boolean;
  submit: Function;
  data?: User | undefined;
  profileImg?: any;
}

const schema = yup.object({
  name: yup.string().min(1, 'Demasiado corto').max(50, 'Demasiado largo').required('Campo obligatorio'),
  lastName: yup.string().min(1, 'Demasiado corto').max(50, 'Demasiado largo').required('Campo obligatorio'),
  email: yup.string().email('Email no válido').required('Campo obligatorio'),
  password: yup.string()
    .when('$isCreateMode', {
      is: true,
      then: schema => schema.min(8, 'Contraseña de al menos 8 caracteres').max(30, 'Contraseña menor de 30 caracteres').nullable().notRequired(),
      otherwise: schema => schema.min(8, 'Contraseña de al menos 8 caracteres').max(30, 'Contraseña menor de 30 caracteres')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/, 'La contraseña debe contener al menos una letra mayúscula, una minúscula y un número').nullable().notRequired(),
    }),
  passwordConfirm: yup.string()
    .when('password', {
      is: (val: string | null | undefined) => val !== null && val !== undefined && val.length > 0,
      then: (schema: yup.Schema) => schema.oneOf([yup.ref('password'), ''], 'Las contraseñas no coinciden'),
      otherwise: (schema: yup.Schema) => schema.nullable(),
    }).nullable(),
  setAsSuperAdmin: yup.boolean(),
  profileImg: yup.mixed(),
  roleId: yup.string().when(['isMultiRoles', 'setAsSuperAdmin', '$isCreateMode'], {
    is: (isMultiRoles: boolean, setAsSuperAdmin: boolean, isCreateMode: boolean) => !isMultiRoles && !(setAsSuperAdmin && isCreateMode),
    then: (schema: yup.Schema) => schema.required('Campo obligatorio'),
    otherwise: (schema: yup.Schema) => schema.nullable(),
  }),
  roles: yup.array().when('isMultiRoles', {
    is: (val: boolean) => val == true,
    then: (schema: yup.Schema) => schema.required('Campo obligatorio'),
    otherwise: (schema: yup.Schema) => schema.nullable()
  }),
});

const UserForm: React.FC<CreateFormProps> = ({ isLoading, submit, data, profileImg }) => {

  // HOOKS 

  const { user } = useSelector((state: RootState) => state.auth);
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { fetchRoles, getRolesList } = useRolesByUser({ active: true });
  const service = new UserService();
  const mode = data ? 'Editar' : 'Crear';
  let multiRoles = mode === 'Editar' && isUser(user) && user?.roles.includes('Superadministrador');

  // STATES

  const [selectedImage, setSelectedImage] = useState<any>(null);

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
      const response = await service.editUserImg(id, file);
      const responseData = response.getResponseData();
      if (responseData.success) {
        setTimeout(() => {
          toast.success('Imagen de perfil actualizada');
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
      const response = await service.deleteUserImg(id);
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
      userId: data?.id ?? '',
      company: data?.userRoles[0]?.company?.id ?? null,
      roleId: data?.userRoles[0]?.role?.id ?? null,
      roles: data?.userRoles?.map(role => role.role.id) ?? [] as any,
      roleName: data?.userRoles[0]?.role?.name ?? '',
      name: data?.name ?? '',
      lastName: data?.lastName ?? '',
      email: data?.email ?? '',
      password: '',
      passwordConfirm: '',
      setAsSuperAdmin: data?.userRoles[0]?.role?.name === 'Superadministrador' || false,
      profileImg: data?.profileImg?.id ?? undefined,
      isCreateMode: mode === 'Crear',
      isMultiRoles: multiRoles,
    },
    validationSchema: schema,
    validateOnBlur: false,
    // validateOnChange: false,
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
                    className='md:col-span-3'
                    formik={formik}
                  />

                  <RequiredInput
                    id='lastName'
                    label="Apellidos"
                    className='md:col-span-4'
                    formik={formik}
                  />

                  <RequiredInput
                    id='email'
                    type="email"
                    label="Correo Electrónico"
                    prefix={<Email className="h-6 w-6 text-black" />}
                    className='md:col-span-5'
                    formik={formik}
                  />

                  <CustomSelectApiHookForm
                    id="roleId"
                    label="Rol"
                    formik={formik}
                    fetchOptions={async (searchText: string | null) => {
                      const text = searchText ? searchText : formik.values.roleName;
                      return fetchRoles({ search_text: text }) as any;
                    }}
                    error={formik.errors.roleId}
                    containerClassName={cn('md:col-span-4', { 'hidden': multiRoles || formik.values.setAsSuperAdmin })} // Hide if multiRoles or setAsSuperAdmin is true
                  />

                  {multiRoles && (
                    <CustomSelect
                      id="roles"
                      label="Roles"
                      isMulti
                      options={getRolesList().map((role: any) => ({ value: role.value, label: role.label }))}
                      onChange={(e: any) => {
                        const selectedValues = e.map((item: any) => item.value);
                        formik.setFieldValue('roles', selectedValues);
                      }}
                      value={formik.values.roles?.map((roleId: any) => ({
                        value: roleId,
                        label: getRolesList().find((role: any) => role.value === roleId)?.label
                      })) || []}
                      error={formik.errors.roles}
                      containerClassName={cn("md:col-span-12", { 'hidden': formik.values.setAsSuperAdmin })} // Hide if setAsSuperAdmin is true
                    />
                  )}

                  <Switch
                    id='setAsSuperAdmin'
                    label={
                      <div className={'flex items-center'}>
                        <label htmlFor='setAsSuperAdmin'>Asignar Superadministrador</label>
                        <Tooltip
                          size="md"
                          content="El sistema asignará automáticamente el rol de Superadministrador al usuario. Esta opción solo está disponible si el usuario tiene permisos de Superadministrador."
                          placement="top"
                          color="invert"
                        >
                          <div className={'inline-block ms-1'}>
                            <Info className="w-5 h-5 text-primary" />
                          </div>
                        </Tooltip>
                      </div>
                    }
                    checked={formik.values.setAsSuperAdmin}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      formik.setValues({
                        ...formik.values,
                        setAsSuperAdmin: e.target.checked,
                        roles: e.target.checked ? [] : formik.values.roles,
                        roleId: e.target.checked ? null : formik.values.roleId,
                      });
                    }}
                    error={formik.errors.setAsSuperAdmin}
                    // @ts-ignore
                    className={cn('md:col-span-4', { 'hidden': !user?.roles.includes('Superadministrador') })} // Hide if user is not Superadmin
                    switchKnobClassName='bg-primary'
                  />

                  <Password
                    id='password'
                    label="Contraseña"
                    className={cn("[&>label>span]:font-medium md:col-span-4", { 'hidden': mode === 'Crear' })}
                    inputClassName="text-sm bg-[#a1b8f7]"
                    onChange={formik.handleChange}
                    value={formik.values.password}
                    error={formik.errors.password}
                  />

                  <Password
                    id='passwordConfirm'
                    label="Confirmar Contraseña"
                    className={cn("[&>label>span]:font-medium md:col-span-4", { 'hidden': mode === 'Crear' })}
                    inputClassName="text-sm bg-[#a1b8f7]"
                    onChange={formik.handleChange}
                    value={formik.values.passwordConfirm}
                    error={formik.errors.passwordConfirm}
                  />
                </div>
              </div>

              <div className={classNames('md:col-span-4', { 'hidden': mode === 'Crear' })}>
                {selectedImage
                  ? <div style={{ height: "200px", width: "200px" }}>
                    <img src={selectedImage} alt="selected" className='mx-auto d-block img-fluid rounded object-cover w-[220px] h-[220px]' />
                  </div>
                  : profileImg
                    ? <AsyncImg id={profileImg.id} isBackground className="mx-auto d-block img-fluid rounded w-[220px] h-[220px] object-cover" />
                    : <PlaceholderImage width={200} height={200} className='mx-auto d-block img-fluid rounded' />
                }
                <div className={'flex justify-start items-center mt-4'}>
                  <FileInput onChange={(e: React.ChangeEvent<any>) => handleImageUpload(e)} autoComplete='photo' placeholder={"Cambiar imagen"} className='me-3' />
                  <DeletePopover
                    title={`Eliminar imagen`}
                    description={`¿Estás seguro de que deseas eliminar la imagen?`}
                    onDelete={deleteImage}
                    size={32}
                    className={classNames({ 'hidden': !profileImg?.id })}
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
        submitBtnText={mode + ' Usuario'}
        handleCancelBtn={() => navigate(-1)}
        handleSubmitBtn={formik.submitForm}
        isLoading={isLoading}
        customBg='bg-transparent'
      />
    </>
  )
};

export default UserForm;