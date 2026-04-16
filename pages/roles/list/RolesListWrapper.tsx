import { Fragment, useContext, useEffect } from "react";
import { useNavigate } from "react-router";
import { PrivilegeContext } from "../../../components/priviledge/PriviledgeProvider";
import { FiltersProvider } from "../../../components/providers/FiltersProvider";
import { menuRoutes } from "../../../router/menu";
import RolesList from "./RolesList";
import { useSetAtom } from "jotai";
import { headerActionAtom, headerConfigAtom } from "../../../atoms/headerAtoms";
import { ReactComponent as RolesIcon } from "../../../assets/Iconos/Interfaz/roles.svg";
import { ReactComponent as RoleCreateIcon } from "../../../assets/Iconos/Interfaz/nuevo_rol.svg";

const RolesListWrapper = () => {

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
            title: "ROLES",
            icon: <RolesIcon className="app-sub-icon" />,
            breadcrumbs: [
                { label: 'Inicio', path: '/' },
                { label: "Control de acceso", path: undefined },
                { label: 'Roles', path: '/roles', active: true },
            ]
        });

        // CONFIGURE MAIN ACTION BUTTON

        if (userCan('create_roles', 'roles')) { 
            setHeaderAction({
                show: userCan('create_roles', 'roles'),
                className: 'border-white w-[40px] h-[40px] p-0',
                label: <RoleCreateIcon className="app-sub-icon" />,
                onClick: () => navigate(menuRoutes.roles.create) 
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
                <RolesList />
            </FiltersProvider>
        </Fragment>
    );
}

export default RolesListWrapper;