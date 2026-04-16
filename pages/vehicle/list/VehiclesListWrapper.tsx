import { Fragment, useContext, useEffect } from "react";
import { useNavigate } from "react-router";
import { PrivilegeContext } from "../../../components/priviledge/PriviledgeProvider";
import { FiltersProvider } from "../../../components/providers/FiltersProvider";
import { menuRoutes } from "../../../router/menu";
import VehiclesList from "./VehiclesList";
import { useSetAtom } from "jotai";
import { headerActionAtom, headerConfigAtom } from "../../../atoms/headerAtoms";
import { ReactComponent as CardAddIcon } from '../../../assets/Iconos/Interfaz/nuevo_vehiculo.svg';
import { ReactComponent as CarListIcon } from '../../../assets/Iconos/Interfaz/gestion_flota.svg';


const VehiclesListWrapper = () => {

    // HOOKS

    const { userCan } = useContext(PrivilegeContext);
    const navigate = useNavigate();

    // ATOMS
            
    const setHeaderAction = useSetAtom(headerActionAtom);
    const setHeaderConfig = useSetAtom(headerConfigAtom);

    // USE EFFECT

    useEffect(() => {

        // CONFIGURE HEADER TITLE AND ICON

        setHeaderConfig({
            title: "GESTION DE FLOTA",
            icon: <CarListIcon className="app-sub-icon w-9 h-9" />,
            breadcrumbs: [
                { 
                    label: 'Inicio', 
                    path: '/' 
                },
                {
                    label: "Flota",
                    path: menuRoutes.vehicles.path,
                    active: true
                }
            ]
        });

        // CONFIGURE MAIN ACTION BUTTON

        if (userCan('create_vehicles', 'vehicles')) {
            setHeaderAction({
                show: userCan('create_vehicles', 'vehicles'),
                className: 'border-white w-[40px] h-[40px] p-0',
                label: <CardAddIcon className="app-sub-icon" />,
                onClick: () => navigate(menuRoutes.vehicles.create)
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
                <VehiclesList />
            </FiltersProvider>
        </Fragment>
    );
}

export default VehiclesListWrapper;