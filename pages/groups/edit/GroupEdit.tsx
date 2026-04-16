import { FC, useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Loader } from "../../../components/loader/SpinnerLogo";
import useFetch from "../../../hooks/useFetch";
import useHandleErrors from "../../../hooks/useHandleErrors";
import { ReactComponent as EditarIcon } from '../../../assets/Iconos/Interfaz/editar.svg';
import { headerConfigAtom } from "../../../atoms/headerAtoms";
import { useSetAtom } from "jotai";
import { Group } from "../../../type/entities/group-type";
import { GroupService } from "../../../services/metrics/groupService";
import GroupForm from "../GoupForm";

const GroupEdit: FC = () => {

    // HOOKS

    const { id = "" } = useParams<{ id: string }>();
    const { handleErrors } = useHandleErrors();
    const navigate = useNavigate();
    const service = new GroupService();

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
        const response = await (await service.getGroup(id as string)).getResponseData();
        if (!response.data) toast.error(response.message || "Error al cargar el grupo");
        return response as Group;   
    }, [id]));
    //-----------------------------------------------------------------------------------------------

    //-----------------------------------------------------------------------------------------------
    /**
     * @ES EDITA UN GRUPO
     * @EN EDITS A GROUP
     */
    //-----------------------------------------------------------------------------------------------
    const handleSubmit = async (values: any) => {
        setIsLoading(true);
        try {
            const response = (await service.editGroup(values)).getResponseData();

            if (response.success) {
                navigate(-1);
                toast.success("Grupo editado correctamente");
            } else {
                handleErrors(response);
            }
        } catch (error: any) {
            toast.error("Error al editar el grupo");
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
            title: `EDITAR GRUPO : ${data.name}`,
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
                    label: "Grupos",
                    path: "/groups",
                },
                {
                    label: `Editar Grupo : ${data.name}`,
                    path: `/groups/${id}/edit`,
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
            {(data !== null && data !== undefined) && <GroupForm data={data} submit={handleSubmit} isLoading={isLoading} />}
        </>
    );
};

export default GroupEdit;
