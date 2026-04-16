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
import { MetricApiResponse } from '../../../type/entities/metric-type';
import { MetricService } from '../../../services/metrics/metricService';
import MetricsFilters from './MetricsFilters';

const columnOrder = [
    'name',
    'orionName',
    'type',
    'value',
    'metadataLabel',
    'metadataType',
    'metadataUnit',
    'scale',
    'offset',
    'from',
    'to',
    'group',
    'createdAt',
    'updatedAt',
];

const MetricsList = () => {

    // HOOKS

    const { handleErrors } = useHandleErrors();
    const { filters, updateFilters, updateFilterOrder, updatePage, updatePageSize, resetFilters } = useFiltersPR();
    const service = new MetricService();

    // STATES

    const [openFilters, setOpenFilters] = useState<boolean>(false);

    // METHODS

    //------------------------------------------------------------------------------------
    /**
     * @ES OBTIENE LAS MÉTRICAS SEGUN LOS FILTROS
     * @EN GET METRICS BASED ON FILTERS
     */
    //------------------------------------------------------------------------------------
    const [data, loading, error, refetch] = useFetch(useCallback(async () => {
        const response = await service.listMetrics(filters);
        return response.getResponseData() as MetricApiResponse;
    }, [filters]));
    //------------------------------------------------------------------------------------

    //------------------------------------------------------------------------------------
    /**
     * @ES ELIMINA UNA MÉTRICA
     * @EN DELETE A METRIC
     * 
     * @param id
     */
    //------------------------------------------------------------------------------------
    const handleDelete = async (id: string) => {
        try {
            const response = await (await service.deleteMetric(id)).getResponseData();
            if (response.success) {
                refetch();
                toast.success('Métrica eliminada correctamente');
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
     * @ES ELIMINA VARIAS MÉTRICAS
     * @EN DELETE MULTIPLE METRICS
     * 
     * @param ids
     */
    //------------------------------------------------------------------------------------
    const handleMultiDelete = async (ids: string[]) => {
        try {
            const response = await (await service.deleteMultiMetrics(ids)).getResponseData();
            if (response.success) {
                refetch();
                toast.success('Métricas eliminadas correctamente');
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
    const orderedData = () => data?.metrics?.map((row: any) => {
        return {
            id: row.id,
            name: row.name,
            orionName: row.orionName,
            type: row.type,
            value: row.value,
            metadataLabel: row.metadataLabel,
            metadataType: row.metadataType,
            metadataUnit: row.metadataUnit,
            scale: row.scale,
            offset: row.offset,
            from: row.from,
            to: row.to,
            group: row.groups?.name,
            createdAt: row.createdAt?.date,
            updatedAt: row.updatedAt?.date,
        };
    });

    // RENDER

    return (
        <Page container='fluid'>
            {data !== undefined && (
                <>
                    <CustomTable
                        id={'metrics-table'}
                        largeTable
                        columnOrder={columnOrder}
                        data={orderedData() ?? []}
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
                                                to={`${menuRoutes.metrics.path}/${row.id}/profile/${menuRoutes.metrics.profile.info}`}>
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
                                            content={'Editar métrica'}
                                            placement="top"
                                            color="invert"
                                        >
                                            <Link to={`${menuRoutes.metrics.path}/${row.id}/edit`}>
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
                                                    title={`Eliminar métrica`}
                                                    description={`¿Estás seguro de que deseas eliminar la métrica ${row.name}?`}
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
                            pageCount: (data as MetricApiResponse) ? data.lastPage : 1,
                            totalCount: data?.totalRegisters,
                            handlePagination: updatePage,
                            handlePerPage: updatePageSize,
                        }}
                        toggleFilters={() => setOpenFilters(!openFilters)}
                    />
                </>
            )}

            <FilterDrawerView isOpen={openFilters} setOpenDrawer={setOpenFilters} drawerTitle={'Filtros Métricas'}>
                <MetricsFilters filters={filters} updateFilters={updateFilters} resetFilters={resetFilters} />
            </FilterDrawerView>
        </Page>
    );
};

export default MetricsList;
