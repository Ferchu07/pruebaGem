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
import VehicleTypesFilters from './VehicleTypesFilters';
import { VehicleTypeService } from '../../../services/vehicleType/vehicleTypeService';
import { VehicleType, VehicleTypesApiResponse } from '../../../type/entities/vehicle-type-type';
import { VehicleApiResponse } from '../../../type/entities/vehicle-type';
import VehicleTypeSubtypesModal from '../modals/VehicleTypeSubtypesModal';
import { AirportShuttle } from '../../../components/icon/material-icons';

const columnOrder = [
    'id',
    'orionId',
    'orionName',
    'name',
    'description',
    'vehicleSubTypes',
    'createdAt',
    'updatedAt'
];


interface VehicleTypesListProps {
    refreshSignal?: number;
    onEdit?: (id: string) => void;
}


const VehicleTypesList = ({ refreshSignal, onEdit }: VehicleTypesListProps) => {

    // STATES
    
    const [openFilters, setOpenFilters] = useState<boolean>(false);
    const [showSubtypesModal, setShowSubtypesModal] = useState(false);
    const [selectedType, setSelectedType] = useState<VehicleType | null>(null);

    // HOOKS
    
    const { handleErrors } = useHandleErrors();
    const { filters, updateFilters, updateFilterOrder, updatePage, updatePageSize, resetFilters } = useFiltersPR();
    const service = new VehicleTypeService();

    // FETCHING DATA

    //-----------------------------------------------------------------------------------------------------------------
    /**
     * @ES OBTIENE LA LISTA DE TIPOS DE VEHÍCULO
     * @EN GETS THE VEHICLE TYPE LIST
     */
    //-----------------------------------------------------------------------------------------------------------------
    const [data, loading, error, refetch] = useFetch(useCallback(async () => {
        const response = await service.listVehicleTypes(filters);
        return response.getResponseData() as VehicleTypesApiResponse;
    }, [filters, refreshSignal]));
    //-----------------------------------------------------------------------------------------------------------------

    // FUNCTIONS

    //-----------------------------------------------------------------------------------------------------------------
    /**
     * @ES ELIMINA UN TIPO DE VEHÍCULO
     * @EN DELETES A VEHICLE TYPE
     * 
     * @param id 
     */
    //-----------------------------------------------------------------------------------------------------------------
    const handleDelete = async (id: string) => {
        try {
            const response = await (await service.deleteVehicleType(id)).getResponseData();
            if (response.success) {
                refetch();
                toast.success(response.message || 'Tipo de vehículo eliminado correctamente');
            } else {
                handleErrors(response.message || 'Error al eliminar el tipo de vehículo');
            }
        } catch (error) {
            handleErrors(error);
        }
    };
    //-----------------------------------------------------------------------------------------------------------------

    //-----------------------------------------------------------------------------------------------------------------
    /**
     * @ES ELIMINA VARIOS TIPOS DE VEHÍCULO
     * @EN DELETES MULTIPLE VEHICLE TYPES
     * 
     * @param ids 
     */
    //-----------------------------------------------------------------------------------------------------------------
    const handleMultiDelete = async (ids: string[]) => {
        try {
            const response = await (await service.deleteMultiVehicleTypes(ids)).getResponseData();
            if (response.success) {
                refetch();
                toast.success(response.message || 'Tipos de vehículo eliminados correctamente');
            } else {
                handleErrors(response.message || 'Error al eliminar los tipos de vehículo');
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
    const orderedData = () => data?.vehicleType?.map((row: any) => {
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
                    id={'vehicle-types-table'}
                    columnOrder={columnOrder}
                    data={orderedData()}
                    isLoading={loading}
                    overrideColumns={[]}
                    columnsNotShown={['vehicleSubTypes']}
                    actions={[
                        {
                            label: 'View',
                            permissions: { group: 'vehicle_types', permission: 'get_vehicle_types' },
                            render: (row: any) => {
                                return (
                                    <Tooltip
                                        size="sm"
                                        content={'Ver tipo de vehículo'}
                                        placement="top"
                                        color="invert"
                                    >
                                         <Link
                                            to={`${menuRoutes.vehicleTypes.path}/${row.id}/profile/${menuRoutes.vehicleTypes.profile.info}`}>
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
                            permissions: { group: 'vehicle_types', permission: 'edit_vehicle_types' },
                            render: (row: any) => {
                                return (
                                    <Tooltip
                                        size="sm"
                                        content={'Gestionar subtipos'}
                                        placement="top"
                                        color="invert"
                                    >
                                        <ActionIcon
                                            as="span"
                                            size="sm"
                                            variant="outline"
                                            className="hover:!border-gray-900 hover:text-gray-700 bg-white"
                                            onClick={() => {
                                                setSelectedType(row);
                                                setShowSubtypesModal(true);
                                            }}
                                        >
                                            <AirportShuttle className="h-4 w-4" />
                                        </ActionIcon>
                                    </Tooltip>
                                );
                            },
                        },
                        {
                            label: 'Edit',
                            permissions: { group: 'vehicle_types', permission: 'edit_vehicle_types' },
                            render: (row: any) => {
                                return (
                                    <Tooltip
                                        size="sm"
                                        content={'Editar tipo de vehículo'}
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
                            permissions: { group: 'vehicle_types', permission: 'delete_vehicle_types' },
                            render: (row: any) => {
                                return (
                                    <Tooltip
                                        size="sm"
                                        content={'Eliminar tipo de vehículo'}
                                        placement="top"
                                        color="invert"
                                    >
                                        <div>
                                            <DeletePopover
                                                title={`Eliminar tipo de vehículo`}
                                                description={`¿Estás seguro de que deseas eliminar el tipo de vehículo ${row.name}?`}
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
                        pageCount: (data as VehicleApiResponse) ? data.lastPage : 1,
                        totalCount: data?.totalRegisters,
                        handlePagination: updatePage,
                        handlePerPage: updatePageSize,
                    }}
                    toggleFilters={() => setOpenFilters(!openFilters)}
                />
            )}

            <FilterDrawerView isOpen={openFilters} setOpenDrawer={setOpenFilters} drawerTitle={'Filtros Tipos de Vehículos'}>
                <VehicleTypesFilters filters={filters} updateFilters={updateFilters} resetFilters={resetFilters} />
            </FilterDrawerView>

            {showSubtypesModal && (
                <VehicleTypeSubtypesModal
                    data={selectedType}
                    isOpen={showSubtypesModal}
                    onClose={() => {
                        setShowSubtypesModal(false);
                        setSelectedType(null);
                    }}
                    onUpdated={() => {
                        refetch();
                    }}
                />
            )}

        </Page>
    );
};

export default VehicleTypesList;