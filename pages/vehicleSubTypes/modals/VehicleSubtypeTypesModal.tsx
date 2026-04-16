import { useFormik } from "formik";
import { FC, useState } from "react";
import { ReactComponent as CloseIcon } from '../../../assets/Iconos/Interfaz/close_02.svg';
import { Button, Modal } from "rizzui";
import { toast } from "sonner";
import CustomSelectApiHookForm from "../../../components/forms/CustomSelectApiHookForms";
import useVehicleTypes from "../../../hooks/api-calls/useVehicleTypes";
import { VehicleSubTypeService } from "../../../services/vehicleSubType/vehicleSubTypeService";
import FormFooter from "../../_layout/_footers/form-footer";

interface VehicleSubtypeTypesModalProps {
    data: any | null;
    isOpen: boolean;
    onClose: () => void;
    onUpdated?: () => void;
}

const VehicleSubtypeTypesModal: FC<VehicleSubtypeTypesModalProps> = ({
    data,
    isOpen,
    onClose,
    onUpdated
}) => {

    // HOOKS

    const service = new VehicleSubTypeService();
    const { fetchVehicleTypes } = useVehicleTypes();

    // STATES

    const [submitting, setSubmitting] = useState(false);

    // METHODS

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            vehicleTypes: data?.types?.map((vt: any) => vt.id) || [],
        },
        onSubmit: async (values) => {
            if (!data?.id) return;
            setSubmitting(true);
            try {
                const response = await service.adminSubtypeTypes(data.id, values.vehicleTypes);
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
                            Gestionar Tipos
                        </h4>
                        <p className="text-sm text-gray-500">
                            {data ? `Para el subtipo de vehículo: ${data.name}` : 'Cargando...'}
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
                                    id='vehicleTypes'
                                    label="Tipos de vehículo"
                                    isMulti
                                    formik={formik}
                                    minInputLength={0}
                                    fetchOptions={async (searchText: string | null) => {
                                        if (!searchText) {
                                            return data?.types?.map((vt: any) => ({
                                                value: vt.id,
                                                label: `${vt.name} (${vt.orionName || ''})`
                                            })) || [];
                                        }
                                        return fetchVehicleTypes({ search_text: searchText });
                                    }}
                                    error={
                                        (formik.touched.vehicleTypes || formik.submitCount > 0)
                                            ? formik.errors.vehicleTypes
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

export default VehicleSubtypeTypesModal;
