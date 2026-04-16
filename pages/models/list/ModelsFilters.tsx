import { isEqual } from 'lodash';
import React, { useEffect, useState } from 'react';
import { ReactComponent as BorrarIcon } from '../../../assets/Iconos/Interfaz/borrar.svg';
import { Button } from 'rizzui';
import CustomSelect from '../../../components/forms/CustomSelect';
import DateField from '../../../components/forms/DateField';
import { FilterOptions } from '../../../hooks/useFilters';
import { MODEL_STATUSES } from '../ModelForm';
import useBrands from '../../../hooks/api-calls/useBrands';
import { PrivilegeContext } from '../../../components/priviledge/PriviledgeProvider';
import { useContext } from 'react';
import useVehicleTypes from '../../../hooks/api-calls/useVehicleTypes';
import useVehicleSubTypes from '../../../hooks/api-calls/useVehicleSubTypes';


interface ModelsFiltersProps {
    updateFilters: (filters: any) => void
    resetFilters: (limit: any) => void
    filters: FilterOptions
}

const ModelsFilters: React.FC<ModelsFiltersProps> = ({ filters, updateFilters, resetFilters }) => {

    // STATES
    const [refresh, setRefresh] = useState(0);
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: currentYear - 1800 + 1 }, (_, i) => currentYear - i);
    const { fetchBrands } = useBrands({ status: true });
    const [brandOptions, setBrandOptions] = useState<any[]>([]);
    const { userCan } = useContext(PrivilegeContext);
    const { fetchVehicleTypes } = useVehicleTypes({ active: true });
    const [vehicleTypeOptions, setVehicleTypeOptions] = useState<any[]>([]);
    const { fetchVehicleSubTypes } = useVehicleSubTypes({ active: true });
    const [vehicleSubTypeOptions, setVehicleSubTypeOptions] = useState<any[]>([]);

    
    useEffect(() => {
        if (!userCan('get_brands_for_selects', 'brands')) return;

        const loadBrands = async () => {
            const response = await fetchBrands({ search_text: null });

            console.log('Respuesta completa brands:', response);

            setBrandOptions(response || []);
        };

        loadBrands();
    }, []);

    useEffect(() => {
        if (!userCan('get_vehicle_types_for_selects', 'vehicle_types')) return;

        const loadTypes = async () => {
            const response = await fetchVehicleTypes({ search_text: null });
            setVehicleTypeOptions(response || []);
        };

        loadTypes();
    }, []);

    useEffect(() => {
        if (!userCan('get_vehicle_subtypes_for_selects', 'vehicle_subtypes')) return;

        const loadSubTypes = async () => {
            const response = await fetchVehicleSubTypes({ search_text: null });
            setVehicleSubTypeOptions(response || []);
        };

        loadSubTypes();
    }, []);
    
    // RENDER
    return (
        <>
            {userCan('get_brands_for_selects', 'brands') && (
                <CustomSelect
                    isMulti
                    isSearchable
                    id="brands"
                    label="Marca"
                    options={brandOptions}
                    onChange={(selected: any) => {
                        if (!selected || selected.length === 0) {
                            updateFilters({ brands: null });
                            return;
                        }

                        updateFilters({
                            brands: selected.map((item: any) => item.value)
                        });
                    }}
                    value={
                        brandOptions.filter(option =>
                            filters.filter_filters?.brands?.includes(option.value)
                        )
                    }
                />
            )}

            {userCan('get_vehicle_types_for_selects', 'vehicle_types') && (
                <CustomSelect
                    isMulti
                    isSearchable
                    id="vehicleTypes"
                    label="Tipo de vehículo"
                    options={vehicleTypeOptions}
                    onChange={(selected: any) => {
                        if (!selected || selected.length === 0) {
                            updateFilters({ vehicle_types: null });
                            return;
                        }

                        updateFilters({
                            vehicle_types: selected.map((item: any) => item.value)
                        });
                    }}
                    value={
                        vehicleTypeOptions.filter(option =>
                            filters.filter_filters?.vehicle_types?.includes(option.value)
                        )
                    }
                />
            )}

            {userCan('get_vehicle_subtypes_for_selects', 'vehicle_subtypes') && (
                <CustomSelect
                    isMulti
                    isSearchable
                    id="vehicleSubTypes"
                    label="Subtipo de vehículo"
                    options={vehicleSubTypeOptions}
                    onChange={(selected: any) => {
                        if (!selected || selected.length === 0) {
                            updateFilters({ vehicle_subtypes: null });
                            return;
                        }

                        updateFilters({
                            vehicle_subtypes: selected.map((item: any) => item.value)
                        });
                    }}
                    value={
                        vehicleSubTypeOptions.filter(option =>
                            filters.filter_filters?.vehicle_subtypes?.includes(option.value)
                        )
                    }
                />
            )}

            <CustomSelect
                isSearchable
                id={'status'}
                key={refresh}
                label="Estado"
                options={MODEL_STATUSES}
                onChange={(e: any) => {
                    if (e.value === 'null') {
                        updateFilters({ status: null });
                        return;
                    }
                    updateFilters({ status: e.value });
                }}
                value={MODEL_STATUSES.find((status) => status.value === filters.filter_filters?.status)}
            />

            <DateField
                isClearable
                className="w-full"
                label="Fecha de Creación"
                placeholderText="Selecciona las fechas"
                selectedDateField={filters.filter_filters?.between_dates?.type || "createdAt"}
                dateTypesOptions={[
                    { label: "Fecha de creación", value: "createdAt" },
                    { label: "Fecha de modificación", value: "updatedAt" },
                ]}
                startDate={filters.filter_filters?.between_dates?.startDate ? new Date(filters.filter_filters.between_dates.startDate) : null}
                endDate={filters.filter_filters?.between_dates?.endDate ? new Date(filters.filter_filters.between_dates.endDate) : null}
                onChange={(date: any) => {
                    const filters_between_dates = filters.filter_filters?.between_dates;
                    const between_dates = date ? { startDate: date[0], endDate: date[1] } : null;

                    if (between_dates && !isEqual(filters_between_dates, between_dates)) {
                        updateFilters({ between_dates: { startDate: date[0], endDate: date[1], type: date[2] } });
                    } else if (!between_dates && filters_between_dates) {
                        updateFilters({ between_dates: null });
                    }
                }}
            />

            <Button
                size="sm"
                onClick={() => {
                    resetFilters(50);
                    setRefresh(refresh + 1);
                }}
                variant="flat"
                className="h-9 bg-gray-200/70"
            >
                <BorrarIcon className="me-1.5 h-[17px] w-[17px]" /> Limpiar
            </Button>
        </>
    );
};

export default ModelsFilters;