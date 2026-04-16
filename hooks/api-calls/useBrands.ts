import { useState } from 'react';
import { BrandService } from '../../services/brand/brandService';

/*----------------------------------------------------------------------------------------
* EN: Hook to manage roles by user fetching and transformation logic.
* ES: Hook para gestionar la lógica de obtención y transformación de roles del usuario.
----------------------------------------------------------------------------------------*/

const useBrands = (initialFilters = {}) => {

    const [data, setData] = useState<any[]>([]);
    const filters = {
        limit: 200,
        filter_filters: { ...initialFilters }
    };

    const fetchBrands = async (f?: any) => {
        const newFilters = { ...filters, filter_filters: { ...filters.filter_filters, ...f } };

        try {
            const response = await (new BrandService()).listBrandsForSelectors(newFilters);
            const fetchedData = response.getResponseData().data;

            if (fetchedData && fetchedData?.brands) 
            {
                const mappedData = fetchedData.brands
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
            console.log('Error fetching brands:', error);
        }
    };

    const getBrandsList = () => {
        return data;
    };

    return { fetchBrands, getBrandsList };
}

export default useBrands;