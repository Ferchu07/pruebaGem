import React, { useCallback, useEffect } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import { toast } from 'sonner';
import { usePrivilege } from '../../../components/priviledge/PriviledgeProvider';
import useFetch from '../../../hooks/useFetch';
import useHandleErrors from '../../../hooks/useHandleErrors';
import { menuRoutes } from "../../../router/menu";
import { UserApiResponse } from '../../../type/entities/user-type';
import { DeviceService } from '../../../services/device/deviceService';
import { atom, useAtom, useSetAtom } from 'jotai';
import { headerActionAtom, headerConfigAtom } from '../../../atoms/headerAtoms';
import { ReactComponent as DevicesIcon } from '../../../assets/Iconos/Interfaz/perfil_dispositivo.svg';
import { ReactComponent as EditarIcon } from '../../../assets/Iconos/Interfaz/editar.svg';
import { ReactComponent as DeleteIcon } from '../../../assets/Iconos/Interfaz/borrar.svg';
import DeviceInfo from './views/info/DeviceInfo';
import Swal from 'sweetalert2';

export const doRefetchAtom = atom(false);

export default function DeviceProfileLayout() {

    // ATOMS    
        
    const setHeaderConfig = useSetAtom(headerConfigAtom);
    const setHeaderAction = useSetAtom(headerActionAtom);

    // HOOKS

    const { id = '' } = useParams<{ id: string }>();
    const { handleErrors } = useHandleErrors();
    const { userCan } = usePrivilege();
    const navigate = useNavigate();
    const service = new DeviceService();
    const [,setDoRefetch] = useAtom(doRefetchAtom);

    // DATA FETCHING

    const [data, loading, error, refetch] = useFetch(useCallback(async () => {
        if (!id || id === '') return null;
        const response = await service.getDeviceById(id);
        return response.getResponseData() as UserApiResponse;
    }, [id]));

    // FUNCTIONS

    // -----------------------------------------------------------------------------------------------------------------
    /**
     * @ES ELIMINACION DE UN DISPOSITIVO
     * @EN DELETION OF A DEVICE
     * 
     * @param id 
     */
    // -----------------------------------------------------------------------------------------------------------------
    const handleDelete = async (id: string) => {
        try {
            Swal.fire({
                title: '¿Estás seguro de eliminar este dispositivo?',
                text: 'No podrás revertir esto!',
                showCancelButton: true,
                confirmButtonColor: '#0021d9',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Sí, eliminar!',
                cancelButtonText: 'Cancelar'
            }).then(async (result) => {
                if (result.isConfirmed) {
                    const response = await (await service.deleteDevice(id)).getResponseData();
                    if (response.success) {
                        refetch();
                        setDoRefetch(true);
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
    // -----------------------------------------------------------------------------------------------------------------

    // USE EFFECTS

    useEffect(() => {

        // IF DATA IS NULL, THEN RETURN
        if (data === null || data === undefined) return;

        // CONFIGURE HEADER TITLE AND ICON

        setHeaderConfig({
            title: `PERFIL DEL DISPOSITIVO ${data.model}`,
            icon: <DevicesIcon className="app-sub-icon" />,
            breadcrumbs: [
                { label: 'Inicio', path: '/' },
                { label: 'Dispositivos', path: '/devices' },
                { label: `Perfil de Dispositivo`, path: '/devices/' + data?.id || '' + '/profile/info', active: true },
            ]
        });

        // CONFIGURE MAIN ACTION BUTTON

        setHeaderAction([
            {
                show: userCan('edit_devices', 'devices') && userCan('list_companies', 'companies'),
                className: 'bg-white hover:bg-[#a1b8f7] w-[40px] h-[40px] p-0',
                label: <EditarIcon className="app-sub-icon filter-none" />,
                onClick: () => navigate( menuRoutes.devices.path + '/' +
                    menuRoutes.devices.edit.replace(':id', data?.id || '')),
            },
            {
                show: userCan('delete_devices', 'devices') && userCan('list_companies', 'companies'),
                className: 'bg-white hover:bg-[#a1b8f7] w-[40px] h-[40px] p-0',
                label: <DeleteIcon className="app-sub-icon filter-none" />,
                onClick: () => handleDelete(data?.id || ''),
            }
        ]);

        // CLEANUP EFFECT

        return () => {
            setHeaderConfig(null);
            setHeaderAction(null);
        };
    
    }, [navigate, data]);

    // RENDER

    return (
        <>
            <DeviceInfo />
        </>
    );
}