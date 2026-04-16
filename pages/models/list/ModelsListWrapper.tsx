import { Fragment, useContext, useEffect } from "react";
import { useNavigate } from "react-router";
import { PrivilegeContext } from "../../../components/priviledge/PriviledgeProvider";
import { FiltersProvider } from "../../../components/providers/FiltersProvider";
import ModelsList from "./ModelsList";
import { useState } from "react";
import ModelCreateModal from "../modals/ModelCreateModal";
import ModelEditModal from "../modals/ModelEditModal";
import { useSetAtom } from "jotai";
import { headerActionAtom, headerConfigAtom } from "../../../atoms/headerAtoms";
import { PiPlus } from "react-icons/pi";
import { ReactComponent as ModelsIcon } from '../../../assets/Iconos/Interfaz/listado_dispositivos.svg';

const ModelsListWrapper = () => {

    // HOOKS

    const { userCan } = useContext(PrivilegeContext);
    const navigate = useNavigate();
    const [openCreateModal, setOpenCreateModal] = useState(false);
    const [openEditModal, setOpenEditModal] = useState(false);
    const [selectedModelId, setSelectedModelId] = useState<string | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);

    // ATOMS

    const setHeaderAction = useSetAtom(headerActionAtom);
    const setHeaderConfig = useSetAtom(headerConfigAtom);

    // USE EFFECT

    useEffect(() => {

        // CONFIGURE HEADER TITLE AND ICON

        setHeaderConfig({
            title: "MODELOS",
            icon: <ModelsIcon className="app-sub-icon" />,
            breadcrumbs: [
                { label: 'Inicio', path: '/' },
                { label: "Vehículos", path: undefined },
                { label: 'Modelos', path: '/models' , active: true }
            ]
        });

        // CONFIGURE MAIN ACTION BUTTON

        if (userCan('create_models', 'models')) {
            setHeaderAction({
                show: userCan('create_models', 'models'),
                className: 'border-white w-[40px] h-[40px] p-0',
                label: <PiPlus className="app-sub-icon" />,
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
                <ModelsList
                    refreshSignal={refreshKey}
                    onEdit={(id: string) => {
                        setSelectedModelId(id);
                        setOpenEditModal(true);
                    }}
                />
            </FiltersProvider>

            <ModelCreateModal
                isOpen={openCreateModal}
                onClose={() => setOpenCreateModal(false)}
                onCreated={() => {
                    setRefreshKey(prev => prev + 1);
                }}
            />

            <ModelEditModal
                modelId={selectedModelId}
                isOpen={openEditModal}
                onClose={() => setOpenEditModal(false)}
                onUpdated={() => setRefreshKey(prev => prev + 1)}
            />
        </Fragment>
    );
}

export default ModelsListWrapper;