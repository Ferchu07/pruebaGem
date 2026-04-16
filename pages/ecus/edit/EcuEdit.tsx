import { FC, useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Loader } from "../../../components/loader/SpinnerLogo";
import useFetch from "../../../hooks/useFetch";
import useHandleErrors from "../../../hooks/useHandleErrors";
import { Ecu } from "../../../type/entities/ecu-type";
import EcuForm from "../EcuForm";
import { EcuService } from "../../../services/metrics/ecuService";
import { ReactComponent as EditarIcon } from '../../../assets/Iconos/Interfaz/editar.svg';
import { headerConfigAtom } from "../../../atoms/headerAtoms";
import { useSetAtom } from "jotai";

const EcuEdit: FC = () => {

    // HOOKS

    const { id = "" } = useParams<{ id: string }>();
    const { handleErrors } = useHandleErrors();
    const navigate = useNavigate();
    const service = new EcuService();

    // ATOMS

    const setHeaderConfig = useSetAtom(headerConfigAtom);

    // STATES

    const [isLoading, setIsLoading] = useState<boolean>(false);

    // FUNCTIONS

    //-----------------------------------------------------------------------------------------------
    /**
     * @ES OBTIENE UNA ECU POR ID
     * @EN GETS AN ECU BY ID
     */
    //-----------------------------------------------------------------------------------------------
    const [data, loading] = useFetch(useCallback(async () => {
        const response = await (await service.getEcu(id as string)).getResponseData();
        if (!response.data) toast.error(response.message || "Error al cargar la ecu");
        return response as Ecu;
    }, [id]));
    //-----------------------------------------------------------------------------------------------

    //-----------------------------------------------------------------------------------------------
    /**
     * @ES EDITA UNA ECU
     * @EN EDITS AN ECU
     */
    //-----------------------------------------------------------------------------------------------
    const handleSubmit = async (values: any) => {
        setIsLoading(true);
        try {
            const response = (await service.editEcu(values)).getResponseData();

            if (response.success) {
                navigate(-1);
                toast.success("Ecu editada correctamente");
            } else {
                handleErrors(response);
            }
        } catch (error: any) {
            toast.error("Error al editar la ecu");
        } finally {
            setIsLoading(false);
        }
    };
    //-----------------------------------------------------------------------------------------------

    // USE EFFECT

    useEffect(() => {

        // IF DATA IS NULL, THEN RETURN
        if (data === null || data === undefined) return;

        // CONFIGURE HEADER TITLE AND ICON

        setHeaderConfig({
            title: `EDITAR ECU : ${data.name}`,
            icon: <EditarIcon className="app-sub-icon" />,
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
                    label: `Editar ECU : ${data.name}`,
                    path: `/ecus/${id}/edit`,
                    active: true
                }
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
            {(data !== null && data !== undefined) && <EcuForm data={data} submit={handleSubmit} isLoading={isLoading} />}
        </>
    );
};

export default EcuEdit;