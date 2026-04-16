import { useState } from 'react';
import { UserService } from '../../services/user/userService';
import { Organisation } from '../../type/entities/organisation-type';

/*----------------------------------------------------------------------------------------
* EN: Hook to manage roles by user fetching and transformation logic.
* ES: Hook para gestionar la lógica de obtención y transformación de roles del usuario.
----------------------------------------------------------------------------------------*/

const useRolesByUser = (initialFilters = {}) => {

    const [data, setData] = useState<any[]>([]);
    const filters = {
        limit: 200,
        filter_filters: { ...initialFilters }
    };

    const fetchRoles = async (f?: any) => {
        const newFilters = { ...filters, filter_filters: { ...filters.filter_filters, ...f } };
        try {
            const response = await (new UserService()).listRolesByUser(newFilters);
            const fetchedData = response.getResponseData().data;

            if (fetchedData && fetchedData?.data) {
                const mappedData = fetchedData.data
                    .filter((data: { company: Organisation }) => !!data.company)
                    .map((data: { id: string; name: string; company: Organisation }) => ({
                        value: data.id,
                        label: `${data.name} (${data.company?.name})`,
                    }));
                setData(mappedData);
                return mappedData;
            }
        } catch (error) {
            console.log('Error fetching roles:', error);
        }
    };

    const getRolesList = () => {
        return data;
    };

    return { fetchRoles, getRolesList };
}

export default useRolesByUser;