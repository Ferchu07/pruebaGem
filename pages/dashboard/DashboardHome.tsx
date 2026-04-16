import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Text, Title } from 'rizzui';
import { ReactComponent as UsersIcon } from '../../assets/Iconos/Interfaz/listado_usuarios.svg';
import { ReactComponent as VehicleIcon } from '../../assets/Iconos/Interfaz/gestion_flota.svg';
import { ReactComponent as DeviceIcon } from '../../assets/Iconos/Interfaz/listado_dispositivos.svg';
import { ReactComponent as GeoIcon } from '../../assets/Iconos/Interfaz/geolocalizacion.svg';
import { menuRoutes } from '../../router/menu';
import cn from '../../utils/classNames';
import { useCheckMenuAccess } from '../../utils/CheckMenuPermissions';
import { PermissionRequired } from '../../type/menu-type';
import { useSetAtom } from 'jotai';
import { headerConfigAtom } from '../../atoms/headerAtoms';
import { ReactComponent as InicioIcon } from '../../assets/Iconos/Interfaz/inicio.svg';

const DashboardHome = () => {

    // HOOKS

    const navigate = useNavigate();
    const checkMenuItemAccess = useCheckMenuAccess();

    // ATOMS

    const setHeaderConfig = useSetAtom(headerConfigAtom);

    const menuItems: {
        title: string;
        description: string;
        icon: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
        icon_class: string;
        path: string;
        color: string;
        borderColor: string;
        permissions_required: PermissionRequired[];
    }[] = [
        {
            title: 'Usuarios',
            description: 'Gestión y configuración de usuarios',
            icon: UsersIcon,
            icon_class: 'w-9 h-9 brightness-0 invert',
            path: menuRoutes.users.path,
            color: 'bg-[#515e7d]',
            borderColor: 'border-black',
            permissions_required: [{ action: 'list_users', group: 'user' }]
        },
        {
            title: 'Vehículos',
            description: 'Administración de la flota y visualización de parámetros',
            icon: VehicleIcon,
            icon_class: 'w-9 h-9 brightness-0 invert',
            path: menuRoutes.vehicles.path,
            color: 'bg-[#515e7d]',
            borderColor: 'border-black',
            permissions_required: [{ action: 'list_vehicles', group: 'vehicles' }]
        },
        {
            title: 'Dispositivos',
            description: 'Control de dispositivos adquiridos',
            icon: DeviceIcon,
            icon_class: 'w-9 h-9 brightness-0 invert',
            path: menuRoutes.devices.path,
            color: 'bg-[#515e7d]',
            borderColor: 'border-black',
            permissions_required: [{ action: 'list_devices', group: 'devices' }]
        },
        {
            title: 'Geolocalización',
            description: 'Seguimiento en tiempo real y trazabilidad',
            icon: GeoIcon,
            icon_class: 'w-9 h-9 brightness-0 invert',
            path: '/geolocation',
            color: 'bg-[#515e7d]',
            borderColor: 'border-black',
            permissions_required: [{ action: 'get_dashboard_information', group: 'dashboard' }]
        }
    ];

    const filteredMenuItems = menuItems.filter(item => 
        checkMenuItemAccess(item.permissions_required)
    );

    // USE EFFECT

    useEffect(() => {

        // CONFIGURE HEADER TITLE AND ICON

        setHeaderConfig({
            title: "Inicio",
            icon: <InicioIcon className="app-sub-icon" />,
            breadcrumbs: [
                { label: 'Inicio', path: '/', active: true },
            ]
        });

        // CLEANUP EFFECT

        return () => {
            setHeaderConfig(null);
        };

    }, [navigate, setHeaderConfig]);

    // RENDER

    return (
        <div className="flex flex-col gap-6 p-6">

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                {filteredMenuItems.map((item, index) => {
                    const Icon = item.icon;
                    return (
                        <button
                            key={index}
                            onClick={() => navigate(item.path)}
                            className={cn(
                                " bg-[#c1cff5] flex flex-col items-start justify-start gap-3 p-6 border rounded-xl transition-all duration-200 hover:shadow-md group text-left h-full",
                                item.borderColor
                            )}
                        >
                            <div className='flex items-center justify-center gap-2'>
                                <div className={cn(
                                    "dahsboard-icon-box rounded flex items-center justify-center mb-1",
                                    item.color
                                )}>
                                    <Icon className={item.icon_class} />
                                </div>
                                <Title as="h3" className="text-xl font-bold text-gray-900">
                                    {item.title}
                                </Title>
                            </div>
                            <div className="flex flex-col gap-1">
                                <Text className="text-lg text-gray-500 font-medium">
                                    {item.description}
                                </Text>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default DashboardHome;
