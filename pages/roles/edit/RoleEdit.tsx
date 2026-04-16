import { FC, useCallback, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import FormCard from "../../../components/card/FormCard";
import { Loader } from "../../../components/loader/SpinnerLogo";
import useFetch from "../../../hooks/useFetch";
import { RoleService } from "../../../services/role/roleService";
import { Role } from "../../../type/entities/role-type";
import RoleForm from "../RoleForm";
import { useSetAtom } from "jotai";
import { headerConfigAtom } from "../../../atoms/headerAtoms";
import { ReactComponent as EditarIcon } from '../../../assets/Iconos/Interfaz/perfil_rol.svg';

const RoleEdit: FC = () => {

    // HOOKS

    const { id = "" } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const service = new RoleService();

    // ATOMS    
        
    const setHeaderConfig = useSetAtom(headerConfigAtom);

    // FUNCTIONS

    // -------------------------------------------------------------------------------------------------
    /**
     * @ES OBTIENE UN ROL POR SU ID.
     * @EN GETS A ROLE BY ITS ID.
     * 
     * @param id 
     * @returns 
     */
    // -------------------------------------------------------------------------------------------------
    const [data, loading] = useFetch(useCallback(async () => {
        const response = await service.getRoleById(id as string);
        return response.getResponseData() as Role;
    }, [id]));
    // -------------------------------------------------------------------------------------------------

    // -------------------------------------------------------------------------------------------------
    /**
     * @ES MANEJA EL ENVIO DEL FORMULARIO DE EDICION DE UN ROL.
     * @EN HANDLES THE SUBMISSION OF THE ROLE EDIT FORM.
     * 
     * @param values 
     * @param permissions 
     */
    // -------------------------------------------------------------------------------------------------
    const handleSubmit = async (values: any, permissions: number[]) => {
        values.permissions = permissions;

        try {
            const response = await service.editRole(values);
            const responseData = response.getResponseData();

            if (responseData.success) {
                navigate(-1);
                toast.success("Rol editado correctamente");
            } else {
                responseData.data.errors.forEach((error: any) => {
                    toast.error(error.message);
                });
            }
        } catch (error: any) {
            toast.error(error.message);
        }
    };
    // -------------------------------------------------------------------------------------------------

    // USE EFFECT
    
    useEffect(() => {

        if (data === null || data === undefined) return;

        // CONFIGURE HEADER TITLE AND ICON

        setHeaderConfig({
            title: `EDITAR ROL: ${data?.name || ""}`,
            icon: <EditarIcon className="app-sub-icon w-8 h-8" />,
            breadcrumbs: [
                { label: 'Inicio', path: '/' },
                { label: "Control de acceso", path: undefined },
                { label: 'Roles', path: '/roles' },
                { label: "Editar", path: `/roles/${id}/edit`, active: true },
            ]
        });

        // CLEANUP EFFECT

        return () => {
            setHeaderConfig(null);
        };
    
    }, [navigate, setHeaderConfig]);

    // RENDER

    if (loading) return <Loader />;

    return (
        <>
            <FormCard title="Datos Principales" className="mb-4">
                {(data !== null && data !== undefined) && <RoleForm data={data} submit={handleSubmit} isLoading={loading} />}
            </FormCard>
        </>
    );
};

export default RoleEdit;