import { useFormik } from "formik";
import { FC, useState } from "react";
import { ReactComponent as CloseIcon } from '../../../assets/Iconos/Interfaz/close_02.svg';
import { Button, Modal } from "rizzui";
import { toast } from "sonner";
import CustomSelectApiHookForm from "../../../components/forms/CustomSelectApiHookForms";
import useVehicleSubTypes from "../../../hooks/api-calls/useVehicleSubTypes";
import { VehicleTypeService } from "../../../services/vehicleType/vehicleTypeService";
import FormFooter from "../../_layout/_footers/form-footer";

interface VehicleTypeSubtypesModalProps {
    data: any | null;
    isOpen: boolean;
    onClose: () => void;
    onUpdated?: () => void;
}

const VehicleTypeSubtypesModal: FC<VehicleTypeSubtypesModalProps> = ({
    data,
    isOpen,
    onClose,
    onUpdated
}) => {

    // HOOKS

    const service = new VehicleTypeService();
    const { fetchVehicleSubTypes } = useVehicleSubTypes();

    // STATES

    const [submitting, setSubmitting] = useState(false);

    // METHODS

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            vehicleSubTypes: data?.vehicleSubTypes?.map((st: any) => st.id) || [],
        },
        onSubmit: async (values) => {
            if (!data?.id) return;
            setSubmitting(true);
            try {
                const response = await service.adminTypeSubtypes(data.id, values.vehicleSubTypes);
                const responseData = response.getResponseData();
                if (responseData.success) {
                    toast.success(responseData.message);
                    onClose();
                    onUpdated?.();
                } else {
                    toast.error(responseData.message);
                }
            } catch (error: any) {
                toast.error(error.message);
            } finally {
                setSubmitting(false);
            }
        },
    });

    // RENDER

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="lg"
            containerClassName="border-2 border-black"
        >
            <div className="p-6">

                {/* HEADER */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h4 className="text-xl font-semibold text-gray-900">
                            Gestionar Subtipos
                        </h4>
                        <p className="text-sm text-gray-500">
                            {data ? `Para el tipo de vehículo: ${data.name}` : 'Cargando...'}
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
                {data && (
                        <form onSubmit={formik.handleSubmit}>
                            <div className="mb-6">
                                <CustomSelectApiHookForm
                                    key={data?.id || 'loading'}
                                    id='vehicleSubTypes'
                                    label="Subtipos de vehículo"
                                    isMulti
                                    formik={formik}
                                    minInputLength={0}
                                    fetchOptions={async (searchText: string | null) => {
                                        if (!searchText) {
                                            return data?.vehicleSubTypes?.map((st: any) => ({
                                                value: st.id,
                                                label: st.orionName ? `${st.name} (${st.orionName})` : st.name
                                            })) || [];
                                        }
                                        return fetchVehicleSubTypes({ search_text: searchText });
                                    }}
                                    error={
                                        (formik.touched.vehicleSubTypes || formik.submitCount > 0)
                                            ? formik.errors.vehicleSubTypes
                                            : undefined
                                    }
                                />
                            </div>

                            <FormFooter
                                submitBtnText="Guardar cambios"
                                customBg='bg-transparent'
                                handleCancelBtn={onClose}
                                handleSubmitBtn={formik.submitForm}
                                isLoading={submitting}
                            />
                        </form>
                    )
                }

            </div>
        </Modal>
    );
};

export default VehicleTypeSubtypesModal;
