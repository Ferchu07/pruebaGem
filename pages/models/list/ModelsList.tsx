import { useCallback, useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { ActionIcon, Switch, Tooltip } from 'rizzui';
import { toast } from 'sonner';
import { ReactComponent as EditarIcon } from '../../../assets/Iconos/Interfaz/editar.svg';
import { ReactComponent as PersonalizacionIcon } from '../../../assets/Iconos/Interfaz/personalizacion.svg';
import { ReactComponent as VerIcon } from '../../../assets/Iconos/Interfaz/ver.svg';
import DeletePopover from '../../../components/buttons/DeletePopover';
import { PrivilegeContext } from '../../../components/priviledge/PriviledgeProvider';
import { useFiltersPR } from '../../../components/providers/FiltersProvider';
import CustomTable from '../../../components/table/CustomTable';
import { FilterDrawerView } from '../../../components/table/components/TableFilter';
import useFetch from '../../../hooks/useFetch';
import useHandleErrors from '../../../hooks/useHandleErrors';
import Page from '../../../layout/Page/Page';
import { menuRoutes } from '../../../router/menu';
import { ModelService } from '../../../services/model/modelService';
import { ModelsApiResponse } from '../../../type/entities/model-type';
import ModelsFilters from './ModelsFilters';
import AsyncImg from '../../../components/extras/AsyncImg';
import VehicleIconSelector from '../../../components/icon/VehicleIconSelector';
import BrandInfoModal from '../modals/BrandInfoModal';

const columnOrder = [
    'id',
    'name',
    'brand',
    'vehicleType',
    'vehicleSubtype',
    'description',
    'isActive',
    'createdAt',
    'updatedAt'
];


interface ModelsListProps {
    refreshSignal?: number;
    onEdit?: (id: string) => void;
}


const ModelsList = ({ refreshSignal, onEdit }: ModelsListProps) => {

    // STATES
    const [changingStatus, setChangingStatus] = useState<string[]>([]);
    const [openFilters, setOpenFilters] = useState<boolean>(false);
    const [modelId, setModelId] = useState<string | null | undefined>(null);
    const [selectedBrandId, setSelectedBrandId] = useState<string | null>(null);
    const [openBrandModal, setOpenBrandModal] = useState(false);



    // HOOKS
    const { handleErrors } = useHandleErrors();
    const { userCan } = useContext(PrivilegeContext);
    const { filters, updateFilters, updateFilterOrder, updatePage, updatePageSize, resetFilters } = useFiltersPR();
    const service = new ModelService();

    // FETCHING DATA

    //-----------------------------------------------------------------------------------------------------------------
    /**
     * @ES OBTIENE LA LISTA DE MODELOS
     * @EN GETS THE MODEL LIST
     */
    //-----------------------------------------------------------------------------------------------------------------
    const [data, loading, error, refetch] = useFetch(useCallback(async () => {
        const response = await service.listModels(filters);
        console.log('Datos obtenidos:' + response);
        console.log(response.getResponseData)
        return response.getResponseData() as ModelsApiResponse;
    }, [filters, refreshSignal]));
    //-----------------------------------------------------------------------------------------------------------------

    // FUNCTIONS

    //-----------------------------------------------------------------------------------------------------------------
    /**
     * @ES MANEJO DEL CAMBIO DE ESTADO DE UN MODELO
     * @EN HANDLER FOR THE MODEL STATE CHANGE
     */
    //-----------------------------------------------------------------------------------------------------------------
    const toggleStatus = async (id: string) => {
            try {
                setChangingStatus([...changingStatus, id]);
                const response = (await service.toggleModelStatus(id)).getResponseData();
                if (response.success) 
                {
                    setChangingStatus(changingStatus.filter((item) => item !== id));
                    refetch();
                    toast.success(response.message);
                } 
                else 
                {
                    setChangingStatus(changingStatus.filter((item) => item !== id));
                    toast.error(response.message);
                }
            } 
            catch (error: any) 
            {
                setChangingStatus(changingStatus.filter((item) => item !== id));
                toast.error(error.message);
            }
        };
    //-----------------------------------------------------------------------------------------------------------------


    //-----------------------------------------------------------------------------------------------------------------
    /**
     * @ES ELIMINA UN MODELO
     * @EN DELETES A MODEL
     * 
     * @param id 
     */
    //-----------------------------------------------------------------------------------------------------------------
    const handleDelete = async (id: string) => {
        try {
            const response = await (await service.deleteModel(id)).getResponseData();
            if (response.success) {
                refetch();
                toast.success(response.message || 'Modelo eliminado correctamente');
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
     * @ES ELIMINA VARIOS MODELOS
     * @EN DELETES MULTIPLE MODELS
     * 
     * @param ids 
     */
    //-----------------------------------------------------------------------------------------------------------------
    const handleMultiDelete = async (ids: string[]) => {
        try {
            const response = await (await service.deleteMultiModels(ids)).getResponseData();
            if (response.success) {
                refetch();
                toast.success(response.message || 'Modelos eliminados correctamente');
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
    const orderedData = () => data?.models.map((row: any) => {
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
                    id={'models-table'}
                    columnOrder={columnOrder}
                    data={orderedData()}
                    isLoading={loading}
                    overrideColumns={[
                        {
                            key: 'isActive',
                            permissions: [
                                {group: 'models', permission: 'edit_models'}
                            ],
                            render: (row: any) => {
                                return (
                                    <Tooltip
                                        size="sm"
                                        content={row.row.original.isActive ? 'Desactivar modelo' : 'Activar modelo'}
                                        placement="top"
                                        color="invert"
                                    >
                                        <Switch
                                            id={row.row.original.id}
                                            checked={row.row.original.isActive}
                                            disabled={changingStatus.includes(row.row.original.id)}
                                            onChange={() => toggleStatus(row.row.original.id)}
                                            switchKnobClassName='bg-primary'
                                        />
                                    </Tooltip>
                                );
                            },
                        },
                        {
                            key: 'brand',
                            columnNameKey: 'Marca',
                            permissions: [
                                { group: 'brands', permission: 'get_brands' }
                            ],
                            render: (row: any) => {

                                const brand = row.row.original.brand;
                                const img = brand?.brandImg;

                                return (
                                    <Tooltip
                                        size="sm"
                                        content={'Ver marca'}
                                        placement="top"
                                        color="invert"
                                    >
                                        <div
                                            className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition"
                                            onClick={() => {
                                                setSelectedBrandId(brand?.id);
                                                setOpenBrandModal(true);
                                            }}
                                        >
                                            {img ? (
                                                <AsyncImg
                                                    id={img.id}
                                                    isBackground
                                                    className="w-9 h-9 rounded-full object-cover border border-gray-200 shadow-sm"
                                                />
                                            ) : (
                                                <div className="w-9 h-9 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center">
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className="h-4 w-4 text-gray-400"
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
                                                {brand?.name}
                                            </span>
                                        </div>
                                    </Tooltip>
                                );
                            }
                        },
                        {
                            key: 'vehicleType',
                            columnNameKey: 'Tipo de vehículo',
                            permissions: [
                                { group: 'vehicle_types', permission: 'get_vehicle_types' }
                            ],
                            render: (row: any) => {

                                const type = row.row.original.vehicleType;

                                if (!type) return <span className="text-gray-400">-</span>;

                                return userCan('get_vehicle_types', 'vehicle_types') ? (
                                    <Link
                                        to={`${menuRoutes.vehicleTypes.path}/${type.id}/profile/${menuRoutes.vehicleTypes.profile.info}`}
                                        className="text-primary font-medium hover:underline text-sm flex items-end"
                                    >
                                        <VehicleIconSelector
                                            category={type?.name} 
                                            subcategory={null} 
                                            className='w-6 h-6 me-2'
                                        />
                                        {type.name}
                                    </Link>
                                ) : (
                                    <span className="font-medium text-gray-900 text-sm flex items-end">
                                         <VehicleIconSelector
                                            category={type?.name} 
                                            subcategory={null} 
                                            className='w-6 h-6 me-2'
                                        />
                                        {type.name}
                                    </span>
                                );
                            }
                        },
                        {
                            key: 'vehicleSubtype',
                            columnNameKey: 'Subtipo de vehículo',
                            permissions: [
                                { group: 'vehicle_subtypes', permission: 'get_vehicle_subtypes' }
                            ],
                            render: (row: any) => {

                                const subtype = row.row.original.vehicleSubtype;

                                if (!subtype) return <span className="text-gray-400">-</span>;

                                return userCan('get_vehicle_subtypes', 'vehicle_subtypes') ? (
                                    <Link
                                        to={`${menuRoutes.vehicleSubTypes.path}/${subtype.id}/profile/${menuRoutes.vehicleSubTypes.profile.info}`}
                                        className="text-primary font-medium hover:underline text-sm flex items-end"
                                    >
                                        <VehicleIconSelector
                                            category={null} 
                                            subcategory={subtype?.name} 
                                            className='w-6 h-6 me-2'
                                        />
                                        {subtype.name}
                                    </Link>
                                ) : (
                                    <span className="font-medium text-gray-900 text-sm flex items-end">
                                         <VehicleIconSelector
                                            category={null} 
                                            subcategory={subtype?.name} 
                                            className='w-6 h-6 me-2'
                                        />
                                        {subtype.name}
                                    </span>
                                );
                            }
                        },

                    ]}
                    actions={[
                        {
                            label: 'View',
                            permissions: { group: 'models', permission: 'get_models' },
                            render: (row: any) => {
                                return (
                                    <Tooltip
                                        size="sm"
                                        content={'Ver modelo'}
                                        placement="top"
                                        color="invert"
                                    >
                                        <Link
                                            to={`${menuRoutes.models.path}/${row.id}/profile/${menuRoutes.models.profile.info}`}>
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
                            permissions: { group: 'models', permission: 'edit_models' },
                            render: (row: any) => {
                                return (
                                    <Tooltip
                                        size="sm"
                                        content={'Editar modelo'}
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
                            label: 'Metrics',
                            permissions: { group: 'models', permission: 'edit_models' },
                            render: (row: any) => {
                                return (
                                    <Tooltip
                                        size="sm"
                                        content={'Configurar métricas'}
                                        placement="top"
                                        color="invert"
                                    >
                                        <Link
                                            to={`${menuRoutes.models.path}/${row.id}/profile/${menuRoutes.models.profile.metrics_config}`}>
                                            <ActionIcon
                                                as="span"
                                                size="sm"
                                                variant="outline"
                                                className="hover:!border-gray-900 hover:text-gray-700 bg-white"
                                            >
                                                <PersonalizacionIcon className="h-4 w-4" />
                                            </ActionIcon>
                                        </Link>
                                    </Tooltip>
                                );
                            },
                        },
                        {
                            label: 'Delete',
                            permissions: { group: 'models', permission: 'delete_models' },
                            render: (row: any) => {
                                return (
                                    <Tooltip
                                        size="sm"
                                        content={'Eliminar modelo'}
                                        placement="top"
                                        color="invert"
                                    >
                                        <div>
                                            <DeletePopover
                                                title={`Eliminar modelo`}
                                                description={`¿Estás seguro de que deseas eliminar el modelo ${row.name}?`}
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
                        pageCount: (data as ModelsApiResponse) ? data.lastPage : 1,
                        totalCount: data?.totalRegisters,
                        handlePagination: updatePage,
                        handlePerPage: updatePageSize,
                    }}
                    toggleFilters={() => setOpenFilters(!openFilters)}
                />
            )}

            <FilterDrawerView isOpen={openFilters} setOpenDrawer={setOpenFilters} drawerTitle={'Filtros Modelos'}>
                <ModelsFilters filters={filters} updateFilters={updateFilters} resetFilters={resetFilters} />
            </FilterDrawerView>

            <BrandInfoModal
                brandId={selectedBrandId}
                isOpen={openBrandModal}
                onClose={() => setOpenBrandModal(false)}
            />
        </Page>
    );
};

export default ModelsList;