import { Fragment, useContext, useEffect } from "react";
import { PrivilegeContext } from "../../../components/priviledge/PriviledgeProvider";
import { FiltersProvider } from "../../../components/providers/FiltersProvider";
import BrandsList from "./BrandsList";
import { useState } from "react";
import BrandCreateModal from "../modals/BrandCreateModal";
import BrandEditModal from "../modals/BrandEditModal";
import { useSetAtom } from "jotai";
import { headerActionAtom, headerConfigAtom } from "../../../atoms/headerAtoms";
import { useNavigate } from "react-router-dom";
import { ReactComponent as BrandIcon } from '../../../assets/Iconos/menu/marca.svg';
import { ReactComponent as BrandCreateIcon } from '../../../assets/Iconos/menu/nueva_marca.svg';

const BrandsListWrapper = () => {

    // HOOKS

    const { userCan } = useContext(PrivilegeContext);
    const navigate = useNavigate();
    const [openCreateModal, setOpenCreateModal] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    const [openEditModal, setOpenEditModal] = useState(false);
    const [selectedBrandId, setSelectedBrandId] = useState<string | null>(null);

    // ATOMS
    
    const setHeaderAction = useSetAtom(headerActionAtom);
    const setHeaderConfig = useSetAtom(headerConfigAtom);

    // USE EFFECT

    useEffect(() => {

        // CONFIGURE HEADER TITLE AND ICON

        setHeaderConfig({
            title: "MARCAS",
            icon: <BrandIcon className="app-sub-icon" />
        });

        // CONFIGURE MAIN ACTION BUTTON

        if (userCan('create_brands', 'brands')) {
            setHeaderAction({
                show: userCan('create_brands', 'brands'),
                className: 'border-white w-[40px] h-[40px] p-0',
                label: <BrandCreateIcon className="app-sub-icon" />,
                onClick: () => setOpenCreateModal(true)
            });
        }

        // CLEANUP EFFECT

        return () => {
            setHeaderAction(null);
            setHeaderConfig(null);
        };

    }, [navigate, userCan, setHeaderAction, setHeaderConfig]);

    // RENDER

    return (
        <Fragment>
            <FiltersProvider>
                <BrandsList
                    refreshSignal={refreshKey}
                    onEdit={(id: string) => {
                        setSelectedBrandId(id);
                        setOpenEditModal(true);
                    }}
                />

                <BrandCreateModal
                    isOpen={openCreateModal}
                    onClose={() => setOpenCreateModal(false)}
                    onCreated={() => setRefreshKey(prev => prev + 1)}
                />

                <BrandEditModal
                    brandId={selectedBrandId}
                    isOpen={openEditModal}
                    onClose={() => setOpenEditModal(false)}
                    onUpdated={() => setRefreshKey(prev => prev + 1)}
                />
            </FiltersProvider>
        </Fragment>
    );
}

export default BrandsListWrapper;