import moment from 'moment';
import { useCallback, useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { ActionIcon, Tooltip } from 'rizzui';
import { toast } from 'sonner';
import { ReactComponent as AsignarEmpresaIcon } from '../../../assets/Iconos/Interfaz/asignar_empresa.svg';
import { ReactComponent as DesasignarEmpresaIcon } from '../../../assets/Iconos/Interfaz/desasignar_empresa.svg';
import { ReactComponent as DeviceIcon } from '../../../assets/Iconos/Interfaz/dispositivo_inalambrico.svg';
import { ReactComponent as EditarIcon } from '../../../assets/Iconos/Interfaz/editar.svg';
import { ReactComponent as VerIcon } from '../../../assets/Iconos/Interfaz/ver.svg';
import DeletePopover from '../../../components/buttons/DeletePopover';
import StatusDropdown from '../../../components/forms/StatusDropdown';
import { PrivilegeContext } from '../../../components/priviledge/PriviledgeProvider';
import { useFiltersPR } from '../../../components/providers/FiltersProvider';
import CustomTable from '../../../components/table/CustomTable';
import { FilterDrawerView } from '../../../components/table/components/TableFilter';
import useFetch from '../../../hooks/useFetch';
import useHandleErrors from '../../../hooks/useHandleErrors';
import Page from '../../../layout/Page/Page';
import { menuRoutes } from '../../../router/menu';
import { DeviceService } from "../../../services/device/deviceService";
import { DevicesApiResponse } from '../../../type/entities/device-type';
import { DEVICE_STATUSES } from '../DeviceForm';
import AssignToCompanyButtonMultiple from '../edit/AssignToCompanyButtonMultiple';
import AssignToCompanyModal from '../edit/AssignToCompanyModal';
import DevicesFilters from './DevicesFilters';

const columnOrder = [
    'id',
    'firmwareVersion',
    'serialNumber',
    'model',
    'status',
    'deviceVehicles',
    //'battery',
    //'signal',
    'orionId',
    //'quantumLeapId',
    //'lastSync',
    'createdAt',
    'updatedAt',
    'deviceCompanies'
];

const DevicesList = () => {

    // STATES

    const [changingStatus, setChangingStatus] = useState<string[]>([]);
    const [openAsignModal, setOpenAsignModal] = useState<boolean>(false);
    const [deviceIds, setDeviceIds] = useState<string[]>([]);
    const [openFilters, setOpenFilters] = useState<boolean>(false);

    // HOOKS

    const { handleErrors } = useHandleErrors();
    const { userCan } = useContext(PrivilegeContext);
    const { filters, updateFilters, updateFilterOrder, updatePage, updatePageSize, resetFilters } = useFiltersPR();
    const service = new DeviceService();
    const canViewId = userCan('list_companies', 'companies') ? '' : 'orionId';

    // FETCHING DATA

    //-----------------------------------------------------------------------------------------------------------------
    /**
     * @ES OBTIENE LA LISTA DE DISPOSITIVOS
     * @EN GETS THE DEVICE LIST
     */
    //-----------------------------------------------------------------------------------------------------------------
    const [data, loading, error, refetch] = useFetch(useCallback(async () => {
        const response = await service.listDevices(filters);
        return response.getResponseData() as DevicesApiResponse;
    }, [filters]));
    //-----------------------------------------------------------------------------------------------------------------

    // FUNCTIONS

    //-----------------------------------------------------------------------------------------------------------------
    /**
     * @ES MANEJO DEL CAMBIO DE ESTADO DE UN DISPOSITIVO
     * @EN HANDLER FOR DEVICE STATUS CHANGE
     */
    //-----------------------------------------------------------------------------------------------------------------
    const handleStateChange = async (entityId: string, statusId: string) => {
        if (changingStatus.includes(entityId)) return;
        setChangingStatus((prev) => [...prev, entityId]);

        const response = await (await service.changeDeviceStatus(entityId, statusId)).getResponseData();
        if (response.success) {
            toast.success('Estado del dispositivo actualizado correctamente');
            refetch();
        } else {
            handleErrors(response);
        }
        setChangingStatus((prev) => prev.filter((id) => id !== entityId));
    };
    //-----------------------------------------------------------------------------------------------------------------

    //-----------------------------------------------------------------------------------------------------------------
    /**
     * @ES ELIMINA UN DISPOSITIVO
     * @EN DELETES A DEVICE
     * 
     * @param id 
     */
    //-----------------------------------------------------------------------------------------------------------------
    const handleDelete = async (id: string) => {
        try {
            const response = await (await service.deleteDevice(id)).getResponseData();
            if (response.success) {
                refetch();
                toast.success(response.message || 'Dispositivo eliminado correctamente');
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
     * @ES ELIMINA VARIOS DISPOSITIVOS
     * @EN DELETES MULTIPLE DEVICES
     * 
     * @param ids 
     */
    //-----------------------------------------------------------------------------------------------------------------
    const handleMultiDelete = async (ids: string[]) => {
        try {
            const response = await (await service.deleteMultiDevices(ids)).getResponseData();
            if (response.success) {
                refetch();
                toast.success(response.message || 'Dispositivos eliminados correctamente');
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
    const orderedData = () => data?.device.map((row: any) => {
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
                    disabledIds={data?.device.filter((row: any) => row.status === 3).map((row: any) => row.id)}
                    isLoading={loading}
                    variant="rother"
                    columnsNotShown={['createdAt', 'updatedAt', 'model', 'serialNumber', canViewId]}
                    overrideColumns={[
                        {
                            key: 'firmwareVersion',
                            columnNameKey: 'Dispositivo',
                            render: (row: any) => {
                                return (
                                    <div className='flex items-center justify-start '>
                                        <div className='me-2'>
                                            <DeviceIcon className='w-5 h-5 text-primary' />
                                        </div>
                                        <div className="flex flex-col">
                                            <div className="text-sm font-bold text-black">
                                                {row.row.original.firmwareVersion}
                                            </div>
                                            <div className="text-sm text-black">
                                                {row.row.original.model} {row.row.original.serialNumber || '-'}
                                            </div>
                                        </div>
                                    </div>
                                )
                            }
                        },
                        {
                            key: 'status',
                            render: (row: any) => {
                                const status = DEVICE_STATUSES.find((status) => status.value === row.row.original.status);
                                return (
                                    <div className='flex flex-col gap-2 text-center' key={row.row.original.id + status?.id}>
                                        <StatusDropdown
                                            fullWidth={true}
                                            entityId={row.row.original?.id}
                                            title="¿Estas seguro de cambiar el estado?"
                                            statesOptions={DEVICE_STATUSES}
                                            currentState={status}
                                            hasComments={false}
                                            handleStateChange={(entityId: string, statusId: string) =>
                                                handleStateChange(entityId, statusId)
                                            }
                                        />
                                    </div>
                                );
                            },
                        },
                        {
                            key: 'deviceVehicles',
                            columnNameKey: 'Vehículos',
                            render: (row: any) => {
                                return (
                                    <div className="text-sm font-medium text-gray-900">
                                        {row.row.original.deviceVehicles
                                            ? (
                                                row.row.original.deviceVehicles.map((vehicle: any) => (
                                                    <div className="flex flex-col">
                                                        <div className="text-sm font-bold text-black">
                                                            {vehicle.vehicle.plateNumber}
                                                        </div>
                                                        <div className="text-sm text-black">
                                                            {vehicle.vehicle.brand} {vehicle.vehicle.model || '-'}
                                                        </div>
                                                    </div>
                                                ))
                                            )
                                            : 'No asignado'
                                        }
                                    </div>
                                )
                            }
                        },
                        {
                            key: 'deviceCompanies',
                            columnNameKey: 'Empresa',
                            permissions: [
                                { group: 'companies', permission: 'list_companies' }
                            ],
                            render: (row: any) => {
                                return (
                                    <span>
                                        {row.row.original.deviceCompanies ? row.row.original.deviceCompanies[0]?.company?.name : 'No asignado'}
                                    </span>
                                );
                            },
                        },
                        {
                            key: 'lastSync',
                            render: (row: any) => {
                                return (
                                    <div className="text-sm font-medium text-gray-900">
                                        {row.row.original.lastSync ? moment(row.row.original.lastSync.date).format('DD/MM/YYYY HH:mm') : 'No se ha conectado'}
                                    </div>
                                )
                            }
                        },
                    ]}
                    actions={[
                        {
                            label: 'Asign to Company',
                            hide: (row: any) => row.deviceCompanies?.length > 0,
                            permissions: { group: 'companies', permission: 'list_companies' },
                            render: (row: any) => {
                                if (row.status == 3) return;
                                return (
                                    <Tooltip
                                        size="sm"
                                        content={'Asignar a empresa'}
                                        placement="top"
                                        color="invert"
                                    >
                                        <ActionIcon
                                            as="span"
                                            size="sm"
                                            variant="solid"
                                            className="hover:!border-gray-900 hover:text-gray-700 cursor-pointer bg-white"
                                            onClick={() => {
                                                setOpenAsignModal(true)
                                                setDeviceIds([row.id])
                                            }}
                                        >
                                            <AsignarEmpresaIcon className="h-4 w-4" />
                                        </ActionIcon>
                                    </Tooltip>
                                );
                            },
                        },
                        {
                            label: 'Desasignar Empresa',
                            hide: (row: any) => row.deviceCompanies?.length === 0,
                            permissions: { group: 'companies', permission: 'list_companies' },
                            render: (row: any) => {
                                return (
                                    <Tooltip
                                        size="sm"
                                        content={'Desasignar Empresa'}
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
                                                    let response = await (await service.unassignCompany([row.id])).getResponseData();
                                                    if (response && response.success) {
                                                        toast.success(`Empresa desasignada correctamente.`);
                                                        refetch();
                                                    } else {
                                                        handleErrors(response);
                                                    }
                                                } catch (error) {
                                                    console.error('Error al desasignar la empresa:', error);
                                                }
                                            }}
                                        >
                                            <DesasignarEmpresaIcon className="h-4 w-4" style={{ fill: 'red' }} />
                                        </ActionIcon>
                                    </Tooltip>
                                );
                            },
                        },
                        {
                            label: 'View',
                            permissions: { group: 'devices', permission: 'get_devices' },
                            render: (row: any) => {
                                return (
                                    <Tooltip
                                        size="sm"
                                        content={'Ver perfil'}
                                        placement="top"
                                        color="invert"
                                    >
                                        <Link
                                            to={`${menuRoutes.devices.path}/${row.id}/profile`}>
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
                            permissions: { group: 'companies', permission: 'list_companies' },
                            render: (row: any) => {
                                return (
                                    <Tooltip
                                        size="sm"
                                        content={'Editar dispositivo'}
                                        placement="top"
                                        color="invert"
                                    >
                                        <Link to={`${menuRoutes.devices.path}/${row.id}/edit`}>
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
                            permissions: { group: 'companies', permission: 'list_companies' },
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
                                                title={`Eliminar dispositivo`}
                                                actionIconClassName='bg-white'
                                                description={`¿Estás seguro de que deseas eliminar a ${row.model} ${row.serialNumber}?`}
                                                onDelete={() => handleDelete(row.id)}
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
                    search={true}
                    toggleFilters={() => setOpenFilters(!openFilters)}
                >
                    <AssignToCompanyButtonMultiple setDeviceIds={setDeviceIds} setOpenModal={setOpenAsignModal} refetch={refetch} />
                </CustomTable>
            )}

            <AssignToCompanyModal
                isOpen={openAsignModal}
                onClose={() => {
                    setOpenAsignModal(false)
                    setDeviceIds([])
                }}
                deviceIds={deviceIds}
                refetchData={refetch}
            />

            <FilterDrawerView isOpen={openFilters} setOpenDrawer={setOpenFilters} drawerTitle={'Filtros Dispositivos'}>
                <DevicesFilters filters={filters} updateFilters={updateFilters} resetFilters={resetFilters} />
            </FilterDrawerView>
        </Page>
    );
};

export default DevicesList;