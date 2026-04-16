import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import { toast } from 'sonner';
import { usePrivilege } from '../../../components/priviledge/PriviledgeProvider';
import useFetch from '../../../hooks/useFetch';
import useHandleErrors from '../../../hooks/useHandleErrors';
import { menuRoutes } from "../../../router/menu";
import { UserApiResponse } from '../../../type/entities/user-type';
import { BrandService } from '../../../services/brand/brandService';
import BrandInfo from './info/BrandInfo';
import { useSetAtom } from 'jotai';
import { headerActionAtom, headerConfigAtom } from '../../../atoms/headerAtoms';
import { ReactComponent as EditarIcon } from '../../../assets/Iconos/Interfaz/editar.svg';
import { ReactComponent as DeleteIcon } from '../../../assets/Iconos/Interfaz/borrar.svg';
import BrandEditModal from '../modals/BrandEditModal';
import { ReactComponent as BrandProfileIcon } from '../../../assets/Iconos/menu/perfil_marca.svg';
import Swal from 'sweetalert2';

export default function BrandProfileLayout() {

    // ATOMS    
            
    const setHeaderConfig = useSetAtom(headerConfigAtom);
    const setHeaderAction = useSetAtom(headerActionAtom);

    // STATES

    const [openEditModal, setOpenEditModal] = useState(false);
    const [selectedBrandId, setSelectedBrandId] = useState<string | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);

    // HOOKS 

    const { id = '' } = useParams<{ id: string }>();
    const { handleErrors } = useHandleErrors();
    const { userCan } = usePrivilege();
    const navigate = useNavigate();
    const service = new BrandService();

    // FUNCTIONS

    // -----------------------------------------------------------------------------------
    /**
     * @ES OBTIENE LOS DATOS DE UNA MARCA POR ID
     * @EN OBTAIN A BRAND BY ID
     */
    // -----------------------------------------------------------------------------------
    const [data] = useFetch(useCallback(async () => {
        if (!id || id === '') return null;
        const response = await service.getBrandById(id);
        return response.getResponseData() as UserApiResponse;
    }, [id, refreshKey]));
    // -----------------------------------------------------------------------------------

    // -----------------------------------------------------------------------------------
    /**
     * @ES ELIMINA UNA MARCA POR ID
     * @EN DELETE A BRAND BY ID
     */
    // -----------------------------------------------------------------------------------
    const handleDelete = async (id: string) => {
        try {
            Swal.fire({
                title: '¿Estás seguro de eliminar esta marca?',
                text: 'No podrás revertir esto!',
                showCancelButton: true,
                confirmButtonColor: '#0021d9',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Sí, eliminar!',
                cancelButtonText: 'Cancelar'
            }).then(async (result) => {
                if (result.isConfirmed) {
                    const response = await (await service.deleteBrand(id)).getResponseData();
                    if (response.success) {
                        navigate(menuRoutes.brands.path);
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
    // -----------------------------------------------------------------------------------

    // USE EFFECTS

    useEffect(() => {

        // IF DATA IS NULL, THEN RETURN
        if (data === null || data === undefined) return;

        // CONFIGURE HEADER TITLE AND ICON

        setHeaderConfig({
            title: `INFORMACIÓN DE MARCA: ${data?.name || 'MARCA'}`,
            icon: <BrandProfileIcon className="app-sub-icon w-9 h-9" />,
            breadcrumbs: [
                { label: 'Inicio', path: '/' },
                { label: 'Marcas', path: menuRoutes.brands.path },
                { label: `Información de la marca`, path: `brands/${data?.id || ''}/profile/info` , active: true }
            ]
        });

        // CONFIGURE MAIN ACTION BUTTON

        setHeaderAction([{
            show: userCan('edit_brands', 'brands'),
            className: 'bg-white hover:bg-[#a1b8f7] w-[40px] h-[40px] p-0',
            label: <EditarIcon className="app-sub-icon filter-none" />,
            onClick: () => {
                setSelectedBrandId(data?.id || '');
                setOpenEditModal(true);
            }
        },
        {
            show: userCan('delete_brands', 'brands'),
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
            <BrandInfo brand={data} />  

            <BrandEditModal
                brandId={selectedBrandId}
                isOpen={openEditModal}
                onClose={() => {
                    setOpenEditModal(false);
                    setSelectedBrandId(null);
                }}
                onUpdated={() => setRefreshKey(prev => prev + 1)}
            />
        </>
    );
}