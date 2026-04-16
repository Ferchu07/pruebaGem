import { useState } from 'react';
import { ModelService } from '../../services/model/modelService';

/*----------------------------------------------------------------------------------------
* EN: Hook to manage roles by user fetching and transformation logic.
* ES: Hook para gestionar la lógica de obtención y transformación de roles del usuario.
----------------------------------------------------------------------------------------*/

const useModels = (initialFilters = {}) => {

    const [data, setData] = useState<any[]>([]);
    const filters = {
        limit: 200,
        filter_filters: { ...initialFilters }
    };

    const fetchModels = async (f?: any) => {
        const newFilters = { ...filters, filter_filters: { ...filters.filter_filters, ...f } };

        try {
            const response = await (new ModelService()).listModelsForSelect(newFilters);
            const fetchedData = response.getResponseData().data;

            if (fetchedData && fetchedData?.models) 
            {
                const mappedData = fetchedData.models
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

    const getModelsList = () => {
        return data;
    };

    return { fetchModels, getModelsList };
}

export default useModels;