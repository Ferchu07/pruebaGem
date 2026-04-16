import React, { useCallback, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { ActionIcon, Switch, Tooltip } from 'rizzui';
import { toast } from 'sonner';
import { ReactComponent as EditarIcon } from '../../../assets/Iconos/Interfaz/editar.svg';
import DeletePopover from '../../../components/buttons/DeletePopover';
import { isUser } from "../../../components/priviledge/PriviledgeProvider";
import { useFiltersPR } from '../../../components/providers/FiltersProvider';
import CustomTable from '../../../components/table/CustomTable';
import { FilterDrawerView } from '../../../components/table/components/TableFilter';
import useFetch from '../../../hooks/useFetch';
import useHandleErrors from '../../../hooks/useHandleErrors';
import Page from '../../../layout/Page/Page';
import { RootState } from '../../../redux/store';
import { menuRoutes } from '../../../router/menu';
import { RoleService } from '../../../services/role/roleService';
import { RolesApiResponse } from '../../../type/entities/role-type';
import RolesFilters from './RolesFilters';
import { useSetAtom } from 'jotai';
import { headerActionAtom, headerConfigAtom } from '../../../atoms/headerAtoms';

interface RolesListProps { }

const columnOrder = [
    'id',
    'name',
    'description',
    'active',
    'color',
    'company',
];

const RolesList: React.FC<RolesListProps> = ({ }) => {

    // HOOKS

    const { user } = useSelector((state: RootState) => state.auth);
    const { handleErrors } = useHandleErrors();
    const { filters, updateFilters, updateFilterOrder, updatePage, updatePageSize, resetFilters } = useFiltersPR();
    const service = new RoleService();

    // STATEs

    const [changingStatus, setChangingStatus] = useState<string[]>([]);
    const [openFilters, setOpenFilters] = useState<boolean>(false);

    // ATOMS
    
    const setHeaderAction = useSetAtom(headerActionAtom);
    const setHeaderConfig = useSetAtom(headerConfigAtom);

    // --------------------------------------------------------------------------------------------------
    /**
     * @ES OBTIENE LOS ROLES SEGUN LOS FILTROS
     * @EN GETS THE ROLES BASED ON THE FILTERS
     * 
     * @param filters
     */
    // --------------------------------------------------------------------------------------------------
    const [data, loading, error, refetch] = useFetch(useCallback(async () => {
        const response = await service.listRoles(filters);
        return response.getResponseData() as RolesApiResponse;
    }, [filters]));
    // --------------------------------------------------------------------------------------------------

    // --------------------------------------------------------------------------------------------------
    /**
     * @ES CAMBIA EL ESTADO DE UN ROL
     * @EN CHANGES THE STATUS OF A ROLE
     * 
     * @param id
     * @param status
     */
    // --------------------------------------------------------------------------------------------------
    const toggleStatus = async (id: string, status: boolean) => {
        try {
            setChangingStatus([...changingStatus, id]);
            const response = (await service.toggleRoleStatus(id, status)).getResponseData();
            if (response.success) {
                setChangingStatus(changingStatus.filter((item) => item !== id));
                refetch();
                toast.success(status ? "Se ha desactivado el rol" : "Se ha activado el rol");
            } else {
                setChangingStatus(changingStatus.filter((item) => item !== id));
                toast.error(response.message);
            }
        } catch (error: any) {
            setChangingStatus(changingStatus.filter((item) => item !== id));
            toast.error(error.message);
        }
    };
    // --------------------------------------------------------------------------------------------------

    // --------------------------------------------------------------------------------------------------
    /**
     * @ES ELIMINA UN ROL
     * @EN DELETES A ROLE
     * 
     * @param id
     */
    // --------------------------------------------------------------------------------------------------
    const handleDelete = async (id: string) => {
        try {
            const response = await (await service.deleteRole(id)).getResponseData();
            if (response.success) {
                refetch();
                toast.success('Rol eliminado correctamente');
            } else {
                handleErrors(response);
            }
        } catch (error) {
            handleErrors(error);
        }
    };
    // --------------------------------------------------------------------------------------------------

    // --------------------------------------------------------------------------------------------------
    /**
     * @ES ELIMINA VARIOS ROLES
     * @EN DELETES MULTIPLE ROLES
     * 
     * @param ids
     */
    // --------------------------------------------------------------------------------------------------
    const handleMultiDelete = async (ids: string[]) => {
        try {
            const response = await (await service.deleteMultiRoles(ids)).getResponseData();
            if (response.success) {
                refetch();
                toast.success('Roles eliminados correctamente');
            } else {
                handleErrors(response);
            }
        } catch (error) {
            handleErrors(error);
        }
    };
    // --------------------------------------------------------------------------------------------------

    // --------------------------------------------------------------------------------------------------
    /**
     * @ES ORDENA LOS DATOS SEGUN EL ORDEN DE COLUMNAS
     * @EN ORDERS THE DATA BASED ON THE COLUMN ORDER
     * 
     * @param data
     * @param columnOrder
     */
    // --------------------------------------------------------------------------------------------------
    const orderedData = data?.data.map((row: any) => {
        const orderedRow: any = {};
        columnOrder.forEach((key) => {
            orderedRow[key] = row[key];
        });
        return orderedRow;
    });
    // --------------------------------------------------------------------------------------------------

    // RENDER

    return (
        <Page container='fluid'>
            {data !== undefined && (
                <CustomTable
                    id={'roles-table'}
                    data={orderedData}
                    columnOrder={columnOrder}
                    columnsNotShown={['inmutable']}
                    overrideColumns={[
                        {
                            key: 'color',
                            render: (row: any) => {
                                if (!row.row.original?.color) return null;
                                return (
                                    <div
                                        key={row.row.original.id + row.row.original?.color}
                                        style={{
                                            backgroundColor: row.row.original?.color,
                                            border: "1px solid rgba(0, 0, 0, 0.1)",
                                            width: "35px",
                                            height: "35px",
                                        }}
                                        className={'rounded-full mr-3 p-3'}
                                    ></div>
                                );
                            },
                        },
                        {
                            key: 'company',
                            permissions: [
                                { group: 'companies', permission: 'list_companies' }
                            ],
                            render: (row: any) => {
                                return (
                                    <span>
                                        {row.row.original.company?.name}
                                    </span>
                                );
                            },
                        },
                        {
                            key: 'active',
                            render: (row: any) => {
                                return (
                                    <Tooltip
                                        size="sm"
                                        content={row.row.original.active ? 'Desactivar rol' : 'Activar rol'}
                                        placement="top"
                                        color="invert"
                                    >
                                        <Switch
                                            id={row.row.original.id}
                                            checked={row.row.original.active}
                                            disabled={changingStatus.includes(row.row.original.id) || (isUser(user) ? row.row.original.id === user.id : false)}
                                            onChange={() => toggleStatus(row.row.original.id, row.row.original.active)}
                                            switchKnobClassName='bg-primary'
                                        />
                                    </Tooltip>
                                );
                            },
                        }
                    ]}
                    actions={[
                        {
                            label: 'Edit',
                            permissions: { group: 'roles', permission: 'edit_roles' },
                            render: (row: any) => {
                                return (
                                    <Tooltip
                                        size="sm"
                                        content={'Editar rol'}
                                        placement="top"
                                        color="invert"
                                    >
                                        <Link to={`${menuRoutes.roles.path}/${row.id}/edit`}>
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
                            label: 'Delete',
                            permissions: { group: 'roles', permission: 'delete_roles' },
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
                                                title={`Eliminar rol`}
                                                description={`¿Estás seguro de que deseas eliminar a ${row.name}?`}
                                                onDelete={() => handleDelete(row.id)}
                                                actionIconClassName='bg-white'
                                            />
                                        </div>
                                    </Tooltip>
                                );
                            },
                        }]}
                    handleMultipleDelete={handleMultiDelete}
                    filters={filters}
                    updateFilters={updateFilters}
                    updateFilterOrder={updateFilterOrder}
                    defaultOrder={filters.filter_order || undefined}
                    paginationData={{
                        pageSize: filters.limit,
                        currentPage: filters.page,
                        pageCount: (data as RolesApiResponse) ? data.lastPage : 1,
                        totalCount: data?.totalRegisters,
                        handlePagination: updatePage,
                        handlePerPage: updatePageSize,
                    }}
                    toggleFilters={() => setOpenFilters(!openFilters)}
                />
            )}
            <FilterDrawerView isOpen={openFilters} setOpenDrawer={setOpenFilters} drawerTitle={'Filtros Roles'}>
                <RolesFilters filters={filters} updateFilters={updateFilters} resetFilters={resetFilters} />
            </FilterDrawerView>
        </Page>
    );
};

export default RolesList;