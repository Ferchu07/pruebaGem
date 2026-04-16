import { useCallback, useEffect } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import { toast } from 'sonner';
import { usePrivilege } from '../../../components/priviledge/PriviledgeProvider';
import useFetch from '../../../hooks/useFetch';
import useHandleErrors from '../../../hooks/useHandleErrors';
import { menuRoutes } from "../../../router/menu";
import { useSetAtom } from 'jotai';
import { headerActionAtom, headerConfigAtom } from '../../../atoms/headerAtoms';
import { ReactComponent as EditarIcon } from '../../../assets/Iconos/Interfaz/editar.svg';
import { ReactComponent as DeleteIcon } from '../../../assets/Iconos/Interfaz/borrar.svg';
import { PiIdentificationCard } from 'react-icons/pi';
import Swal from 'sweetalert2';
import { GroupService } from '../../../services/metrics/groupService';
import { Group } from '../../../type/entities/group-type';
//@ts-ignore
import GroupInfo from './views/info/GroupInfo';

export default function GroupProfileLayout() {

    // HOOKS

    const { id = '' } = useParams<{ id: string }>();
    const { handleErrors } = useHandleErrors();
    const { userCan } = usePrivilege();
    const navigate = useNavigate();
    const service = new GroupService();

    // ATOMS      
                
    const setHeaderConfig = useSetAtom(headerConfigAtom);
    const setHeaderAction = useSetAtom(headerActionAtom);

    // FUNCTIONS

    // -----------------------------------------------------------------------------------
    /**
     * @ES OBTIENE UN GRUPO POR ID
     * @EN GETS A GROUP BY ID
     * 
     * @param id
     */
    // -----------------------------------------------------------------------------------
    const [data] = useFetch(useCallback(async () => {
        if (!id || id === '') return null;
        const response = await service.getGroup(id);
        return response.getResponseData() as Group;
    }, [id]));
    // -----------------------------------------------------------------------------------

    // -----------------------------------------------------------------------------------
    /**
     * @ES ELIMINA UN GRUPO
     * @EN DELETES A GROUP
     * 
     * @param id 
     */
    // -----------------------------------------------------------------------------------
    const handleDelete = async (id: string) => {
        try {
            Swal.fire({
                title: '¿Estás seguro de eliminar este Grupo?',
                text: 'No podrás revertir esto!',
                showCancelButton: true,
                confirmButtonColor: '#0021d9',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Sí, eliminar!',
                cancelButtonText: 'Cancelar'
            }).then(async (result) => {
                if (result.isConfirmed) {
                    const response = await (await service.deleteGroup(id)).getResponseData();
                    if (response.success) {
                        navigate(menuRoutes.groups.path);
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

        // IF DATA IS NULL, THEN RETURN
        if (data === null || data === undefined) return;

        // CONFIGURE HEADER TITLE AND ICON

        setHeaderConfig({
            title: `PERFIL DE ${data.name}`,
            icon: <PiIdentificationCard className="app-sub-icon" />,
            breadcrumbs: [
                { label: 'Inicio', path: '/' },
                { label: "Dispositivos", path: undefined },
                { label: `Grupos`, path: '/groups' },
                { label: `Perfil Grupo`, path: `/groups/${id}/profile/${menuRoutes.groups.profile.info}`, active: true },   
            ]
        });

        // CONFIGURE MAIN ACTION BUTTON

        setHeaderAction([{
            show: userCan('edit_metrics', 'metrics'),
            className: 'bg-white hover:bg-[#a1b8f7] w-[40px] h-[40px] p-0',
            label: <EditarIcon className="app-sub-icon filter-none" />,
            onClick: () => {
                navigate(`${menuRoutes.groups.path}/${id}/edit`);
            }
        },
        {
            show: userCan('delete_metrics', 'metrics'),
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
        <div className="@container">
            <div className="grid divide-y-2 divide-dashed divide-gray-200 gap-6">
                {data && <GroupInfo data={data} />}
            </div>
        </div>
    );
}