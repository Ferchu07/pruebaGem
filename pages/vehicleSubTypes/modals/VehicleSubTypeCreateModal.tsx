import { FC, useState } from "react";
import { Modal, Button } from "rizzui";
import { toast } from "sonner";
import VehicleTypesForm from "../VehicleSubTypesForm";
import { ReactComponent as CloseIcon } from '../../../assets/Iconos/Interfaz/close_02.svg';
import { VehicleSubTypeService } from "../../../services/vehicleSubType/vehicleSubTypeService";

interface VehicleSubTypeCreateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreated?: () => void;
}

const VehicleSubTypeCreateModal: FC<VehicleSubTypeCreateModalProps> = ({
    isOpen,
    onClose,
    onCreated
}) => {

    // HOOKS 

    const service = new VehicleSubTypeService();

    // STATES

    const [loading, setLoading] = useState(false);

    // METHODS 

    // --------------------------------------------------------------------------
    /**
     * @ES CREA UN NUEVO SUBTIPO DE VEHICULO
     * @EN CREATES A NEW VEHICLE SUBTYPE
     * 
     * @param values 
     * @returns VehicleSubType
     */
    // --------------------------------------------------------------------------
    const handleSubmit = async (values: any) => {
        setLoading(true);

        try {
            const response = await service.createVehicleSubType(values);
            const responseData = response.getResponseData();

            if (responseData.success) {
                toast.success(responseData.message);
                onClose();
                onCreated?.(); // refresca listado de tipos de vehículos
            } else {
                toast.error(responseData.message);
            }
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };
    // --------------------------------------------------------------------------

    // RENDER

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
                            Crear nuevo tipo de vehículo
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
                <VehicleTypesForm submit={handleSubmit} isLoading={loading} onClose={onClose} />

            </div>
        </Modal>
    );
};

export default VehicleSubTypeCreateModal;
