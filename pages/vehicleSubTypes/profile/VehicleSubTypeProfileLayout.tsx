import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import { toast } from 'sonner';
import { usePrivilege } from '../../../components/priviledge/PriviledgeProvider';
import useFetch from '../../../hooks/useFetch';
import useHandleErrors from '../../../hooks/useHandleErrors';
import { menuRoutes } from "../../../router/menu";
import { VehicleTypeApiResponse } from '../../../type/entities/vehicle-type-type';
import { VehicleSubTypeService } from '../../../services/vehicleSubType/vehicleSubTypeService';
import VehicleSubTypeEditModal from '../modals/VehicleSubTypeEditModal';
import VehicleSubTypeInfo from './info/VehicleSubTypeInfo';
import { useSetAtom } from 'jotai';
import { headerActionAtom, headerConfigAtom } from '../../../atoms/headerAtoms';
import { ReactComponent as EditarIcon } from '../../../assets/Iconos/Interfaz/editar.svg';
import { ReactComponent as DeleteIcon } from '../../../assets/Iconos/Interfaz/borrar.svg';
import VehicleIconSelector from '../../../components/icon/VehicleIconSelector';
import Swal from 'sweetalert2';

export default function VehicleSubTypeProfileLayout() {

    // HOOKS 

    const { id = '' } = useParams<{ id: string }>();
    const { handleErrors } = useHandleErrors();
    const { userCan } = usePrivilege();
    const navigate = useNavigate();
    const service = new VehicleSubTypeService();

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
     * @ES OBTIENE LA SUBTIPO DE VEHICULO POR ID
     * @EN GETS A VEHICLE SUBTYPE BY ID
     * 
     * @param id 
     * @returns VehicleSubType
     */
    // --------------------------------------------------------------------------
    const [data] = useFetch(useCallback(async () => {
        if (!id || id === '') return null;
        const response = await service.getVehicleSubTypeById(id);
        return response.getResponseData() as VehicleTypeApiResponse;
    }, [id, refreshKey]));
    // --------------------------------------------------------------------------

    // --------------------------------------------------------------------------
    /**
     * @ES ELIMINA UN SUBTIPO DE VEHICULO
     * @EN DELETES A VEHICLE SUBTYPE
     * 
     * @param id 
     */
    // --------------------------------------------------------------------------
    const handleDelete = async (id: string) => {
        try {
            Swal.fire({
                title: '¿Estás seguro de eliminar este subtipo de vehículo?',
                text: 'No podrás revertir esto!',
                showCancelButton: true,
                confirmButtonColor: '#0021d9',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Sí, eliminar!',
                cancelButtonText: 'Cancelar'
            }).then(async (result) => {
                if (result.isConfirmed) {
                    try {
                        const response = await (await service.deleteVehicleSubType(id)).getResponseData();
                        if (response.success) {
                            navigate(menuRoutes.vehicleSubTypes.path);
                            toast.success(response.message);
                        } else {
                            handleErrors(response.message);
                        }
                    } catch (error) {
                        handleErrors(error);
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
            title: `INFORMACIÓN DEL SUBTIPO DE VEHÍCULO : ${data?.name || ''}`,
            icon: <VehicleIconSelector category={null} subcategory={data?.name} className='w-8 h-8 me-2 brightness-0 invert' />,
            breadcrumbs: [
                { label: 'Inicio', path: '/' },
                { label: 'Vehículos', path: undefined },
                { label: 'Subtipos de vehículos', path: menuRoutes.vehicleSubTypes.path },
                { label: `Información del subtipo de vehículo`, path: `/vehicle-sub-types/${data?.id}/profile/info`, active: true },
            ]
        });

        // CONFIGURE MAIN ACTION BUTTON

        setHeaderAction([{
            show: userCan('edit_vehicle_subtypes', 'vehicle_subtypes'),
            className: 'bg-white hover:bg-[#a1b8f7] w-[40px] h-[40px] p-0',
            label: <EditarIcon className="app-sub-icon filter-none" />,
            onClick: () => {
                setSelectedVehicleTypeId(data?.id || '');
                setOpenEditModal(true);
            }
        },
        {
            show: userCan('delete_vehicle_subtypes', 'vehicle_subtypes'),
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
            <VehicleSubTypeInfo vehicleSubType={data} />

            <VehicleSubTypeEditModal
                vehicleSubTypeId={selectedVehicleTypeId}
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