import { Fragment, useContext, useEffect } from "react";
import { PrivilegeContext } from "../../../components/priviledge/PriviledgeProvider";
import { FiltersProvider } from "../../../components/providers/FiltersProvider";
import { useState } from "react";
import VehicleTypesList from "./VehicleTypesList";
import VehicleTypeCreateModal from "../modals/VehicleTypeCreateModal";
import VehicleTypeEditModal from "../modals/VehicleTypeEditModal";
import { ReactComponent as VehicleTypesIcon } from '../../../assets/Iconos/menu/tipo_vehiculo.svg';
import { ReactComponent as VehicleTypeCreateIcon } from '../../../assets/Iconos/menu/nuevo_tipo_vehiculo.svg';
import { useSetAtom } from "jotai";
import { headerActionAtom, headerConfigAtom } from "../../../atoms/headerAtoms";

const VehicleTypesListWrapper = () => {

    // HOOKS

    const { userCan } = useContext(PrivilegeContext);

    // STATES

    const [openCreateModal, setOpenCreateModal] = useState(false);
    const [openEditModal, setOpenEditModal] = useState(false);
    const [selectedVehicleTypeId, setSelectedVehicleTypeId] = useState<string | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);

    // ATOMS
        
    const setHeaderAction = useSetAtom(headerActionAtom);
    const setHeaderConfig = useSetAtom(headerConfigAtom);

    // USE EFFECT

    useEffect(() => {

        // CONFIGURE HEADER TITLE AND ICON

        setHeaderConfig({
            title: "TIPOS DE VEHÍCULOS",
            icon: <VehicleTypesIcon className="app-sub-icon" />,
            breadcrumbs: [
                { 
                    label: 'Inicio', 
                    path: '/' 
                },
                {
                    label: "Vehículos",
                    path: undefined
                },
                {
                    label: "Tipos de Vehículos",
                    path: "/vehicle-types",
                    active: true
                }
            ]
        });

        // CONFIGURE MAIN ACTION BUTTON

        if (userCan('create_vehicle_types', 'vehicle_types')) {
            setHeaderAction({
                show: userCan('create_vehicle_types', 'vehicle_types'),
                className: 'border-white w-[40px] h-[40px] p-0',
                label: <VehicleTypeCreateIcon className="app-sub-icon" />,
                onClick: () => setOpenCreateModal(true)
            });
        }

        // CLEANUP EFFECT

        return () => {
            setHeaderAction(null);
            setHeaderConfig(null);
        };

    }, [userCan, setHeaderAction, setHeaderConfig]);

    // RENDER

    return (
        <Fragment>
            <FiltersProvider>
                <VehicleTypesList
                    refreshSignal={refreshKey}
                    onEdit={(id: string) => {
                        setSelectedVehicleTypeId(id);
                        setOpenEditModal(true);
                    }}
                />
            </FiltersProvider>

            <VehicleTypeCreateModal
                isOpen={openCreateModal}
                onClose={() => setOpenCreateModal(false)}
                onCreated={() => {
                    setRefreshKey(prev => prev + 1);
                }}
            />

            <VehicleTypeEditModal
                vehicleTypeId={selectedVehicleTypeId}
                isOpen={openEditModal}
                onClose={() => setOpenEditModal(false)}
                onUpdated={() => setRefreshKey(prev => prev + 1)}
            />
        </Fragment>
    );
}

export default VehicleTypesListWrapper;
