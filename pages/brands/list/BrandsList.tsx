import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { ActionIcon, Tooltip } from 'rizzui';
import { toast } from 'sonner';
import { ReactComponent as EditarIcon } from '../../../assets/Iconos/Interfaz/editar.svg';
import { ReactComponent as VerIcon } from '../../../assets/Iconos/Interfaz/ver.svg';
import DeletePopover from '../../../components/buttons/DeletePopover';
import { useFiltersPR } from '../../../components/providers/FiltersProvider';
import CustomTable from '../../../components/table/CustomTable';
import { FilterDrawerView } from '../../../components/table/components/TableFilter';
import useFetch from '../../../hooks/useFetch';
import useHandleErrors from '../../../hooks/useHandleErrors';
import Page from '../../../layout/Page/Page';
import { menuRoutes } from '../../../router/menu';
import { BrandService } from '../../../services/brand/brandService';
import { BrandsApiResponse } from '../../../type/entities/brand-type';
import BrandsFilters from './BrandsFilters';
import AsyncImg from '../../../components/extras/AsyncImg';
import { StatusBadgeDropdown } from '../../../components/forms/StatusBadgeDropdown';

const columnOrder = [
    'id',
    'name',
    'brandImg',
    'description',
    'orionId',
    'orionName',
    'isActive',
    'createdAt',
    'updatedAt'
];

interface BrandsListProps {
    refreshSignal?: number;
    onEdit?: (id: string) => void;
}

const BrandsList = ({ refreshSignal, onEdit }: BrandsListProps) => {

    // STATES

    const [changingStatus, setChangingStatus] = useState<string[]>([]);
    const [openFilters, setOpenFilters] = useState<boolean>(false);
    const [brandId, setBrandId] = useState<string | null | undefined>(null);

    // HOOKS

    const { handleErrors } = useHandleErrors();
    const { filters, updateFilters, updateFilterOrder, updatePage, updatePageSize, resetFilters } = useFiltersPR();
    const service = new BrandService();

    // FETCHING DATA

    //-----------------------------------------------------------------------------------------------------------------
    /**
     * @ES OBTIENE LA LISTA DE MARCAS
     * @EN GETS THE BRAND LIST
     */
    //-----------------------------------------------------------------------------------------------------------------
    const [data, loading, error, refetch] = useFetch(useCallback(async () => {
        const response = await service.listBrands(filters);
        console.log(response.getResponseData)
        return response.getResponseData() as BrandsApiResponse;
    }, [filters, refreshSignal]));
    //-----------------------------------------------------------------------------------------------------------------

    // FUNCTIONS

    //-----------------------------------------------------------------------------------------------------------------
    /**
     * @ES MANEJO DEL CAMBIO DE ESTADO DE UNA MARCA
     * @EN HANDLER FOR THE BRAND STATE CHANGE
     */
    //-----------------------------------------------------------------------------------------------------------------
    const toggleStatus = async (id: string) => {
            try {
                setChangingStatus([...changingStatus, id]);
                const response = (await service.toggleBrandStatus(id)).getResponseData();
                if (response.success) {
                    setChangingStatus(changingStatus.filter((item) => item !== id));
                    refetch();
                    toast.success(response.message);
                } else {
                    setChangingStatus(changingStatus.filter((item) => item !== id));
                    toast.error(response.message);
                }
            } catch (error: any) {
                setChangingStatus(changingStatus.filter((item) => item !== id));
                toast.error(error.message);
            }
        };
    //-----------------------------------------------------------------------------------------------------------------

    //-----------------------------------------------------------------------------------------------------------------
    /**
     * @ES ELIMINA UNA MARCA
     * @EN DELETES A BRAND
     * 
     * @param id 
     */
    //-----------------------------------------------------------------------------------------------------------------
    const handleDelete = async (id: string) => {
        try {
            const response = await (await service.deleteBrand(id)).getResponseData();
            if (response.success) {
                refetch();
                toast.success(response.message || 'Marca eliminada correctamente');
            } else {
                handleErrors(response.message);
            }
        } catch (error) {
            handleErrors(error);
        }
    };
    //-----------------------------------------------------------------------------------------------------------------

    //-----------------------------------------------------------------------------------------------------------------
    /**
     * @ES ELIMINA VARIAS MARCAS
     * @EN DELETES MULTIPLE BRANDS
     * 
     * @param ids 
     */
    //-----------------------------------------------------------------------------------------------------------------
    const handleMultiDelete = async (ids: string[]) => {
        try {
            const response = await (await service.deleteMultiBrands(ids)).getResponseData();
            if (response.success) {
                refetch();
                toast.success(response.message || 'Marcas eliminadas correctamente');
            } else {
                handleErrors(response.messa );
            }
        } catch (error) {
            handleErrors(error);
        }
    };
    //-----------------------------------------------------------------------------------------------------------------

    //-----------------------------------------------------------------------------------------------------------------
    /**
     * @ES ORDENA LOS DATOS DE LA TABLA
     * @EN ORDERS THE TABLE DATA
     * 
     * @returns 
     */
    //-----------------------------------------------------------------------------------------------------------------
    const orderedData = () => data?.brands.map((row: any) => {
        const orderedRow: any = {};
        columnOrder.forEach((key) => {
            orderedRow[key] = row[key];
        });
        return orderedRow;
    });
    //-----------------------------------------------------------------------------------------------------------------

    // RENDER

    return (
        <Page container='fluid'>
            {data !== undefined && (
                <CustomTable
                    id={'brands-table'}
                    columnOrder={columnOrder}
                    columnsNotShown={['brandImg']}
                    data={orderedData()}
                    isLoading={loading}
                    overrideColumns={[
                        {
                            key: 'isActive',
                            permissions: [
                                {group: 'brands', permission: 'edit_brands'}
                            ],
                            render: (row: any) => {
                                return (
                                    <div className="">
                                        <StatusBadgeDropdown
                                            isActive={row.row.original.isActive}
                                            onToggle={() => toggleStatus(row.row.original.id)}
                                            className="w-full"
                                        />
                                    </div>
                                );
                            },
                        },
                        {
                            key: 'name',
                            render: (row: any) => {

                                const img = row.row.original.brandImg;

                                return (
                                    <div className="flex items-center gap-3">
                                        {img ? (
                                            <AsyncImg
                                                id={img.id}
                                                isBackground
                                                className="w-10 h-10 rounded-full object-cover border border-gray-200 shadow-sm"
                                            />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="h-5 w-5 text-gray-400"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                    strokeWidth={1.5}
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M3 7h18M3 7l2 13h14l2-13M5 7V5a2 2 0 012-2h10a2 2 0 012 2v2"
                                                    />
                                                </svg>
                                            </div>
                                        )}

                                        <span className="font-medium text-gray-900">
                                            {row.row.original.name}
                                        </span>
                                    </div>
                                );
                            }
                        }
                    ]}
                    actions={[
                        {
                            label: 'View',
                            permissions: { group: 'brands', permission: 'get_brands' },
                            render: (row: any) => {
                                return (
                                    <Tooltip
                                        size="sm"
                                        content={'Ver marca'}
                                        placement="top"
                                        color="invert"
                                    >
                                        <Link
                                            to={`${menuRoutes.brands.path}/${row.id}/profile/${menuRoutes.brands.profile.info}`}>
                                            <ActionIcon
                                                as="span"
                                                size="sm"
                                                variant="outline"
                                                className="hover:!border-gray-900 hover:text-gray-700 bg-white"
                                            >
                                                <VerIcon className="h-4 w-4" />
                                            </ActionIcon>
                                        </Link>
                                    </Tooltip>
                                );
                            },
                        },
                        {
                            label: 'Edit',
                            permissions: { group: 'brands', permission: 'edit_brands' },
                            render: (row: any) => {
                                return (
                                    <Tooltip
                                        size="sm"
                                        content={'Editar marca'}
                                        placement="top"
                                        color="invert"
                                    >
                                        <ActionIcon
                                            as="span"
                                            size="sm"
                                            variant="outline"
                                            className="hover:!border-gray-900 hover:text-gray-700 bg-white"
                                            onClick={() => onEdit?.(row.id)}
                                        >
                                            <EditarIcon className="h-4 w-4" />
                                        </ActionIcon>
                                    </Tooltip>
                                );
                            },
                        },
                        {
                            label: 'Delete',
                            permissions: { group: 'brands', permission: 'delete_brands' },
                            render: (row: any) => {
                                return (
                                    <Tooltip
                                        size="sm"
                                        content={'Eliminar'}
                                        placement="top"
                                        color="invert"
                                    >
                                        <div>
                                            <DeletePopover
                                                title={`Eliminar marca`}
                                                description={`¿Estás seguro de que deseas eliminar la marca ${row.name}?`}
                                                onDelete={() => handleDelete(row.id)}
                                                actionIconClassName='bg-white'
                                            />
                                        </div>
                                    </Tooltip>
                                );
                            },
                        },
                    ]}
                    handleMultipleDelete={handleMultiDelete}
                    filters={filters}
                    updateFilters={updateFilters}
                    updateFilterOrder={updateFilterOrder}
                    defaultOrder={filters.filter_order || undefined}
                    paginationData={{
                        pageSize: filters.limit,
                        currentPage: filters.page,
                        pageCount: (data as BrandsApiResponse) ? data.lastPage : 1,
                        totalCount: data?.totalRegisters,
                        handlePagination: updatePage,
                        handlePerPage: updatePageSize,
                    }}
                    toggleFilters={() => setOpenFilters(!openFilters)}
                />
            )}

            <FilterDrawerView isOpen={openFilters} setOpenDrawer={setOpenFilters} drawerTitle={'Filtros Marcas'}>
                <BrandsFilters filters={filters} updateFilters={updateFilters} resetFilters={resetFilters} />
            </FilterDrawerView>
        </Page>
    );
};

export default BrandsList;