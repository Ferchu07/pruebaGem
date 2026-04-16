import { isEqual } from 'lodash';
import React, { useState } from 'react';
import { ReactComponent as BorrarIcon } from '../../../assets/Iconos/Interfaz/borrar.svg';
import { Button } from 'rizzui';
import CustomSelect from '../../../components/forms/CustomSelect';
import DateField from '../../../components/forms/DateField';
import { FilterOptions } from '../../../hooks/useFilters';
import { DEVICE_STATUSES } from '../DeviceForm';

interface DevicesFiltersProps {
    updateFilters: (filters: any) => void
    resetFilters: (limit: any) => void
    filters: FilterOptions
}

const DevicesFilters: React.FC<DevicesFiltersProps> = ({ filters, updateFilters, resetFilters }) => {

    // STATES

    const [refresh, setRefresh] = useState(0);

    // RENDER

    return (
        <>
            <CustomSelect
                isMulti
                isSearchable
                id={'status'}
                key={refresh}
                label="Estado"
                options={DEVICE_STATUSES}
                formatOptionLabel={(option: any) => (
                    <div className="flex flex-row items-center gap-2">
                        {option.icon && <option.icon className="w-5 h-5" />}
                        <span>{option.label}</span>
                    </div>
                )}
                onChange={(e: any) => {
                    const selectedStatuses = e ? e.map((option: any) => option.value) : null;
                    if (!isEqual(filters.filter_filters?.status, selectedStatuses)) {
                        updateFilters({ status: selectedStatuses });
                    }
                }}
                value={filters.filter_filters?.status ? DEVICE_STATUSES.filter((status: any) => filters.filter_filters?.status.includes(status.value)) : []}
            />

            <DateField
                isClearable
                className="w-full"
                label="Fecha de Creación"
                placeholderText="Selecciona las fechas"
                startDate={filters.filter_filters?.between_dates?.startDate ? new Date(filters.filter_filters.between_dates.startDate) : null}
                endDate={filters.filter_filters?.between_dates?.endDate ? new Date(filters.filter_filters.between_dates.endDate) : null}
                onChange={(date: any) => {
                    const filters_between_dates = filters.filter_filters?.between_dates;
                    const between_dates = date ? { startDate: date[0], endDate: date[1] } : null;

                    if (between_dates && !isEqual(filters_between_dates, between_dates)) {
                        updateFilters({ between_dates: { startDate: date[0], endDate: date[1] } });
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
                variant="outline"
                className="h-9 border-red text-red font-[600]" 
            >
                <BorrarIcon className="me-1.5 h-[17px] w-[17px]" /> Limpiar Filtros
            </Button>
        </>
    );
};

export default DevicesFilters;