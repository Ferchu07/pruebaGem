import { useFormik } from "formik";
import { useEffect, useState } from "react";
import { Button, Loader, Modal } from "rizzui";
import { toast } from "sonner";
import CustomSelect from "../../../components/forms/CustomSelect";
import useCompanies from "../../../hooks/api-calls/useCompanies";
import useHandleErrors from "../../../hooks/useHandleErrors";
import { DeviceService } from "../../../services/device/deviceService";

interface AssignToCompanyModalProps {
    isOpen: boolean;
    deviceIds?: string[];
    onClose: () => void;
    refetchData?: any;
}

const AssignToCompanyModal = ({ isOpen, onClose, deviceIds, refetchData }: AssignToCompanyModalProps) => {

    // STATES

    const [loading, setLoading] = useState(false);
    const deviceService = new DeviceService();

    // HOOKS

    const { getCompaniesList } = useCompanies();
    const { handleErrors } = useHandleErrors();

    // FUNCTIONS 

    //-------------------------------------------------------------------------------------------------------------
    /**
     * @ES ASIGNAR DISPOSITIVO A EMPRESA
     * @EN ASSIGN DEVICE TO COMPANY
     * 
     * @param values
     */
    //-------------------------------------------------------------------------------------------------------------
    const handleAssignToCompany = async (values: any) => {
        setLoading(true);
        try {
            let response = await (await deviceService.asignDeviceToCompany(values.deviceIds, values.company)).getResponseData();
            if (response && response.success) {
                toast.success(`Dispositivo${values.deviceIds?.length > 1 ? 's' : ''} asignado correctamente.`);
                refetchData();
            } else {
                handleErrors(response);
            }
            setLoading(false);
            onClose();
        } catch (error) {
            console.error('Error al editar la configuración del equipo:', error);
        } finally {
            setLoading(false);
        }
    }
    //-------------------------------------------------------------------------------------------------------------

    // FORMIK

    const formik = useFormik({
        initialValues: {
            company: '',
            deviceIds: deviceIds
        },
        onSubmit: (values) => { handleAssignToCompany(values) },
    });

    // USE EFFECTS

    useEffect(() => {
        if (deviceIds?.length && deviceIds.length > 0) {
            formik.setFieldValue('deviceIds', deviceIds);
        } else {
            formik.resetForm();
        }
    }, [deviceIds]);

    // RENDER 

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size='sm'
            overlayClassName='backdrop-blur'
            containerClassName='!max-w-xl !shadow-xl'
            className='z-[9999] [&_.pointer-events-none]:overflow-visible'
        >
            <div className='flex items-center justify-between p-4'>
                <h2 className='text-lg font-semibold text-gray-800 dark:text-white'>
                    Asignar Dispositivo a Empresa
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
                        {/* COMPANY SELECTOR */}
                        <CustomSelect
                            isSearchable
                            id={'company'}
                            label="Empresa"
                            containerClassName='md:col-span-12 mb-4'
                            value={{ value: formik.values.company, label: getCompaniesList()?.find((g: any) => g.value === formik.values.company)?.label }}
                            options={getCompaniesList()}
                            onChange={(e: any) => {
                                formik.setFieldValue('company', e?.value)
                            }}
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
                    {loading ? <Loader className='text-white' /> : 'Asignar empresa'}
                </Button>
            </div>
        </Modal>
    );
}
export default AssignToCompanyModal;