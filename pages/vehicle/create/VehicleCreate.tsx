import { FC, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import FormCard from "../../../components/card/FormCard";
import useHandleErrors from "../../../hooks/useHandleErrors";
import { VehicleService } from "../../../services/vehicle/vehicleService";
import VehicleForm from "../VehicleForm";
import { useSetAtom } from "jotai";
import { headerConfigAtom } from "../../../atoms/headerAtoms";
import { ReactComponent as CardAddIcon } from '../../../assets/Iconos/Interfaz/nuevo_vehiculo.svg';

const VehicleCreate: FC = () => {

    // STATES

    const [loading, setLoading] = useState<boolean>(false);

    // HOOKS

    const { handleErrors } = useHandleErrors();
    const navigate = useNavigate();
    const service = new VehicleService();

    // ATOMS
            
    const setHeaderConfig = useSetAtom(headerConfigAtom);

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
            const response = (await service.createVehicle(values)).getResponseData();

            if (response.success) {
                navigate(-1);
                toast.success("Vehículo creado correctamente");
            } else {
                handleErrors(response);
            }
        } catch (error: any) {
            toast.error("Error al crear el vehículo");
        } finally {
            setLoading(false);
        }
    };
    //-------------------------------------------------------------------------------------------------------

    // USE EFFECT

    useEffect(() => {

        // CONFIGURE HEADER TITLE AND ICON

        setHeaderConfig({
            title: "CREAR VEHÍCULO",
            icon: <CardAddIcon className="app-sub-icon" />,
            breadcrumbs: [
                { label: 'Inicio', path: '/' },
                { label: 'Vehículos', path: '/vehicles' },
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
            <FormCard title="Datos Principales" className="mb-4">
                <VehicleForm submit={handleSubmit} isLoading={loading} />
            </FormCard>
        </>
    );
};

export default VehicleCreate;