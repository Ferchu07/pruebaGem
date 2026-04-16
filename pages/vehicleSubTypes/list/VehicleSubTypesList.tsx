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
import VehicleSubTypesFilters from './VehicleSubTypesFilters';
import { VehicleSubTypeService } from '../../../services/vehicleSubType/vehicleSubTypeService';
import { VehicleSubType, VehicleSubTypesApiResponse } from '../../../type/entities/vehicle-subtype-type';
import VehicleSubtypeTypesModal from '../modals/VehicleSubtypeTypesModal';
import { ReactComponent as TruckIcon } from '../../../assets/Iconos/Interfaz/camion.svg';

const columnOrder = [
    'id',
    'orionName',
    'name',
    'types',
    'description',
    'createdAt',
    'updatedAt'
];


interface VehicleSubTypesListProps {
    refreshSignal?: number;
    onEdit?: (id: string) => void;
}


const VehicleSubTypesList = ({ refreshSignal, onEdit }: VehicleSubTypesListProps) => {

    // STATES
    
    const [openFilters, setOpenFilters] = useState<boolean>(false);
    const [showTypesModal, setShowTypesModal] = useState(false);
    const [selectedSubtype, setSelectedSubtype] = useState<VehicleSubType | null>(null);

    // HOOKS
    
    const { handleErrors } = useHandleErrors();
    const { filters, updateFilters, updateFilterOrder, updatePage, updatePageSize, resetFilters } = useFiltersPR();
    const service = new VehicleSubTypeService();

    // FETCHING DATA

    //-----------------------------------------------------------------------------------------------------------------
    /**
     * @ES OBTIENE LA LISTA DE TIPOS DE VEHÍCULO
     * @EN GETS THE VEHICLE TYPE LIST
     */
    //-----------------------------------------------------------------------------------------------------------------
    const [data, loading, error, refetch] = useFetch(useCallback(async () => {
        const response = await service.listVehicleSubTypes(filters);
        return response.getResponseData() as VehicleSubTypesApiResponse;
    }, [filters, refreshSignal]));
    //-----------------------------------------------------------------------------------------------------------------

    // FUNCTIONS

    //-----------------------------------------------------------------------------------------------------------------
    /**
     * @ES ELIMINA UN SUBTIPO DE VEHÍCULO
     * @EN DELETES A VEHICLE SUBTYPE
     * 
     * @param id 
     */
    //-----------------------------------------------------------------------------------------------------------------
    const handleDelete = async (id: string) => {
        try {
            const response = await (await service.deleteVehicleSubType(id)).getResponseData();
            if (response.success) {
                refetch();
                toast.success(response.message || 'Subtipo de vehículo eliminado correctamente');
            } else {
                handleErrors(response.message || 'Error al eliminar el subtipo de vehículo');
            }
        } catch (error) {
            handleErrors(error);
        }
    };
    //-----------------------------------------------------------------------------------------------------------------

    //-----------------------------------------------------------------------------------------------------------------
    /**
     * @ES ELIMINA VARIOS SUBTIPOS DE VEHÍCULO
     * @EN DELETES MULTIPLE VEHICLE SUBTYPES
     * 
     * @param ids 
     */
    //-----------------------------------------------------------------------------------------------------------------
    const handleMultiDelete = async (ids: string[]) => {
        try {
            const response = await (await service.deleteMultiVehicleSubTypes(ids)).getResponseData();
            if (response.success) {
                refetch();
                toast.success(response.message || 'Subtipos de vehículo eliminados correctamente');
            } else {
                handleErrors(response.message || 'Error al eliminar los subtipos de vehículo');
            }
        } catch (error) {
            handleErrors(error);
        }
    };
    //-----------------------------------------------------------------------------------------------------------------


    //-----------------------------------------------------------------------------------------------------------------
    /**
     * @ES ORDENA LOS DATOS DE LA TABLA
     * @EN ORDERS THE TABLE DATA
     * 
     * @returns 
     */
    //-----------------------------------------------------------------------------------------------------------------
    const orderedData = () => data?.vehicleSubtypes?.map((row: any) => {
        const orderedRow: any = {};
        columnOrder.forEach((key) => {
            orderedRow[key] = row[key];
        });
        return orderedRow;
    });
    //-----------------------------------------------------------------------------------------------------------------

    // RENDER

    return (
        <Page container='fluid'>
            {data !== undefined && (
                <CustomTable
                    id={'vehicle-subtypes-table'}
                    columnOrder={columnOrder}
                    data={orderedData()}
                    isLoading={loading}
                    overrideColumns={[]}
                    columnsNotShown={['types']}
                    actions={[
                        {
                            label: 'View',
                            permissions: { group: 'vehicle_subtypes', permission: 'get_vehicle_subtypes' },
                            render: (row: any) => {
                                return (
                                    <Tooltip
                                        size="sm"
                                        content={'Ver subtipo de vehículo'}
                                        placement="top"
                                        color="invert"
                                    >
                                         <Link
                                            to={`${menuRoutes.vehicleSubTypes.path}/${row.id}/profile/${menuRoutes.vehicleSubTypes.profile.info}`}>
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
                            label: 'Relaciones',
                            permissions: { group: 'vehicle_subtypes', permission: 'edit_vehicle_subtypes' },
                            render: (row: any) => {
                                return (
                                    <Tooltip
                                        size="sm"
                                        content={'Gestionar tipos'}
                                        placement="top"
                                        color="invert"
                                    >
                                        <ActionIcon
                                            as="span"
                                            size="sm"
                                            variant="outline"
                                            className="hover:!border-gray-900 hover:text-gray-700 bg-white"
                                            onClick={() => {
                                                setSelectedSubtype(row);
                                                setShowTypesModal(true);
                                            }}
                                        >
                                            <TruckIcon className="h-4 w-4 brightness-0" />
                                        </ActionIcon>
                                    </Tooltip>
                                );
                            },
                        },
                        {
                            label: 'Edit',
                            permissions: { group: 'vehicle_subtypes', permission: 'edit_vehicle_subtypes' },
                            render: (row: any) => {
                                return (
                                    <Tooltip
                                        size="sm"
                                        content={'Editar subtipo de vehículo'}
                                        placement="top"
                                        color="invert"
                                    >
                                        <ActionIcon
                                            as="span"
                                            size="sm"
                                            variant="outline"
                                            className="hover:!border-gray-900 hover:text-gray-700 bg-white"
                                            onClick={() => onEdit?.(row.id)}
                                        >
                                            <EditarIcon className="h-4 w-4" />
                                        </ActionIcon>
                                    </Tooltip>
                                );
                            },
                        },
                        {
                            label: 'Delete',
                            permissions: { group: 'vehicle_subtypes', permission: 'delete_vehicle_subtypes' },
                            render: (row: any) => {
                                return (
                                    <Tooltip
                                        size="sm"
                                        content={'Eliminar subtipo de vehículo'}
                                        placement="top"
                                        color="invert"
                                    >
                                        <div>
                                            <DeletePopover
                                                title={`Eliminar subtipo de vehículo`}
                                                description={`¿Estás seguro de que deseas eliminar el subtipo de vehículo ${row.name}?`}
                                                onDelete={() => handleDelete(row.id)}
                                                actionIconClassName='bg-white'
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
                        pageCount: (data as VehicleSubTypesApiResponse) ? data.lastPage : 1,
                        totalCount: data?.totalRegisters,
                        handlePagination: updatePage,
                        handlePerPage: updatePageSize,
                    }}
                    toggleFilters={() => setOpenFilters(!openFilters)}
                />
            )}

            <FilterDrawerView isOpen={openFilters} setOpenDrawer={setOpenFilters} drawerTitle={'Filtros Subtipos de Vehículos'}>
                <VehicleSubTypesFilters filters={filters} updateFilters={updateFilters} resetFilters={resetFilters} />
            </FilterDrawerView>

            {showTypesModal && (
                <VehicleSubtypeTypesModal
                    data={selectedSubtype}
                    isOpen={showTypesModal}
                    onClose={() => {
                        setShowTypesModal(false);
                        setSelectedSubtype(null);
                    }}
                    onUpdated={() => {
                        refetch();
                    }}
                />
            )}

        </Page>
    );
};

export default VehicleSubTypesList;
