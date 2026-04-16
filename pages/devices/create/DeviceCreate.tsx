import { FC, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import FormCard from "../../../components/card/FormCard";
import useHandleErrors from "../../../hooks/useHandleErrors";
import { DeviceService } from "../../../services/device/deviceService";
import DeviceForm from "../DeviceForm";
import { useSetAtom } from "jotai";
import { headerConfigAtom } from "../../../atoms/headerAtoms";
import { ReactComponent as DevicesIcon } from '../../../assets/Iconos/Interfaz/nuevo_dispositivo.svg';

const DeviceCreate: FC = () => {

    // STATES

    const [loading, setLoading] = useState<boolean>(false);


    // ATOMS
        
    const setHeaderConfig = useSetAtom(headerConfigAtom);

    // HOOKS

    const { handleErrors } = useHandleErrors();
    const navigate = useNavigate();
    const service = new DeviceService();

    // FUNCTIONS

    //-------------------------------------------------------------------------------------------------------
    /**
     * @ES MANEJA EL ENVIO DEL FORMULARIO
     * @EN HANDLE THE FORM SUBMISSION
     * 
     * @param values 
     */
    //-------------------------------------------------------------------------------------------------------
    const handleSubmit = async (values: any) => {
        setLoading(true);
        try {
            const response = (await service.createDevice(values)).getResponseData();

            if (response.success) {
                navigate(-1);
                toast.success("Dispositivo creado correctamente");
            } else {
                handleErrors(response);
            }
        } catch (error: any) {
            toast.error("Error al crear el dispositivo");
        } finally {
            setLoading(false);
        }
    };
    //-------------------------------------------------------------------------------------------------------


    // USE EFFECT

    useEffect(() => {

        // CONFIGURE HEADER TITLE AND ICON

        setHeaderConfig({
            title: "CREAR DISPOSITIVO",
            icon: <DevicesIcon className="app-sub-icon" />,
            breadcrumbs: [
                { label: 'Inicio', path: '/' },
                { label: 'Dispositivos', path: '/devices' },
                { label: 'Crear', active: true }
            ]
        });
        
        // CLEANUP EFFECT

        return () => {
            setHeaderConfig(null);
        };
    
    }, [navigate]);

    // RENDER

    return (
        <>
            <FormCard title="" className="mb-4">
                <DeviceForm submit={handleSubmit} isLoading={loading} />
            </FormCard>
        </>
    );
};

export default DeviceCreate;