import { useState } from 'react';
import { VehicleType } from '../../type/entities/vehicle-type-type';
import { VehicleSubTypeService } from '../../services/vehicleSubType/vehicleSubTypeService';

/*----------------------------------------------------------------------------------------
* EN: Hook to manage roles by user fetching and transformation logic.
* ES: Hook para gestionar la lógica de obtención y transformación de roles del usuario.
----------------------------------------------------------------------------------------*/

const useVehicleSubTypes = (initialFilters = {}) => {

    const [data, setData] = useState<any[]>([]);
    const [rawVehicleSubTypes, setRawVehicleSubTypes] = useState<VehicleType[]>([]);

    const filters = {
        limit: 200,
        filter_filters: { ...initialFilters }
    };

    const fetchVehicleSubTypes = async (f?: any) => {
        const newFilters = { ...filters, filter_filters: { ...filters.filter_filters, ...f } };

        try {
            const response = await (new VehicleSubTypeService()).listVehicleSubTypesForSelectors(newFilters);
            const apiData = response.getResponseData().data;

            const list = apiData?.vehicleSubtypes || apiData?.vehicleSubTypes || [];

            if (list.length > 0) {

                // Guardamos el array COMPLETO
                setRawVehicleSubTypes(list);

                const mappedData = list.map(
                    (vt: any) => ({
                        value: vt.id,
                        label: `${vt.name} (${vt.orionName})`,
                    })
                );

                setData(mappedData || []);
                return mappedData || [];
            }
        } catch (error) {
            console.log('Error fetching vehicle types:', error);
        }
    };

    return { fetchVehicleSubTypes, rawVehicleSubTypes };
};

export default useVehicleSubTypes;