import { HeaderMenuItem } from "../type/menu-type";
import { ReactComponent as HomeIcon } from "../assets/Iconos/Interfaz/inicio.svg";
import { ReactComponent as AdminIcon } from "../assets/Iconos/menu/administracion.svg";
import { ReactComponent as ControlAccessIcon } from "../assets/Iconos/menu/control_acceso.svg";
import { ReactComponent as OrgsIcon } from "../assets/Iconos/Interfaz/organizaciones.svg";
import { ReactComponent as RolesIcon } from "../assets/Iconos/Interfaz/roles.svg";
import { ReactComponent as UsersIcon } from '../assets/Iconos/Interfaz/listado_usuarios.svg';
import { ReactComponent as VehicleIcon } from '../assets/Iconos/Interfaz/gestion_flota.svg';
import { ReactComponent as DeviceIcon } from '../assets/Iconos/Interfaz/listado_dispositivos.svg';
import { ReactComponent as GeoIcon } from '../assets/Iconos/Interfaz/geolocalizacion.svg';
import { ReactComponent as UsersIconHeader } from '../assets/Iconos/menu/administracion_usuarios.svg';
import { ReactComponent as OrgsIconHeader } from '../assets/Iconos/menu/administracion_organizaciones.svg';
import { ReactComponent as RolesIconHeader } from '../assets/Iconos/menu/administracion_roles.svg';
import { ReactComponent as VehicleIconHeader } from '../assets/Iconos/menu/administracion_vehiculos.svg';
import { ReactComponent as DeviceIconHeader } from '../assets/Iconos/menu/administracion_dispositivos.svg';
import { ReactComponent as GeoIconHeader } from '../assets/Iconos/menu/administracion_geolocalizacion.svg';
import { ReactComponent as MarcaIcon } from '../assets/Iconos/menu/marca.svg';
import { ReactComponent as SubcategoriaIcon } from '../assets/Iconos/menu/subcategoria.svg';
import { ReactComponent as TipoVehiculoIcon } from '../assets/Iconos/menu/tipo_vehiculo.svg';

export const menuRoutes = {
    auth: {
        login: "/login",
        grant_access: "/grant-access",
        forgot_password: "/forgot-password",
        initialPassword: "/set-initial-password",
        reset_password: "/reset-password",
    },
    dashboard: {
        path: "/dashboard",
    },
    geolocation: {
        path: "/geolocation",
    },
    organisations: {
        path: "/organisations",
        create: "create",
        edit: ":id/edit",
    },
    roles: {
        path: "/roles",
        create: "create",
        edit: ":id/edit",
    },
    users: {
        path: "/users",
        create: "create",
        edit: ":id/edit/info",
        edit_permissions: ":id/edit/permissions",
        profile: {
            path: ":id/profile",
            info: "/info",
            stats: "/stats",
            documents: "/documents",
            permissions: "/permissions",
            contract_history: "/contract-history",
            activity: "/activity",
        },
    },
    devices: {
        path: "/devices",
        create: "create",
        edit: ":id/edit",
        profile: {
            path: ":id/profile"
        },
    },
    ecus: {
        path: "/ecus",
        create: "create",
        edit: ":id/edit",
        profile: {
            path: ":id/profile/",
            info: "info",
        },
    },
    groups: {
        path: "/groups",
        create: "create",
        edit: ":id/edit",
        profile: {
            path: ":id/profile/",
            info: "info",
        },
    },
    metrics: {
        path: "/metrics",
        create: "create",
        edit: ":id/edit",
        profile: {
            path: ":id/profile/",
            info: "info",
        },
    },
    vehicles: {
        path: "/vehicles",
        create: "create",
        edit: ":id/edit",
        profile: {
            path: ":id/profile/",
            info: "info",
            device_history: "device-history",
            metrics: "metrics",
            data_history: "data-history",
        },
    },
    vehicleTypes:{
        path: "/vehicle-types",
        create: "create",
        edit: ":id/edit",
        profile: {
            path: ":id/profile/",
            info: "info"
        },
    },
    vehicleSubTypes:{
        path: "/vehicle-sub-types",
        create: "create",
        edit: ":id/edit",
        profile: {
            path: ":id/profile/",
            info: "info"
        },
    },
    brands: {
        path: "/brands",
        create: "create",
        edit: ":id/edit",
        profile: {
            path: ":id/profile/",
            info: "info",
            models: "models"
        },
    },
    models: {
        path: "/models",
        create: "create",
        edit: ":id/edit",
        profile: {
            path: ":id/profile/",
            info: "info",
            device_types: "device-types",
            metrics_config: "metrics-config"
        },
    },
    settings: {
        path: "/settings",
        invoices: "/invoices",
        contracts: "/contracts",
        tutors: "/tutors",
        holidays: "/holidays",
    },
};

export const rotherMenuItems: HeaderMenuItem = {
    dashboardMenu: {
        id: "dashboard",
        name: "Inicio",
        path: "/dashboard",
        type: "enhance",
        react_icon: HomeIcon,
        permissions_required: [{
            group: "dashboard",
            action: "get_dashboard_information",
        }],
    },
    administrationMenu: {
        id: "administration",
        name: "Administración",
        path: "/admin",
        react_icon: AdminIcon,
        type: "enhance",
        dropdownItems: [
            {
                id: "access-and-credentials",
                name: "Control de acceso",
                react_icon: ControlAccessIcon,
                header_icon: UsersIconHeader,
                subMenuItems: [
                    {
                        name: "Usuarios",
                        href: menuRoutes.users.path,
                        react_icon: UsersIcon,
                        header_icon: UsersIconHeader,
                        permissions_required: [
                            {
                                group: "user",
                                action: "list_users",
                            }
                        ],
                    },
                    {
                        name: "Roles",
                        href: menuRoutes.roles.path,
                        react_icon: RolesIcon,
                        header_icon: RolesIconHeader,
                        permissions_required: [
                            {
                                group: "roles",
                                action: "list_roles",
                            },
                        ],
                    },
                    {
                        name: "Organizaciones",
                        href: menuRoutes.organisations.path,
                        react_icon: OrgsIcon,
                        header_icon: OrgsIconHeader,
                        permissions_required: [
                            {
                                group: "companies",
                                action: "admin_companies",
                            }
                        ],
                    },
                ]
            },
            {
                id: "vehicles",
                name: "Vehículos",
                react_icon: VehicleIcon,
                header_icon: VehicleIconHeader,
                subMenuItems: [
                    {
                        name: "Flota",
                        href: menuRoutes.vehicles.path,
                        react_icon: VehicleIcon,
                        header_icon: VehicleIconHeader,
                        permissions_required: [
                            {
                                group: "vehicles",
                                action: "list_vehicles",
                            }
                        ],
                    },
                    {
                        name: "Marcas",
                        href: menuRoutes.brands.path,
                        react_icon: MarcaIcon,
                        header_icon: VehicleIconHeader,
                        permissions_required: [
                            {
                                group: "brands",
                                action: "list_brands",
                            }
                        ],
                    },
                    {
                        name: "Modelos",
                        href: menuRoutes.models.path,
                        react_icon: VehicleIcon,
                        header_icon: VehicleIconHeader,
                        permissions_required: [
                            {
                                group: "models",
                                action: "list_models",
                            }
                        ],
                    },
                    {
                        name: "Tipos de Vehículos",
                        href: menuRoutes.vehicleTypes.path,
                        react_icon: TipoVehiculoIcon,
                        header_icon: VehicleIconHeader,
                        permissions_required: [
                            {
                                group: "vehicle_types",
                                action: "list_vehicle_types",
                            }
                        ],
                    },
                    {
                        name: "Subtipos de Vehículos",
                        href: menuRoutes.vehicleSubTypes.path,
                        react_icon: SubcategoriaIcon,
                        header_icon: VehicleIconHeader,
                        permissions_required: [
                            {
                                group: "vehicle_subtypes",
                                action: "list_vehicle_subtypes",
                            }
                        ],
                    },
                ]
            },
            {
                id: "devices",
                name: "Dispositivos",
                header_icon: DeviceIconHeader,
                react_icon: DeviceIcon,
                subMenuItems: [
                    {
                        name: "Dispositivos",
                        href: menuRoutes.devices.path,
                        react_icon: DeviceIcon,
                        header_icon: DeviceIconHeader,
                        permissions_required: [
                            {
                                group: "devices",
                                action: "list_devices",
                            }
                        ],
                    },
                    {
                        name: "Ecus",
                        href: menuRoutes.ecus.path,
                        react_icon: DeviceIcon,
                        header_icon: DeviceIconHeader,
                        permissions_required: [
                            {
                                group: "metrics",
                                action: "list_metrics",
                            }
                        ],
                    },
                    {
                        name: "Grupos",
                        href: menuRoutes.groups.path,
                        react_icon: DeviceIcon,
                        header_icon: DeviceIconHeader,
                        permissions_required: [
                            {
                                group: "metrics",
                                action: "list_metrics",
                            }
                        ],
                    },
                    {
                        name: "Metricas",
                        href: menuRoutes.metrics.path,
                        react_icon: DeviceIcon,
                        header_icon: DeviceIconHeader,
                        permissions_required: [
                            {
                                group: "metrics",
                                action: "list_metrics",
                            }
                        ],
                    }
                ],
            },
            {
                id: "geolocation",
                name: "Geolocalización",
                header_icon: GeoIconHeader,
                react_icon: GeoIcon,
                path: menuRoutes.geolocation.path,
                permissions_required: [
                    {
                        group: "vehicles",
                        action: "list_vehicles",
                    }
                ],
            },
            // {
            //     id: "incidents",
            //     name: "Análisis de incidentes y averías",
            //     react_icon: IncidentsIcon,
            //     path: "/incidents", // Placeholder
            //     permissions_required: [
            //         {
            //             group: "dashboard",
            //             action: "get_dashboard_information",
            //         }
            //     ],
            // }
        ]
    },
};