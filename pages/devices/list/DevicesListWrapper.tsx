import { useSetAtom } from "jotai";
import { Fragment, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { headerActionAtom, headerConfigAtom } from "../../../atoms/headerAtoms";
import { PrivilegeContext } from "../../../components/priviledge/PriviledgeProvider";
import { FiltersProvider } from "../../../components/providers/FiltersProvider";
import { menuRoutes } from "../../../router/menu";
import DevicesList from "./DevicesList";
import { ReactComponent as DevicesIcon } from '../../../assets/Iconos/Interfaz/listado_dispositivos.svg';
import { ReactComponent as DeviceCreateIcon } from '../../../assets/Iconos/Interfaz/nuevo_dispositivo.svg';

const DevicesListWrapper = () => {

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
            title: "DISPOSITIVOS",
            icon: <DevicesIcon className="app-sub-icon" />,
            breadcrumbs: [
                { label: 'Inicio', path: '/' },
                { label: 'Dispositivos', path: '/devices', active: true },
            ]
        });

        // CONFIGURE MAIN ACTION BUTTON

        if (userCan('create_devices', 'devices') && userCan('list_companies', 'companies')) {
            setHeaderAction({
                show: userCan('create_devices', 'devices'),
                className: 'border-white w-[40px] h-[40px] p-0',
                label: <DeviceCreateIcon className="app-sub-icon" />,
                onClick: () => navigate(menuRoutes.devices.create)
            });
        }

        // CLEANUP EFFECT

        return () => {
            setHeaderAction(null);
            setHeaderConfig(null);
        };

    }, [navigate, userCan, setHeaderAction, setHeaderConfig]);

    // RENDER

    return (
        <Fragment>
            <FiltersProvider>
                <DevicesList />
            </FiltersProvider>
        </Fragment>
    );
}

export default DevicesListWrapper;
