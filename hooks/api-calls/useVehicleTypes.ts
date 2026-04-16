import { useState } from 'react';
import { VehicleType } from '../../type/entities/vehicle-type-type';
import { VehicleTypeService } from '../../services/vehicleType/vehicleTypeService';

/*----------------------------------------------------------------------------------------
* EN: Hook to manage roles by user fetching and transformation logic.
* ES: Hook para gestionar la lógica de obtención y transformación de roles del usuario.
----------------------------------------------------------------------------------------*/

const useVehicleTypes = (initialFilters = {}) => {

    const [data, setData] = useState<any[]>([]);
    const [rawVehicleTypes, setRawVehicleTypes] = useState<VehicleType[]>([]);

    const filters = {
        limit: 200,
        filter_filters: { ...initialFilters }
    };

    const fetchVehicleTypes = async (f?: any) => {
        const newFilters = { ...filters, filter_filters: { ...filters.filter_filters, ...f } };

        try {
            const response = await (new VehicleTypeService()).listVehicleTypesForSelectors(newFilters);
            const apiData = response.getResponseData().data;

            // Check for both singular and plural keys to be safe
            const vehicleTypesList = apiData?.vehicleType || apiData?.vehicleTypes || [];

            if (vehicleTypesList.length > 0) {

                // Guardamos el array COMPLETO
                setRawVehicleTypes(vehicleTypesList);

                const mappedData = vehicleTypesList.map(
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

    return { fetchVehicleTypes, rawVehicleTypes };
};

export default useVehicleTypes;