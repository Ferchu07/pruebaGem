import { useCallback, useEffect, useState } from 'react';
import { usePrivilege } from '../../components/priviledge/PriviledgeProvider';
import { RoleService } from '../../services/role/roleService';
import { Organisation } from '../../type/entities/organisation-type';

/*----------------------------------------------------------------------------------------
* EN: Hook to manage roles fetching and transformation logic.
* ES: Hook para gestionar la lógica de obtención y transformación de roles.
----------------------------------------------------------------------------------------*/

const useRoles = () => {

    const { userCan } = usePrivilege();
    const [data, setData] = useState<any[]>([]);

    const fetchRoles = useCallback(async (companyId?: string) => {
        if (!userCan('list_roles', 'roles')) return;
        try {
            const service = new RoleService();
            const response = await service.listRoles({ filter_filters: { companyId: companyId }, limit: 9999 });
            const fetchedData = response.getResponseData().data;

            if (fetchedData && fetchedData?.data) {
                const mappedData = fetchedData.data?.map((data: { id: string; name: string; company: Organisation }) => ({
                    value: data.id,
                    label: data.name + (data.company ? ` (${data.company?.name})` : ''),
                }));
                setData(mappedData);
            }
        } catch (error) {
            console.log('Error fetching roles:', error);
        }
    }, []);

    useEffect(() => {
        fetchRoles();
    }, []);

    const getRolesList = () => {
        return data;
    };

    return { fetchRoles, getRolesList };
}

export default useRoles;