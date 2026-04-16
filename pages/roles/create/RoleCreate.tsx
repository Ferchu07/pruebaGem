import { FC, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import FormCard from "../../../components/card/FormCard";
import { RoleService } from "../../../services/role/roleService";
import RoleForm from "../RoleForm";
import { useSetAtom } from "jotai";
import { headerConfigAtom } from "../../../atoms/headerAtoms";
import { ReactComponent as RoleCreateIcon } from "../../../assets/Iconos/Interfaz/nuevo_rol.svg";

const RoleCreate: FC = () => {

    // HOOKS

    const navigate = useNavigate();
    const service = new RoleService();

    // STATES

    const [loading, setLoading] = useState<boolean>(false);

    // ATOMS    
    
    const setHeaderConfig = useSetAtom(headerConfigAtom);

    // FUNCTIONS

    // ----------------------------------------------------------------------------------------
    /**
     * @ES CREAR UN NUEVO ROL EN LA BASE DE DATOS
     * @EN CREATE A NEW ROLE IN THE DATABASE
     * 
     * @param values 
     * @param permissions 
     */
    // ----------------------------------------------------------------------------------------
    const handleSubmit = async (values: any, permissions: number[]) => {
        setLoading(true);
        values.permissions = permissions;

        try {
            const response = await service.createRole(values);
            const responseData = response.getResponseData();

            if (responseData.success) {
                navigate(-1);
                toast.success("Rol creado correctamente");
            } else {
                responseData.data.errors.forEach((error: any) => {
                    toast.error(error.message);
                });
            }
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };
    // ----------------------------------------------------------------------------------------

    // USE EFFECT
    
    useEffect(() => {

        // CONFIGURE HEADER TITLE AND ICON

        setHeaderConfig({
            title: "NUEVO ROL",
            icon: <RoleCreateIcon className="app-sub-icon" />,
            breadcrumbs: [
                { label: 'Inicio', path: '/' },
                { label: "Control de acceso", path: undefined },
                { label: 'Roles', path: '/roles' },
                { label: "Crear", path: '/roles/create', active: true },
            ]
        });

        // CLEANUP EFFECT

        return () => {
            setHeaderConfig(null);
        };
    
    }, [navigate, setHeaderConfig]);

    // RENDER

    return (
        <>
            <FormCard title="Datos Principales" className="mb-4">
                <RoleForm submit={handleSubmit} isLoading={loading} />
            </FormCard>
        </>
    );
};

export default RoleCreate;