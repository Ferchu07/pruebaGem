import classNames from "classnames";
import { Fragment, useContext, useEffect } from "react";
import { useNavigate } from "react-router";
import { Button } from "rizzui";
import { PrivilegeContext } from "../../../components/priviledge/PriviledgeProvider";
import { FiltersProvider } from "../../../components/providers/FiltersProvider";
import PageHeader from "../../../layout/shared/page-header";
import { menuRoutes } from "../../../router/menu";
import OrganisationsList from "./OrganisationsList";
import { headerActionAtom, headerConfigAtom } from "../../../atoms/headerAtoms";
import { useSetAtom } from "jotai";
import { ReactComponent as OrganisationsIcon } from "../../../assets/Iconos/Interfaz/organizaciones.svg";
import { ReactComponent as OrganisationsCreateIcon } from "../../../assets/Iconos/Interfaz/nueva_organizacion.svg";

const OrganisationsListWrapper = () => {

    // HOOKS

    const { userCan } = useContext(PrivilegeContext);
    const navigate = useNavigate();

    // ATOMS

    const setHeaderConfig = useSetAtom(headerConfigAtom);
    const setHeaderAction = useSetAtom(headerActionAtom);

    // USE EFFECT

    useEffect(() => {

        // CONFIGURE HEADER TITLE AND ICON

        setHeaderConfig({
            title: "ORGANIZACIONES",
            icon: <OrganisationsIcon className="app-sub-icon" />,
            breadcrumbs: [
                { label: 'Inicio', path: '/' },
                { label: "Control de acceso", path: undefined },
                { label: 'Organizaciones', path: '/organisations', active: true },
            ]
        });

        // CONFIGURE MAIN ACTION BUTTON

        if (userCan('create_companies', 'companies')) {
            setHeaderAction({
                show: userCan('create_companies', 'companies'),
                className: 'border-white w-[40px] h-[40px] p-0',
                label: <OrganisationsCreateIcon className="app-sub-icon" />,
                onClick: () => navigate(menuRoutes.organisations.create)
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
                <OrganisationsList />
            </FiltersProvider>
        </Fragment>
    );
}

export default OrganisationsListWrapper;