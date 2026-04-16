import { FC, useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Loader } from "../../../components/loader/SpinnerLogo";
import useFetch from "../../../hooks/useFetch";
import useHandleErrors from "../../../hooks/useHandleErrors";
import { ReactComponent as EditarIcon } from '../../../assets/Iconos/Interfaz/editar.svg';
import { headerConfigAtom } from "../../../atoms/headerAtoms";
import { useSetAtom } from "jotai";
import { Metric } from "../../../type/entities/metric-type";
import MetricForm from "../MetricsForm";
import { MetricService } from "../../../services/metrics/metricService";
import FormCard from "../../../components/card/FormCard";

const MetricEdit: FC = () => {

    // HOOKS

    const { id = "" } = useParams<{ id: string }>();
    const { handleErrors } = useHandleErrors();
    const navigate = useNavigate();
    const service = new MetricService();

    // ATOMS

    const setHeaderConfig = useSetAtom(headerConfigAtom);

    // STATES

    const [isLoading, setIsLoading] = useState<boolean>(false);

    // FUNCTIONS

    //-----------------------------------------------------------------------------------------------
    /**
     * @ES OBTIENE UNA MÉTRICA POR ID
     * @EN GETS A METRIC BY ID
     */
    //-----------------------------------------------------------------------------------------------
    const [data, loading] = useFetch(useCallback(async () => {
        const response = await (await service.getMetric(id as string)).getResponseData();
        if (!response.data) toast.error(response.message || "Error al cargar la métrica");
        return response as Metric;   
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
            const formData = new FormData();

            // Append values
            Object.keys(values).forEach(key => {
                const val = values[key];

                if (key === 'options') {
                    if (Array.isArray(val)) {
                        val.forEach((option: any, index: number) => {
                            formData.append(`options[${index}][label]`, option.label || '');
                            formData.append(`options[${index}][value]`, option.value || '');
                            
                            if (option.id) {
                                formData.append(`options[${index}][id]`, option.id);
                            }

                            if (option.image instanceof File) {
                                formData.append(`options[${index}][image]`, option.image);
                            } else if (option.image && typeof option.image === 'object' && option.image.id) {
                                // Existing image object (ProfileImg)
                                formData.append(`options[${index}][image][id]`, option.image.id);
                            }
                        });
                    }
                } else if (key === 'profileImg') {
                    if (val instanceof File) {
                        formData.append('profileImg', val);
                    }
                } else if (key !== 'profileImgUrl' && key !== 'options') {
                    if (val !== null && val !== undefined) {
                        formData.append(key, val as string);
                    }
                }
            });

            const response = await (await service.editMetric(formData as any)).getResponseData();

            if (response.success) {
                navigate(-1);
                toast.success("Métrica editada correctamente");
            } else {
                handleErrors(response);
            }
        } catch (error: any) {
            toast.error("Error al editar la métrica");
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
            title: `EDITAR METRICA : ${data.name}`,
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
                    label: "Metricas",
                    path: "/metrics",
                },
                {
                    label: `Editar Metrica : ${data.name}`,
                    path: `/metrics/${id}/edit`,
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
        <FormCard  title="Datos Principales" className="mb-4">
            {(data !== null && data !== undefined) && <MetricForm data={data} submit={handleSubmit} isLoading={isLoading} />}
        </FormCard>
    );
};

export default MetricEdit;
