import React from 'react';
import { FilterOptions, FilterOrders } from '../../hooks/useFilters';
import { permissionsGroup } from '../priviledge/PriviledgeProvider';
import DynamicTableColumns from './components/DynamicTableColumns';
import MainTableWaitColumnConfig from "./components/MainTableWaitColumnConfig";

export interface PaginationProps {
    pageCount: number,
    currentPage: number,
    pageSize: number,
    totalCount: number,
    handlePagination: Function,
    handlePerPage: Function,
}

interface CustomTableProps {
    id: string;
    data: any[];
    columnOrder?: string[];
    columnsNotShown?: string[];
    isLoading?: boolean;
    viewFilters?: boolean;
    filters: FilterOptions;
    updateFilters?: Function;
    updateFilterOrder?: Function;
    defaultOrder?: FilterOrders | undefined;
    pagination?: boolean;
    paginationData?: PaginationProps;
    overrideColumns?: { key: string; columnNameKey?: string | null; permissions?: { group: permissionsGroup; permission: string }[]; render: Function }[];
    additionalColumns?: { id: string; header: string; render: Function; enableSorting?: boolean }[];
    actions?: { label: string; permissions?: { group: permissionsGroup; permission: string }; render: Function ,hide?: boolean | Function;}[];
    multiActions?: { label: string; permissions?: { group: permissionsGroup; permission: string }; render: Function ,hide?: boolean | Function; }[];
    handleMultipleDelete?: Function;
    multiDeletePermission?: { action: string; group: permissionsGroup } | null;
    search?: boolean;
    searchNumber?: boolean;
    filter?: boolean;
    toggleFilters?: Function;
    children?: React.ReactNode;
    largeTable?: boolean;
    columnsNoSortables?: any;
    isSortable?: boolean;
    disabledIds?: string[] | null;
    variant?: any;
}

const CustomTable: React.FC<CustomTableProps> = (
    {
        id,
        data,
        columnOrder,
        columnsNotShown,
        isLoading,
        overrideColumns,
        additionalColumns,
        actions,
        viewFilters = true,
        multiActions,
        handleMultipleDelete,
        multiDeletePermission,
        filters,
        updateFilters,
        updateFilterOrder,
        defaultOrder,
        pagination = true,
        paginationData,
        search = true,
        searchNumber = false,
        filter = true,
        toggleFilters,
        children,
        largeTable = false,
        columnsNoSortables = [],
        isSortable = true,
        disabledIds = null,
        variant = 'rother'
    }
) => {

    const { configuredColumns } = DynamicTableColumns({
        id,
        data,
        columnsNotShown,
        overrideColumns,
        additionalColumns,
        actions,
        columnOrder,
        disabledIds
    });

    return (
        <>
            {configuredColumns !== null && (
                <MainTableWaitColumnConfig
                    id={id}
                    data={data}
                    defaultColumnConfig={configuredColumns}
                    filters={filters}
                    multiActions={multiActions}
                    handleMultipleDelete={handleMultipleDelete}
                    multiDeletePermission={multiDeletePermission}
                    isLoading={isLoading}
                    viewFilters={viewFilters}
                    pagination={pagination}
                    paginationData={paginationData}
                    search={search}
                    searchNumber={searchNumber}
                    defaultOrder={defaultOrder}
                    updateFilterOrder={updateFilterOrder}
                    updateFilters={updateFilters}
                    toggleFilters={toggleFilters}
                    filter={filter}
                    children={children}
                    largeTable={largeTable}
                    columnsNoSortables={columnsNoSortables}
                    isSortable={isSortable}
                    disabledIds={disabledIds}
                />
            )}
        </>
    );
};

export default CustomTable;