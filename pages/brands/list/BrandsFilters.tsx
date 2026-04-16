import { isEqual } from 'lodash';
import React, { useState } from 'react';
import { ReactComponent as BorrarIcon } from '../../../assets/Iconos/Interfaz/borrar.svg';
import { Button } from 'rizzui';
import CustomSelect from '../../../components/forms/CustomSelect';
import DateField from '../../../components/forms/DateField';
import { FilterOptions } from '../../../hooks/useFilters';
import { BRAND_STATUSES } from '../BrandForm';

interface BrandsFiltersProps {
    updateFilters: (filters: any) => void
    resetFilters: (limit: any) => void
    filters: FilterOptions
}

const BrandsFilters: React.FC<BrandsFiltersProps> = ({ filters, updateFilters, resetFilters }) => {

    // STATES

    const [refresh, setRefresh] = useState(0);

    // RENDER

    return (
        <>
            <CustomSelect
                isSearchable
                id={'status'}
                key={refresh}
                label="Estado"
                options={BRAND_STATUSES}
                onChange={(e: any) => {
                    if (e.value === 'null') {
                        updateFilters({ status: null });
                        return;
                    }
                    updateFilters({ status: e.value });
                }}
                value={BRAND_STATUSES.find((status) => status.value === filters.filter_filters?.status)}
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
                variant="outline"
                className="h-9 border-red text-red font-[600] hover:border-red hover:text-red" 
            >
                <BorrarIcon className="me-1.5 h-[17px] w-[17px]" /> Limpiar
            </Button>
        </>
    );
};

export default BrandsFilters;