import { type Table as ReactTableType } from '@tanstack/react-table';
import { ReactComponent as FlechaIcon } from '../../../assets/Iconos/Interfaz/flecha.svg';
import ReactPaginate from 'react-paginate';
import { Select, SelectOption, Text } from 'rizzui';
import { PaginationProps } from '../CustomTable';

const options = [
    { value: 10, label: '10' },
    { value: 50, label: '50' },
    { value: 100, label: '100' },
    { value: 500, label: '500' },
    { value: 1000, label: '1000' },
];

export default function Pagination<TData extends Record<string, any>>({
    table,
    paginationData,
    rangeDisplayed = 2,
}: {
    table: ReactTableType<TData>;
    paginationData?: PaginationProps;
    rangeDisplayed?: number;
}) {

    if (paginationData === undefined) return null;

    return (
        <div className="flex w-full items-center justify-between @container mt-6">
            <div className='text-gray-400 text-bold'>Nº Resultados: &nbsp; {paginationData.totalCount ?? '...'}</div>
            <div className="flex w-full items-center justify-between gap-6 @2xl:w-auto @2xl:gap-12">
                <div className="flex items-center gap-4">
                    <Text className="hidden font-medium text-gray-900 @md:block">
                        Filas por página:
                    </Text>
                    <Select
                        options={options}
                        className="w-[70px]"
                        value={table.getState().pagination.pageSize}
                        onChange={(v: SelectOption) => {
                            paginationData.handlePerPage(v);
                            table.setPageSize(Number(v.value));
                        }}
                        selectClassName="font-semibold text-sm ring-0 shadow-sm h-9"
                        dropdownClassName="font-medium [&_li]:justify-center [&_li]:text-sm"
                    />
                </div>

                <div className="grid grid-cols-1 gap-2">
                    <ReactPaginate
                        pageCount={paginationData.pageCount}
                        pageRangeDisplayed={rangeDisplayed}
                        initialPage={paginationData.pageCount === 0 ? paginationData.pageCount : paginationData.currentPage - 1}
                        onPageChange={page => paginationData.handlePagination(page)}
                        nextLabel={<FlechaIcon className="h-4 w-4 -rotate-90" />}
                        previousLabel={<FlechaIcon className="h-4 w-4 rotate-90" />}
                        // Estilos generales del contenedor de la paginación
                        className="flex items-center justify-center space-x-1 text-gray-700"
                        // Estilo para cada item de la paginación (números)
                        pageClassName="inline-flex"
                        // Estilo para el enlace de cada página (números)
                        pageLinkClassName="inline-flex items-center px-3 py-1.5 border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary rounded-md"
                        // Estilo para el item de la página activa
                        activeClassName=""
                        // Estilo para el enlace de la página activa
                        activeLinkClassName="pagination-active"
                        // Estilo para el item del enlace "Previous"
                        previousClassName="inline-flex"
                        // Estilo para el enlace "Previous"
                        previousLinkClassName="inline-flex items-center px-1.5 py-1.5 border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary rounded-md"
                        // Estilo para el item del enlace "Next"
                        nextClassName="inline-flex"
                        // Estilo para el enlace "Next"
                        nextLinkClassName="inline-flex items-center px-1.5 py-1.5 border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary rounded-md"
                        // Estilo para el item del enlace de pausa/omisión
                        breakClassName="inline-flex"
                        // Estilo para el enlace de pausa/omisión (puntos suspensivos)
                        breakLinkClassName="inline-flex items-center px-1.5 py-1.5 border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary rounded-md"
                    />
                </div>
            </div>
        </div>
    );
}