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
import EcusFilters from "./EcusFilters";
import { EcuService } from '../../../services/metrics/ecuService';
import { EcusApiResponse } from '../../../type/entities/ecu-type';
import AsyncImg from '../../../components/extras/AsyncImg';

const columnOrder = [
    'id',
    'image',
    'name',
    'orionName',
    'orionId',
    'description',
    'createdAt',
    'updatedAt',
];

const EcusList = () => {

    // HOOKS

    const { handleErrors } = useHandleErrors();
    const { filters, updateFilters, updateFilterOrder, updatePage, updatePageSize, resetFilters } = useFiltersPR();
    const service = new EcuService();

    // STATES

    const [openFilters, setOpenFilters] = useState<boolean>(false);

    // METHODS

    //------------------------------------------------------------------------------------
    /**
     * @ES OBTIENE LAS ECUS SEGUN LOS FILTROS
     * @EN GET ECUS BASED ON FILTERS
     */
    //------------------------------------------------------------------------------------
    const [data, loading, error, refetch] = useFetch(useCallback(async () => {
        const response = await service.listEcus(filters);
        return response.getResponseData() as EcusApiResponse;
    }, [filters]));
    //------------------------------------------------------------------------------------

    //------------------------------------------------------------------------------------
    /**
     * @ES ELIMINA UNA ECU
     * @EN DELETE AN ECU
     * 
     * @param id
     */
    //------------------------------------------------------------------------------------
    const handleDelete = async (id: string) => {
        try {
            const response = await (await service.deleteEcu(id)).getResponseData();
            if (response.success) {
                refetch();
                toast.success('Ecu eliminada correctamente');
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
     * @ES ELIMINA VARIAS ECUS
     * @EN DELETE MULTIPLE ECUS
     * 
     * @param ids
     */
    //------------------------------------------------------------------------------------
    const handleMultiDelete = async (ids: string[]) => {
        try {
            const response = await (await service.deleteMultiEcus(ids)).getResponseData();
            if (response.success) {
                refetch();
                toast.success('Ecus eliminadas correctamente');
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
    const orderedData = () => data?.ecus?.map((row: any) => {
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
                        id={'ecus-table'}
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
                                                to={`${menuRoutes.ecus.path}/${row.id}/profile/${menuRoutes.ecus.profile.info}`}>
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
                                            content={'Editar usuario'}
                                            placement="top"
                                            color="invert"
                                        >
                                            <Link to={`${menuRoutes.ecus.path}/${row.id}/edit`}>
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
                                            content={'Eliminar'}
                                            placement="top"
                                            color="invert"
                                        >
                                            <div>
                                                <DeletePopover
                                                    title={`Eliminar ecu`}
                                                    description={`¿Estás seguro de que deseas eliminar la ecu ${row.name}?`}
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
                            pageCount: (data as EcusApiResponse) ? data.lastPage : 1,
                            totalCount: data?.totalRegisters,
                            handlePagination: updatePage,
                            handlePerPage: updatePageSize,
                        }}
                        toggleFilters={() => setOpenFilters(!openFilters)}
                    />
                </>
            )}

            <FilterDrawerView isOpen={openFilters} setOpenDrawer={setOpenFilters} drawerTitle={'Filtros Ecus'}>
                <EcusFilters filters={filters} updateFilters={updateFilters} resetFilters={resetFilters} />
            </FilterDrawerView>
        </Page>
    );
};

export default EcusList;