import { Fragment, useContext, useEffect } from "react";
import { PrivilegeContext } from "../../../components/priviledge/PriviledgeProvider";
import { FiltersProvider } from "../../../components/providers/FiltersProvider";
import { useState } from "react";
import VehicleSubTypesList from "./VehicleSubTypesList";
import VehicleSubTypeCreateModal from "../modals/VehicleSubTypeCreateModal";
import VehicleSubTypeEditModal from "../modals/VehicleSubTypeEditModal";
import { useSetAtom } from "jotai";
import { headerActionAtom, headerConfigAtom } from "../../../atoms/headerAtoms";
import { PiPlusLight, PiTruck } from "react-icons/pi";

const VehicleSubTypesListWrapper = () => {

    // HOOKS

    const { userCan } = useContext(PrivilegeContext);
    const [openCreateModal, setOpenCreateModal] = useState(false);
    const [openEditModal, setOpenEditModal] = useState(false);
    const [selectedVehicleSubTypeId, setSelectedVehicleSubTypeId] = useState<string | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);

    // ATOMS
        
    const setHeaderAction = useSetAtom(headerActionAtom);
    const setHeaderConfig = useSetAtom(headerConfigAtom);

    // USE EFFECT

    useEffect(() => {

        // CONFIGURE HEADER TITLE AND ICON

        setHeaderConfig({
            title: "SUBTIPOS DE VEHÍCULOS",
            icon: <PiTruck className="app-sub-icon" />,
            breadcrumbs: [
                { label: 'Inicio', path: '/' },
                { label: 'Vehículos', path: undefined },
                {
                    label: "Subtipos de Vehículos",
                    path: "/vehicle-subtypes",
                    active: true
                }
            ]
        });

        // CONFIGURE MAIN ACTION BUTTON

        if (userCan('create_vehicle_subtypes', 'vehicle_subtypes')) {
            setHeaderAction({
                show: userCan('create_vehicle_subtypes', 'vehicle_subtypes'),
                className: 'border-white w-[40px] h-[40px] p-0',
                label: <PiPlusLight className="app-sub-icon" />,
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
                <VehicleSubTypesList
                    refreshSignal={refreshKey}
                    onEdit={(id: string) => {
                        setSelectedVehicleSubTypeId(id);
                        setOpenEditModal(true);
                    }}
                />
            </FiltersProvider>

            <VehicleSubTypeCreateModal
                isOpen={openCreateModal}
                onClose={() => setOpenCreateModal(false)}
                onCreated={() => {
                    setRefreshKey(prev => prev + 1);
                }}
            />

            <VehicleSubTypeEditModal
                vehicleSubTypeId={selectedVehicleSubTypeId}
                isOpen={openEditModal}
                onClose={() => setOpenEditModal(false)}
                onUpdated={() => setRefreshKey(prev => prev + 1)}
            />
        </Fragment>
    );
}

export default VehicleSubTypesListWrapper;
