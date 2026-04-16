import React, { useCallback, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from "react-router-dom";
import { toast } from 'sonner';
import { Loader } from '../../../components/loader/SpinnerLogo';
import TabNav, { MenuItem } from "../../../components/navigation/TabNav";
import { usePrivilege } from '../../../components/priviledge/PriviledgeProvider';
import useFetch from '../../../hooks/useFetch';
import useHandleErrors from '../../../hooks/useHandleErrors';
import { RootState } from '../../../redux/store';
import { setSelectedView } from '../../../redux/userProfileSlice';
import { menuRoutes } from "../../../router/menu";
import { UserService } from '../../../services/user/userService';
import { UserApiResponse } from '../../../type/entities/user-type';
import { useSetAtom } from 'jotai';
import { headerActionAtom, headerBottomAtom, headerConfigAtom } from '../../../atoms/headerAtoms';
import { ReactComponent as EditarIcon } from '../../../assets/Iconos/Interfaz/editar.svg';
import { ReactComponent as DeleteIcon } from '../../../assets/Iconos/Interfaz/borrar.svg';
import { PiIdentificationCard } from 'react-icons/pi';
import Swal from 'sweetalert2';


export const baseMenuItems: MenuItem[] = [
    {
        label: 'Información',
        path: '/info',
        permission: {
            group: 'user',
            action: 'get_users',
        },
    },
];

export const superAdminExtraItems: MenuItem[] = [
    {
        label: 'Permisos',
        path: '/permissions',
        permission: {
            group: 'user',
            action: 'get_users',
        },
    },
];

export default function UserProfileLayout({ children, isLoading }: { children: React.ReactNode, isLoading?: boolean }) {

    // HOOKS

    const { selectedView } = useSelector((state: RootState) => state.userProfile);
    const { id = '' } = useParams<{ id: string }>();
    const { handleErrors } = useHandleErrors();
    const { userCan } = usePrivilege();
    const navigate = useNavigate();
    const service = new UserService();

    // ATOMS      
                
    const setHeaderConfig = useSetAtom(headerConfigAtom);
    const setHeaderAction = useSetAtom(headerActionAtom);
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

    const menuItems: MenuItem[] = [...baseMenuItems, ...superAdminExtraItems];

    // -----------------------------------------------------------------------------------
    /**
     * @ES ELIMINA UN USUARIO
     * @EN DELETES A USER
     * 
     * @param id 
     */
    // -----------------------------------------------------------------------------------
    const handleDelete = async (id: string) => {
        try {
            Swal.fire({
                title: '¿Estás seguro de eliminar este usuario?',
                text: 'No podrás revertir esto!',
                showCancelButton: true,
                confirmButtonColor: '#0021d9',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Sí, eliminar!',
                cancelButtonText: 'Cancelar'
            }).then(async (result) => {
                if (result.isConfirmed) {
                    const response = await (await service.deleteUser(id)).getResponseData();
                    if (response.success) {
                        navigate(menuRoutes.users.path);
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
    // -----------------------------------------------------------------------------------

    // USE EFFECT

    useEffect(() => {
        navigate(`${menuRoutes.users.path}/${id}/profile${selectedView}`);
    }, [selectedView]);

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
                { label: `Perfil de Usuario`, path: `/users/${id}/profile/info`, active: true },
            ]
        });

        // CONFIGURE MAIN ACTION BUTTON

        setHeaderAction([{
            show: userCan('edit_users', 'user'),
            className: 'bg-white hover:bg-[#a1b8f7] w-[40px] h-[40px] p-0',
            label: <EditarIcon className="app-sub-icon filter-none" />,
            onClick: () => {
                navigate(`${menuRoutes.users.path}/${id}/edit/info`);
            }
        },
        {
            show: userCan('delete_users', 'user'),
            className: 'bg-white hover:bg-[#a1b8f7] w-[40px] h-[40px] p-0',
            label: <DeleteIcon className="app-sub-icon filter-none" />,
            onClick: () => handleDelete(data?.id || ''),
        }
        ]);

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

    }, [navigate, data, selectedView]);

    // RENDER

    return (
        <>
            {isLoading ? <Loader height='60vh' /> : children}
        </>
    );
}