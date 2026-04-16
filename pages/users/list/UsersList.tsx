import { formatDistance } from "date-fns";
import { es } from 'date-fns/locale';
import { useFormik } from "formik";
import { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { ActionIcon, Switch, Tooltip, cn } from 'rizzui';
import { toast } from 'sonner';
import { ReactComponent as AdminIcon } from '../../../assets/Iconos/Interfaz/admin.svg';
import { ReactComponent as EditarIcon } from '../../../assets/Iconos/Interfaz/editar.svg';
import { ReactComponent as PersonalizacionIcon } from '../../../assets/Iconos/Interfaz/personalizacion.svg';
import { ReactComponent as VerIcon } from '../../../assets/Iconos/Interfaz/ver.svg';
import Spinner from '../../../components/bootstrap/Spinner';
import CustomPopover from '../../../components/buttons/CustomPopover';
import DeletePopover from '../../../components/buttons/DeletePopover';
import CompanySelectModal from '../../../components/forms/CompanySelectModal';
import { isUser } from '../../../components/priviledge/PriviledgeProvider';
import { useFiltersPR } from '../../../components/providers/FiltersProvider';
import CustomTable from '../../../components/table/CustomTable';
import { FilterDrawerView } from '../../../components/table/components/TableFilter';
import useFetch from '../../../hooks/useFetch';
import useHandleErrors from '../../../hooks/useHandleErrors';
import Page from '../../../layout/Page/Page';
import { User, login } from '../../../redux/authSlice';
import { AppDispatch, RootState } from '../../../redux/store';
import { menuRoutes } from '../../../router/menu';
import { LoginService } from "../../../services/auth/loginService";
import { UserService } from '../../../services/user/userService';
import { UsersApiResponse } from '../../../type/entities/user-type';
import { capitalize } from "../../../utils/addSpacesToCamelCase";
import UsersFilters from './UsersFilters';
import SvgLogin from "../../../components/icon/material-icons/Login";

const columnOrder = [
    'id',
    'profileImg',
    'name',
    'lastName',
    'email',
    'userRoles',
    'userCompanies',
    'active',
    'lastLogin',
    'createdAt',
    'updatedAt',
];

const UsersList = () => {

    // HOOKS

    const { user } = useSelector((state: RootState) => state.auth);
    const dispatch = useDispatch<AppDispatch>();
    const { handleErrors } = useHandleErrors();
    const navigate = useNavigate();
    const { filters, updateFilters, updateFilterOrder, updatePage, updatePageSize, resetFilters } = useFiltersPR();
    const service = new UserService();

    // STATES

    const [changingStatus, setChangingStatus] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [openFilters, setOpenFilters] = useState<boolean>(false);
    const [companySelection, setCompanySelection] = useState<any>(null);
    const [companiesForUserToggle, setCompaniesForUserToggle] = useState<any>(null);
    const [selectedUserData, setSelectedUserData] = useState<any>(null);

    // METHODS

    //------------------------------------------------------------------------------------
    /**
     * @ES OBTIENE LOS USUARIOS SEGUN LOS FILTROS
     * @EN GET USERS BASED ON FILTERS
     */
    //------------------------------------------------------------------------------------
    const [data, loading, error, refetch] = useFetch(useCallback(async () => {
        const response = await service.listUsers(filters);
        return response.getResponseData() as UsersApiResponse;
    }, [filters]));
    //------------------------------------------------------------------------------------

    //------------------------------------------------------------------------------------
    /**
     * @ES CAMBIA EL ESTADO DE UN USUARIO
     * @EN TOGGLE USER STATUS
     * 
     * @param id
     * @param status
     * @param companies
     */
    //------------------------------------------------------------------------------------
    const toggleStatus = async (id: string, status: boolean, companies: any) => {
        if (isUser(user) && user?.roles.includes('Superadministrador') && companies?.length > 1) {
            setCompaniesForUserToggle(companies);
            setSelectedUserData({ id, status });
        } else {
            try {
                setChangingStatus([...changingStatus, id]);
                const response = (await service.toggleUserStatus(id, status, companies[0]?.company?.id)).getResponseData();
                if (response.success) {
                    setChangingStatus(changingStatus.filter((item) => item !== id));
                    refetch();
                    toast.success(response.message);
                } else {
                    setChangingStatus(changingStatus.filter((item) => item !== id));
                    toast.error(response.message);
                }
            } catch (error: any) {
                setChangingStatus(changingStatus.filter((item) => item !== id));
                toast.error(error.message);
            }
        }
    };
    //------------------------------------------------------------------------------------

    //------------------------------------------------------------------------------------
    /**
     * @ES CAMBIA EL ESTADO DE UN USUARIO PARA UNA ORGANIZACIÓN ESPECÍFICA
     * @EN TOGGLE USER STATUS FOR A SPECIFIC COMPANY
     * 
     * @param companyId
     */
    //------------------------------------------------------------------------------------
    const handleToggleUserByCompany = async (companyId: string) => {
        try {
            setChangingStatus([...changingStatus, selectedUserData?.id]);
            const response = (await service.toggleUserStatus(selectedUserData?.id, selectedUserData?.status, companyId)).getResponseData();
            if (response.success) {
                setChangingStatus(changingStatus.filter((item) => item !== selectedUserData?.id));
                refetch();
                toast.success("Se ha modificado el estado del usuario para esa organización");
            } else {
                setChangingStatus(changingStatus.filter((item) => item !== selectedUserData?.id));
                toast.error(response.message);
            }
        } catch (error: any) {
            setChangingStatus(changingStatus.filter((item) => item !== selectedUserData?.id));
            toast.error(error.message);
        } finally {
            setCompaniesForUserToggle(null);
            setSelectedUserData(null);
            toggleFormik.resetForm();
        }
    };
    //------------------------------------------------------------------------------------

    //------------------------------------------------------------------------------------
    /**
     * @ES INICIA SESIÓN COMO UN USUARIO
     * @EN LOGIN AS A USER
     * 
     * @param id
     */
    //------------------------------------------------------------------------------------
    const handleLoginAsUser = async (id: string) => {
        setIsLoading(true);
        const response = await (await service.loginAsUser(id)).getResponseData();

        if (!response?.success) {
            toast.error(response?.response?.message || 'Error al intentar acceder como el usuario');
            setIsLoading(false);
            dispatch(login({
                isAuthenticated: false,
                hasToken: false,
                loading: false,
                error: response.message || 'Error al intentar acceder como el usuario',
                user: null
            }));
            return;
        }

        if (response && response.success) {
            if (response.data?.token) {
                try {
                    const user: User = {
                        id: response.data.user.id,
                        email: response.data.user.email,
                        token: response.data.token,
                        name: response.data.user.name,
                        lastName: response.data.user.lastName,
                        profileImage: response.data.user.imgProfile,
                        roles: response.data.user.roles,
                        roleId: response.data.user.roleId,
                        companyName: response.data.user.companyName || '',
                        companyId: response.data.user.loggedCompany || '',
                    };
                    // dispatch login action
                    dispatch(login({
                        user: user,
                        isAuthenticated: true,
                        hasToken: true,
                        loading: false,
                        error: null,
                    }))
                    toast.success('Has accedido como ' + user.name);
                } catch (error) {
                    toast.error('Error al intentar acceder como el usuario');
                    return;
                } finally {
                    setIsLoading(false);
                }
            } else {
                setCompanySelection(response.data.companies);
                setSelectedUserData({
                    userId: response.data.user_id,
                    loginCode: response.data.provisional_code,
                });
                setIsLoading(false);
            }
        }
    };
    //------------------------------------------------------------------------------------

    //------------------------------------------------------------------------------------
    /**
     * @ES ASIGNA ACCESO A UN USUARIO A UNA EMPRESA
     * @EN GRANT ACCESS TO A USER FOR A COMPANY
     * 
     * @param companyId
     */
    //------------------------------------------------------------------------------------
    const handleGrantAccess = async (companyId: string) => {
        setIsLoading(true);
        if (!isUser(user)) return;
        const response = await (await (new LoginService).authUserGrantAccess(companyId, selectedUserData?.userId, selectedUserData?.loginCode)).getResponseData();

        try {
            const user: User = {
                token: response.data.token,
                id: response.data.user.id,
                email: response.data.user.email,
                name: response.data.user.name,
                lastName: response.data.user.lastName,
                profileImage: response.data.user.imgProfile,
                roles: response.data.user.roles,
                roleId: response.data.user.roleId,
                companyName: response.data.user.companyName || '',
                companyId: response.data.user.loggedCompany || '',
                companyCif: response.data.user.companyCif || '',
            };

            // dispatch login action
            dispatch(login({
                user: user,
                isAuthenticated: true,
                hasToken: true,
                loading: false,
                error: null,
            }));

            navigate(menuRoutes.dashboard.path, { replace: true });
        } catch (error) {
            toast.error(response?.message || 'Error al iniciar sesión. Por favor, inténtalo de nuevo más tarde.');
            return;
        } finally {
            setIsLoading(false);
        }
    };
    //------------------------------------------------------------------------------------

    //------------------------------------------------------------------------------------
    /**
     * @ES ELIMINA UN USUARIO
     * @EN DELETE A USER
     * 
     * @param id
     */
    //------------------------------------------------------------------------------------
    const handleDelete = async (id: string) => {
        try {
            const response = await (await service.deleteUser(id)).getResponseData();
            if (response.success) {
                refetch();
                toast.success('Usuario eliminado correctamente');
            } else {
                handleErrors(response);
            }
        } catch (error) {
            handleErrors(error);
        }
    };
    //------------------------------------------------------------------------------------
    
    //------------------------------------------------------------------------------------
    /**
     * @ES ELIMINA VARIOS USUARIOS
     * @EN DELETE MULTIPLE USERS
     * 
     * @param ids
     */
    //------------------------------------------------------------------------------------
    const handleMultiDelete = async (ids: string[]) => {
        try {
            const response = await (await service.deleteMultiUsers(ids)).getResponseData();
            if (response.success) {
                refetch();
                toast.success('Usuarios eliminados correctamente');
            } else {
                handleErrors(response);
            }
        } catch (error) {
            handleErrors(error);
        }
    };
    //------------------------------------------------------------------------------------

    //------------------------------------------------------------------------------------
    /**
     * @ES RESETEA LOS PERMISOS DE UN USUARIO
     * @EN RESET USER PERMISSIONS
     * 
     * @param id
     */
    //------------------------------------------------------------------------------------
    const resetUserPermissions = async (id: string) => {
        try {
            const response = await (await service.resetUserPermissions(id)).getResponseData();
            if (response.success) {
                refetch();
                toast.success('Permisos reseteados correctamente');
            } else {
                handleErrors(response);
            }
        } catch (error) {
            handleErrors(error);
        }
    };
    //------------------------------------------------------------------------------------

    //------------------------------------------------------------------------------------
    /**
     * @ES ORDENA LOS DATOS SEGÚN EL ORDEN DE LAS COLUMNAS
     * @EN ORDER DATA BY COLUMN ORDER
     */
    //------------------------------------------------------------------------------------
    const orderedData = () => data?.data.map((row: any) => {
        const orderedRow: any = {};
        columnOrder.forEach((key) => {
            orderedRow[key] = row[key];
        });
        return orderedRow;
    });

    // FORMIK

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            companyId: '',
        },
        validate: (values) => {
            const errors: { companyId?: string } = {};

            if (!values.companyId) {
                errors.companyId = 'Requerido';
            }

            return errors;
        },
        validateOnChange: false,
        onSubmit: (values) => { handleGrantAccess(values.companyId) },
    });

    const toggleFormik = useFormik({
        enableReinitialize: true,
        initialValues: {
            companyId: '',
        },
        validate: (values) => {
            const errors: { companyId?: string } = {};

            if (!values.companyId) {
                errors.companyId = 'Requerido';
            }

            return errors;
        },
        validateOnChange: false,
        onSubmit: (values) => { handleToggleUserByCompany(values.companyId) },
    });

    // RENDER

    return (
        <Page container='fluid'>
            {data !== undefined && (
                <>
                    <CustomTable
                        id={'users-table'}
                        largeTable
                        columnOrder={columnOrder}
                        data={orderedData()}
                        isLoading={loading}
                        columnsNotShown={['lastName', 'userCompanies']}
                        overrideColumns={[
                            {
                                key: 'userRoles',
                                render: (row: any) => {
                                    const originalCompanies = row.row.original.userCompanies;

                                    // Si NO es superadmin → solo mostrar su compañía
                                    const userCompanies = isUser(user) && !user.roles.includes('Superadministrador')
                                        ? originalCompanies.filter(
                                            (comp: any) => comp.company.id === user.companyId
                                        )
                                        : originalCompanies;

                                    return (
                                        <div>
                                            {row.row.original.userRoles.map((role: any) => {
                                                const companies = userCompanies.find(
                                                    (company: any) => company.company.id === role.company?.id
                                                );

                                                // Si no pertenece a la compañía visible → no mostrar ese rol
                                                if (!companies && !user?.roles.includes('Superadministrador')) return null;

                                                const hasMultipleCompanies = userCompanies.length > 1;
                                                const isDisabledCompany = hasMultipleCompanies ? companies?.userIsActiveOnOrg : null;
                                                const color = hasMultipleCompanies ? (isDisabledCompany ? 'text-primary' : 'text-secondary') : '';

                                                return (
                                                    <div key={role.role.id} className={color}>
                                                        {role.role.name}
                                                        {role.company?.name && ` (${role.company.name})`}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    );
                                }
                            },
                            {
                                key: 'lastLogin',
                                render: (row: any) => {
                                    const date = row.row.original?.lastLogin?.date;
                                    return date ? capitalize(formatDistance(new Date(date), new Date(), { addSuffix: true, locale: es })) : 'Nunca';
                                },
                            },
                            {
                                key: 'active',
                                render: (row: any) => {

                                    const original = row.row.original;

                                    // Si el usuario logueado NO es superadmin → usar estado por compañía
                                    let isActive = original.active;

                                    if (isUser(user) && !user.roles.includes('Superadministrador') && user.companyId) {
                                        const companyEntry = original.userCompanies?.find(
                                            (c: any) => c.company.id === user.companyId
                                        );

                                        // Si existe, usamos su estado individual por compañía
                                        isActive = companyEntry ? companyEntry.userIsActiveOnOrg : false;
                                    }

                                    return (
                                        <Tooltip
                                            size="sm"
                                            content={isActive ? 'Desactivar usuario' : 'Activar usuario'}
                                            placement="top"
                                            color="invert"
                                        >
                                            <Switch
                                                id={original.id}
                                                checked={isActive}
                                                disabled={
                                                    changingStatus.includes(original.id) ||
                                                    (isUser(user) ? original.id === user.id : false)
                                                }
                                                onChange={() =>
                                                    toggleStatus(
                                                        original.id,
                                                        isActive,
                                                        original.userCompanies
                                                    )
                                                }
                                                switchKnobClassName={cn({
                                                    'bg-primary': isActive,
                                                    'bg-secondary': !isActive,
                                                })}
                                            />
                                        </Tooltip>
                                    );
                                }
                            }
                        ]}
                        actions={[
                            {
                                label: 'Log in',
                                permissions: { group: 'user', permission: 'login_as_other_users' },
                                render: (row: any) => {

                                    // Obtener correctamente el objeto original
                                    const original = row.row?.original ?? row.original ?? row;

                                    if (isUser(user) && original.id === user?.id) return null;

                                    const loggedCompanyId = user?.companyId;

                                    // Estado del usuario según MI compañía
                                    let isActiveInCompany = true; // valor por defecto por si no usa multiempresa

                                    if (loggedCompanyId) {
                                        const companyEntry = original.userCompanies?.find(
                                            (c: any) => c.company.id === loggedCompanyId
                                        );

                                        isActiveInCompany = companyEntry ? companyEntry.userIsActiveOnOrg : false;
                                    }

                                    // Bloqueo si NO soy superadmin y ese usuario está inactivo en mi compañía
                                    const mustDisableLogin =
                                        (!user?.roles.includes('Superadministrador')) &&
                                        !isActiveInCompany;

                                    return (
                                        <Tooltip
                                            size="sm"
                                            content={
                                                mustDisableLogin
                                                    ? 'Este usuario está inactivo en tu organización'
                                                    : 'Acceder como usuario'
                                            }
                                            placement="top"
                                            color="invert"
                                        >
                                            <ActionIcon
                                                as="span"
                                                size="sm"
                                                variant="outline"
                                                className={cn(
                                                    "hover:!border-gray-900 hover:text-gray-700 cursor-pointer bg-white",
                                                    mustDisableLogin && "opacity-50 cursor-not-allowed"
                                                )}
                                                onClick={() =>
                                                    !mustDisableLogin && handleLoginAsUser(original.id)
                                                }
                                                disabled={isLoading || mustDisableLogin}
                                            >
                                                {isLoading ? (
                                                    <Spinner color={'dark'} />
                                                ) : (
                                                    <SvgLogin className="h-4 w-4" />
                                                )}
                                            </ActionIcon>
                                        </Tooltip>
                                    );
                                },
                            },
                            {
                                label: 'View',
                                permissions: { group: 'user', permission: 'get_users' },
                                render: (row: any) => {
                                    return (
                                        <Tooltip
                                            size="sm"
                                            content={'Ver perfil'}
                                            placement="top"
                                            color="invert"
                                        >
                                            <Link
                                                to={`${menuRoutes.users.path}/${row.id}/profile${menuRoutes.users.profile.info}`}>
                                                <ActionIcon
                                                    as="span"
                                                    size="sm"
                                                    variant="outline"
                                                    className="hover:!border-gray-900 hover:text-gray-700 bg-white"
                                                >
                                                    <VerIcon className="h-4 w-4" />
                                                </ActionIcon>
                                            </Link>
                                        </Tooltip>
                                    );
                                },
                            },
                            {
                                label: 'Edit',
                                permissions: { group: 'user', permission: 'edit_users' },
                                render: (row: any) => {
                                    return (
                                        <Tooltip
                                            size="sm"
                                            content={'Editar usuario'}
                                            placement="top"
                                            color="invert"
                                        >
                                            <Link to={`${menuRoutes.users.path}/${row.id}/edit/info`}>
                                                <ActionIcon
                                                    as="span"
                                                    size="sm"
                                                    variant="outline"
                                                    className="hover:!border-gray-900 hover:text-gray-700 bg-white"
                                                >
                                                    <EditarIcon className="h-4 w-4" />
                                                </ActionIcon>
                                            </Link>
                                        </Tooltip>
                                    );
                                },
                            },
                            {
                                label: 'Resetear Permisos',
                                permissions: { group: 'user', permission: 'edit_user_permissions' },
                                render: (row: any) => {
                                    return (
                                        <Tooltip
                                            size="sm"
                                            content={'Resetear permisos'}
                                            placement="top"
                                            color="invert"
                                        >
                                            <div>
                                                <CustomPopover
                                                    title={'Resetear permisos'}
                                                    description={'¿Estás seguro de que deseas resetear los permisos de este usuario?'}
                                                    onClick={() => resetUserPermissions(row.id)}
                                                    icon={<PersonalizacionIcon className="h-4 w-4" />}
                                                    actionIconClassName="bg-white"
                                                />
                                            </div>
                                        </Tooltip>
                                    );
                                },
                            },
                            {
                                label: 'Delete',
                                permissions: { group: 'user', permission: 'delete_users' },
                                render: (row: any) => {
                                    if (isUser(user) && row.id === user.id) return null;
                                    return (
                                        <Tooltip
                                            size="sm"
                                            content={'Eliminar'}
                                            placement="top"
                                            color="invert"
                                        >
                                            <div>
                                                <DeletePopover
                                                    title={`Eliminar usuario`}
                                                    description={`¿Estás seguro de que deseas eliminar a ${row.name}?`}
                                                    onDelete={() => handleDelete(row.id)}
                                                    actionIconClassName="bg-white"
                                                />
                                            </div>
                                        </Tooltip>
                                    );
                                },
                            },
                        ]}
                        handleMultipleDelete={handleMultiDelete}
                        filters={filters}
                        updateFilters={updateFilters}
                        updateFilterOrder={updateFilterOrder}
                        defaultOrder={filters.filter_order || undefined}
                        paginationData={{
                            pageSize: filters.limit,
                            currentPage: filters.page,
                            pageCount: (data as UsersApiResponse) ? data.lastPage : 1,
                            totalCount: data?.totalRegisters,
                            handlePagination: updatePage,
                            handlePerPage: updatePageSize,
                        }}
                        toggleFilters={() => setOpenFilters(!openFilters)}
                    />

                    <CompanySelectModal
                        isOpen={companySelection !== null}
                        title={'Listado de empresas del usuario'}
                        onClose={() => {
                            setCompanySelection(null);
                            setSelectedUserData(null);
                            formik.resetForm();
                        }}
                        formik={formik}
                        companies={companySelection}
                        label={'Selecciona la empresa a la que quieres acceder:'}
                        buttonText={'Acceder'}
                        isLoading={isLoading}
                        loading={loading}
                    />

                    <CompanySelectModal
                        isOpen={companiesForUserToggle !== null}
                        title={'Listado de empresas del usuario'}
                        onClose={() => {
                            setCompaniesForUserToggle(null);
                            setSelectedUserData(null);
                            toggleFormik.resetForm();
                        }}
                        formik={toggleFormik}
                        companies={companiesForUserToggle}
                        label={'Selecciona la empresa en la que se va a cambiar el estado del usuario:'}
                        buttonText={'Cambiar estado del usuario'}
                        isLoading={isLoading}
                        loading={loading}
                    />
                </>
            )}

            <FilterDrawerView isOpen={openFilters} setOpenDrawer={setOpenFilters} drawerTitle={'Filtros Usuarios'}>
                <UsersFilters filters={filters} updateFilters={updateFilters} resetFilters={resetFilters} />
            </FilterDrawerView>
        </Page>
    );
};

export default UsersList;