import { useEffect, useState } from 'react';
import { ModelService } from '../../services/model/modelService';
import { EcuService } from '../../services/metrics/ecuService';

/*----------------------------------------------------------------------------------------
* EN: Hook to manage ecus by user fetching and transformation logic.
* ES: Hook para gestionar la lógica de obtención y transformación de roles del usuario.
----------------------------------------------------------------------------------------*/

const useEcus = (initialFilters = {}) => {

    const [data, setData] = useState<any[]>([]);
    const filters = {
        limit: 200,
        filter_filters: { ...initialFilters }
    };

    const fetchEcus = async (f?: any) => {
        const newFilters = { ...filters, filter_filters: { ...filters.filter_filters, ...f } };

        try {
            const response = await (new EcuService()).listEcusForSelect(newFilters);
            const fetchedData = response.getResponseData().data;

            if (fetchedData && fetchedData?.ecus) 
            {
                const mappedData = fetchedData.ecus
                    .map((data: { id: string; name: string;}) => ({
                        value: data.id,
                        label: `${data.name}`,
                    }));
                setData(mappedData);
                return mappedData;
            }
        } 
        catch (error) 
        {
            console.log('Error fetching models:', error);
        }
    };

    useEffect(() => {
        fetchEcus();
    }, []);

    const getEcuList = () => {
        return data;
    };

    return { fetchEcus, getEcuList };
}

export default useEcus;
