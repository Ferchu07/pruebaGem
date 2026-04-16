import { useSetAtom } from "jotai";
import { headerBottomAtom, headerConfigAtom } from "../../../atoms/headerAtoms";
import TabNav, { MenuItem } from "../../../components/navigation/TabNav";
import { baseMenuItems, superAdminExtraItems } from "../profile/UserProfileLayout";
import { useCallback, useEffect } from "react";
import { PiIdentificationCard } from "react-icons/pi";
import useFetch from "../../../hooks/useFetch";
import { UserApiResponse } from "../../../type/entities/user-type";
import { useParams } from "react-router-dom";
import { UserService } from "../../../services/user/userService";


export default function UserEditLayout({ children }: { children: React.ReactNode }) {

    // HOOKS 

    const { id = '' } = useParams<{ id: string }>();
    const service = new UserService();
     

    // STATES

    const menuItems: MenuItem[] = [...baseMenuItems, ...superAdminExtraItems];

    // ATOMS      
                    
    const setHeaderConfig = useSetAtom(headerConfigAtom);
    const setHeaderBottom = useSetAtom(headerBottomAtom);

    // FUNCTIONS

    // -----------------------------------------------------------------------------------
    /**
     * @ES OBTIENE UN USUARIO POR ID
     * @EN GETS A USER BY ID
     * 
     * @param id
     */
    // -----------------------------------------------------------------------------------
    const [data] = useFetch(useCallback(async () => {
        if (!id || id === '') return null;
        const response = await service.getUserById(id);
        return response.getResponseData() as UserApiResponse;
    }, [id]));
    // -----------------------------------------------------------------------------------

    // USE EFFECT 

    useEffect(() => {

        // IF DATA IS NULL, THEN RETURN

        if (data === null || data === undefined) return;

        // CONFIGURE HEADER TITLE AND ICON

        setHeaderConfig({
            title: `PERFIL DE ${data.name} ${data.lastName}`,
            icon: <PiIdentificationCard className="app-sub-icon" />,
            breadcrumbs: [
                { label: 'Inicio', path: '/' },
                { label: "Control de acceso", path: undefined },
                { label: `Usuarios`, path: '/users' },
                { label: `Editar`, path: `/users/${id}/edit`, active: true },
            ]
        });

        // CONFIGURE HEADER BOTTOM (TAB NAV)
        setHeaderBottom(
            <TabNav 
                menuItems={menuItems}
                variant="block" 
                className="!sticky-0 !top-0 !m-0 !p-0 shadow-none border-none"
            />
        );

        // CLEANUP EFFECT

        return () => {
            setHeaderConfig(null);
            setHeaderBottom(null);
        };

    }, [data]);

    // RENDER

    return (
        <>
            {children}
        </>
    )
};