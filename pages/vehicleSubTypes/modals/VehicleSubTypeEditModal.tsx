import { FC, useCallback, useState } from "react";
import { Modal, Button } from "rizzui";
import { toast } from "sonner";
import useFetch from "../../../hooks/useFetch";
import { Loader } from "../../../components/loader/SpinnerLogo";
import VehicleTypesForm from "../VehicleSubTypesForm";
import { ReactComponent as CloseIcon } from '../../../assets/Iconos/Interfaz/close_02.svg';
import { VehicleSubTypeService } from "../../../services/vehicleSubType/vehicleSubTypeService";
import { VehicleSubType } from "../../../type/entities/vehicle-subtype-type";

interface VehicleSubTypeEditModalProps {
    vehicleSubTypeId: string | null;
    isOpen: boolean;
    onClose: () => void;
    onUpdated?: () => void;
}

const VehicleSubTypeEditModal: FC<VehicleSubTypeEditModalProps> = ({
    vehicleSubTypeId,
    isOpen,
    onClose,
    onUpdated
}) => {

    // HOOKS

    const service = new VehicleSubTypeService();

    // STATES

    const [submitting, setSubmitting] = useState(false);

    // METHODS

    // --------------------------------------------------------------------------
    /**
     * @ES OBTIENE EL SUBTIPO DE VEHICULO POR ID
     * @EN GETS A VEHICLE SUBTYPE BY ID
     * 
     * @param vehicleSubTypeId 
     * @returns VehicleSubType
     */
    // --------------------------------------------------------------------------
    const [data, loading] = useFetch(useCallback(async () => {
        if (!vehicleSubTypeId) return null;
        const response = await service.getVehicleSubTypeById(vehicleSubTypeId);
        return response.getResponseData() as VehicleSubType;
    }, [vehicleSubTypeId]));
    // --------------------------------------------------------------------------

    // --------------------------------------------------------------------------
    /**
     * @ES EDITA UN SUBTIPO DE VEHICULO
     * @EN EDITS A VEHICLE SUBTYPE
     * 
     * @param values 
     * @returns VehicleSubType
     */
    // --------------------------------------------------------------------------
    const handleSubmit = async (values: any) => {
        setSubmitting(true);

        try {
            const response = await service.editVehicleSubType(values);
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
                            Editar Subtipo de Vehículo
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
                        <VehicleTypesForm
                            data={data}
                            submit={handleSubmit}
                            isLoading={submitting}
                            onClose={onClose}
                        />
                    )
                )}

            </div>
        </Modal>
    );
};

export default VehicleSubTypeEditModal;
