import { useEffect, useState } from 'react';
import { GroupService } from '../../services/metrics/groupService';

/*----------------------------------------------------------------------------------------
* EN: Hook to manage groups by user fetching and transformation logic.
* ES: Hook para gestionar la lógica de obtención y transformación de grupos del usuario.
----------------------------------------------------------------------------------------*/

const useGroups = (initialFilters = {}) => {

    const [data, setData] = useState<any[]>([]);
    const filters = {
        limit: 1000,
        filter_filters: { ...initialFilters }
    };

    const fetchGroups = async (f?: any) => {
        const newFilters = { ...filters, filter_filters: { ...filters.filter_filters, ...f } };

        try {
            const response = await (new GroupService()).listGroupsForSelect(newFilters);
            const fetchedData = response.getResponseData().data;

            if (fetchedData && fetchedData?.groups) 
            {
                const mappedData = fetchedData.groups
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
            console.log('Error fetching groups:', error);
        }
    };

    useEffect(() => {
        fetchGroups();
    }, []);

    const getGroupList = () => {
        return data;
    };

    return { fetchGroups, getGroupList };
}

export default useGroups;
