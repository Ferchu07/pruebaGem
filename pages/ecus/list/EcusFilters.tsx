import { isEqual } from 'lodash';
import React from 'react';
import { ReactComponent as BorrarIcon } from '../../../assets/Iconos/Interfaz/borrar.svg';
import { Button } from 'rizzui';
import DateField from '../../../components/forms/DateField';
import { FilterOptions } from '../../../hooks/useFilters';

interface EcusFiltersProps {
    updateFilters: (filters: any) => void
    resetFilters: (limit: any) => void
    filters: FilterOptions
}

const EcusFilters: React.FC<EcusFiltersProps> = ({ filters, updateFilters, resetFilters }) => {

    // RENDER

    return (
        <>

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
                }}
                variant="flat"
                className="h-9 bg-gray-200/70"
            >
                <BorrarIcon className="me-1.5 h-[17px] w-[17px]" /> Limpiar
            </Button>
        </>
    );
};

export default EcusFilters;
