import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { useDirection } from "../../../hooks/use-direction";
import { FilterOptions } from "../../../hooks/useFilters";
import { useTanStackTable } from "../../../hooks/useTanStackTable";
import { RootState } from "../../../redux/store";
import { getColumnVisibility } from "../../../redux/tableSlice";
import { isUser } from "../../priviledge/PriviledgeProvider";
import MainTable from "./MainTable";
import TablePagination from "./TablePagination";
import TableToolbar from "./TableToolbar";

type MainTableWaitColumnConfigProps = {
    id: string;
    defaultColumnConfig: any[];
    data: any[];
    filters: FilterOptions;
    multiActions?: any;
    handleMultipleDelete?: Function;
    multiDeletePermission?: { action: string; group: string } | null;
    isLoading?: boolean;
    viewFilters?: boolean;
    pagination?: boolean;
    paginationData?: any;
    search?: boolean;
    searchNumber?: boolean;
    defaultOrder?: any;
    updateFilterOrder?: Function;
    updateFilters?: Function;
    toggleFilters?: Function;
    filter?: boolean;
    children?: React.ReactNode;
    largeTable?: boolean;
    columnsNoSortables?: any;
    isSortable?: boolean;
    disabledIds?: string[] | null;
    variant?: any;
}

const fallbackData: any[] = []

const MainTableWaitColumnConfig: React.FC<MainTableWaitColumnConfigProps> = (
    {
        id,
        defaultColumnConfig,
        data,
        filters,
        multiActions,
        handleMultipleDelete,
        multiDeletePermission = null,
        isLoading,
        viewFilters = true,
        pagination,
        paginationData,
        search,
        searchNumber,
        defaultOrder,
        updateFilterOrder,
        updateFilters,
        toggleFilters,
        filter = true,
        children,
        largeTable = false,
        columnsNoSortables = [],
        isSortable = true,
        disabledIds = null,
        variant,
    }) => {

    const { user } = useSelector((state: RootState) => state.auth);

    const columnVisibility = useSelector((state: any) => {
        const stateData = state.table;
        const columnVisibility = getColumnVisibility(stateData, id);
        return columnVisibility;
    });

    const { direction } = useDirection();

    const { table, setData, tableData, setConlumnConfig } = useTanStackTable<any>({
        tableData: data ?? fallbackData,
        columnConfig: defaultColumnConfig,
        options: {
            initialState: {
                pagination: {
                    pageIndex: 0,
                    pageSize: filters.limit,
                },
            },
            enableRowSelection: (row) => row.original.id !== (isUser(user) ? user.id : undefined) && !disabledIds?.includes(row.original.id),
            meta: { handleMultipleDelete, multiActions, multiDeletePermission },
            enableColumnResizing: true,
            columnResizeDirection: direction as any,
            columnResizeMode: 'onChange',
        },
    });

    useEffect(() => {
        if (Array.isArray(data)) {
            setData(data);
        }
        if (data === undefined || data === null) {
            setData([]);
        }
    }, [data]);

    useEffect(() => {
        setConlumnConfig(defaultColumnConfig);
    }, [defaultColumnConfig]);

    useEffect(() => {
        if (table?.getRowModel().rows.length === 0) return;
        Object.keys(columnVisibility).forEach((key) => {
            const isVisible = columnVisibility[key];
            const column = table.getColumn(key);
            if (column) column.toggleVisibility(isVisible);
        });
    }, [tableData]);

    return (
        <>
            {viewFilters && (
                <TableToolbar
                    tableId={id}
                    table={table}
                    filters={filters}
                    search={search}
                    searchNumber={searchNumber}
                    updateFilters={updateFilters}
                    toggleFilters={toggleFilters}
                    filter={filter}
                    children={children}
                />
            )}
            <MainTable
                table={table}
                isLoading={isLoading}
                variant={variant}
                updateFilterOrder={updateFilterOrder}
                defaultOrder={defaultOrder}
                largeTable={largeTable}
                isSortable={isSortable}
                columnsNoSortables={columnsNoSortables}
            />
            {pagination && <TablePagination table={table} paginationData={paginationData} />}
        </>
    );
}

export default MainTableWaitColumnConfig;