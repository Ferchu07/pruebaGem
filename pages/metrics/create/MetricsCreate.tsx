import { FC, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import FormCard from "../../../components/card/FormCard";
import useHandleErrors from "../../../hooks/useHandleErrors";
import { useSetAtom } from "jotai";
import { headerConfigAtom } from "../../../atoms/headerAtoms";
import { ReactComponent as NewUserIcon } from '../../../assets/Iconos/Interfaz/nuevo_usuario.svg';
import { MetricService } from "../../../services/metrics/metricService";
import MetricForm from "../MetricsForm";

const MetricCreate: FC = () => {

    // HOOKS

    const { handleErrors } = useHandleErrors();
    const navigate = useNavigate();
    const service = new MetricService();

    // STATES

    const [loading, setLoading] = useState<boolean>(false);

    // ATOMS
            
    const setHeaderConfig = useSetAtom(headerConfigAtom);

    // FUNCTIONS

    // --------------------------------------------------------------------------------------
    /**
     * @ES MANEJA EL ENVIO DEL FORMULARIO DE CREACIÓN DE MÉTRICA.
     * @EN HANDLES THE SUBMISSION OF THE METRIC CREATION FORM.
     * 
     * @param values
     */
    // --------------------------------------------------------------------------------------
    const handleSubmit = async (values: any) => {
        setLoading(true);
        try {
            const formData = new FormData();

            Object.keys(values).forEach(key => {
                const val = values[key];

                if (key === 'options') {
                    if (Array.isArray(val)) {
                        val.forEach((option: any, index: number) => {
                            formData.append(`options[${index}][label]`, option.label || '');
                            formData.append(`options[${index}][value]`, option.value || '');
                            
                            if (option.image instanceof File) {
                                formData.append(`options[${index}][image]`, option.image);
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

            const response = await (await service.createMetric(formData as any)).getResponseData();

            if (response.success) {
                navigate(-1);
                toast.success("Metrica creada correctamente");
            } else {
                handleErrors(response);
            }
        } catch (error: any) {
            toast.error("Error al crear la metrica");
        } finally {
            setLoading(false);
        }
    };
    // --------------------------------------------------------------------------------------

    // USE EFFECT

    useEffect(() => {

        // CONFIGURE HEADER TITLE AND ICON

        setHeaderConfig({
            title: "CREAR MÉTRICA",
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
                    label: "Métricas",
                    path: "/metrics",
                },
                {
                    label: "Crear Métrica",
                    path: "/metrics/create",
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
                <MetricForm submit={handleSubmit} isLoading={loading} />
            </FormCard>
        </>
    );
};

export default MetricCreate;
