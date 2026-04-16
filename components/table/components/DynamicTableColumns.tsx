import { createColumnHelper } from '@tanstack/react-table';
import moment from 'moment';
import { useContext, useEffect, useState } from 'react';
import { Checkbox, Text, Tooltip } from 'rizzui';
import { imageFields, translateColumnName } from '../../../utils/tableUtils';
import AsyncImg from '../../extras/AsyncImg';
import { PrivilegeContext } from '../../priviledge/PriviledgeProvider';
import AvatarCard from '../../ui/AvatarCard';
import { RootState } from '../../../redux/store';
import { useSelector } from 'react-redux';

const columnHelper = createColumnHelper();

const DynamicTableColumns = (
    {
        id,
        data,
        columnsNotShown,
        overrideColumns = [],
        additionalColumns = [],
        actions = [],
        columnOrder,
        disabledIds = null
    }: any) => {

    const { userCan } = useContext(PrivilegeContext);

    const [configuredColumns, setConfiguredColumns] = useState<any[] | null>(null);
    const { user } = useSelector((state: RootState) => state.auth);


    const configureDynamicColumns = () => {
        if (data === undefined || !data || data.length === 0) {
            setConfiguredColumns([])
            return;
        }

        const firstRow = data[0];
        const columns = [];

        /**
         * Añadir columna de selección de filas
         */
        columns.push(columnHelper.accessor('id', {
            id: 'id',
            size: 60,
            header: ({ table }) => (
                <Checkbox
                    aria-label="Selecciona todas las filas"
                    checked={table.getIsAllPageRowsSelected()}
                    onChange={() => table.toggleAllPageRowsSelected()}
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    aria-label="Selecciona esta fila"
                    checked={row.getIsSelected()}
                    onChange={() => row.toggleSelected()}
                    //@ts-ignore
                    disabled={id === 'users-table' ? row.original.id === user?.id : disabledIds !== null ? disabledIds.includes(row.original.id) : false}
                />
            ),
            enableSorting: false,
            meta: { isHidden: true },
        }));

        /**
         * Si columnsNotShown contiene la columna id, se elimina de la lista de columnas
         * Se realiza un pop() al ser la única columna que se puede eliminar
         */
        if (columnsNotShown && columnsNotShown.includes('id')) {
            columns.pop();
        }

        /**
         * Añadir columnas de datos de la tabla
         */
        Object.keys(firstRow).forEach((key) => {
            if (key === 'id') return;
            if (key === 'name' && imageFields.some((field) => Object.keys(firstRow).some((k) => k === field))) return;
            if (columnsNotShown && columnsNotShown.includes(key)) return;

            /**
             * Si overrideColumns recibe permissions se comprueba si el usuario tiene permisos, en caso contrario se elimina la columna y no se muestra ni el header ni el contenido
             */
            const overrideColumnPermissions = overrideColumns.find((col: any) => col.key === key)?.permissions;
            if (overrideColumnPermissions && !overrideColumnPermissions.every((perm: any) => userCan(perm.permission, perm.group))) return;

            // Buscar override para la columna
            const overrideColumn = overrideColumns.find((col: any) => col.key === key);

            const columnConfig = {
                id: key,
                //size: key.length * 10,
                header: translateColumnName(overrideColumn?.columnNameKey || key),
                cell: ({ row }: any) => {
                    const value = row.original[key];

                    if (typeof value === 'object' && value !== null) {
                        if (value.date) {
                            return moment(value.date).format('DD/MM/YY HH:mm');
                        }
                        if (value) {
                            return (
                                <figure className={'flex items-center gap-3'}>
                                    <AsyncImg id={value.id} className="mx-0 d-block rounded w-[40px] h-[40px] object-cover " />
                                    <figcaption className="grid gap-0.5">
                                        <Text className="font-lexend text-sm font-medium text-gray-900 dark:text-gray-700">
                                            {row.original.name + (row.original.lastName ? ` ${row.original.lastName}` : '')}
                                        </Text>
                                    </figcaption>
                                </figure>
                            )
                        }
                        return JSON.stringify(value);
                    }

                    if (imageFields.includes(key)) {
                        return <AvatarCard src={'default-avatar.png'} name={row.original.name + (row.original.lastName ? ` ${row.original.lastName}` : '')} />;
                    }

                    if (key === 'name' && row.original.lastName) {
                        return `${value} ${row.original.lastName}`;
                    }

                    if (typeof value === 'string' && value.length > 50) {
                        return (
                            <Tooltip
                                size="md"
                                content={<div className='tooltip-container'>{value}</div>}
                                placement="top"
                                color="invert"
                            >
                                <div>{value.substring(0, 50)}...</div>
                            </Tooltip>
                        );
                    }

                    if (value === null || value === undefined || value === '') {
                        return <Text color="gray">N/A</Text>;
                    }

                    return value;
                },
                enableSorting: true,
            };

            // Si hay un override para esta columna, se sobreescribe la función de renderizado
            if (overrideColumn) {
                columnConfig.cell = overrideColumn.render;
            }

            columns.push(columnHelper.accessor(key, columnConfig));
        });

        /**
         * Añadir columnas adicionales
         */
        additionalColumns.forEach((col: any) => {
            columns.push(columnHelper.accessor(col.id, {
                id: col.id,
                size: col.size || 100,
                header: col.header || translateColumnName(col.id),
                cell: col.render,
                enableSorting: col.enableSorting || false,
            }));
        });

        /**
         * Añadir columna de acciones
         */
        if (actions.length > 0) {
            columns.push(columnHelper.accessor('actions', {
                id: 'actions',
                size: actions.length * 2,
                header: () => <div style={{ textAlign: 'center' }}>Acciones</div>,
                cell: ({ row }: any) => (
                    <div className="flex items-center justify-center gap-3 pe-3">
                        {actions.map((action: any, index: number) => {
                            if (action.permissions && !userCan(action.permissions.permission, action.permissions.group)) return;
                            if (typeof action.hide === 'function' && action.hide(row.original)) return null;
                            if (typeof action.hide === 'boolean' && action.hide) return null;
                            return (
                                <div key={index} className="flex items-center gap-2">
                                    {action.render && action.render(row.original)}
                                </div>
                            )
                        })}
                    </div>
                ),
                enableSorting: false,
            }));
        }

        /**
         * Ordenar columnas según el orden indicado
         * Si no se indica un orden, se mantiene el orden original
         */
        if (columnOrder) {
            const sortedColumns = columns.sort((a, b) => {
                // La columna id siempre debe ser la primera
                if (a.id === 'id') return -1;
                if (b.id === 'id') return 1;

                // La columna de acciones siempre debe ser la última
                if (a.id === 'actions') return 1;
                if (b.id === 'actions') return -1;

                const indexA = columnOrder.indexOf(a.id);
                const indexB = columnOrder.indexOf(b.id);

                if (indexA !== -1 && indexB !== -1) {
                    return indexA - indexB;
                }

                if (indexA !== -1) return -1;
                if (indexB !== -1) return 1;

                return 0;
            });

            setConfiguredColumns(sortedColumns);
        }

        setConfiguredColumns(columns);
    };

    useEffect(() => {
        if (Array.isArray(data)) {
            configureDynamicColumns();
        }
    }, [data]);

    return { configuredColumns };
};

export default DynamicTableColumns;