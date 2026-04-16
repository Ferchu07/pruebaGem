import { useCallback, useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { ActionIcon, Tooltip } from 'rizzui';
import { toast } from 'sonner';
import { ReactComponent as VehicleTypeIcon } from '../../../assets/Iconos/Interfaz/administracion_vehiculos.svg';
import { ReactComponent as AsignarDispositivoIcon } from '../../../assets/Iconos/Interfaz/asignar_dispositivo.svg';
import { ReactComponent as CarIcon } from '../../../assets/Iconos/Interfaz/coche.svg';
import { ReactComponent as DesasignarDispositivoIcon } from '../../../assets/Iconos/Interfaz/desasignar_dispositivo.svg';
import { ReactComponent as DeviceIcon } from '../../../assets/Iconos/Interfaz/dispositivo_inalambrico.svg';
import { ReactComponent as EditarIcon } from '../../../assets/Iconos/Interfaz/editar.svg';
import { ReactComponent as VerIcon } from '../../../assets/Iconos/Interfaz/ver.svg';
import DeletePopover from '../../../components/buttons/DeletePopover';
import StatusDropdown from '../../../components/forms/StatusDropdown';
import { PrivilegeContext } from '../../../components/priviledge/PriviledgeProvider';
import { useFiltersPR } from '../../../components/providers/FiltersProvider';
import CustomTable from '../../../components/table/CustomTable';
import { FilterDrawerView } from '../../../components/table/components/TableFilter';
import useDevices from '../../../hooks/api-calls/useDevices';
import useFetch from '../../../hooks/useFetch';
import useHandleErrors from '../../../hooks/useHandleErrors';
import Page from '../../../layout/Page/Page';
import { menuRoutes } from '../../../router/menu';
import { VehicleService } from '../../../services/vehicle/vehicleService';
import { DevicesApiResponse } from '../../../type/entities/device-type';
import { VEHICLE_STATUSES } from '../VehicleForm';
import AssignToDeviceModal from '../edit/AssignToDeviceModal';
import VehiclesFilters from './VehiclesFilters';
import VehicleIconSelector from '../../../components/icon/VehicleIconSelector';

const columnOrder = [
    'id',
    'plateNumber',
    'vehicleType',
    'vehicleSubtype',
    'brand',
    'model',
    'vehicleDevices',
    'status',
    'fabricationYear',
    'chassisNumber',
    'createdAt',
    // 'updatedAt',
    'company',
];

const VehiclesList = () => {

    // STATES

    const [changingStatus, setChangingStatus] = useState<string[]>([]);
    const [openFilters, setOpenFilters] = useState<boolean>(false);
    const [openAsignModal, setOpenAsignModal] = useState<boolean>(false);
    const [vehicleId, setVehicleId] = useState<string | null | undefined>(null);

    // HOOKS

    const { handleErrors } = useHandleErrors();
    const { userCan } = useContext(PrivilegeContext);
    const { filters, updateFilters, updateFilterOrder, updatePage, updatePageSize, resetFilters } = useFiltersPR();
    const { fetchDevices, getDevicesList } = useDevices();
    const service = new VehicleService();

    // FETCHING DATA

    //-----------------------------------------------------------------------------------------------------------------
    /**
     * @ES OBTIENE LA LISTA DE VEHÍCULOS
     * @EN GETS THE VEHICLE LIST
     */
    //-----------------------------------------------------------------------------------------------------------------
    const [data, loading, error, refetch] = useFetch(useCallback(async () => {
        const response = await service.listVehicles(filters);
        return response.getResponseData() as DevicesApiResponse;
    }, [filters]));
    //-----------------------------------------------------------------------------------------------------------------

    // FUNCTIONS

    //-----------------------------------------------------------------------------------------------------------------
    /**
     * @ES MANEJO DEL CAMBIO DE ESTADO DE UN VEHÍCULO
     * @EN HANDLER FOR VEHICLE STATUS CHANGE
     */
    //-----------------------------------------------------------------------------------------------------------------
    const handleStateChange = async (entityId: string, statusId: string) => {
        if (changingStatus.includes(entityId)) return;
        setChangingStatus((prev) => [...prev, entityId]);

        const response = await (await service.changeVehicleStatus(entityId, statusId)).getResponseData();
        if (response.success) {
            toast.success('Estado del vehículo actualizado correctamente');
            refetch();
        } else {
            handleErrors(response);
        }
        setChangingStatus((prev) => prev.filter((id) => id !== entityId));
    };
    //-----------------------------------------------------------------------------------------------------------------

    //-----------------------------------------------------------------------------------------------------------------
    /**
     * @ES ELIMINA UN VEHÍCULO
     * @EN DELETES A VEHICLE
     * 
     * @param id 
     */
    //-----------------------------------------------------------------------------------------------------------------
    const handleDelete = async (id: string) => {
        try {
            const response = await (await service.deleteVehicle(id)).getResponseData();
            if (response.success) {
                refetch();
                toast.success(response.message || 'Vehículo eliminado correctamente');
            } else {
                handleErrors(response);
            }
        } catch (error) {
            handleErrors(error);
        }
    };
    //-----------------------------------------------------------------------------------------------------------------

    //-----------------------------------------------------------------------------------------------------------------
    /**
     * @ES ELIMINA VARIOS VEHÍCULOS
     * @EN DELETES MULTIPLE VEHICLES
     * 
     * @param ids 
     */
    //-----------------------------------------------------------------------------------------------------------------
    const handleMultiDelete = async (ids: string[]) => {
        try {
            const response = await (await service.deleteMultiVehicles(ids)).getResponseData();
            if (response.success) {
                refetch();
                toast.success(response.message || 'Vehículos eliminados correctamente');
            } else {
                handleErrors(response);
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
    const orderedData = () => data?.vehicle.map((row: any) => {
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
                    id={'devices-table'}
                    columnOrder={columnOrder}
                    data={orderedData()}
                    disabledIds={data?.vehicle.filter((row: any) => row.status === 3).map((row: any) => row.id)}
                    isLoading={loading}
                    columnsNotShown={['model', 'brand', userCan('list_companies', 'companies') ? '' : 'id', userCan('list_companies', 'companies') ? '' : 'company']}
                    overrideColumns={[
                        {
                            key: 'plateNumber',
                            columnNameKey: 'Vehículo',
                            render: (row: any) => {
                                return (
                                    <div className='flex items-center justify-start '>
                                        <div className='me-2'>
                                             <VehicleIconSelector category={null} subcategory={row.row.original.model?.vehicleSubtype?.name} className='w-6 h-6 me-2' />
                                        </div>
                                        <div className="flex flex-col">
                                            <div className="text-sm font-bold text-black">
                                                {row.row.original.plateNumber}
                                            </div>
                                            <div className="text-sm text-black">
                                                {row.row.original.brand?.name} {row.row.original.model?.name || '-'}
                                            </div>
                                        </div>
                                    </div>
                                )
                            }
                        },
                        {
                            key: 'vehicleType',
                            columnNameKey: 'Tipo',
                            render: (row: any) => {
                                return (
                                    <div className='flex items-center justify-start '>
                                        <div className="flex flex-col">
                                            {row.row.original.model?.vehicleType?.name ? (
                                                <div className="text-sm text-black">
                                                    <VehicleIconSelector category={row.row.original.model?.vehicleType?.name} subcategory={null} className='w-6 h-6 me-2' />
                                                    {row.row.original.model?.vehicleType?.name}
                                                </div>
                                                ) : (
                                                <div className="text-sm text-black">
                                                    -
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )
                            }
                        },
                        {
                            key: 'vehicleSubtype',
                            columnNameKey: 'Subtipo',
                            render: (row: any) => {
                                return (
                                    <div className='flex items-center justify-start '>
                                        <div className="flex flex-col">
                                            {row.row.original.model?.vehicleSubtype?.name ? (
                                                <div className="text-sm text-black">
                                                    <VehicleIconSelector category={null} subcategory={row.row.original.model?.vehicleSubtype?.name} className='w-6 h-6 me-2' />
                                                    {row.row.original.model?.vehicleSubtype?.name}
                                                </div>
                                                ) : (
                                                <div className="text-sm text-black">
                                                    -
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )
                            }
                        },
                        {
                            key: 'vehicleDevices',
                            columnNameKey: 'Dispositivo',
                            render: (row: any) => {
                                let vehicleDevices = row.row.original.vehicleDevices || [];
                                let device = vehicleDevices && vehicleDevices[0] ? vehicleDevices[0].device : null;
                                if (vehicleDevices.length === 0) return ('-');
                                return (
                                    <div className='flex items-center justify-start '>
                                        <div className='me-2'>
                                            <DeviceIcon className='w-5 h-5 text-primary' />
                                        </div>
                                        <div className="flex flex-col">
                                            <div className="text-sm font-bold text-black">
                                                {device.model}
                                            </div>
                                            <div className="text-sm text-black">
                                                {device.serialNumber || '-'}
                                            </div>
                                        </div>
                                    </div>
                                )
                            }
                        },
                        {
                            key: 'fabricationYear',
                            columnNameKey: 'Año de fabricación',
                            render: (row: any) => {
                                return (
                                    <div className='flex flex-col gap-2 justify-content-start' key={row.row.original.id + row.row.original.createdAt}>
                                        <div className="text-sm text-black">
                                            {row.row.original.fabricationYear ?? '-'}
                                        </div>
                                    </div>
                                )
                            }
                        },
                        {
                            key: 'status',
                            render: (row: any) => {
                                const status = VEHICLE_STATUSES.find((status) => status.value === row.row.original.status);
                                return (
                                    <div className='flex flex-col gap-2 justify-content-center text-center' key={row.row.original.id + status?.id}>
                                        <StatusDropdown
                                            entityId={row.row.original?.id}
                                            fullWidth={true}
                                            title="¿Estas seguro de cambiar el estado?"
                                            statesOptions={VEHICLE_STATUSES}
                                            currentState={status}
                                            hasComments={false}
                                            handleStateChange={(entityId: string, statusId: string) => handleStateChange(entityId, statusId)}
                                        />
                                    </div>
                                );
                            },
                        },
                        {
                            key: 'company',
                            columnNameKey: 'Empresa',
                            render: (row: any) => {
                                return (
                                    <div className='flex flex-col gap-2 justify-content-start' key={row.row.original.id + 'company'}>
                                        <div className="text-sm text-black">
                                            {row.row.original.company?.name || ''}
                                        </div>
                                    </div>
                                )
                            }
                        },

                    ]}
                    actions={[
                        {
                            label: 'Asignar Dispositivo',
                            hide: (row: any) => row.vehicleDevices?.some((vehicleDevice: any) => vehicleDevice.isActive),
                            permissions: { group: 'vehicles', permission: 'edit_vehicles' },
                            render: (row: any) => {
                                if (row.status == 3) return;
                                return (
                                    <Tooltip
                                        size="sm"
                                        content={'Asignar Dispositivo'}
                                        placement="top"
                                        color="invert"
                                    >
                                        <ActionIcon
                                            as="span"
                                            size="sm"
                                            variant="outline"
                                            className="hover:!border-gray-900 hover:text-gray-700 cursor-pointer bg-white"
                                            onClick={() => {
                                                setOpenAsignModal(true)
                                                setVehicleId(row.id)
                                            }}
                                        >
                                            <AsignarDispositivoIcon className="h-4 w-4" />
                                        </ActionIcon>
                                    </Tooltip>
                                );
                            },
                        },
                        {
                            label: 'Desasignar Dispositivo',
                            hide: (row: any) => row.vehicleDevices.length === 0 || row.vehicleDevices?.every((vehicleDevice: any) => vehicleDevice.isActive == false),
                            permissions: { group: 'vehicles', permission: 'edit_vehicles' },
                            render: (row: any) => {
                                if (row.status == 3) return;
                                return (
                                    <Tooltip
                                        size="sm"
                                        content={'Desasignar Dispositivo'}
                                        placement="top"
                                        color="invert"
                                    >
                                        <ActionIcon
                                            as="span"
                                            size="sm"
                                            variant="outline"
                                            className="hover:!border-gray-900 hover:text-gray-700 cursor-pointer bg-white"
                                            onClick={async () => {
                                                try {
                                                    let response = await (await service.unassignVehicleFromDevice(row.id)).getResponseData();
                                                    if (response && response.success) {
                                                        toast.success(`Dispositivo desasignado correctamente.`);
                                                        fetchDevices(); // Refresh devices list
                                                        getDevicesList(); // Refresh devices list
                                                        refetch();
                                                    } else {
                                                        handleErrors(response);
                                                    }
                                                } catch (error) {
                                                    console.error('Error al desasignar el dispositivo:', error);
                                                }
                                            }}
                                        >
                                            <DesasignarDispositivoIcon className="h-4 w-4" style={{ fill: 'red' }} />
                                        </ActionIcon>
                                    </Tooltip>
                                );
                            },
                        },
                        {
                            label: 'View',
                            permissions: { group: 'vehicles', permission: 'get_vehicles' },
                            render: (row: any) => {
                                return (
                                    <Tooltip
                                        size="sm"
                                        content={'Ver perfil'}
                                        placement="top"
                                        color="invert"
                                    >
                                        <Link
                                            to={`${menuRoutes.vehicles.path}/${row.id}/profile/${menuRoutes.vehicles.profile.info}`}>
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
                            permissions: { group: 'vehicles', permission: 'edit_vehicles' },
                            render: (row: any) => {
                                return (
                                    <Tooltip
                                        size="sm"
                                        content={'Editar vehículo'}
                                        placement="top"
                                        color="invert"
                                    >
                                        <Link to={`${menuRoutes.vehicles.path}/${row.id}/edit`}>
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
                            permissions: { group: 'vehicles', permission: 'delete_vehicles' },
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
                                                title={`Eliminar vehículo`}
                                                description={`¿Estás seguro de que deseas eliminar ${row.plateNumber}?`}
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
                        pageCount: (data as DevicesApiResponse) ? data.lastPage : 1,
                        totalCount: data?.totalRegisters,
                        handlePagination: updatePage,
                        handlePerPage: updatePageSize,
                    }}
                    toggleFilters={() => setOpenFilters(!openFilters)}
                />
            )}

            <FilterDrawerView isOpen={openFilters} setOpenDrawer={setOpenFilters} drawerTitle={'Filtros Vehiculos'}>
                <VehiclesFilters filters={filters} updateFilters={updateFilters} resetFilters={resetFilters} />
            </FilterDrawerView>

            <AssignToDeviceModal
                isOpen={openAsignModal}
                onClose={() => {
                    setOpenAsignModal(false)
                    setVehicleId(null)
                }}
                vehicleId={vehicleId}
                refetchData={refetch}
            />
        </Page>
    );
};

export default VehiclesList;