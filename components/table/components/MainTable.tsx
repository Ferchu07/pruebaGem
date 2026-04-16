import { flexRender } from '@tanstack/react-table';
import { isEmpty } from 'lodash';
import { Fragment, Key, useState } from 'react';
import { ReactComponent as FlechaIcon } from '../../../assets/Iconos/Interfaz/flecha.svg';
import { Empty, Text, Title } from 'rizzui';
import { useScrollPosition } from '../../../hooks/useScrollPosition';
import { CustomBodyCellProps, CustomHeaderCellProps, MainTableProps, PinnedRowProps, } from '../../../type/main-table-types';
import cn from '../../../utils/classNames';
import { Loader } from '../../loader/SpinnerLogo';
import { getColumnOptions } from '../util';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './Table';

export default function MainTable<TData extends Record<string, any>>({
    table,
    variant,
    largeTable,
    classNames,
    columnOrder,
    isLoading = false,
    showLoadingText = false,
    components,
    updateFilterOrder,
    defaultOrder,
    isSortable = true,
    columnsNoSortables = [],
}: MainTableProps<TData>) {

    const { containerRef, tableRef, isLeftScrollable, isRightScrollable } = useScrollPosition();

    if (!table) return null;

    if (isLoading) {
        return (
            <div className="flex h-full min-h-[128px] flex-col items-center justify-center">
                <Loader />
                {showLoadingText ? <Title as="h6" className="-me-2 mt-4 font-medium text-gray-500">Cargando...</Title> : null}
            </div>
        );
    };

    const headerParam = {
        table,
        columnOrder,
        isLeftScrollable,
        isRightScrollable,
    };

    const rowParam = {
        table,
        columnOrder,
        isLeftScrollable,
        isRightScrollable,
    };

    const mainRows = table?.getIsSomeRowsPinned() ? table.getCenterRows() : table?.getRowModel().rows;

    return (
        <>
            <div
                ref={containerRef}
                className={cn('custom-scrollbar w-full max-w-full overflow-x-auto', classNames?.container)}
            >
                <Table
                    ref={tableRef}
                    variant={variant}
                    style={{ width: table?.getTotalSize() }}
                    className={cn(largeTable && 'table-large')}
                >
                    <Fragment>
                        {components?.header
                            ? components.header(headerParam)
                            : (
                                <TableHeader>
                                    {table?.getHeaderGroups().map((headerGroup) => {
                                        const headerCellParam = {
                                            columnOrder,
                                            headerGroup,
                                            isLeftScrollable,
                                            isRightScrollable,
                                            updateFilterOrder,
                                            defaultOrder,
                                            isSortable,
                                        };
                                        return (
                                            <TableRow key={headerGroup.id}>
                                                {components?.headerCell
                                                    ? components.headerCell(headerCellParam)
                                                    : (
                                                        <TableHeadBasic
                                                            headerGroup={headerGroup}
                                                            isLeftScrollable={isLeftScrollable}
                                                            isRightScrollable={isRightScrollable}
                                                            updateFilterOrder={updateFilterOrder}
                                                            defaultOrder={defaultOrder}
                                                            largeTable={largeTable}
                                                            isSortable={isSortable}
                                                            columnNoSortables={columnsNoSortables}
                                                        />
                                                    )}
                                            </TableRow>
                                        );
                                    })}
                                </TableHeader>
                            )}
                    </Fragment>

                    <TableBody>
                        {table?.getTopRows().map((row) => (
                            <PinnedRow
                                key={row.id}
                                row={row}
                                table={table}
                                isLeftScrollable={isLeftScrollable}
                                isRightScrollable={isRightScrollable}
                            />
                        ))}

                        {components?.bodyRow
                            ? components.bodyRow(rowParam)
                            : (
                                <>
                                    {mainRows?.map((row) => (
                                        <Fragment key={row.id}>
                                            <TableRow>
                                                {row.getVisibleCells().map((cell) => {
                                                    const bodyCellParam = {
                                                        cell,
                                                        columnOrder,
                                                        isLeftScrollable,
                                                        isRightScrollable,
                                                    };
                                                    return (
                                                        <Fragment key={cell.id}>
                                                            {components?.bodyCell
                                                                ? components.bodyCell(bodyCellParam)
                                                                : (
                                                                    <TableCellBasic
                                                                        cell={cell}
                                                                        isLeftScrollable={isLeftScrollable}
                                                                        isRightScrollable={isRightScrollable}
                                                                    />
                                                                )}
                                                        </Fragment>
                                                    );
                                                })}
                                            </TableRow>

                                            {/* custom-expanded-component start  */}
                                            {components?.expandedComponent && row.getIsExpanded() && (
                                                <TableRow>
                                                    <TableCell className="!p-0" colSpan={row.getVisibleCells().length}>
                                                        {components.expandedComponent(row)}
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                            {/* customExpandedComponent end */}
                                        </Fragment>
                                    ))}
                                </>
                            )}

                        {table?.getBottomRows().map((row) => (
                            <PinnedRow
                                key={row.id}
                                row={row}
                                table={table}
                                isLeftScrollable={isLeftScrollable}
                                isRightScrollable={isRightScrollable}
                            />
                        ))}
                    </TableBody>
                </Table>
            </div>

            {isEmpty(table?.getRowModel().rows) && (
                <div className="py-5 text-center lg:py-8">
                    <Empty /> <Text className="mt-3">No hay resultados</Text>
                </div>
            )}
        </>
    );
}

// Basic Header component
export function TableHeadBasic<TData extends Record<string, any>>({
    headerGroup,
    isLeftScrollable,
    isRightScrollable,
    updateFilterOrder,
    defaultOrder,
    isSortable,
    columnNoSortables
}: CustomHeaderCellProps<TData>) {
    const [sortedBy, setSortedBy] = useState<{ id: Key; direction: 'asc' | 'desc' | null } | null>(
        defaultOrder !== undefined ? { id: defaultOrder[0]?.field, direction: defaultOrder[0]?.order } : null
    );

    const handleSort = (columnId: Key) => {
        if (sortedBy?.id === columnId) {
            const newDirection = sortedBy.direction === 'asc' ? 'desc' : 'asc';
            setSortedBy({ id: columnId, direction: newDirection });
            updateFilterOrder && updateFilterOrder(columnId, newDirection);
        } else {
            setSortedBy({ id: columnId, direction: 'asc' });
            updateFilterOrder && updateFilterOrder(columnId, 'asc');
        }
    };

    if (!headerGroup) return null;

    return (
        <>
            {headerGroup.headers.map((header) => {
                const { canResize, canPin, isPinned, isLeftPinned, isRightPinned } = getColumnOptions(header.column);

                return (
                    <TableHead
                        key={header.id}
                        colSpan={header.colSpan}
                        style={{
                            left: isLeftPinned ? header.column.getStart('left') : undefined,
                            right: isRightPinned ? header.column.getAfter('right') : undefined,
                            width: header.getSize(),
                        }}
                        className={cn(
                            'group text-nowrap row whitespace-nowrap',
                            isPinned && canPin && 'sticky z-10',
                            !isPinned && canResize && 'relative',
                            isPinned && isLeftScrollable && 'sticky-right',
                            isPinned && isRightScrollable && 'sticky-left',
                            sortedBy?.id === header.column.id && '!bg-[#c1cff5]'
                        )}
                    >
                        {header.isPlaceholder
                            ? null
                            : (<div className={cn(sortedBy?.id === header.column.id && 'text-black')}>
                                {flexRender(header.column.columnDef.header, header.getContext())}
                                {(isSortable && columnNoSortables?.indexOf(header.column.id) === -1 && header.column.getCanSort())
                                    ? (
                                        <button
                                            type="button"
                                            onClick={() => handleSort(header.column.id)}
                                            className="ms-2 translate-y-1"
                                            aria-label="Ordenar por esta columna"
                                        >
                                            {{
                                                asc: <FlechaIcon className={`h-3.5 w-3.5 ${sortedBy?.id === header.column.id ? 'text-black' : 'fill-white'}`} />,
                                                desc: <FlechaIcon className={`h-3.5 w-3.5 rotate-180 ${sortedBy?.id === header.column.id ? 'text-black' : 'fill-white'}`} />,
                                            }[(sortedBy?.id === header.column.id ? sortedBy.direction : 'asc') as keyof typeof sortedBy] ??
                                                (header.column.columnDef.header !== '' && (
                                                    <FlechaIcon className={`h-3.5 w-3.5 rotate-180 ${sortedBy?.id === header.column.id ? 'text-black' : 'fill-white'}`} />
                                                ))}
                                        </button>
                                    )
                                    : null
                                }
                            </div>)
                        }


                        {header.column.getCanResize() && (
                            <div
                                {...{
                                    onDoubleClick: () => header.column.resetSize(),
                                    onMouseDown: header.getResizeHandler(),
                                    onTouchStart: header.getResizeHandler(),
                                }}
                                className="absolute end-0 top-0 hidden h-full w-0.5 cursor-w-resize bg-gray-400 group-hover:block"
                            />
                        )}
                    </TableHead>
                );
            })}
        </>
    );
}

// Basic Cell component
export function TableCellBasic<TData extends Record<string, any>>({
    cell,
    isLeftScrollable,
    isRightScrollable,
}: CustomBodyCellProps<TData>) {
    if (!cell) return null;

    const { canResize, canPin, isPinned, isLeftPinned, isRightPinned } =
        getColumnOptions(cell.column);

    return (
        <TableCell
            style={{
                left: isLeftPinned ? cell!.column.getStart('left') : undefined,
                right: isRightPinned ? cell.column.getAfter('right') : undefined,
                width: cell.column.getSize(),
            }}
            className={cn(
                isPinned && canPin && 'sticky z-10',
                !isPinned && canResize && 'relative',
                isPinned && isLeftScrollable && 'sticky-right',
                isPinned && isRightScrollable && 'sticky-left'
            )}
        >
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
    );
}

// Pinned Row Component
export function PinnedRow<TData extends Record<string, any>>({
    row,
    isLeftScrollable,
    isRightScrollable,
}: PinnedRowProps<TData>) {
    const isTopPinned = row.getIsPinned() === 'top';
    const isBottomPinned = row.getIsPinned() === 'bottom';
    return (
        <TableRow
            className={cn(
                'sticky z-20 bg-white dark:bg-gray-50',
                isTopPinned && '-top-px shadow-[0px_2px_2px_0px_#0000000D]',
                isBottomPinned && '-bottom-0.5 shadow-[rgba(0,0,0,0.24)_0px_3px_8px]'
            )}
        >
            {row.getVisibleCells().map((cell) => {
                return (
                    <TableCellBasic
                        key={cell.id}
                        cell={cell}
                        isLeftScrollable={isLeftScrollable}
                        isRightScrollable={isRightScrollable}
                    />
                );
            })}
        </TableRow>
    );
}