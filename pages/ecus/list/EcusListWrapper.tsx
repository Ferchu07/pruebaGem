import { Fragment, useContext, useEffect } from "react";
import { useNavigate } from "react-router";
import { PrivilegeContext } from "../../../components/priviledge/PriviledgeProvider";
import { FiltersProvider } from "../../../components/providers/FiltersProvider";
import { menuRoutes } from "../../../router/menu";
import { useSetAtom } from "jotai";
import { headerActionAtom, headerConfigAtom } from "../../../atoms/headerAtoms";
import { ReactComponent as DevicesIcon } from '../../../assets/Iconos/Interfaz/listado_dispositivos.svg';
import EcusList from "./EcusList";
import { PiPlus } from "react-icons/pi";

const EcusListWrapper = () => {

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
            title: "LISTADO DE ECUS",
            icon: <DevicesIcon className="app-sub-icon w-9 h-9" />,
            breadcrumbs: [
                { 
                    label: 'Inicio', 
                    path: '/' 
                },
                {
                    label: "Dispositivos",
                    path: undefined
                },
                {
                    label: "Ecus",
                    path: "/ecus",
                    active: true
                }
            ]
        });

        // CONFIGURE MAIN ACTION BUTTON

        if (userCan('create_metrics', 'metrics')) {
            setHeaderAction({
                show: userCan('create_metrics', 'metrics'),
                className: 'border-white w-[40px] h-[40px] p-0',
                label: <PiPlus className="app-sub-icon w-7 h-7" />,
                onClick: () => navigate(`${menuRoutes.ecus.path}/${menuRoutes.ecus.create}`)
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
                <EcusList />
            </FiltersProvider>
        </Fragment>
    );
}

export default EcusListWrapper;
