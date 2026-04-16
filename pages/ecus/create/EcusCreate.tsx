import { FC, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import FormCard from "../../../components/card/FormCard";
import useHandleErrors from "../../../hooks/useHandleErrors";
import { EcuService } from "../../../services/metrics/ecuService";
import EcuForm from "../EcuForm";
import { useSetAtom } from "jotai";
import { headerConfigAtom } from "../../../atoms/headerAtoms";
import { ReactComponent as NewUserIcon } from '../../../assets/Iconos/Interfaz/nuevo_usuario.svg';

const EcusCreate: FC = () => {

    // HOOKS

    const { handleErrors } = useHandleErrors();
    const navigate = useNavigate();
    const service = new EcuService();

    // STATES

    const [loading, setLoading] = useState<boolean>(false);

    // ATOMS
            
    const setHeaderConfig = useSetAtom(headerConfigAtom);

    // FUNCTIONS

    // --------------------------------------------------------------------------------------
    /**
     * @ES MANEJA EL ENVIO DEL FORMULARIO DE CREACIÓN DE ECU.
     * @EN HANDLES THE SUBMISSION OF THE ECU CREATION FORM.
     * 
     * @param values
     */
    // --------------------------------------------------------------------------------------
    const handleSubmit = async (values: any) => {
        setLoading(true);
        try {
            const response = (await service.createEcu(values)).getResponseData();

            if (response.success) {
                navigate(-1);
                toast.success("Ecu creada correctamente");
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
            title: "CREAR ECU",
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
                    label: "Ecus",
                    path: "/ecus",
                },
                {
                    label: "Crear",
                    path: "/ecus/create",
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
                <EcuForm submit={handleSubmit} isLoading={loading} />
            </FormCard>
        </>
    );
};

export default EcusCreate;
