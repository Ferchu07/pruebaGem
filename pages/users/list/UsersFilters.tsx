import { isEqual } from 'lodash';
import React from 'react';
import { ReactComponent as BorrarIcon } from '../../../assets/Iconos/Interfaz/borrar.svg';
import { Button } from 'rizzui';
import CustomSelect from '../../../components/forms/CustomSelect';
import DateField from '../../../components/forms/DateField';
import { usePrivilege } from '../../../components/priviledge/PriviledgeProvider';
import useRoles from '../../../hooks/api-calls/useRoles';
import { FilterOptions } from '../../../hooks/useFilters';

interface UsersFiltersProps {
    updateFilters: (filters: any) => void
    resetFilters: (limit: any) => void
    filters: FilterOptions
}

const UsersFilters: React.FC<UsersFiltersProps> = ({ filters, updateFilters, resetFilters }) => {

    const { userCan } = usePrivilege();
    const { getRolesList } = useRoles();

    return (
        <>

            <CustomSelect
                isSearchable
                id={'active'}
                label="Estado"
                options={[
                    { label: 'Todos', value: 'null' },
                    { label: 'Activos', value: true },
                    { label: 'Desactivados', value: false }
                ]}
                onChange={(e: any) => {
                    if (e.value === 'null') {
                        updateFilters({ active: null });
                        return;
                    }
                    updateFilters({ active: e.value });
                }}
                value={filters.filter_filters?.active !== null
                    ? { label: filters.filter_filters?.active ? 'Activo' : 'Desactivado', value: filters.filter_filters?.active }
                    : { label: 'Todos', value: 'null' }}
            />

            <CustomSelect
                isSearchable
                isMulti
                id={'roleId'}
                label="Rol"
                options={getRolesList()}
                onChange={(e: any) => { updateFilters({ roles: e.map((rol: any) => rol.value) }) }}
                value={
                    filters.filter_filters?.roles
                        ? getRolesList().filter((rol: any) => filters.filter_filters?.roles.includes(rol.value))
                        : []
                }
                display={userCan('list_roles', 'roles')}
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
                }}
                variant="flat"
                className="h-9 bg-gray-200/70"
            >
                <BorrarIcon className="me-1.5 h-[17px] w-[17px]" /> Limpiar
            </Button>
        </>
    );
};

export default UsersFilters;