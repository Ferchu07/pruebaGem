import { FC, useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import FormCard from "../../../components/card/FormCard";
import { Loader } from "../../../components/loader/SpinnerLogo";
import useFetch from "../../../hooks/useFetch";
import useHandleErrors from "../../../hooks/useHandleErrors";
import { VehicleService } from "../../../services/vehicle/vehicleService";
import { Vehicle } from "../../../type/entities/vehicle-type";
import VehicleForm from "../VehicleForm";
import { useSetAtom } from "jotai";
import { headerConfigAtom } from "../../../atoms/headerAtoms";
import { ReactComponent as VehicleIcon } from '../../../assets/Iconos/Interfaz/perfil_vehiculo.svg';

const VehicleEdit: FC = () => {

    // STATES

    const { id = "" } = useParams<{ id: string }>();
    const { handleErrors } = useHandleErrors();
    const navigate = useNavigate();
    const service = new VehicleService();

    // HOOKS

    const [isLoading, setIsLoading] = useState<boolean>(false);

    // ATOMS
                
    const setHeaderConfig = useSetAtom(headerConfigAtom);

    // FETCHING DATA

    // ------------------------------------------------------------------------------------------------------------------
    /**
     * @ES OBTIENE LOS DATOS DEL VEHICULO
     * @EN GETS THE VEHICLE DATA
     */
    // ------------------------------------------------------------------------------------------------------------------
    const [data, loading] = useFetch(useCallback(async () => {
        const response = await (await service.getVehicleById(id as string)).getResponseData();
        if (!response.data) toast.error(response.message || "Error al cargar el Vehículo");
        return response as Vehicle;
    }, [id]));
    // ------------------------------------------------------------------------------------------------------------------

    // ------------------------------------------------------------------------------------------------------------------
    /**
     * @ES EDITA EL VEHICULO
     * @EN EDITS THE VEHICLE
     */
    // ------------------------------------------------------------------------------------------------------------------
    const handleSubmit = async (values: any) => {
        setIsLoading(true);
        try {
            const response = (await service.editVehicle(values)).getResponseData();

            if (response.success) {
                navigate(-1);
                toast.success("Vehículo editado correctamente");
            } else {
                handleErrors(response);
            }
        } catch (error: any) {
            toast.error("Error al editar el vehículo");
        } finally {
            setIsLoading(false);
        }
    };
    // ------------------------------------------------------------------------------------------------------------------

    // USE EFFECT

    useEffect(() => {

        if (data === null || data === undefined) return;

        // CONFIGURE HEADER TITLE AND ICON

        setHeaderConfig({
            title: "PERFIL DEL VEHÍCULO: " + (data.plateNumber),
            icon: <VehicleIcon className="app-sub-icon w-9 h-9" />,
            breadcrumbs: [
                { label: 'Inicio', path: '/' },
                { label: 'Vehículos', path: '/vehicles' },
                { label: 'Editar', active: true }
            ]
        });
        
        // CLEANUP EFFECT

        return () => {
            setHeaderConfig(null);
        };
    
    }, [navigate, data]);

    // RENDER

    if (loading) return <Loader />;

    return (
        <>
            <FormCard title="Datos Principales" className="mb-4">
                {(data !== null && data !== undefined) && <VehicleForm data={data} submit={handleSubmit} isLoading={isLoading} />}
            </FormCard>
        </>
    );
};

export default VehicleEdit;