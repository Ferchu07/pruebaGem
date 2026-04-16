import { useFormik } from "formik";
import { FC, useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { useParams } from "react-router-dom";
import { Input, Text, cn } from "rizzui";
import { toast } from "sonner";
import CustomSelect from "../../../components/forms/CustomSelect";
import { Loader } from "../../../components/loader/SpinnerLogo";
import { isUser } from "../../../components/priviledge/PriviledgeProvider";
import { PermissionsGrid } from "../../../components/ui/PermissionsAccordion";
import useFetch from "../../../hooks/useFetch";
import FormGroup from "../../../layout/shared/form-group";
import { RootState } from "../../../redux/store";
import { PermissionService } from "../../../services/auth/permissionService";
import { UserService } from "../../../services/user/userService";
import { PermissionGroup, PermissionsApiResponse, RolePermission } from "../../../type/entities/role-type";
import { User, UserApiResponse } from "../../../type/entities/user-type";
import FormFooter from "../../_layout/_footers/form-footer";
import UserEditLayout from "./UserEditLayout";

const UserEditPermissions: FC = () => {
    
    // HOOKS 

    const { user } = useSelector((state: RootState) => state.auth);
    const { id = "" } = useParams<{ id: string }>();
    const service = new UserService();
    const navigate = useNavigate();

    // STATES

    const [groupSearch, setGroupSearch] = useState<string>('');
    const [filteredPermissionsData, setFilteredPermissionsData] = useState<PermissionGroup[] | null>(null);
    const [selectedPermissions, setSelectedPermissions] = useState<number[] | null>([]);
    const [updating, setUpdating] = useState<boolean>(false);

    // FORMIK

    const formik = useFormik({
        initialValues: {
            companyId: '',
        },
        onSubmit: (values) => updatePermissions(values),
    });

    // FUNCTIONS

    // -------------------------------------------------------------------------
    /**
     * @ES OBTIENE LOS PERMISOS ASIGNADOS A UN USUARIO
     * @EN GETS THE PERMISSIONS ASSIGNED TO A USER
     * 
     * @param id
     */
    // -------------------------------------------------------------------------
    const [data] = useFetch(useCallback(async () => {
        const response = await service.getUserById(id as string);
        return response.getResponseData() as User;
    }, [id]));
    // -------------------------------------------------------------------------

    // -------------------------------------------------------------------------
    /**
     * @ES OBTIENE LAS EMPRESAS A LAS QUE PERTENECE UN USUARIO
     * @EN GETS THE COMPANIES A USER BELONGS TO
     * 
     * @param id
     */
    // -------------------------------------------------------------------------
    const [userCompanies] = useFetch(useCallback(async () => {
        if (!data || !data.id) return [];
        const response = await service.listCompanies({ filter_filters: { user: data.id } });
        return response.getResponseData() as UserApiResponse;
    }, [data]));
    // -------------------------------------------------------------------------

    // -------------------------------------------------------------------------
    /**
     * @ES OBTIENE LOS PERMISOS DISPONIBLES
     * @EN GETS THE AVAILABLE PERMISSIONS
     */
    // -------------------------------------------------------------------------
    const [permissionsData, permissionsLoading] = useFetch(useCallback(async () => {
        const response = await (new PermissionService()).getPermissions();
        return response.getResponseData() as PermissionsApiResponse;
    }, []));
    // -------------------------------------------------------------------------

    // -------------------------------------------------------------------------
    /**
     * @ES MUESTRA LOS PERMISOS SELECCIONADOS EN EL GRID
     * @EN SHOWS THE SELECTED PERMISSIONS IN THE GRID
     * 
     * @param permissions
     */
    // -------------------------------------------------------------------------
    const _handleSelectedPermissions = (permissions: RolePermission[]) => {
        let permissionsIds = permissions.map((permission: RolePermission) => permission.permission.id);
        setSelectedPermissions(permissionsIds);
    };
    // -------------------------------------------------------------------------

    // -------------------------------------------------------------------------
    /**
     * @ES SELECCIONA TODOS LOS PERMISOS O DESSELECCIONA TODOS LOS PERMISOS
     * @EN SELECTS ALL PERMISSIONS OR DESELECTS ALL PERMISSIONS
     * 
     * @param permissions
     * @param checked
     */
    // -------------------------------------------------------------------------
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
    // -------------------------------------------------------------------------

    // -------------------------------------------------------------------------
    /**
     * @ES ACTUALIZA LOS PERMISOS ASIGNADOS A UN USUARIO
     * @EN UPDATES THE PERMISSIONS ASSIGNED TO A USER
     * 
     * @param values
     */
    // -------------------------------------------------------------------------
    const updatePermissions = async (values: any) => {
        try {
            setUpdating(true);
            if (selectedPermissions) {
                let response = await (await service.editUserPermissions(id, selectedPermissions, values.companyId)).getResponseData() as UserApiResponse;
                setUpdating(false);
                if (response.success && response.data) {
                    toast.success(response.message);
                } else {
                    toast.error(response.message);
                }
            }

        } catch (error: any) {
            toast.error('Error al actualizar los permisos');
        } finally {
            setUpdating(false);
        }
    };
    // -------------------------------------------------------------------------

    // -------------------------------------------------------------------------
    /**
     * @ES MUESTRA LOS PERMISOS SELECCIONADOS EN EL GRID
     * @EN SHOWS THE SELECTED PERMISSIONS IN THE GRID
     * 
     * @param permission 
     * @param checked 
     */
    // -------------------------------------------------------------------------
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
    // -------------------------------------------------------------------------

    // USE EFFECT

    /**
     * Set formik companyId value by default to the first company of the user or the user's company if the user is not a superadmin
     */
    useEffect(() => {
        if (userCompanies && userCompanies.length > 0) {
            const firstCompany = userCompanies[0];
            formik.setFieldValue('companyId', isUser(user) && (user?.roles?.includes('Superadministrador') ? firstCompany.id : user?.companyId) || null);
        }
    }, [userCompanies]);

    useEffect(() => {
        const companyId = isUser(user) && (user?.roles?.includes('Superadministrador') ? formik.values.companyId : user?.companyId) || undefined;
        if (data) {
            const userPermissionsByCompany = data.userPermissions?.filter((permission: RolePermission) => permission.company?.id === companyId) || null;
            _handleSelectedPermissions(userPermissionsByCompany);
        }
    }, [data, formik.values.companyId, user]);

    /**
     * Filter groups by groupSearch, if groupSearch is empty, return all groups
     */
    useEffect(() => {
        if (permissionsData) {
            if (groupSearch === '') {
                setFilteredPermissionsData(permissionsData);
            } else {
                const filteredGroups = permissionsData.filter((group: PermissionGroup) => { return group.label.toLowerCase().includes(groupSearch.toLowerCase()) });
                setFilteredPermissionsData(filteredGroups);
            }
        }
    }, [permissionsData, groupSearch]);

    // RENDER

    return (
        <UserEditLayout>
            <div className="@container">
                <form onSubmit={formik.handleSubmit} autoComplete="off">
                    <div className="mt-6 flex items-center">
                        <Text className="rizzui-input-label block text-sm font-medium me-3">Buscar grupo:</Text>
                        <Input
                            id="groupSearch"
                            value={groupSearch}
                            onChange={(e) => setGroupSearch(e.target.value)}
                            inputClassName='!bg-[#a1b8f7]'
                        />

                        <Text className={cn("rizzui-input-label block text-sm font-medium ms-5 me-3", { 'hidden': isUser(user) && !user?.roles?.includes('Superadministrador') })}>Organización:</Text>
                        <CustomSelect
                            id="companyId"
                            options={userCompanies?.map((company: any) => ({
                                value: company.id,
                                label: company.name,
                            })) || []}
                            value={{ value: formik.values.companyId, label: userCompanies?.find((company: any) => company.id === formik.values.companyId)?.name }}
                            onChange={(option: any) => formik.setFieldValue('companyId', option.value)}
                            className={cn("w-64", { 'hidden': isUser(user) && !user?.roles?.includes('Superadministrador') })}
                        />
                    </div>

                    {selectedPermissions && permissionsData && (filteredPermissionsData && !permissionsLoading)
                        ? filteredPermissionsData.map((permissionGroup: PermissionGroup) => {
                            return (
                                <FormGroup
                                    key={`index-${permissionGroup.id}`}
                                    title={permissionGroup.label}
                                    //description={'Lista de permisos asignados al usuario'}
                                    className='pt-6 mt-6 border-t border-gray-200'
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
                        : <Loader height='50vh' />
                    }

                    <FormFooter
                        submitBtnText={'Guardar Permisos'}
                        handleSubmitBtn={formik.submitForm}
                        handleCancelBtn={() => navigate(-1)}
                        isLoading={updating}
                        isDisabled={updating || permissionsLoading || !selectedPermissions || selectedPermissions.length === 0}
                    />
                </form>
            </div>
        </UserEditLayout>
    )
}

export default UserEditPermissions;