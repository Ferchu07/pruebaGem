import { FC, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import FormCard from "../../../components/card/FormCard";
import useHandleErrors from "../../../hooks/useHandleErrors";
import { GroupService } from "../../../services/metrics/groupService";
import { useSetAtom } from "jotai";
import { headerConfigAtom } from "../../../atoms/headerAtoms";
import { ReactComponent as NewUserIcon } from '../../../assets/Iconos/Interfaz/nuevo_usuario.svg';
import GroupForm from "../GoupForm";

const GroupCreate: FC = () => {

    // HOOKS

    const { handleErrors } = useHandleErrors();
    const navigate = useNavigate();
    const service = new GroupService();

    // STATES

    const [loading, setLoading] = useState<boolean>(false);

    // ATOMS
            
    const setHeaderConfig = useSetAtom(headerConfigAtom);

    // FUNCTIONS

    // --------------------------------------------------------------------------------------
    /**
     * @ES MANEJA EL ENVIO DEL FORMULARIO DE CREACIÓN DE GRUPO.
     * @EN HANDLES THE SUBMISSION OF THE GROUP CREATION FORM.
     * 
     * @param values
     */
    // --------------------------------------------------------------------------------------
    const handleSubmit = async (values: any) => {
        setLoading(true);
        try {
            const response = (await service.createGroup(values)).getResponseData();

            if (response.success) {
                navigate(-1);
                toast.success("Grupo creado correctamente");
            } else {
                handleErrors(response);
            }
        } catch (error: any) {
            toast.error("Error al crear la ecu");
        } finally {
            setLoading(false);
        }
    };
    // --------------------------------------------------------------------------------------

    // USE EFFECT

    useEffect(() => {

        // CONFIGURE HEADER TITLE AND ICON

        setHeaderConfig({
            title: "CREAR GRUPO",
            icon: <NewUserIcon className="app-sub-icon w-9 h-9" />,
            breadcrumbs: [
                { 
                    label: 'Inicio', 
                    path: '/' 
                },
                {
                    label: "Dispositivos",
                    path: undefined
                },
                {
                    label: "Grupos",
                    path: "/groups",
                },
                {
                    label: "Crear",
                    path: "/groups/create",
                    active: true
                }
            ]
        });

        // CLEANUP EFFECT

        return () => {
            setHeaderConfig(null);
        };

    }, [setHeaderConfig]);

    // RENDER

    return (
        <>
            <FormCard title="Datos Principales" className="mb-4">
                <GroupForm submit={handleSubmit} isLoading={loading} />
            </FormCard>
        </>
    );
};

export default GroupCreate;
