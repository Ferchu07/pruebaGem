import React from 'react';
import { ReactComponent as AdminIcon } from '../../../assets/Iconos/Interfaz/admin.svg';
import {
    ActionIcon,
    Checkbox,
    CheckboxGroup,
    Popover,
    Title
} from 'rizzui';
import { addSpacesToCamelCase } from '../../../utils/addSpacesToCamelCase';
import cn from '../../../utils/classNames';

const tableStyles = {
    variants: {
        classic:
            'min-w-full border-collapse [&_thead]:border-y [&_thead]:bg-gray-100 [&_thead]:border-muted/70 [&_th]:text-gray-500 [&_th]:tracking-wider [&_th]:uppercase [&_th]:text-start [&_th]:font-semibold [&_th]:text-xs [&_th]:p-3 [&_tbody_tr]:border-b [&_tbody_tr]:border-muted/70 hover:[&_tbody_tr]:bg-gray-50 [&_td]:text-start [&_td]:py-4 [&_td]:px-3 before:[&_.sticky-left]:pointer-events-none before:[&_.sticky-left]:absolute before:[&_.sticky-left]:bottom-0 before:[&_.sticky-left]:end-0 before:[&_.sticky-left]:top-0 before:[&_.sticky-left]:hidden before:[&_.sticky-left]:w-5 before:[&_.sticky-left]:shadow-[inset_10px_0_8px_-8px_rgba(0,0,0,0.2)] first:before:[&_.sticky-left]:block dark:before:[&_.sticky-left]:shadow-[inset_10px_0_8px_-8px_rgba(130,136,155,0.1)] before:[&_.sticky-left]:transition-shadow before:[&_.sticky-left]:duration-300 before:[&_.sticky-left]:translate-x-full before:[&_.sticky-right]:content-[""] after:[&_.sticky-right]:pointer-events-none after:[&_.sticky-right]:absolute after:[&_.sticky-right]:-bottom-[1px] after:[&_.sticky-right]:start-0 after:[&_.sticky-right]:top-0 after:[&_.sticky-right]:hidden after:[&_.sticky-right]:w-5 after:[&_.sticky-right]:shadow-[inset_-10px_0_8px_-8px_rgba(0,0,0,0.2)] last:after:[&_.sticky-right]:block dark:after:[&_.sticky-right]:shadow-[inset_-10px_0_8px_-8px_rgba(130,136,155,0.1)] after:[&_.sticky-right]:transition-shadow after:[&_.sticky-right]:duration-300 after:[&_.sticky-right]:-translate-x-full after:[&_.sticky-right]:content-[""] [&_th.sticky-left]:bg-gray-100 [&_td.sticky-left]:bg-white dark:[&_td.sticky-left]:bg-gray-50 [&_th.sticky-right]:bg-gray-100 [&_td.sticky-right]:bg-white dark:[&_td.sticky-right]:bg-gray-50',

        modern:
            'min-w-full border-collapse [&_thead]:bg-gray-100 [&_th]:text-start [&_th]:text-gray-500 [&_th]:tracking-wider [&_th]:uppercase [&_th]:font-semibold [&_th]:text-xs [&_th]:p-3 [&_tbody_tr]:border-b [&_tbody_tr]:border-muted/70 hover:[&_tbody_tr]:bg-gray-50 [&_td]:py-4 [&_td]:px-3 before:[&_.sticky-left]:pointer-events-none before:[&_.sticky-left]:absolute before:[&_.sticky-left]:bottom-0 before:[&_.sticky-left]:end-0 before:[&_.sticky-left]:top-0 before:[&_.sticky-left]:hidden before:[&_.sticky-left]:w-5 before:[&_.sticky-left]:shadow-[inset_10px_0_8px_-8px_rgba(0,0,0,0.2)] first:before:[&_.sticky-left]:block dark:before:[&_.sticky-left]:shadow-[inset_10px_0_8px_-8px_rgba(130,136,155,0.1)] before:[&_.sticky-left]:transition-shadow before:[&_.sticky-left]:duration-300 before:[&_.sticky-left]:translate-x-full before:[&_.sticky-right]:content-[""] after:[&_.sticky-right]:pointer-events-none after:[&_.sticky-right]:absolute after:[&_.sticky-right]:-bottom-[1px] after:[&_.sticky-right]:start-0 after:[&_.sticky-right]:top-0 after:[&_.sticky-right]:hidden after:[&_.sticky-right]:w-5 after:[&_.sticky-right]:shadow-[inset_-10px_0_8px_-8px_rgba(0,0,0,0.2)] last:after:[&_.sticky-right]:block dark:after:[&_.sticky-right]:shadow-[inset_-10px_0_8px_-8px_rgba(130,136,155,0.1)] after:[&_.sticky-right]:transition-shadow after:[&_.sticky-right]:duration-300 after:[&_.sticky-right]:-translate-x-full after:[&_.sticky-right]:content-[""] [&_th.sticky-left]:bg-gray-100 [&_td.sticky-left]:bg-white dark:[&_td.sticky-left]:bg-gray-50 [&_th.sticky-right]:bg-gray-100 [&_td.sticky-right]:bg-white dark:[&_td.sticky-right]:bg-gray-50',

        minimal:
            'min-w-full border-collapse [&_thead]:bg-gray-100 first:[&_thead_th]:rounded-s-lg last:[&_thead_th]:rounded-e-lg [&_th]:text-start [&_th]:text-gray-500 [&_th]:tracking-wider [&_th]:uppercase [&_th]:font-semibold [&_th]:text-xs [&_th]:p-3 hover:[&_tbody_tr]:bg-gray-50 [&_td]:py-4 [&_td]:px-3 before:[&_.sticky-left]:pointer-events-none before:[&_.sticky-left]:absolute before:[&_.sticky-left]:bottom-0 before:[&_.sticky-left]:end-0 before:[&_.sticky-left]:top-0 before:[&_.sticky-left]:hidden before:[&_.sticky-left]:w-5 before:[&_.sticky-left]:shadow-[inset_10px_0_8px_-8px_rgba(0,0,0,0.2)] first:before:[&_.sticky-left]:block dark:before:[&_.sticky-left]:shadow-[inset_10px_0_8px_-8px_rgba(130,136,155,0.1)] before:[&_.sticky-left]:transition-shadow before:[&_.sticky-left]:duration-300 before:[&_.sticky-left]:translate-x-full before:[&_.sticky-right]:content-[""] after:[&_.sticky-right]:pointer-events-none after:[&_.sticky-right]:absolute after:[&_.sticky-right]:-bottom-[1px] after:[&_.sticky-right]:start-0 after:[&_.sticky-right]:top-0 after:[&_.sticky-right]:hidden after:[&_.sticky-right]:w-5 after:[&_.sticky-right]:shadow-[inset_-10px_0_8px_-8px_rgba(0,0,0,0.2)] last:after:[&_.sticky-right]:block dark:after:[&_.sticky-right]:shadow-[inset_-10px_0_8px_-8px_rgba(130,136,155,0.1)] after:[&_.sticky-right]:transition-shadow after:[&_.sticky-right]:duration-300 after:[&_.sticky-right]:-translate-x-full after:[&_.sticky-right]:content-[""] [&_th.sticky-left]:bg-gray-100 [&_td.sticky-left]:bg-white dark:[&_td.sticky-left]:bg-gray-50 [&_th.sticky-right]:bg-gray-100 [&_td.sticky-right]:bg-white dark:[&_td.sticky-right]:bg-gray-50',

        elegant:
            'min-w-full border-collapse [&_thead]:border-y [&_thead]:border-muted/70 [&_th]:text-start [&_th]:text-gray-500 [&_th]:tracking-wider [&_th]:uppercase [&_th]:font-semibold [&_th]:text-xs [&_th]:p-3 [&_tbody_tr]:border-b [&_tbody_tr]:border-muted/70 hover:[&_tbody_tr]:bg-gray-50 [&_td]:py-4 [&_td]:px-3 before:[&_.sticky-left]:pointer-events-none before:[&_.sticky-left]:absolute before:[&_.sticky-left]:bottom-0 before:[&_.sticky-left]:end-0 before:[&_.sticky-left]:top-0 before:[&_.sticky-left]:hidden before:[&_.sticky-left]:w-5 before:[&_.sticky-left]:shadow-[inset_10px_0_8px_-8px_rgba(0,0,0,0.2)] first:before:[&_.sticky-left]:block dark:before:[&_.sticky-left]:shadow-[inset_10px_0_8px_-8px_rgba(130,136,155,0.1)] before:[&_.sticky-left]:transition-shadow before:[&_.sticky-left]:duration-300 before:[&_.sticky-left]:translate-x-full before:[&_.sticky-right]:content-[""] after:[&_.sticky-right]:pointer-events-none after:[&_.sticky-right]:absolute after:[&_.sticky-right]:-bottom-[1px] after:[&_.sticky-right]:start-0 after:[&_.sticky-right]:top-0 after:[&_.sticky-right]:hidden after:[&_.sticky-right]:w-5 after:[&_.sticky-right]:shadow-[inset_-10px_0_8px_-8px_rgba(0,0,0,0.2)] last:after:[&_.sticky-right]:block dark:after:[&_.sticky-right]:shadow-[inset_-10px_0_8px_-8px_rgba(130,136,155,0.1)] after:[&_.sticky-right]:transition-shadow after:[&_.sticky-right]:duration-300 after:[&_.sticky-right]:-translate-x-full after:[&_.sticky-right]:content-[""] [&_th.sticky-left]:bg-white [&_td.sticky-left]:bg-white [&_th.sticky-right]:bg-white [&_td.sticky-right]:bg-white',

        retro:
            'min-w-full border-collapse [&_thead]:border-y [&_thead]:border-muted/70 [&_th]:text-start [&_th]:text-gray-500 [&_th]:tracking-wider [&_th]:uppercase [&_th]:font-semibold [&_th]:text-xs [&_th]:p-3 last:[&_tbody_tr]:border-b last:[&_tbody_tr]:border-muted/70 hover:[&_tbody_tr]:bg-gray-50 [&_td]:py-4 [&_td]:px-3 before:[&_.sticky-left]:pointer-events-none before:[&_.sticky-left]:absolute before:[&_.sticky-left]:bottom-0 before:[&_.sticky-left]:end-0 before:[&_.sticky-left]:top-0 before:[&_.sticky-left]:hidden before:[&_.sticky-left]:w-5 before:[&_.sticky-left]:shadow-[inset_10px_0_8px_-8px_rgba(0,0,0,0.2)] first:before:[&_.sticky-left]:block dark:before:[&_.sticky-left]:shadow-[inset_10px_0_8px_-8px_rgba(130,136,155,0.1)] before:[&_.sticky-left]:transition-shadow before:[&_.sticky-left]:duration-300 before:[&_.sticky-left]:translate-x-full before:[&_.sticky-right]:content-[""] after:[&_.sticky-right]:pointer-events-none after:[&_.sticky-right]:absolute after:[&_.sticky-right]:-bottom-[1px] after:[&_.sticky-right]:start-0 after:[&_.sticky-right]:top-0 after:[&_.sticky-right]:hidden after:[&_.sticky-right]:w-5 after:[&_.sticky-right]:shadow-[inset_-10px_0_8px_-8px_rgba(0,0,0,0.2)] last:after:[&_.sticky-right]:block dark:after:[&_.sticky-right]:shadow-[inset_-10px_0_8px_-8px_rgba(130,136,155,0.1)] after:[&_.sticky-right]:transition-shadow after:[&_.sticky-right]:duration-300 after:[&_.sticky-right]:-translate-x-full after:[&_.sticky-right]:content-[""] [&_th.sticky-left]:bg-white [&_td.sticky-left]:bg-white [&_th.sticky-right]:bg-white [&_td.sticky-right]:bg-white',

        rother:
            'min-w-full border-collapse [&_thead]:!bg-[#849acf] [&_thead_th]:!text-white [&_thead_th]:!font-semibold [&_thead_th]:!text-xs [&_thead_th]:!uppercase [&_thead_th]:!p-3 [&_thead_th]:!text-start [&_thead_th]:!border-r [&_thead_th]:!border-white last:[&_thead_th]:!border-r-0 [&_tbody_tr:nth-child(odd)]:!bg-[#a1b8f7] [&_tbody_tr:nth-child(even)]:!bg-[#c1cff5] [&_tbody_tr]:!border-b [&_tbody_tr]:!border-white hover:[&_tbody_tr]:!bg-[#a8c2f0] [&_tbody_td]:!p-3 [&_tbody_td]:!text-start [&_tbody_td]:!border-r [&_tbody_td]:!border-white last:[&_tbody_td]:!border-r-0 [&_tbody_td]:!text-gray-900 first:[&_thead_th]:!rounded-tl-lg last:[&_thead_th]:!rounded-tr-lg',
    },
};

const Table = React.forwardRef<HTMLTableElement, TableProps>(
    ({ className, variant = 'rother', ...props }, ref) => (
        <table
            ref={ref}
            className={cn(tableStyles.variants[variant], className)}
            {...props}
        />
    )
);

const TableHeader = React.forwardRef<
    HTMLTableSectionElement,
    React.ComponentPropsWithRef<'thead'>
>(({ className, ...props }, ref) => (
    <thead ref={ref} className={className} {...props} />
));

const TableBody = React.forwardRef<
    HTMLTableSectionElement,
    React.ComponentPropsWithRef<'tbody'>
>(({ className, ...props }, ref) => (
    <tbody ref={ref} className={className} {...props} />
));

const TableFooter = React.forwardRef<
    HTMLTableSectionElement,
    React.ComponentPropsWithRef<'tfoot'>
>(({ className, ...props }, ref) => (
    <tfoot ref={ref} className={className} {...props} />
));

const TableRow = React.forwardRef<
    HTMLTableRowElement,
    React.ComponentPropsWithRef<'tr'>
>(({ className, ...props }, ref) => (
    <tr ref={ref} className={className} {...props} />
));

const TableHead = React.forwardRef<
    HTMLTableCellElement,
    React.ComponentPropsWithRef<'th'>
>(({ className, ...props }, ref) => (
    <th ref={ref} className={className} {...props} />
));

const TableCell = React.forwardRef<
    HTMLTableCellElement,
    React.ComponentPropsWithRef<'td'>
>(({ className, ...props }, ref) => (
    <td ref={ref} className={className} {...props} />
));

Table.displayName = 'Table';
TableHeader.displayName = 'TableHeader';
TableBody.displayName = 'TableBody';
TableFooter.displayName = 'TableFooter';
TableRow.displayName = 'TableRow';
TableHead.displayName = 'TableHead';
TableCell.displayName = 'TableCell';

export {
    Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow
};

export type TableVariantProps = keyof typeof tableStyles.variants;
export interface TableProps extends React.ComponentPropsWithRef<'table'> {
    variant?: TableVariantProps;
}

type ToggleColumnsTypes<T> = {
    columns: T[];
    checkedColumns: string[];
    setCheckedColumns: React.Dispatch<React.SetStateAction<string[]>>;
    hideIndex?: number;
};

export function ToggleColumns<T>({
    columns,
    checkedColumns,
    setCheckedColumns,
    hideIndex,
}: ToggleColumnsTypes<T>) {
    return (
        <div>
            <Popover shadow="sm" placement="bottom-end">
                <Popover.Trigger>
                    <ActionIcon variant="outline" title={'Toggle Columns'}>
                        <AdminIcon className="h-5 w-5" />
                    </ActionIcon>
                </Popover.Trigger>
                <Popover.Content className="z-0">
                    <div className="px-0.5 pt-2 text-left rtl:text-right">
                        <Title as="h6" className="mb-1 px-0.5 text-sm font-semibold">
                            Toggle Columns
                        </Title>
                        <CheckboxGroup
                            values={checkedColumns}
                            setValues={setCheckedColumns}
                            className="grid grid-cols-2 gap-x-6 gap-y-5 px-1.5 pb-3.5 pt-4"
                        >
                            {columns.map((column: any, index) => (
                                <Checkbox
                                    key={column.dataIndex}
                                    value={column.dataIndex}
                                    label={addSpacesToCamelCase(column.dataIndex)}
                                    labelClassName="ml-2 rtl:mr-2 text-[13px] font-medium"
                                    className={cn(
                                        hideIndex && index === hideIndex ? 'hidden' : ''
                                    )}
                                />
                            ))}
                        </CheckboxGroup>
                    </div>
                </Popover.Content>
            </Popover>
        </div>
    );
}