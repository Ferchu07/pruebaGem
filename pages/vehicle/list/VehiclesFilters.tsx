import { isEqual } from 'lodash';
import React, { useState } from 'react';
import { ReactComponent as BorrarIcon } from '../../../assets/Iconos/Interfaz/borrar.svg';
import { Button } from 'rizzui';
import CustomSelect from '../../../components/forms/CustomSelect';
import DateField from '../../../components/forms/DateField';
import { FilterOptions } from '../../../hooks/useFilters';
import { VEHICLE_STATUSES } from '../VehicleForm';
import { useContext, useEffect } from 'react';
import useBrands from '../../../hooks/api-calls/useBrands';
import useVehicleTypes from '../../../hooks/api-calls/useVehicleTypes';
import useModels from '../../../hooks/api-calls/useModels';
import { PrivilegeContext } from '../../../components/priviledge/PriviledgeProvider';


interface DevicesFiltersProps {
    updateFilters: (filters: any) => void
    resetFilters: (limit: any) => void
    filters: FilterOptions
}

const VehiclesFilters: React.FC<DevicesFiltersProps> = ({ filters, updateFilters, resetFilters }) => {

    // STATES

    const [refresh, setRefresh] = useState(0);
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: currentYear - 1800 + 1 }, (_, i) => currentYear - i);

    const { userCan } = useContext(PrivilegeContext);

    const { fetchBrands } = useBrands({ active: true });
    const { fetchVehicleTypes, rawVehicleTypes } = useVehicleTypes({ active: true });
    const { fetchModels } = useModels({ active: true });

    const [brandOptions, setBrandOptions] = useState<any[]>([]);
    const [modelOptions, setModelOptions] = useState<any[]>([]);
    const [vehicleTypeOptions, setVehicleTypeOptions] = useState<any[]>([]);
    const [vehicleSubtypeOptions, setVehicleSubtypeOptions] = useState<any[]>([]);

    useEffect(() => {
        if (userCan('get_brands_for_selects', 'brands')) {
            fetchBrands({ search_text: null }).then(res => {
                setBrandOptions(res || []);
            });
        }

        if (userCan('get_vehicle_types_for_selects', 'vehicle_types')) {
            fetchVehicleTypes({ search_text: null }).then(res => {
                setVehicleTypeOptions(res || []);
            });
        }

        if (userCan('get_models_for_selects', 'models')) {
            fetchModels({ search_text: null }).then(res => {
                setModelOptions(res || []);
            });
        }

    }, []);

    useEffect(() => {
        const selectedTypes = filters.filter_filters?.vehicle_types;

        if (!selectedTypes || selectedTypes.length === 0) {
            setVehicleSubtypeOptions([]);
            return;
        }

        const subtypes = rawVehicleTypes
            .filter((vt: any) => selectedTypes.includes(vt.id))
            .flatMap((vt: any) =>
                vt.subtypes?.map((sub: any) => ({
                    value: sub.id,
                    label: `${sub.name} (${sub.orionName})`
                })) || []
            );

        setVehicleSubtypeOptions(subtypes);

    }, [filters.filter_filters?.vehicle_types, rawVehicleTypes]);


    // RENDER

    return (
        <>
            <CustomSelect
                isSearchable
                id={'status'}
                key={refresh}
                label="Estado"
                options={VEHICLE_STATUSES}
                formatOptionLabel={(option: any) => (
                    <div className="flex flex-row items-center gap-2">
                        {option.icon && <option.icon className="w-5 h-5" />}
                        <span>{option.label}</span>
                    </div>
                )}
                onChange={(e: any) => {
                    if (e.value === 'null') {
                        updateFilters({ status: null });
                        return;
                    }
                    updateFilters({ status: e.value });
                }}
                value={VEHICLE_STATUSES.find((status) => status.value === filters.filter_filters?.status)}
            />

            {userCan('get_brands_for_selects', 'brands') && (
                <CustomSelect
                    isMulti
                    isSearchable
                    id="brands"
                    label="Marca"
                    options={brandOptions}
                    onChange={(selected: any) => {
                        if (!selected?.length) {
                            updateFilters({ brands: null });
                            return;
                        }

                        updateFilters({
                            brands: selected.map((item: any) => item.value)
                        });
                    }}
                    value={brandOptions.filter(option =>
                        filters.filter_filters?.brands?.includes(option.value)
                    )}
                />
            )}


            {userCan('get_models_for_selects', 'models') && (
                <CustomSelect
                    isMulti
                    isSearchable
                    id="models"
                    label="Modelo"
                    options={modelOptions}
                    onChange={(selected: any) => {
                        if (!selected?.length) {
                            updateFilters({ models: null });
                            return;
                        }

                        updateFilters({
                            models: selected.map((item: any) => item.value)
                        });
                    }}
                    value={modelOptions.filter(option =>
                        filters.filter_filters?.models?.includes(option.value)
                    )}
                />
            )}

            {userCan('get_vehicle_types_for_selects', 'vehicle_types') && (
                <CustomSelect
                    isMulti
                    isSearchable
                    id="vehicle_types"
                    label="Tipo"
                    options={vehicleTypeOptions}
                    onChange={(selected: any) => {
                        if (!selected?.length) {
                            updateFilters({ vehicle_types: null, vehicle_subtypes: null });
                            return;
                        }

                        updateFilters({
                            vehicle_types: selected.map((item: any) => item.value),
                            vehicle_subtypes: null
                        });
                    }}
                    value={vehicleTypeOptions.filter(option =>
                        filters.filter_filters?.vehicle_types?.includes(option.value)
                    )}
                />
            )}

            {userCan('get_vehicle_subtypes_for_selects', 'vehicle_subtypes') && (
                <CustomSelect
                    isMulti
                    isSearchable
                    id="vehicle_subtypes"
                    label="Subtipo"
                    options={vehicleSubtypeOptions}
                    isDisabled={!filters.filter_filters?.vehicle_types?.length}
                    onChange={(selected: any) => {
                        if (!selected?.length) {
                            updateFilters({ vehicle_subtypes: null });
                            return;
                        }

                        updateFilters({
                            vehicle_subtypes: selected.map((item: any) => item.value)
                        });
                    }}
                    value={vehicleSubtypeOptions.filter(option =>
                        filters.filter_filters?.vehicle_subtypes?.includes(option.value)
                    )}
                />
            )}


            <CustomSelect
                isSearchable
                isMulti
                id={'fabrication_years'}
                key={refresh}
                label="Año"
                options={years.map((year) => ({ value: year, label: year }))}
                onChange={(e: any) => {
                    if (e.length === 0) {
                        updateFilters({ fabrication_years: null });
                        return;
                    }
                    const selectedYears = e.map((year: any) => year.value);
                    updateFilters({ fabrication_years: selectedYears });
                }}
                value={filters.filter_filters?.fabrication_years ? filters.filter_filters.fabrication_years.map((year: any) => ({ value: year, label: year })) : []}
            />

            <DateField
                isClearable
                inputClassName="bg-[#a1b8f7]"
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

export default VehiclesFilters;