import { useFormik } from 'formik';
import React, { Fragment, useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input, Textarea } from 'rizzui';
import * as yup from 'yup';
import RequiredInput from '../../components/forms/InputHOC';
import { PopoverPicker } from '../../components/forms/PopoverPicker';
import { PermissionsGrid } from '../../components/ui/PermissionsAccordion';
import useFetch from '../../hooks/useFetch';
import Page from '../../layout/Page/Page';
import FormGroup from '../../layout/shared/form-group';
import { PermissionService } from '../../services/auth/permissionService';
import { PermissionGroup, PermissionsApiResponse, Role, RolePermission } from '../../type/entities/role-type';
import FormFooter from '../_layout/_footers/form-footer';
import CustomSelect from '../../components/forms/CustomSelect';
import useCompanies from '../../hooks/api-calls/useCompanies';
import { usePrivilege } from '../../components/priviledge/PriviledgeProvider';

interface CreateFormProps {
    isLoading: boolean;
    submit: Function;
    data?: Role | undefined;
}

const schema = yup.object({
    name: yup.string().min(1, 'Demasiado corto').max(100, 'Demasiado largo').required('Campo obligatorio'),
    description: yup.string().nullable(),
});

const RoleForm: React.FC<CreateFormProps> = ({ isLoading, submit, data = undefined }) => {

    const navigate = useNavigate();
    const mode = data ? 'Editar' : 'Crear';
    const { getCompaniesList } = useCompanies();
    const { userCan } = usePrivilege();


    const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);

    const [permissionsData] = useFetch(useCallback(async () => {
        const response = await (new PermissionService()).getPermissions();
        return response.getResponseData() as PermissionsApiResponse;
    }, []));

    const formik = useFormik({
        initialValues: {
            company: data?.company?.id ?? '',
            roleId: data?.id ?? '',
            name: data?.name ?? '',
            color: data?.color ?? '#607d8b',
            description: data?.description ?? '',
            permissions: data?.permissions.map((permission: RolePermission) => permission.permission.id) ?? []
        },
        validationSchema: schema,
        validateOnBlur: false,
        // validateOnChange: false,
        onSubmit: values => { submit(values, selectedPermissions); },
    });

    useEffect(() => {
        if (data) _handleSelectedPermissions(data.permissions);
    }, [data]);

    const _handleSelectedPermissions = (permissions: RolePermission[]) => {
        let permissionsIds = permissions.map((permission: RolePermission) => permission.permission.id);
        setSelectedPermissions(permissionsIds);
    };

    const _handleSelectAll = (permissions: number[], checked: boolean) => {
        if (checked && selectedPermissions !== null) {
            // if already in selectedPermissions, do nothing
            let permissionsToAdd: number[] = [];
            permissions.forEach((permission: number) => {
                if (!selectedPermissions.includes(permission)) {
                    permissionsToAdd.push(permission);
                }
            });
            setSelectedPermissions([...selectedPermissions, ...permissionsToAdd]);
        }

        if (!checked && selectedPermissions !== null) {
            const selectedPermissionsCopy = selectedPermissions;

            permissions.forEach((permission: number) => {
                const index = selectedPermissionsCopy.indexOf(permission);
                if (index > -1) {
                    selectedPermissionsCopy.splice(index, 1);
                }
            });

            setSelectedPermissions([...selectedPermissionsCopy]);
        }
    };

    const _handleOnSelectPermission = (permission: number, checked: boolean) => {
        if (checked && selectedPermissions !== null) {
            if (!selectedPermissions.includes(permission)) {
                setSelectedPermissions([...selectedPermissions, permission]);
            }
        }

        if (!checked && selectedPermissions !== null) {
            const selectedPermissionsCopy = selectedPermissions;
            const index = selectedPermissionsCopy.indexOf(permission);
            if (index > -1) {
                selectedPermissionsCopy.splice(index, 1);
            }
            setSelectedPermissions([...selectedPermissionsCopy]);
        }
    };

    const getContent = () => {
        return (
            <>
                <div className="@container">
                    <form onSubmit={formik.handleSubmit} autoComplete="off">
                        <div className="mb-10 grid gap-7 divide-y-2 divide-dashed divide-gray-200 @2xl:gap-9 @3xl:gap-11 font-medium">
                            <FormGroup
                                title="Información General"
                                description="Datos principales del rol"
                                className='pt-6'
                                childCols={`@lg:col-span-9  ${userCan('list_companies', 'companies') ? 'lg:grid-cols-3' : 'lg:grid-cols-2'}`}
                            >
                                <RequiredInput
                                    id='name'
                                    label="Nombre"
                                    formik={formik}
                                />
                                
                                { userCan('list_companies', 'companies') && (
                                <CustomSelect
                                    isSearchable
                                    id={'company'}
                                    label="Compañia"
                                    options={getCompaniesList()}
                                    onChange={(e: any) => {
                                        formik.setFieldValue('company', e.value);
                                    }}
                                    value={
                                        getCompaniesList().find((company: any) => company.value === formik.values.company)
                                    }
                                /> )}

                                <div className={`flex flex-row flex-wrap gap-1 align-bottom	`}>
                                    <Input
                                        id='color'
                                        type="text"
                                        label="Color"
                                        className="[&>label>span]:font-medium"
                                        inputClassName="text-sm flex flex-grow bg-[#a1b8f7]"
                                        onChange={formik.handleChange}
                                        value={formik.values.color}
                                        error={formik.errors.color}
                                    />
                                    <PopoverPicker color={formik.values.color} onChange={(color: string) => formik.setFieldValue('color', color)} />
                                </div>


                                <Textarea
                                    id='description'
                                    label="Descripción"
                                    textareaClassName='bg-[#a1b8f7]'
                                    required
                                    className={`[&>label>span]:font-medium ${userCan('list_companies', 'companies') ? 'col-span-3' : 'col-span-2'}`}
                                    rows={3}
                                    onChange={formik.handleChange}
                                    value={formik.values.description}
                                    error={formik.errors.description}
                                />
                            </FormGroup>

                            {selectedPermissions !== null && permissionsData &&
                                permissionsData.map((permissionGroup: PermissionGroup, index: number) => {
                                    return (
                                        <FormGroup
                                            key={`index-${permissionGroup.id}`}
                                            title={permissionGroup.label}
                                            description={'Lista de permisos asignados al usuario'}
                                            className='pt-6'
                                            childClassName='col-span-full grid gap-4 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 @4xl:col-span-8 @4xl:gap-5 xl:gap-7'
                                        >
                                            <div key={permissionGroup.id} className={"col-span-full"}>
                                                <PermissionsGrid
                                                    group={permissionGroup}
                                                    onSelectAll={_handleSelectAll}
                                                    onSelectPermission={_handleOnSelectPermission}
                                                    selectedPermissions={selectedPermissions}
                                                />
                                            </div>
                                        </FormGroup>
                                    )
                                })
                            }
                        </div>
                    </form>
                </div>
            </>
        )
    };

    return (
        <Fragment>
            <Page container="fluid">
                {(mode === "Editar" && data) && getContent()}
                {mode === "Crear" && getContent()}
            </Page>
            <FormFooter
                submitBtnText={mode + ' Rol'}
                handleCancelBtn={() => navigate(-1)}
                handleSubmitBtn={formik.submitForm} isLoading={isLoading}
            />
        </Fragment>
    )
};

export default RoleForm;