import moment from 'moment';
import React, { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { ActionIcon, Switch, Tooltip } from 'rizzui';
import { toast } from 'sonner';
import { ReactComponent as EditarIcon } from '../../../assets/Iconos/Interfaz/editar.svg';
import DeletePopover from '../../../components/buttons/DeletePopover';
import { useFiltersPR } from '../../../components/providers/FiltersProvider';
import CustomTable from '../../../components/table/CustomTable';
import { FilterDrawerView } from '../../../components/table/components/TableFilter';
import useFetch from '../../../hooks/useFetch';
import useHandleErrors from '../../../hooks/useHandleErrors';
import Page from '../../../layout/Page/Page';
import { menuRoutes } from '../../../router/menu';
import { OrganisationService } from '../../../services/organisation/organisationService';
import { OrganisationsApiResponse } from '../../../type/entities/organisation-type';
import OrganisationsFilters from './OrganisationsFilters';

interface OrganisationsListProps { }

const columnOrder = [
    'id',
    'logo',
    'cif',
    'address',
    'description',
    'isActive',
    'createdAt',
    'name',
];

const OrganisationsList: React.FC<OrganisationsListProps> = ({ }) => {

    // HOOKS

    const { handleErrors } = useHandleErrors();
    const { filters, updateFilters, updateFilterOrder, updatePage, updatePageSize, resetFilters } = useFiltersPR();
    const service = new OrganisationService();

    // STATES

    const [changingStatus, setChangingStatus] = useState<string[]>([]);
    const [openFilters, setOpenFilters] = useState<boolean>(false);

    // FUNCTIONS

    // ----------------------------------------------------------------------------------------------
    /**
     * @ES OBTIENE LA LISTA DE ORGANIZACIONES
     * @EN GETS THE LIST OF ORGANISATIONS
     * 
     * @param filters
     */
    // ----------------------------------------------------------------------------------------------
    const [data, loading, error, refetch] = useFetch(useCallback(async () => {
        const response = await service.listOrganisations(filters);
        return response.getResponseData() as OrganisationsApiResponse;
    }, [filters]));
    // ----------------------------------------------------------------------------------------------

    // ----------------------------------------------------------------------------------------------
    /**
     * @ES CAMBIA EL ESTADO DE UNA ORGANIZACIÓN
     * @EN CHANGES THE STATUS OF AN ORGANISATION
     * 
     * @param id
     * @param status
     */
    // ----------------------------------------------------------------------------------------------
    const toggleStatus = async (id: string, status: boolean) => {
        try {
            setChangingStatus([...changingStatus, id]);
            const response = (await service.toggleOrganisationStatus(id, status)).getResponseData();
            if (response.success) {
                setChangingStatus(changingStatus.filter((item) => item !== id));
                refetch();
                toast.success(status ? "Se ha desactivado la organización" : "Se ha activado la organización");
            } else {
                setChangingStatus(changingStatus.filter((item) => item !== id));
                toast.error(response.message);
            }
        } catch (error: any) {
            setChangingStatus(changingStatus.filter((item) => item !== id));
            toast.error(error.message);
        }
    };
    // ----------------------------------------------------------------------------------------------

    // ----------------------------------------------------------------------------------------------
    /**
     * @ES ELIMINA UNA ORGANIZACIÓN
     * @EN DELETES AN ORGANISATION
     * 
     * @param id
     */
    // ----------------------------------------------------------------------------------------------
    const handleDelete = async (id: string) => {
        try {
            const response = await (await service.deleteOrganisation(id)).getResponseData();
            if (response.success) {
                refetch();
                toast.success('Se ha eliminado la organización correctamente');
            } else {
                handleErrors(response);
            }
        } catch (error) {
            handleErrors(error);
        }
    };
    // ----------------------------------------------------------------------------------------------

    // ----------------------------------------------------------------------------------------------
    /**
     * @ES ELIMINA VARIAS ORGANIZACIONES
     * @EN DELETES MULTIPLE ORGANISATIONS
     * 
     * @param ids
     */
    // ----------------------------------------------------------------------------------------------
    const handleMultiDelete = async (ids: string[]) => {
        try {
            const response = await (await service.deleteMultiOrganisations(ids)).getResponseData();
            if (response.success) {
                refetch();
                toast.success('Se han eliminado correctamente');
            } else {
                handleErrors(response);
            }
        } catch (error) {
            handleErrors(error);
        }
    };
    // ----------------------------------------------------------------------------------------------

    // ----------------------------------------------------------------------------------------------
    /**
     * @ES ORDENA LAS COLUMNAS SEGÚN EL ORDEN DEFINIDO EN columnOrder
     * @EN SORTS THE COLUMNS ACCORDING TO THE ORDER DEFINED IN columnOrder
     */
    // ----------------------------------------------------------------------------------------------
    const orderedData = data?.data.map((row: any) => {
        const orderedRow: any = {};
        columnOrder.forEach((key) => {
            orderedRow[key] = row[key];
        });
        return orderedRow;
    });
    // ----------------------------------------------------------------------------------------------

    // RENDER

    return (
        <Page container='fluid'>
            {data !== undefined && (
                <CustomTable
                    id={'organisations-table'}
                    data={orderedData}
                    isLoading={loading}
                    overrideColumns={[
                        {
                            key: 'createdAt',
                            render: (row: any) => {
                                const date = row.row.original?.createdAt?.date;
                                return date ? moment(date).format('DD/MM/YYYY') : 'N/A';
                            },
                        },
                        {
                            key: 'isActive',
                            render: (row: any) => {
                                return (
                                    <Tooltip
                                        size="sm"
                                        content={row.row.original.isActive ? 'Desactivar organización' : 'Activar organización'}
                                        placement="top"
                                        color="invert"
                                    >
                                        <Switch
                                            id={row.row.original.id}
                                            checked={row.row.original.isActive}
                                            disabled={changingStatus.includes(row.row.original.id)}
                                            onChange={() => toggleStatus(row.row.original.id, row.row.original.isActive)}
                                            switchKnobClassName='bg-primary'
                                        />
                                    </Tooltip>
                                );
                            },
                        },
                    ]}
                    actions={[
                        {
                            label: 'Edit',
                            permissions: { group: 'companies', permission: 'edit_companies' },
                            render: (row: any) => {
                                return (
                                    <Tooltip
                                        size="sm"
                                        content={'Editar organización'}
                                        placement="top"
                                        color="invert"
                                    >
                                        <Link to={`${menuRoutes.organisations.path}/${row.id}/edit`}>
                                            <ActionIcon
                                                as="span"
                                                size="sm"
                                                variant="outline"
                                                className="hover:!border-gray-900 hover:text-gray-700 bg-white"
                                            >
                                                <EditarIcon className="h-4 w-4" />
                                            </ActionIcon>
                                        </Link>
                                    </Tooltip>
                                );
                            },
                        },
                        {
                            label: 'Delete',
                            permissions: { group: 'companies', permission: 'delete_companies' },
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
                                                title={`Eliminar organización`}
                                                description={`Vas a eliminar ${row.cif} ¿Estás seguro?`}
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
                    filter={false}
                    updateFilters={updateFilters}
                    updateFilterOrder={updateFilterOrder}
                    defaultOrder={filters.filter_order || undefined}
                    paginationData={{
                        pageSize: filters.limit,
                        currentPage: filters.page,
                        pageCount: (data as OrganisationsApiResponse) ? data.lastPage : 1,
                        totalCount: data?.totalRegisters,
                        handlePagination: updatePage,
                        handlePerPage: updatePageSize,
                    }}
                    toggleFilters={() => setOpenFilters(!openFilters)}
                />
            )}
            <FilterDrawerView isOpen={openFilters} setOpenDrawer={setOpenFilters} drawerTitle={'Filtros Organizaciones'}>
                <OrganisationsFilters filters={filters} updateFilters={updateFilters} resetFilters={resetFilters} />
            </FilterDrawerView>
        </Page>
    );
};

export default OrganisationsList;