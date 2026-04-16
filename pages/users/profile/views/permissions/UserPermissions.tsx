import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { Input, Text } from 'rizzui';
import CustomSelect from '../../../../../components/forms/CustomSelect';
import { Loader } from '../../../../../components/loader/SpinnerLogo';
import { isUser } from '../../../../../components/priviledge/PriviledgeProvider';
import { ShowPermissionAccordion } from '../../../../../components/ui/PermissionsAccordion';
import useFetch from '../../../../../hooks/useFetch';
import FormGroup from '../../../../../layout/shared/form-group';
import { RootState } from '../../../../../redux/store';
import { PermissionService } from '../../../../../services/auth/permissionService';
import { UserService } from '../../../../../services/user/userService';
import { Permission, PermissionGroup, PermissionsApiResponse, RolePermission } from '../../../../../type/entities/role-type';
import { UserApiResponse } from '../../../../../type/entities/user-type';
import cn from '../../../../../utils/classNames';
import UserProfileLayout from '../../UserProfileLayout';

const UserPermissions = () => {

    // HOOKS

    const { user } = useSelector((state: RootState) => state.auth);
    const { id = '' } = useParams<{ id: string }>();

    // STATES

    const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
    const [groupSearch, setGroupSearch] = useState<string>('');
    const [filteredPermissionsData, setFilteredPermissionsData] = useState<PermissionGroup[] | null>(null);
    const [companyId, setCompanyId] = useState<string | null>(null);

    // FUNCTIONS

    // -----------------------------------------------------------------------------------
    /**
     * @ES OBTIENE LOS DATOS DE UN USUARIO POR ID
     * @EN GETS USER DATA BY ID
     * 
     * @param id 
     */
    // -----------------------------------------------------------------------------------
    const [data] = useFetch(useCallback(async () => {
        if (!id || id === '') return null;
        const response = await (new UserService()).getUserById(id);
        return response.getResponseData() as UserApiResponse;
    }, [id]));
    // -----------------------------------------------------------------------------------

    // -----------------------------------------------------------------------------------
    /**
     * @ES OBTIENE LAS EMPRESAS A LAS QUE PERTENECE UN USUARIO
     * @EN GETS THE COMPANIES A USER BELONGS TO
     * 
     * @param id 
     */
    // -----------------------------------------------------------------------------------
    const [userCompanies] = useFetch(useCallback(async () => {
        if (!data || !data.id) return [];
        const response = await (new UserService()).listCompanies({ filter_filters: { user: data.id } });
        return response.getResponseData() as UserApiResponse;
    }, [data]));
    // -----------------------------------------------------------------------------------

    // -----------------------------------------------------------------------------------
    /**
     * @ES OBTIENE LOS PERMISOS DISPONIBLES
     * @EN GETS AVAILABLE PERMISSIONS
     * 
     * @param id 
     */
    // -----------------------------------------------------------------------------------
    const [permissionsData, permissionsLoading] = useFetch(useCallback(async () => {
        const response = await (new PermissionService()).getPermissions();
        return response.getResponseData() as PermissionsApiResponse;
    }, []));
    // -----------------------------------------------------------------------------------

    // -----------------------------------------------------------------------------------
    /**
     * @ES MUESTRA LOS PERMISOS SELECCIONADOS
     * @EN SHOWS SELECTED PERMISSIONS
     * 
     * @param permissions 
     */
    // -----------------------------------------------------------------------------------
    const _handleSelectedPermissions = (permissions: RolePermission[]) => {
        const selectedIds = permissions.map((permission: RolePermission) => permission.permission.id);
        // @ts-ignore
        setSelectedPermissions(selectedIds);
    };
    // -----------------------------------------------------------------------------------

    // USE EFFECTS

    // -----------------------------------------------------------------------------------
    /**
     * @ES ASIGNA LA EMPRESA DEL USUARIO A LA VARIABLE companyId
     * @EN ASSIGNS THE USER'S COMPANY TO THE companyId VARIABLE
     */
    // -----------------------------------------------------------------------------------
    useEffect(() => {
        if (user && isUser(user)) {
            const userCompanyId = user?.roles?.includes('Superadministrador') ? userCompanies?.[0]?.id : user?.companyId;
            setCompanyId(userCompanyId || null);
        }
    }, [userCompanies]);
    // -----------------------------------------------------------------------------------

    // -----------------------------------------------------------------------------------
    /**
     * @ES ASIGNA LOS PERMISOS DEL USUARIO A LA VARIABLE selectedPermissions
     * @EN ASSIGNS THE USER'S PERMISSIONS TO THE selectedPermissions VARIABLE
     */
    // -----------------------------------------------------------------------------------
    useEffect(() => {
        const selectedCompanyId = isUser(user) && (user?.roles?.includes('Superadministrador') ? companyId : user?.companyId) || undefined;
        if (data) {
            const userPermissionsByCompany = data.userPermissions?.filter((permission: RolePermission) => permission.company?.id === selectedCompanyId) || null;
            _handleSelectedPermissions((isUser(user) && (user?.roles?.includes('Superadministrador'))) ? userPermissionsByCompany : data.userPermissions || []);
        }
    }, [data, companyId, user]);

    // -----------------------------------------------------------------------------------
    /**
     * @ES FILTRA LOS GRUPOS DE PERMISOS POR groupSearch, SI groupSearch ESTA VACIO, RETORNA TODOS LOS GRUPOS
     * @EN FILTERS PERMISSION GROUPS BY groupSearch, IF groupSearch IS EMPTY, RETURN ALL GROUPS
     */
    // -----------------------------------------------------------------------------------
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
    // -----------------------------------------------------------------------------------

    // RENDER

    return (
        <UserProfileLayout>
            <div className="@container">
                <div>
                    <div className="mt-6 mb-4 flex items-center">
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
                            value={{ value: companyId, label: userCompanies?.find((company: any) => company.id === companyId)?.name }}
                            onChange={(option: any) => setCompanyId(option.value)}
                            className={cn("w-64", { 'hidden': isUser(user) && !user?.roles?.includes('Superadministrador') })}
                        />
                    </div>
                    {(filteredPermissionsData && !permissionsLoading && selectedPermissions)
                        ? filteredPermissionsData.map((permissionGroup: PermissionGroup) => {
                            const atLeastOneSelected = permissionGroup.permissions.some((permission: Permission) => selectedPermissions.includes(permission.id as any));
                            return (
                                <FormGroup
                                    key={`index-${permissionGroup.id}`}
                                    title={permissionGroup.label}
                                    //description='Lista de permisos asignados al usuario'
                                    className='pt-6 mt-6 border-t border-gray-200'
                                    childClassName='col-span-full grid gap-4 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 @4xl:col-span-8 @4xl:gap-5 xl:gap-7'
                                >
                                    <div key={permissionGroup.id} className={cn([atLeastOneSelected ? '' : 'hidden absolute', "col-span-full"])}>
                                        <ShowPermissionAccordion
                                            group={permissionGroup}
                                            selectAll={[]}
                                            selectedPermissions={selectedPermissions}
                                        />
                                    </div>
                                </FormGroup>
                            )
                        })
                        : <Loader height='50vh' />
                    }
                </div>
            </div>
        </UserProfileLayout>
    );
};

export default UserPermissions;