import React, { useEffect, useState } from 'react';
import { Button, Input } from 'rizzui';
import { ReactComponent as BorrarIcon } from '../../../assets/Iconos/Interfaz/borrar.svg';
import { FilterOptions } from '../../../hooks/useFilters';

interface OrganisationsFiltersProps {
    updateFilters: (filters: any) => void
    resetFilters: (limit: any) => void
    filters: FilterOptions
}

const OrganisationsFilters: React.FC<OrganisationsFiltersProps> = ({ filters, updateFilters, resetFilters }) => {
    
    // STATES

    const [filter_filters, setFilterFilters] = useState<any>({});
    const [loaded, setLoaded] = useState<boolean>(false);

    // USE EFFECTS

    useEffect(() => {
        if (loaded && filter_filters !== filters.filter_filters) {
            const delaySearch = setTimeout(() => {
                updateFilters({ ...filter_filters });
            }, 1000);
            return () => clearTimeout(delaySearch);
        }
    }, [filter_filters, loaded]);

    useEffect(() => {
        setFilterFilters(filters.filter_filters || '');
    }, [filters]);

    useEffect(() => {
        setLoaded(true);
    }, []);

    // RENDER
    
    return (
        <>
            <Input
                id='search_text'
                type="text"
                label="Buscar"
                className="[&>label>span]:font-medium"
                inputClassName="text-sm"
                onChange={(e) => setFilterFilters({ ...filter_filters, search_text: e.target.value })}
                value={filter_filters?.search_text ?? ''}
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

export default OrganisationsFilters;