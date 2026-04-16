import React, { FC, useState } from "react";
import { Modal, Button } from "rizzui";
import { toast } from "sonner";
import { ModelService } from "../../../services/model/modelService";
import ModelForm from "../ModelForm";
import { ReactComponent as CloseIcon } from '../../../assets/Iconos/Interfaz/close_02.svg';

interface ModelCreateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreated?: () => void;
}

const ModelCreateModal: FC<ModelCreateModalProps> = ({
    isOpen,
    onClose,
    onCreated
}) => {

    const service = new ModelService();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (values: any) => {
        setLoading(true);

        try {
            const response = await service.createModel(values);
            const responseData = response.getResponseData();

            if (responseData.success) {
                toast.success(responseData.message);
                onClose();
                onCreated?.(); // refresca listado
            } else {
                toast.error(responseData.message);
            }
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
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
                            Crear nuevo modelo
                        </h4>
                        <p className="text-sm text-gray-500">
                            Complete los datos principales
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

                {/* FORM */}
                <ModelForm submit={handleSubmit} isLoading={loading} />

            </div>
        </Modal>
    );
};

export default ModelCreateModal;
