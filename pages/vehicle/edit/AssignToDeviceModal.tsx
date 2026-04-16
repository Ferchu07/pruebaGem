import { useFormik } from "formik";
import { useCallback, useEffect, useState } from "react";
import { Button, Loader, Modal } from "rizzui";
import { toast } from "sonner";
import CustomSelect from "../../../components/forms/CustomSelect";
import useHandleErrors from "../../../hooks/useHandleErrors";
import { DeviceService } from "../../../services/device/deviceService";
import { VehicleService } from "../../../services/vehicle/vehicleService";

interface AssignToDeviceModalProps {
    isOpen: boolean;
    vehicleId?: string | null | undefined;
    onClose: () => void;
    refetchData?: any;
}

const AssignToDeviceModal = ({ isOpen, onClose, vehicleId, refetchData }: AssignToDeviceModalProps) => {

    // STATES

    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<any[]>([]);

    // HOOKS

    const { handleErrors } = useHandleErrors();
    const vehicleService = new VehicleService();

    // FUNCTIONS

    //-------------------------------------------------------------------------------------------------------------
    /**
     * @ES OBTENER DISPOSITIVOS
     * @EN FETCH DEVICES
     * @description Obtiene la lista de dispositivos para el selector
     * @returns {Promise<void>}
     */
    //-------------------------------------------------------------------------------------------------------------
    const fetchDevices = useCallback(async () => {
        try {
            const service = new DeviceService();
            const response = await service.listForSelectDevices();
            const fetchedData = response.getResponseData();

            if (fetchedData?.success && fetchedData?.data) {
                const mappedData = fetchedData.data.map((item: { id: string; serialNumber: string; model: string; companyName?: string }) => ({
                    value: item.id,
                    label: item.serialNumber + ' (' + (item.model || '') + ')' + (item.companyName ? ` - ${item.companyName}` : ''),
                }));
                setData(mappedData);
            } else {
                setData([]);
            }
        } catch (error) {
            console.error('Error fetching devices:', error);
            setData([]);
        }
    }, []);
    //-------------------------------------------------------------------------------------------------------------

    //-------------------------------------------------------------------------------------------------------------
    /**
     * @ES ASIGNAR VEHICULO A DISPOSITIVO
     * @EN ASSIGN VEHICLE TO DEVICE
     * 
     * @param values
     */
    //-------------------------------------------------------------------------------------------------------------
    const handleAssignToDevice = async (values: any) => {
        setLoading(true);
        try {
            let response = await (await vehicleService.assignVehicleToDevice(values.vehicleId, values.deviceId)).getResponseData();
            if (response && response.success) {
                toast.success(`Vehículo asignado correctamente`);
                refetchData();
            } else {
                handleErrors(response);
            }
            setLoading(false);
            onClose();
        } catch (error) {
            console.error('Error al editar configuración del equipo:', error);
        } finally {
            setLoading(false);
        }
    }
    //-------------------------------------------------------------------------------------------------------------

    // FORMIK

    const formik = useFormik({
        initialValues: {
            vehicleId: vehicleId,
            deviceId: ''
        },
        onSubmit: (values) => { handleAssignToDevice(values) },
    });

    // USE EFFECTS

    useEffect(() => {
        if (vehicleId) {
            formik.setFieldValue('vehicleId', vehicleId);
        } else {
            formik.resetForm();
        }
    }, [vehicleId]);

    useEffect(() => {
        if (isOpen) {
            fetchDevices();
        }
    }, [isOpen, fetchDevices]);

    // RENDER

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size='sm'
            overlayClassName='backdrop-blur'
            containerClassName='border-2 border-black'
            className='z-[9999] [&_.pointer-events-none]:overflow-visible border-2 border-black'
        >
            <div className='flex items-center justify-between p-4'>
                <h2 className='text-lg font-semibold text-gray-800 dark:text-white'>
                    Asignar Dispositivo a Vehículo
                </h2>
                <button onClick={onClose} className='text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
            <div className='m-auto px-7 pt-6 pb-4'>
                <form onSubmit={formik.handleSubmit}>
                    <div className='mb-4'>
                        {/* DEVICE SELECTOR */}
                        <CustomSelect
                            key={isOpen ? 'assign-device-select' : 'assign-device-select-closed'}
                            isSearchable
                            id={'deviceId'}
                            label="Dispositivo"
                            containerClassName='md:col-span-12 mb-4'
                            value={{ value: formik.values.deviceId, label: data?.find((g: any) => g.value === formik.values.deviceId)?.label }}
                            options={data}
                            onChange={(e: any) => { formik.setFieldValue('deviceId', e?.value) }}
                        />
                    </div>
                </form>
            </div>

            <div className='flex justify-center p-7'>
                <Button
                    onClick={() => formik.handleSubmit()}
                    color='primary'
                    disabled={loading}
                >
                    {loading ? <Loader className='text-white' /> : 'Asignar dispositivo'}
                </Button>
            </div>
        </Modal>
    );
}

export default AssignToDeviceModal;