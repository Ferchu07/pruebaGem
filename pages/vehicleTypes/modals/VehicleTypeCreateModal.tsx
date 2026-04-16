import { FC, useState } from "react";
import { Modal, Button } from "rizzui";
import { toast } from "sonner";
import { VehicleTypeService } from "../../../services/vehicleType/vehicleTypeService";
import VehicleTypesForm from "../VehicleTypesForm";
import { ReactComponent as CloseIcon } from '../../../assets/Iconos/Interfaz/close_02.svg';

interface VehicleTypeCreateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreated?: () => void;
}

const VehicleTypeCreateModal: FC<VehicleTypeCreateModalProps> = ({
    isOpen,
    onClose,
    onCreated
}) => {

    // HOOKS 

    const service = new VehicleTypeService();

    // STATES

    const [loading, setLoading] = useState(false);

    // METHODS 

    // --------------------------------------------------------------------------
    /**
     * @ES CREA UN NUEVO TIPO DE VEHICULO
     * @EN CREATES A NEW VEHICLE TYPE
     * 
     * @param values 
     * @returns VehicleType
     */
    // --------------------------------------------------------------------------
    const handleSubmit = async (values: any) => {
        setLoading(true);

        const { vehicleSubTypes, ...vehicleTypeData } = values;

        try {
            const response = await service.createVehicleType(vehicleTypeData);
            const responseData = response.getResponseData();

            if (responseData.success) {
                
                if (vehicleSubTypes && vehicleSubTypes.length > 0) {
                    await service.adminTypeSubtypes(responseData.data.id, vehicleSubTypes);
                }

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
                <VehicleTypesForm submit={handleSubmit} isLoading={loading} />

            </div>
        </Modal>
    );
};

export default VehicleTypeCreateModal;
