import { type Table as ReactTableType } from '@tanstack/react-table';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useMedia } from 'react-use';
import { ActionIcon, Button, Checkbox, Popover, Title } from 'rizzui';
import { FilterOptions } from '../../../hooks/useFilters';
import { setColumnVisibility } from '../../../redux/tableSlice';
import { PiTextColumns } from 'react-icons/pi';
import cn from '../../../utils/classNames';
import ButtonPopover from '../../buttons/ButtonPopover';
import CustomSearchInput from '../../forms/CustomSearchInput';
import { usePrivilege } from '../../priviledge/PriviledgeProvider';
import { FilterAlt } from '../../icon/material-icons';

interface TableToolbarProps<T extends Record<string, any>> {
    tableId: string;
    table: ReactTableType<T>;
    filters: FilterOptions;
    updateFilters?: Function;
    search?: boolean;
    searchNumber?: boolean;
    filter?: boolean;
    toggleFilters?: Function;
    children?: React.ReactNode;
}

export default function TableToolbar<TData extends Record<string, any>>(
    {
        tableId,
        table,
        filters,
        updateFilters,
        search = true,
        searchNumber = false,
        filter = true,
        toggleFilters,
        children,
    }: TableToolbarProps<TData>) {

    const { userCan } = usePrivilege();
    const dispatch = useDispatch();
    const isMediumScreen = useMedia('(max-width: 1860px)', false);
    const isMultipleSelected = table.getSelectedRowModel().rows.length > 0;
    const { options: { meta } } = table;

    const [openDrawer, setOpenDrawer] = useState(false);

    /**
     * Maneja la visibilidad de las columnas en redux
     */
    const handleVisibilityChange = (columnId: string, isVisible: boolean) => {
        dispatch(setColumnVisibility({ tableId, columnId, isVisible: !isVisible }));
    };

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
            {search && updateFilters && (
                <div className="flex flex-wrap items-center gap-4">
                    <CustomSearchInput onSearch={(e) => updateFilters({ search_text: e })} defaultValue={filters.filter_filters?.search_text || ''} className="min-w-[150px] flex-1" />
                </div>
            )}
            {searchNumber && updateFilters && (
                <div className="flex flex-wrap items-center gap-4">
                    <CustomSearchInput type={'number'} onSearch={(e) => updateFilters({ search_text: Number(e) })} defaultValue={filters.filter_filters?.search_text || undefined} className="min-w-[150px] flex-1" />
                </div>
            )}

            <div className="flex flex-wrap items-center gap-4 justify-center md:justify-end">
                {/* @ts-ignore */}
                {isMultipleSelected
                    ? (
                        <>
                            {/* @ts-ignore */}
                            {meta?.multiActions?.length > 0 && meta?.multiActions.map((action: any, index: number) => {
                                if (action.permissions && !userCan(action.permissions.permission, action.permissions.group)) return;
                                if (typeof action.hide === 'function' && action.hide(table.getSelectedRowModel().rows.map((r) => r.original))) return null;
                                if (typeof action.hide === 'boolean' && action.hide) return null;
                                return (
                                    <div key={index} className="flex items-center gap-2">
                                        {action.render && action.render(table.getSelectedRowModel().rows.map((r) => r.original.id))}
                                    </div>
                                );
                            })}

                            {/* @ts-ignore */}
                            {meta?.handleMultipleDelete !== undefined && (meta?.multiDeletePermission === null || userCan(meta?.multiDeletePermission?.action, meta?.multiDeletePermission?.group)) && (
                                <ButtonPopover
                                    title='Eliminar'
                                    description='¿Estás seguro de eliminar los elementos seleccionados?'
                                    //@ts-ignore
                                    onClick={() => meta?.handleMultipleDelete && meta.handleMultipleDelete(table.getSelectedRowModel().rows.map((r) => r.original.id)) && table.resetRowSelection()}
                                    variant='outline'
                                    btnClassName='flex w-auto'
                                />
                            )}
                        </>
                    )
                    : null
                }

                {children ?
                    React.isValidElement(children)
                        ? React.cloneElement(children as React.ReactElement, { selectedRows: table.getSelectedRowModel().rows })
                        : null
                    : null
                }

                {table && (
                    <Popover shadow="sm" placement="bottom-end">
                        <Popover.Trigger>
                            <ActionIcon
                                variant="outline"
                                title={'Toggle Columns'}
                                className="h-auto w-auto p-1 border-dotted border-black"
                            >
                                {/* @ts-ignore */}
                                <PiTextColumns strokeWidth={3} className="size-6" />
                            </ActionIcon>
                        </Popover.Trigger>
                        <Popover.Content className="z-0">
                            <div className="p-2 text-left rtl:text-right">
                                <Title as="h6" className="mb-6 px-0.5 text-sm font-semibold">
                                    Mostrar/Ocultar columnas
                                </Title>
                                <div className="grid grid-cols-2 gap-6">
                                    {table.getAllLeafColumns().map((column) => {
                                        const columnId = column.id;
                                        return (
                                            typeof column.columnDef.header === 'string' &&
                                            column.columnDef.header.length > 0 && (
                                                <Checkbox
                                                    key={columnId}
                                                    label={<>{column.columnDef.header}</>}
                                                    checked={column.getIsVisible()}
                                                    onChange={() => {
                                                        column.toggleVisibility();
                                                        handleVisibilityChange(columnId, column.getIsVisible());
                                                    }}
                                                />
                                            )
                                        );
                                    })}
                                </div>
                            </div>
                        </Popover.Content>
                    </Popover>
                )}

                {filter && (
                    <Button
                        {... ({
                            onClick: () => {
                                setOpenDrawer(() => !openDrawer);
                                if (toggleFilters) toggleFilters();
                            }
                        })}
                        variant={'outline'}
                        className={cn(
                            'h-[34px] pe-3 ps-2.5 border-dotted border-black',
                            !isMediumScreen
                        )}
                    >
                        <FilterAlt className="me-1.5 h-[18px] w-[18px]" strokeWidth={1.7} />
                        Filtros
                    </Button>
                )}
            </div>
        </div>
    );
}