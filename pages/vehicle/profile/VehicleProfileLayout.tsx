import { atom, useAtom, useSetAtom } from 'jotai';
import { isEqual } from 'lodash';
import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Outlet, useNavigate, useParams } from "react-router-dom";
import { cn, Switch, Tooltip } from 'rizzui';
import { toast } from 'sonner';
import DateField from '../../../components/forms/DateField';
import StatusDropdown from '../../../components/forms/StatusDropdown';
import { Loader } from '../../../components/loader/SpinnerLogo';
import TabNav, { MenuItem } from "../../../components/navigation/TabNav";
import { usePrivilege } from '../../../components/priviledge/PriviledgeProvider';
import { useFiltersPR } from '../../../components/providers/FiltersProvider';
import useFetch from '../../../hooks/useFetch';
import useHandleErrors from '../../../hooks/useHandleErrors';
import { RootState } from '../../../redux/store';
import { setReloadMetrics, setSelectedView } from '../../../redux/vehicleProfileSlice';
import { menuRoutes } from "../../../router/menu";
import { VehicleService } from '../../../services/vehicle/vehicleService';
import { VehicleApiResponse } from '../../../type/entities/vehicle-type';
import { VEHICLE_STATUSES } from '../VehicleForm';
import { headerActionAtom, headerConfigAtom, headerBottomAtom } from '../../../atoms/headerAtoms';
import { ReactComponent as EditarIcon } from '../../../assets/Iconos/Interfaz/editar.svg';
import { ReactComponent as DeleteIcon } from '../../../assets/Iconos/Interfaz/borrar.svg';
import { ReactComponent as VehicleIcon } from '../../../assets/Iconos/Interfaz/perfil_vehiculo.svg';
import Swal from 'sweetalert2';


const menuItems: MenuItem[] = [
    {
        label: 'Información',
        path: '/info',
        permission: {
            group: 'vehicles',
            action: 'get_vehicles',
        },
    },
    {
        label: 'Histórico de Dispositivos',
        path: '/device-history',
        permission: {
            group: 'vehicles',
            action: 'get_vehicles',
        },
    },
    {
        label: 'Visualización dinámica de datos',
        path: '/metrics',
        permission: {
            group: 'vehicles',
            action: 'get_vehicles',
        },
    },
    {
        label: 'Histórico de datos',
        path: '/data-history',
        permission: {
            group: 'vehicles',
            action: 'get_vehicles',
        },
    },
];

export const doRefetchAtom = atom(false);

export default function VehicleProfileLayout({ isLoading }: { isLoading?: boolean }) {

    // STATES

    const [changingStatus, setChangingStatus] = useState<string[]>([]);

    // HOOKS

    const { selectedView, reloadMetrics } = useSelector((state: RootState) => state.vehicleProfile);
    const { id = '' } = useParams<{ id: string }>();
    const { handleErrors } = useHandleErrors();
    const { userCan } = usePrivilege();
    const navigate = useNavigate();
    const service = new VehicleService();
    const { filters, updateFilters } = useFiltersPR();
    const [, setDoRefetch] = useAtom(doRefetchAtom);
    const dispatch = useDispatch();

    // ATOMS      
            
    const setHeaderConfig = useSetAtom(headerConfigAtom);
    const setHeaderAction = useSetAtom(headerActionAtom);
    const setHeaderBottom = useSetAtom(headerBottomAtom);

    // DATA FETCHING

    const [data, loading, error, refetch] = useFetch(useCallback(async () => {
        if (!id || id === '') return null;
        const response = await service.getVehicleById(id);
        return response.getResponseData() as VehicleApiResponse;
    }, [id]));

    // FUNCTIONS

    // -----------------------------------------------------------------------------------------------------------------
    /**
     * @ES ELIMINACIÓN DE UN VEHÍCULO
     * @EN VEHICLE DELETION HANDLER
     */
    // -----------------------------------------------------------------------------------------------------------------
    const handleDelete = async (id: string) => {
        try {
            Swal.fire({
                title: '¿Estás seguro de eliminar este vehículo?',
                text: 'No podrás revertir esto!',
                showCancelButton: true,
                confirmButtonColor: '#0021d9',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Sí, eliminar!',
                cancelButtonText: 'Cancelar'
            }).then(async (result) => {
                if (result.isConfirmed) {
                    const response = await (await service.deleteVehicle(id)).getResponseData();
                    if (response.success) {
                        refetch();
                        setDoRefetch(true);
                        toast.success('Se ha eliminado correctamente');
                    } else {
                        handleErrors(response);
                    }
                }
            })
        } catch (error) {
            handleErrors(error);
        }
    };
    // -----------------------------------------------------------------------------------------------------------------

    // -----------------------------------------------------------------------------------------------------------------
    /**
     * @ES MANEJO DEL CAMBIO DE ESTADO DE UN VEHÍCULO
     * @EN VEHICLE STATUS CHANGE HANDLER
     */
    // -----------------------------------------------------------------------------------------------------------------
    const handleStateChange = async (entityId: string, statusId: string) => {
        if (changingStatus.includes(entityId)) return;
        setChangingStatus((prev) => [...prev, entityId]);

        const response = await (await service.changeVehicleStatus(entityId, statusId)).getResponseData();
        if (response.success) {
            toast.success('Estado del vehículo actualizado correctamente');
            refetch();
            setDoRefetch(true);
        } else {
            handleErrors(response);
        }
        setChangingStatus((prev) => prev.filter((id) => id !== entityId));
    }
    // -----------------------------------------------------------------------------------------------------------------

    // USE EFFECTS

    useEffect(() => {
        navigate(`${menuRoutes.vehicles.path}/${id}/profile${selectedView}`);
    }, [selectedView]);

    useEffect(() => {

        // IF DATA IS NULL, THEN RETURN
        if (data === null || data === undefined) return;

        // CONFIGURE HEADER TITLE AND ICON

        setHeaderConfig({
            title: `PERFIL DEL VEHÍCULO ${data.plateNumber}`,
            icon: <VehicleIcon className="app-sub-icon w-9 h-9" />,
            breadcrumbs: [
                { label: 'Inicio', path: '/' },
                { label: 'Vehículos', path: '/vehicles' },
                { label: `Perfil de Vehículo`, path: `/vehicles/${id}/profile`, active: true },
            ]
        });

        // CONFIGURE MAIN ACTION BUTTON

        const actions: any[] = [];

        if (selectedView === '/data-history') {
            actions.push({
                show: true,
                custom: true,
                className: 'flex items-center gap-3',
                label: (
                    <div className="flex flex-row items-center gap-3">
                        <Tooltip
                            size="sm"
                            content={`${reloadMetrics ? 'Desactivar' : 'Activar'} la actualización automática de los datos`}
                            placement="top"
                            color="invert"
                        >
                            <div>
                                <Switch
                                    id={data?.id}
                                    checked={reloadMetrics}
                                    onChange={() => dispatch(setReloadMetrics(!reloadMetrics))}
                                    switchKnobClassName={cn({ 'bg-primary': reloadMetrics, 'bg-secondary': !reloadMetrics })}
                                />
                            </div>
                        </Tooltip>

                        <DateField
                            isClearable
                            className="w-[300px]"
                            inputClassName="bg-white"
                            placeholderText="Selecciona las fechas"
                            startDate={filters.filter_filters?.startDate ? new Date(filters.filter_filters.startDate) : null}
                            endDate={filters.filter_filters?.endDate ? new Date(filters.filter_filters.endDate) : null}
                            onChange={(date: any) => {
                                const filters_date = { startDate: filters.filter_filters?.startDate, endDate: filters.filter_filters?.endDate };
                                const new_date = date ? { startDate: date[0], endDate: date[1] } : null;
                                if (new_date && !isEqual(filters_date, new_date)) {
                                    updateFilters({ startDate: date[0], endDate: date[1] });
                                } else if (!new_date && filters_date) {
                                    updateFilters({ startDate: null, endDate: null });
                                }
                            }}
                        />
                        <div className='border-l border-gray-300 h-6 mx-2' />
                    </div>
                )
            });
        }

        if (userCan('edit_vehicles', 'vehicles') && data) {
            actions.push({
                show: true,
                custom: true,
                className: 'min-w-[120px]',
                label: (
                    <StatusDropdown
                        key={data?.status}
                        entityId={data?.id}
                        title="¿Estas seguro de cambiar el estado?"
                        inputClassName="h-[34px]"
                        statesOptions={VEHICLE_STATUSES}
                        currentState={VEHICLE_STATUSES.find((status) => status.value === data.status)}
                        hasComments={false}
                        handleStateChange={(entityId: string, statusId: string) =>
                            handleStateChange(entityId, statusId)
                        }
                    />
                )
            });
        }

        actions.push(
            {
                show: userCan('edit_vehicles', 'vehicles'),
                className: 'bg-white hover:bg-[#a1b8f7] w-[40px] h-[40px] p-0',
                label: <EditarIcon className="app-sub-icon filter-none" />,
                onClick: () => navigate(`${menuRoutes.vehicles.path}/${data?.id}/edit`),
            },
            {
                show: userCan('delete_vehicles', 'vehicles'),
                delete: true,
                className: 'bg-white hover:bg-[#a1b8f7]',
                label: <DeleteIcon className="app-sub-icon filter-none" />,
                onClick: () => handleDelete(data?.id || ''),
            }
        );

        setHeaderAction(actions);

        // CONFIGURE HEADER BOTTOM (TAB NAV)
        setHeaderBottom(
            <TabNav 
                menuItems={menuItems} 
                setSelectedView={setSelectedView} 
                variant="block" 
                className="!sticky-0 !top-0 !m-0 !p-0 shadow-none border-none"
            />
        );

        // CLEANUP EFFECT

        return () => {
            setHeaderConfig(null);
            setHeaderAction(null);
            setHeaderBottom(null);
        };

    }, [navigate, data, selectedView, reloadMetrics, filters, changingStatus]);

    // RENDER

    return (
        <>
            {isLoading ? <Loader height='60vh' /> : <Outlet />}
        </>
    );
}
