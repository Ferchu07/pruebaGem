import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import { toast } from 'sonner';
import { usePrivilege } from '../../../components/priviledge/PriviledgeProvider';
import useFetch from '../../../hooks/useFetch';
import useHandleErrors from '../../../hooks/useHandleErrors';
import { menuRoutes } from "../../../router/menu";
import { VehicleTypeService } from '../../../services/vehicleType/vehicleTypeService';
import VehicleTypeEditModal from '../modals/VehicleTypeEditModal';
import { VehicleTypeApiResponse } from '../../../type/entities/vehicle-type-type';
import VehicleTypeInfo from './info/VehicleTypeInfo';
import { useSetAtom } from 'jotai';
import { headerActionAtom, headerConfigAtom } from '../../../atoms/headerAtoms';
import { ReactComponent as EditarIcon } from '../../../assets/Iconos/Interfaz/editar.svg';
import { ReactComponent as DeleteIcon } from '../../../assets/Iconos/Interfaz/borrar.svg';
import { ReactComponent as VehicleTypeProfileIcon } from '../../../assets/Iconos/menu/perfil_tipo_vehiculo.svg';
import VehicleIconSelector from '../../../components/icon/VehicleIconSelector';
import Swal from 'sweetalert2';

export default function VehicleTypeProfileLayout() {

    // HOOKS 

    const { id = '' } = useParams<{ id: string }>();
    const { handleErrors } = useHandleErrors();
    const { userCan } = usePrivilege();
    const service = new VehicleTypeService();
    const navigate = useNavigate();

    // STATES

    const [openEditModal, setOpenEditModal] = useState(false);
    const [selectedVehicleTypeId, setSelectedVehicleTypeId] = useState<string | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);

    // ATOMS        
                
    const setHeaderConfig = useSetAtom(headerConfigAtom);
    const setHeaderAction = useSetAtom(headerActionAtom);

    // METHODS

    // --------------------------------------------------------------------------
    /**
     * @ES OBTIENE LA TIPO DE VEHICULO POR ID
     * @EN GETS A VEHICLE TYPE BY ID
     * 
     * @param id 
     * @returns VehicleType
     */
    // --------------------------------------------------------------------------
    const [data] = useFetch(useCallback(async () => {
        if (!id || id === '') return null;
        const response = await service.getVehicleTypeById(id);
        return response.getResponseData() as VehicleTypeApiResponse;
    }, [id, refreshKey]));
    // --------------------------------------------------------------------------

    // --------------------------------------------------------------------------
    /**
     * @ES ELIMINA UN TIPO DE VEHICULO
     * @EN DELETES A VEHICLE TYPE
     * 
     * @param id 
     */
    // --------------------------------------------------------------------------
    const handleDelete = async (id: string) => {
        try {            
            Swal.fire({
                title: '¿Estás seguro de eliminar este tipo de vehículo?',
                text: 'No podrás revertir esto!',
                showCancelButton: true,
                confirmButtonColor: '#0021d9',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Sí, eliminar!',
                cancelButtonText: 'Cancelar'
            }).then(async (result) => {
                if (result.isConfirmed) {
                    const response = await (await service.deleteVehicleType(id)).getResponseData();
                    if (response.success) {
                        navigate(menuRoutes.vehicleTypes.path);
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
    // --------------------------------------------------------------------------

    // USE EFFECTS
    
    useEffect(() => {

        // IF DATA IS NULL, THEN RETURN
        if (data === null || data === undefined) return;

        // CONFIGURE HEADER TITLE AND ICON

        setHeaderConfig({
            title: `INFORMACIÓN DEL TIPO DE VEHÍCULO : ${data?.name || ''}`,
            icon: <VehicleIconSelector category={data?.name} subcategory={null} className='w-8 h-8 me-2 brightness-0 invert' />,
            breadcrumbs: [
                { label: 'Inicio', path: '/' },
                { label: 'Tipos de vehículos', path: menuRoutes.vehicleTypes.path },
                { label: `Información del tipo de vehículo`, path: `/vehicle-types/${data?.id}/profile/info`, active: true },
            ]
        });

        // CONFIGURE MAIN ACTION BUTTON

        setHeaderAction([{
            show: userCan('edit_vehicle_types', 'vehicle_types'),
            className: 'bg-white hover:bg-[#a1b8f7] w-[40px] h-[40px] p-0',
            label: <EditarIcon className="app-sub-icon filter-none" />,
            onClick: () => {
                setSelectedVehicleTypeId(data?.id || '');
                setOpenEditModal(true);
            }
        },
        {
            show: userCan('delete_vehicle_types', 'vehicle_types'),
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
    
    }, [data]);

    // RENDER

    return (
        <>

            <VehicleTypeInfo vehicleType={data} />

            <VehicleTypeEditModal
                vehicleTypeId={selectedVehicleTypeId}
                isOpen={openEditModal}
                onClose={() => setOpenEditModal(false)}
                onUpdated={() => {
                    setOpenEditModal(false);
                    setSelectedVehicleTypeId(null);
                    setRefreshKey(refreshKey + 1);
                }}
            />
        </>
    );
}