import { useFormik } from "formik";
import { FC, Fragment, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FileInput, Textarea, cn } from "rizzui";
import { toast } from "sonner";
import * as yup from "yup";
import DeletePopover from "../../components/buttons/DeletePopover";
import AsyncImg from "../../components/extras/AsyncImg";
import PlaceholderImage from "../../components/extras/PlaceholderImage";
import RequiredInput from "../../components/forms/InputHOC";
import Page from "../../layout/Page/Page";
import FormGroup from "../../layout/shared/form-group";
import { OrganisationService } from "../../services/organisation/organisationService";
import { Organisation } from "../../type/entities/organisation-type";
import { validateCIF } from "../../utils/validatorFunctions";
import FormFooter from "../_layout/_footers/form-footer";

interface CreateFormProps {
    isLoading: boolean;
    submit: Function;
    data?: Organisation | undefined;
    logo?: any;
}

const schema = yup.object({
    isEdit: yup.boolean().notRequired(),
    cif: yup.string().test('valid-cif', 'El CIF no es válido', (value) => {
        if (value !== undefined && value.length > 0) {
            return validateCIF(value);
        } else {
            return true;
        }
    }).required('Campo obligatorio'),
    name: yup.string().min(1, 'Demasiado corto').required('Campo obligatorio'),
    address: yup.string().notRequired().nullable(),
    province: yup.string().notRequired().nullable(),
    town: yup.string().notRequired().nullable(),
    postalCode: yup.string().matches(/^\d{5}$/, 'El código postal debe tener 5 dígitos').notRequired().nullable(),
    description: yup.string().max(500, 'Demasiado largo').notRequired().nullable(),
    userName: yup.string().when('isEdit', {
        is: false,
        then: schema => schema.required('Campo obligatorio'),
        otherwise: schema => schema.notRequired(),
    }),
    userLastName: yup.string().when('isEdit', {
        is: false,
        then: schema => schema.required('Campo obligatorio'),
        otherwise: schema => schema.notRequired(),
    }),
    userEmail: yup.string().email('Correo electrónico no válido').when('isEdit', {
        is: false,
        then: schema => schema.required('Campo obligatorio'),
        otherwise: schema => schema.notRequired(),
    }),
});

const editSchema = yup.object({
    cif: yup.string().test('valid-cif', 'El CIF no es válido', (value) => {
        if (value !== undefined && value.length > 0) {
            return validateCIF(value);
        } else {
            return true;
        }
    }).required('Campo obligatorio'),
    name: yup.string().min(1, 'Demasiado corto').required('Campo obligatorio'),
    address: yup.string().notRequired().nullable(),
    province: yup.string().notRequired().nullable(),
    town: yup.string().notRequired().nullable(),
    postalCode: yup.string().matches(/^\d{5}$/, 'El código postal debe tener 5 dígitos').notRequired().nullable(),
    description: yup.string().max(500, 'Demasiado largo').notRequired().nullable(),
});

const OrganisationForm: FC<CreateFormProps> = ({ isLoading, submit, data }) => {

    // HOOKS

    const { id = "" } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const mode = data ? 'Editar' : 'Crear';
    const service = new OrganisationService();

    // STATES

    const [selectedImage, setSelectedImage] = useState<any>(null);

    // FUNCTIONS

    // ----------------------------------------------------------------------------------------------
    /**
     * @ES MANEJA EL EVENTO DE SUBIDA DE IMAGEN
     * @EN HANDLES THE IMAGE UPLOAD EVENT
     * 
     * @param event 
     */
    // ----------------------------------------------------------------------------------------------
    const handleImageUpload = async (event: React.ChangeEvent<any>) => {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onload = () => {
            setSelectedImage(reader.result);
        };
        reader.readAsDataURL(file);

        try {
            const response = await service.editOrganisationImg(id, file);

            const responseData = response.getResponseData();

            if (responseData.success) {
                setTimeout(() => {
                    toast.success('Logo actualizado');
                }, 100);
            } else {
                toast.error(responseData.message);
                setSelectedImage(null);
            }
        } catch (error: any) {
            toast.error("Formato de logo incorrecto");
            setSelectedImage(null);
        }
    };
    // ----------------------------------------------------------------------------------------------

    // ----------------------------------------------------------------------------------------------
    /**
     * @ES MANEJA EL EVENTO DE ELIMINACIÓN DE IMAGEN
     * @EN HANDLES THE IMAGE DELETE EVENT
     */
    // ----------------------------------------------------------------------------------------------
    const deleteImage = async () => {
        try {
            const response = await service.deleteOrganisationImg(id);
            const responseData = response.getResponseData();

            if (responseData.success) {
                setSelectedImage(null);
                window.location.reload();
            }
        } catch (error: any) {
            toast.error("Error al eliminar la imagen");
        }
    };
    // ----------------------------------------------------------------------------------------------

    // FORMIK

    const formik = useFormik({
        initialValues: {
            companyId: data?.id ?? '',
            name: data?.name ?? '',
            cif: data?.cif ?? '',
            logo: data?.logo?.id ?? undefined,
            address: data?.address ?? '',
            province: data?.province ?? '',
            town: data?.town ?? '',
            postalCode: data?.postalCode ?? '',
            description: data?.description ?? '',
            userName: data?.userName ?? '',
            userLastName: data?.userLastName ?? '',
            userEmail: data?.userEmail ?? '',
            isEdit: data !== undefined,
        },
        validationSchema: data ? editSchema : schema,
        validateOnBlur: false,
        //validateOnChange: false,
        onSubmit: values => submit(values),
    });

    // RENDER

    const getContent = () => {
        return (
            <>
                <div className="@container">
                    <form onSubmit={formik.handleSubmit} autoComplete="off">
                        <div className="mb-10 grid gap-7 divide-y-2 divide-dashed divide-gray-200 @2xl:gap-9 @3xl:gap-11 font-medium">
                            <FormGroup
                                title="Información General"
                                description="Datos principales de una organización"
                                className='pt-6'
                                titleCols="@md:col-span-2"
                                childCols="@md:col-span-10 md:grid-cols-12"
                            >
                                <div className={cn(mode === 'Crear' ? 'md:col-span-12' : 'md:col-span-8')}>
                                    <div className='md:grid md:grid-cols-5 gap-4'>
                                        <RequiredInput
                                            id='name'
                                            label="Nombre"
                                            className="md:col-span-2"
                                            formik={formik}
                                        />

                                        <RequiredInput
                                            id='cif'
                                            label="CIF"
                                            formik={formik}
                                        />

                                        <Textarea
                                            id='description'
                                            label="Descripción"
                                            value={formik.values.description}
                                            onChange={formik.handleChange}
                                            textareaClassName="bg-[#a1b8f7]"
                                            rows={3}
                                            className="md:col-span-2"
                                        />

                                        <RequiredInput
                                            id='province'
                                            label="Provincia"
                                            formik={formik}
                                            required={false}
                                        />

                                        <RequiredInput
                                            id='town'
                                            label="Población"
                                            formik={formik}
                                            required={false}
                                        />

                                        <RequiredInput
                                            id='address'
                                            label="Dirección"
                                            className="md:col-span-2"
                                            formik={formik}
                                            required={false}
                                        />

                                        <RequiredInput
                                            id='postalCode'
                                            label="Código Postal"
                                            formik={formik}
                                            required={false}
                                        />
                                    </div>
                                </div>

                                <div className={cn('md:col-span-4', { 'hidden': mode === 'Crear' })}>
                                    {selectedImage
                                        ? <div style={{ height: "200px", width: "200px" }}>
                                            <img src={selectedImage} alt="selected" className='mx-auto d-block img-fluid rounded object-cover w-[220px] h-[220px]' />
                                        </div>
                                        : formik.values.logo
                                            ? <AsyncImg id={formik.values.logo} isBackground className="mx-auto d-block img-fluid rounded w-[220px] h-[220px] object-cover" />
                                            : <PlaceholderImage width={200} height={200} className='mx-auto d-block img-fluid rounded' />
                                    }
                                    <div className={'flex justify-start items-center mt-4'}>
                                        <FileInput onChange={(e: React.ChangeEvent<any>) => handleImageUpload(e)} autoComplete='photo' placeholder={"Cambiar logo"} className='me-3' />
                                        <DeletePopover
                                            title={`Eliminar logo`}
                                            description={`¿Estás seguro de que deseas eliminar el logo?`}
                                            onDelete={deleteImage}
                                            size={32}
                                            className={cn({ 'hidden': !formik.values.logo })}
                                        />
                                    </div>
                                </div>
                            </FormGroup>

                            { !data && ( 

                                <FormGroup
                                    title="Usuario"
                                    description="Datos del usuario inicial de la organización"
                                    className='pt-6'
                                    titleCols="@md:col-span-2"
                                    childCols="@md:col-span-10 md:grid-cols-3"
                                >
                                    <RequiredInput
                                        id='userName'
                                        label="Nombre"
                                        formik={formik}
                                    />

                                    <RequiredInput
                                        id='userLastName'
                                        label="Apellidos"
                                        formik={formik}
                                    />

                                    <RequiredInput
                                        id='userEmail'
                                        label="Correo Electrónico"
                                        type="email"
                                        formik={formik}
                                    />
                                </FormGroup>
                            )}

                        </div>
                    </form>
                </div>
            </>
        )
    }

    return (
        <Fragment>
            <Page container="fluid">
                {(mode === "Editar" && data) && getContent()}
                {mode === "Crear" && getContent()}
            </Page>
            <FormFooter
                submitBtnText={mode + ' Organización'}
                handleCancelBtn={() => navigate(-1)}
                handleSubmitBtn={formik.submitForm} isLoading={isLoading}
                customBg="bg-transparent"
            />
        </Fragment>
    )
}

export default OrganisationForm;