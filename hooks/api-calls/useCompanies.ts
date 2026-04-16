import { useCallback, useEffect, useState } from 'react';
import { usePrivilege } from '../../components/priviledge/PriviledgeProvider';
import { OrganisationService } from '../../services/organisation/organisationService';

/*----------------------------------------------------------------------------------------
* EN: Hook to manage company fetching and transformation logic.
* ES: Hook para gestionar la lógica de obtención y transformación de compañias.
----------------------------------------------------------------------------------------*/

const useCompanies = () => {

    const { userCan } = usePrivilege();
    const [data, setData] = useState<any[]>([]);

    const fetchCompanies = useCallback(async (companyId?: string) => {
        try {
            if (!userCan('list_companies', 'companies')) return;
            const service = new OrganisationService();
            const response = await service.listForSelect();
            const fetchedData = response.getResponseData();

            if (fetchedData && fetchedData?.data) {
                const mappedData = fetchedData.data?.map((data: { id: string; name: string; }) => ({
                    value: data.id,
                    label: data.name,
                }));
                setData(mappedData);
            }
        } catch (error) {
            console.log('Error fetching companies:', error);
        }
    }, []);

    useEffect(() => {
        fetchCompanies();
    }, []);

    const getCompaniesList = () => {
        return data;
    };

    return { fetchCompanies, getCompaniesList };
}

export default useCompanies;