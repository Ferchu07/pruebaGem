import { FC, useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Loader } from "../../../components/loader/SpinnerLogo";
import useFetch from "../../../hooks/useFetch";
import useHandleErrors from "../../../hooks/useHandleErrors";
import { DeviceService } from "../../../services/device/deviceService";
import { Device } from "../../../type/entities/device-type";
import DeviceForm from "../DeviceForm";
import FormCard from "../../../components/card/FormCard";
import { headerConfigAtom } from "../../../atoms/headerAtoms";
import { useSetAtom } from "jotai";
import { ReactComponent as DevicesIcon } from '../../../assets/Iconos/Interfaz/perfil_dispositivo.svg';

const DeviceEdit: FC = () => {

    // STATES

    const { id = "" } = useParams<{ id: string }>();
    const { handleErrors } = useHandleErrors();
    const navigate = useNavigate();
    const service = new DeviceService();

    // ATOMS
    
    const setHeaderConfig = useSetAtom(headerConfigAtom);

    // HOOKS
    
    const [isLoading, setIsLoading] = useState<boolean>(false);

    // FETCHING DATA

    // ------------------------------------------------------------------------------------------------------------------
    /**
     * @ES OBTIENE LOS DATOS DEL DISPOSITIVO
     * @EN GETS THE DEVICE DATA
     */
    // ------------------------------------------------------------------------------------------------------------------
    const [data, loading] = useFetch(useCallback(async () => {
        const response = await (await service.getDeviceById(id as string)).getResponseData();
        if (!response.data) toast.error(response.message || "Error al cargar el dispositivo");
        return response as Device;
    }, [id]));
    // ------------------------------------------------------------------------------------------------------------------
    
    // ------------------------------------------------------------------------------------------------------------------
    /**
     * @ES EDITA EL DISPOSITIVO
     * @EN EDITS THE DEVICE
     */
    // ------------------------------------------------------------------------------------------------------------------
    const handleSubmit = async (values: any) => {
        setIsLoading(true);
        try {
            const response = (await service.editDevice(values)).getResponseData();

            if (response.success) {
                navigate(-1);
                toast.success("Dispositivo editado correctamente");
            } else {
                handleErrors(response);
            }
        } catch (error: any) {
            toast.error("Error al editar el dispositivo");
        } finally {
            setIsLoading(false);
        }
    };
    // ------------------------------------------------------------------------------------------------------------------

    // USE EFFECT

    useEffect(() => {

        // IF DATA IS NULL, THEN RETURN
        if (data === null || data === undefined) return;

        // CONFIGURE HEADER TITLE AND ICON

        setHeaderConfig({
            title: `PERFIL DEL DISPOSITIVO ${data.model}`,
            icon: <DevicesIcon className="app-sub-icon" />,
            breadcrumbs: [
                { label: 'Inicio', path: '/' },
                { label: 'Dispositivos', path: '/devices' },
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
            <FormCard title="" className="mb-4">
                {(data !== null && data !== undefined) && <DeviceForm data={data} submit={handleSubmit} isLoading={isLoading} />}
            </FormCard>
        </>
    );
};

export default DeviceEdit;