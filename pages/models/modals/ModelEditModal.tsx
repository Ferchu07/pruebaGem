import React, { FC, useCallback, useState } from "react";
import { Modal, Button } from "rizzui";
import { toast } from "sonner";
import useFetch from "../../../hooks/useFetch";
import { Loader } from "../../../components/loader/SpinnerLogo";
import { ModelService } from "../../../services/model/modelService";
import { Model } from "../../../type/entities/model-type";
import ModelForm from "../ModelForm";
import { ReactComponent as CloseIcon } from '../../../assets/Iconos/Interfaz/close_02.svg';

interface ModelEditModalProps {
    modelId: string | null;
    isOpen: boolean;
    onClose: () => void;
    onUpdated?: () => void;
}

const ModelEditModal: FC<ModelEditModalProps> = ({
    modelId,
    isOpen,
    onClose,
    onUpdated
}) => {

    const service = new ModelService();
    const [submitting, setSubmitting] = useState(false);

    const [data, loading] = useFetch(useCallback(async () => {
        if (!modelId) return null;
        const response = await service.getModelById(modelId);
        return response.getResponseData() as Model;
    }, [modelId]));

    const handleSubmit = async (values: any) => {
        setSubmitting(true);

        try {
            const response = await service.editModel(values);
            const responseData = response.getResponseData();

            if (responseData.success) {
                toast.success(responseData.message);
                onClose();
                onUpdated?.(); // refresca tabla
            } else {
                toast.error(responseData.message);
            }
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="xl"
            containerClassName="border-2 border-black"
        >
            <div className="p-6">

                {/* HEADER */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h4 className="text-xl font-semibold text-gray-900">
                            Editar modelo
                        </h4>
                        <p className="text-sm text-gray-500">
                            Modifique los datos necesarios
                        </p>
                    </div>

                    <Button
                        size="sm"
                        variant="text"
                        onClick={onClose}
                    >
                        <CloseIcon className="h-8 w-8" />
                    </Button>
                </div>

                {/* CONTENT */}
                {loading ? (
                    <div className="py-10 flex justify-center">
                        <Loader />
                    </div>
                ) : (
                    data && (
                        <ModelForm
                            data={data}
                            submit={handleSubmit}
                            isLoading={submitting}
                        />
                    )
                )}

            </div>
        </Modal>
    );
};

export default ModelEditModal;
