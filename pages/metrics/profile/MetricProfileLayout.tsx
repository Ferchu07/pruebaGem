import { useCallback, useEffect, useState } from 'react';
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
import GroupInfo from './views/info/MetricInfo';
import { Metric } from '../../../type/entities/metric-type';
import { MetricService } from '../../../services/metrics/metricService';

export default function MetricProfileLayout() {

    // HOOKS

    const { id = '' } = useParams<{ id: string }>();
    const { handleErrors } = useHandleErrors();
    const { userCan } = usePrivilege();
    const navigate = useNavigate();
    const service = new MetricService();

    // STATES

    const [isEditing, setIsEditing] = useState(false);

    // ATOMS      
                
    const setHeaderConfig = useSetAtom(headerConfigAtom);
    const setHeaderAction = useSetAtom(headerActionAtom);

    // FUNCTIONS

    // -----------------------------------------------------------------------------------
    /**
     * @ES OBTIENE UNA METRICA POR ID
     * @EN GETS A METRIC BY ID
     * 
     * @param id
     */
    // -----------------------------------------------------------------------------------
    const [data, , , refetch] = useFetch(useCallback(async () => {
        if (!id || id === '') return null;
        const response = await service.getMetric(id);
        return response.getResponseData() as Metric;
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
                title: '¿Estás seguro de eliminar esta Metrica?',
                text: 'No podrás revertir esto!',
                showCancelButton: true,
                confirmButtonColor: '#0021d9',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Sí, eliminar!',
                cancelButtonText: 'Cancelar'
            }).then(async (result) => {
                if (result.isConfirmed) {
                    const response = await (await service.deleteMetric(id)).getResponseData();
                    if (response.success) {
                        navigate(menuRoutes.metrics.path);
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
                { label: `Metricas`, path: '/metrics' },
                { label: `Perfil Metrica`, path: `/metrics/${id}/profile/${menuRoutes.metrics.profile.info}`, active: true },   
            ]
        });

        // CONFIGURE MAIN ACTION BUTTON

        setHeaderAction([{
            show: userCan('edit_metrics', 'metrics'),
            className: `bg-white hover:bg-[#a1b8f7] ${isEditing ? 'ring-2 ring-primary ring-offset-2' : ''} w-[40px] h-[40px] p-0`,
            label: <EditarIcon className="app-sub-icon filter-none" />,
            onClick: () => {
                navigate(menuRoutes.metrics.path + '/' + id + '/edit');
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

    }, [navigate, data, isEditing]);

    // RENDER

    return (
        <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
            {data && (
                <GroupInfo 
                    data={data} 
                    isEditing={isEditing} 
                    setIsEditing={setIsEditing} 
                    onUpdate={refetch}
                />
            )}
        </div>
    );
}