import React, { FC, useState } from "react";
import { Modal, Button } from "rizzui";
import { toast } from "sonner";
import { BrandService } from "../../../services/brand/brandService";
import BrandForm from "../BrandForm";
import { ReactComponent as CloseIcon } from '../../../assets/Iconos/Interfaz/close_02.svg';


interface BrandCreateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreated?: () => void;
}

const BrandCreateModal: FC<BrandCreateModalProps> = ({
    isOpen,
    onClose,
    onCreated
}) => {

    // STATES

    const [loading, setLoading] = useState(false);

    // HOOKS

    const service = new BrandService();
   
    // FUNCTIONS

    // --------------------------------------------------------------------------------------------
    /**
     * @ES CREA UNA NUEVA MARCA
     * @EN CREATES A NEW BRAND
     * 
     * @param values 
     */
    // --------------------------------------------------------------------------------------------
    const handleSubmit = async (values: any) => {
        setLoading(true);

        try {
            const response = await service.createBrand(values);
            const responseData = response.getResponseData();

            if (responseData.success) {
                toast.success(responseData.message);
                onClose();
                onCreated?.();
            } else {
                responseData?.data?.errors?.forEach((error: any) => {
                    toast.error(error.message);
                });
            }
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    // RENDER

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="xl"
            containerClassName="border-2 border-black"
        >
            <div className="p-6">

                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h4 className="text-xl font-semibold text-gray-900">
                            Crear nueva marca
                        </h4>
                        <p className="text-sm text-gray-500">
                            Complete los datos principales
                        </p>
                    </div>

                    <Button
                        size="sm"
                        variant="outline"
                        onClick={onClose}
                        className="border-none"
                    >
                        <CloseIcon className="h-8 w-8" />
                    </Button>
                </div>

                <BrandForm submit={handleSubmit} isLoading={loading} />

            </div>
        </Modal>
    );
};

export default BrandCreateModal;
