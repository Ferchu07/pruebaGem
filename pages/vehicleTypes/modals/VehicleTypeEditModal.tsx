import { FC, useCallback, useState } from "react";
import { Modal, Button } from "rizzui";
import { toast } from "sonner";
import useFetch from "../../../hooks/useFetch";
import { Loader } from "../../../components/loader/SpinnerLogo";
import VehicleTypesForm from "../VehicleTypesForm";
import { VehicleType } from "../../../type/entities/vehicle-type-type";
import { VehicleTypeService } from "../../../services/vehicleType/vehicleTypeService";
import { ReactComponent as CloseIcon } from '../../../assets/Iconos/Interfaz/close_02.svg';

interface VehicleTypeEditModalProps {
    vehicleTypeId: string | null;
    isOpen: boolean;
    onClose: () => void;
    onUpdated?: () => void;
}

const VehicleTypeEditModal: FC<VehicleTypeEditModalProps> = ({
    vehicleTypeId,
    isOpen,
    onClose,
    onUpdated
}) => {

    // HOOKS

    const service = new VehicleTypeService();

    // STATES

    const [submitting, setSubmitting] = useState(false);

    // METHODS

    // --------------------------------------------------------------------------
    /**
     * @ES OBTIENE EL TIPO DE VEHICULO POR ID
     * @EN GETS A VEHICLE TYPE BY ID
     * 
     * @param vehicleTypeId 
     * @returns VehicleType
     */
    // --------------------------------------------------------------------------
    const [data, loading] = useFetch(useCallback(async () => {
        if (!vehicleTypeId) return null;
        const response = await service.getVehicleTypeById(vehicleTypeId);
        return response.getResponseData() as VehicleType;
    }, [vehicleTypeId]));
    // --------------------------------------------------------------------------

    // --------------------------------------------------------------------------
    /**
     * @ES EDITA UN TIPO DE VEHICULO
     * @EN EDITS A VEHICLE TYPE
     * 
     * @param values 
     * @returns VehicleType
     */
    // --------------------------------------------------------------------------
    const handleSubmit = async (values: any) => {
        setSubmitting(true);

        const { vehicleSubTypes, ...vehicleTypeData } = values;

        try {
            const response = await service.editVehicleType(vehicleTypeData);
            const responseData = response.getResponseData();

            if (responseData.success) {

                if (vehicleSubTypes) {
                    await service.adminTypeSubtypes(vehicleTypeData.vehicleTypeId, vehicleSubTypes);
                }

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
                            Editar Tipo de Vehículo
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
                        />
                    )
                )}

            </div>
        </Modal>
    );
};

export default VehicleTypeEditModal;
