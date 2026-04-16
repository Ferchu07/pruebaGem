import { Fragment, useContext, useEffect } from "react";
import { useNavigate } from "react-router";
import { PrivilegeContext } from "../../../components/priviledge/PriviledgeProvider";
import { FiltersProvider } from "../../../components/providers/FiltersProvider";
import { menuRoutes } from "../../../router/menu";
import UsersList from "./UsersList";
import { useSetAtom } from "jotai";
import { headerActionAtom, headerConfigAtom } from "../../../atoms/headerAtoms";
import { ReactComponent as NewUserIcon } from '../../../assets/Iconos/Interfaz/nuevo_usuario.svg';
import { ReactComponent as ListUsersIcon } from '../../../assets/Iconos/Interfaz/listado_usuarios.svg';

const UsersListWrapper = () => {

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
            title: "LISTADO DE USUARIOS",
            icon: <ListUsersIcon className="app-sub-icon w-9 h-9" />,
            breadcrumbs: [
                { 
                    label: 'Inicio', 
                    path: '/' 
                },
                {
                    label: "Control de acceso",
                    path: undefined
                },
                {
                    label: "Usuarios",
                    path: "/users",
                    active: true
                }
            ]
        });

        // CONFIGURE MAIN ACTION BUTTON

        if (userCan('create_users', 'user')) {
            setHeaderAction({
                show: userCan('create_users', 'user'),
                className: 'border-white w-[40px] h-[40px] p-0',
                label: <NewUserIcon className="app-sub-icon" />,
                onClick: () => navigate(`${menuRoutes.users.path}/${menuRoutes.users.create}`)
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
                <UsersList />
            </FiltersProvider>
        </Fragment>
    );
}

export default UsersListWrapper;