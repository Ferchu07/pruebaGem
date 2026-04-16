import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { ActionIcon, Tooltip } from 'rizzui';
import { toast } from 'sonner';
import { ReactComponent as EditarIcon } from '../../../assets/Iconos/Interfaz/editar.svg';
import { ReactComponent as VerIcon } from '../../../assets/Iconos/Interfaz/ver.svg';
import DeletePopover from '../../../components/buttons/DeletePopover';
import { useFiltersPR } from '../../../components/providers/FiltersProvider';
import CustomTable from '../../../components/table/CustomTable';
import { FilterDrawerView } from '../../../components/table/components/TableFilter';
import useFetch from '../../../hooks/useFetch';
import useHandleErrors from '../../../hooks/useHandleErrors';
import Page from '../../../layout/Page/Page';
import { menuRoutes } from '../../../router/menu';
import { GroupsApiResponse } from '../../../type/entities/group-type';
import { GroupService } from '../../../services/metrics/groupService';
import GroupsFilters from './GroupsFilters';

const columnOrder = [
    'id',
    'name',
    'orionName',
    'orionId',
    'description',
    'createdAt',
    'updatedAt',
];

const MetricsList = () => {

    // HOOKS

    const { handleErrors } = useHandleErrors();
    const { filters, updateFilters, updateFilterOrder, updatePage, updatePageSize, resetFilters } = useFiltersPR();
    const service = new GroupService();

    // STATES

    const [openFilters, setOpenFilters] = useState<boolean>(false);

    // METHODS

    //------------------------------------------------------------------------------------
    /**
     * @ES OBTIENE LAS GRUPOS SEGUN LOS FILTROS
     * @EN GET GROUPS BASED ON FILTERS
     */
    //------------------------------------------------------------------------------------
    const [data, loading, error, refetch] = useFetch(useCallback(async () => {
        const response = await service.listGroups(filters);
        return response.getResponseData() as GroupsApiResponse;
    }, [filters]));
    //------------------------------------------------------------------------------------

    //------------------------------------------------------------------------------------
    /**
     * @ES ELIMINA UN GRUPO
     * @EN DELETE A GROUP
     * 
     * @param id
     */
    //------------------------------------------------------------------------------------
    const handleDelete = async (id: string) => {
        try {
            const response = await (await service.deleteGroup(id)).getResponseData();
            if (response.success) {
                refetch();
                toast.success('Grupo eliminado correctamente');
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
     * @ES ELIMINA VARIOS GRUPOS
     * @EN DELETE MULTIPLE GROUPS
     * 
     * @param ids
     */
    //------------------------------------------------------------------------------------
    const handleMultiDelete = async (ids: string[]) => {
        try {
            const response = await (await service.deleteMultiGroups(ids)).getResponseData();
            if (response.success) {
                refetch();
                toast.success('Grupos eliminados correctamente');
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
    const orderedData = () => data?.groups?.map((row: any) => {
        const orderedRow: any = {};
        columnOrder.forEach((key) => {
            orderedRow[key] = row[key];
        });
        return orderedRow;
    });

    // RENDER

    return (
        <Page container='fluid'>
            {data !== undefined && (
                <>
                    <CustomTable
                        id={'groups-table'}
                        largeTable
                        columnOrder={columnOrder}
                        data={orderedData()}
                        isLoading={loading}
                        columnsNotShown={[]}
                        overrideColumns={[]}
                        actions={[
                            {
                                label: 'View',
                                permissions: { group: 'metrics', permission: 'get_metrics' },
                                render: (row: any) => {
                                    return (
                                        <Tooltip
                                            size="sm"
                                            content={'Ver perfil'}
                                            placement="top"
                                            color="invert"
                                        >
                                            <Link
                                                to={`${menuRoutes.groups.path}/${row.id}/profile/${menuRoutes.groups.profile.info}`}>
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
                                permissions: { group: 'metrics', permission: 'edit_metrics' },
                                render: (row: any) => {
                                    return (
                                        <Tooltip
                                            size="sm"
                                            content={'Editar grupo'}
                                            placement="top"
                                            color="invert"
                                        >
                                            <Link to={`${menuRoutes.groups.path}/${row.id}/edit`}>
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
                                permissions: { group: 'metrics', permission: 'delete_metrics' },
                                render: (row: any) => {
                                    return (
                                        <Tooltip
                                            size="sm"
                                            content={'Eliminar grupo'}
                                            placement="top"
                                            color="invert"
                                        >
                                            <div>
                                                <DeletePopover
                                                    title={`Eliminar grupo`}
                                                    description={`¿Estás seguro de que deseas eliminar el grupo ${row.name}?`}
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
                            pageCount: (data as GroupsApiResponse) ? data.lastPage : 1,
                            totalCount: data?.totalRegisters,
                            handlePagination: updatePage,
                            handlePerPage: updatePageSize,
                        }}
                        toggleFilters={() => setOpenFilters(!openFilters)}
                    />
                </>
            )}

            <FilterDrawerView isOpen={openFilters} setOpenDrawer={setOpenFilters} drawerTitle={'Filtros Grupos'}>
                <GroupsFilters filters={filters} updateFilters={updateFilters} resetFilters={resetFilters} />
            </FilterDrawerView>
        </Page>
    );
};

export default MetricsList;
