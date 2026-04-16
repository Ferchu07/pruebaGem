import { Dispatch, SetStateAction } from 'react';
import { Button } from 'rizzui';
import { toast } from 'sonner';
import { ReactComponent as AsignarEmpresaIcon } from '../../../assets/Iconos/Interfaz/asignar_empresa.svg';
import { ReactComponent as DesasignarEmpresaIcon } from '../../../assets/Iconos/Interfaz/desasignar_empresa.svg';
import useHandleErrors from '../../../hooks/useHandleErrors';
import { DeviceService } from '../../../services/device/deviceService';

interface AssignToCompanyButtonMultipleProps {
  selectedRows?: [];
  setOpenModal: Dispatch<SetStateAction<boolean>>;
  setDeviceIds: Dispatch<SetStateAction<any[]>>;
  refetch: any
}

const AssignToCompanyButtonMultiple = ({ selectedRows, setOpenModal, setDeviceIds, refetch }: AssignToCompanyButtonMultipleProps) => {

  const { handleErrors } = useHandleErrors();

  // RENDER

  return (
    <>
      {selectedRows && selectedRows.length > 0
        ? (
          <Button
            as="span"
            size="sm"
            variant="outline"
            className="hover:!border-gray-900 hover:text-gray-700 cursor-pointer"
            onClick={() => {
              setOpenModal(true)
              if (selectedRows) {
                setDeviceIds(selectedRows.map((row: any) => row?.original?.id))
              }
            }}
          >
            <AsignarEmpresaIcon className="h-4 w-4 me-2" />
            Asignar a empresa
          </Button>
        )
        : null
      }
      {selectedRows && selectedRows.length > 0
        ? (
          <Button
            as="span"
            size="sm"
            variant="outline"
            className="hover:!border-gray-900 hover:text-gray-700 cursor-pointer"
            onClick={async () => {
              if (selectedRows) {
                const service = new DeviceService();
                try {
                  let response = await (await service.unassignCompany(selectedRows.map((row: any) => row?.original?.id))).getResponseData();
                  if (response && response.success) {
                    toast.success(`Empresas desasignadas correctamente`);
                    refetch();
                  } else {
                    handleErrors(response);
                  }
                } catch (error) {
                  console.error('Error al desasignar las empresas:', error);
                }
              }
            }}
          >
            <DesasignarEmpresaIcon className="h-4 w-4 me-2" />
            Desasignar Empresas
          </Button>
        )
        : null
      }
    </>
  );

}

export default AssignToCompanyButtonMultiple;