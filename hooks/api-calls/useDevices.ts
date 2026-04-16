import { useCallback, useEffect, useState } from 'react';
import { usePrivilege } from '../../components/priviledge/PriviledgeProvider';
import { DeviceService } from '../../services/device/deviceService';

/*----------------------------------------------------------------------------------------
* EN: Hook to manage device fetching and transformation logic.
* ES: Hook para gestionar la lógica de obtención y transformación de dispositivos.
----------------------------------------------------------------------------------------*/

const useDevices = () => {

    const { userCan } = usePrivilege();
    const [data, setData] = useState<any[]>([]);

    const fetchDevices = useCallback(async (deviceId?: string) => {
        try {
            if (!userCan('list_devices', 'devices')) return;
            const service = new DeviceService();
            const response = await service.listForSelectDevices();
            const fetchedData = response.getResponseData();

            if (fetchedData && fetchedData?.data) {
                const mappedData = fetchedData.data?.map((data: { id: string; serialNumber: string; model: string; companyName: string }) => ({
                    value: data.id,
                    label: data.serialNumber + ' (' + data.model + ')' + (data.companyName ? ` - ${data.companyName}` : ''),
                }));
                setData(mappedData);
            }
        } catch (error) {
            console.log('Error fetching devices:', error);
        }
    }, []);

    useEffect(() => {
        fetchDevices();
    }, []);

    const getDevicesList = () => {
        return data;
    };

    return { fetchDevices, getDevicesList };
}

export default useDevices;