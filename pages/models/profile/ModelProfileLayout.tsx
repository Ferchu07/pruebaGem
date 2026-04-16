import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import { toast } from 'sonner';
import { usePrivilege } from '../../../components/priviledge/PriviledgeProvider';
import useFetch from '../../../hooks/useFetch';
import useHandleErrors from '../../../hooks/useHandleErrors';
import { menuRoutes } from "../../../router/menu";
import { ModelService } from '../../../services/model/modelService';
import { ModelApiResponse } from '../../../type/entities/model-type';
import ModelInfo from './info/ModelInfo';
import { useSetAtom } from 'jotai';
import { headerActionAtom, headerConfigAtom } from '../../../atoms/headerAtoms';
import ModelEditModal from '../modals/ModelEditModal';
import { ReactComponent as EditarIcon } from '../../../assets/Iconos/Interfaz/editar.svg';
import { ReactComponent as DeleteIcon } from '../../../assets/Iconos/Interfaz/borrar.svg';
import { ReactComponent as ModelsIcon } from '../../../assets/Iconos/Interfaz/listado_dispositivos.svg';
import Swal from 'sweetalert2';

export default function ModelProfileLayout() {

    // STATES

    const [openEditModal, setOpenEditModal] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    // HOOKS

    const { id = '' } = useParams<{ id: string }>();
    const { handleErrors } = useHandleErrors();
    const { userCan } = usePrivilege();
    const navigate = useNavigate();
    const service = new ModelService();

    // ATOMS    
            
    const setHeaderConfig = useSetAtom(headerConfigAtom);
    const setHeaderAction = useSetAtom(headerActionAtom);

    // FUNCTIONS

    // -------------------------------------------------------------------------------------
    /**
     * @ES OBTIENE LOS DATOS DE UN MODELO POR ID
     * @EN GETS A MODEL BY ID
     * 
     * @param id
     */
    // -------------------------------------------------------------------------------------
    const [data] = useFetch(useCallback(async () => {
        if (!id || id === '') return null;
        const response = await service.getModelById(id);
        return response.getResponseData() as ModelApiResponse;
    }, [id, refreshKey]));
    // -------------------------------------------------------------------------------------

    // -------------------------------------------------------------------------------------
    /**
     * @ES ELIMINA UN MODELO POR ID
     * @EN DELETES A MODEL BY ID
     * 
     * @param id 
     */
    // -------------------------------------------------------------------------------------
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
                    const response = await (await service.deleteModel(id)).getResponseData();
                    if (response.success) {
                        navigate(menuRoutes.models.path);
                        toast.success(response.message);
                    } else {
                        handleErrors(response.message);
                    }
                }
            })
        } catch (error) {
            handleErrors(error);
        }
    };
    // -------------------------------------------------------------------------------------

    // USE EFFECT

    useEffect(() => {

        // IF DATA IS NULL, THEN RETURN
        if (data === null || data === undefined) return;

        // CONFIGURE HEADER TITLE AND ICON

        setHeaderConfig({
            title: `PERFIL DEL MODELO ${data.name}`,
            icon: <ModelsIcon className="app-sub-icon" />,
            breadcrumbs: [
                { label: 'Inicio', path: '/' },
                { label: 'Modelos', path: '/models' },
                { label: `Perfil de Modelo`, path: '/models/' + data?.id || '' + '/profile/info', active: true }
            ]
        });

        // CONFIGURE MAIN ACTION BUTTON

        setHeaderAction([
            {
                show: userCan('edit_models', 'models'),
                className: 'bg-white hover:bg-[#a1b8f7] w-[40px] h-[40px] p-0',
                label: <EditarIcon className="app-sub-icon filter-none" />,
                onClick: () => {
                    setOpenEditModal(true);
                }
            },
            {
                show: userCan('delete_models', 'models'),
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
            <ModelEditModal
                modelId={id}
                isOpen={openEditModal}
                onClose={() => setOpenEditModal(false)}
                onUpdated={() => setRefreshKey(prev => prev + 1)}
            />

            <ModelInfo model={data} />
        </>
    );
}