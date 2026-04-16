import BrandsWrapper from "../pages/brands";
import BrandsListWrapper from "../pages/brands/list/BrandsListWrapper";
import DashboardWrapper from "../pages/dashboard";
import DashboardHome from "../pages/dashboard/DashboardHome";
import DashboardListWrapper from "../pages/dashboard/DashboardWrapper";
import DevicesWrapper from "../pages/devices";
import DeviceCreate from "../pages/devices/create/DeviceCreate";
import DeviceEdit from "../pages/devices/edit/DeviceEdit";
import DevicesListWrapper from "../pages/devices/list/DevicesListWrapper";
import ModelsWrapper from "../pages/models";
import ModelsListWrapper from "../pages/models/list/ModelsListWrapper";
import MetricsConfig from "../pages/models/metrics/MetricsConfig";
import OrganisationWrapper from "../pages/organisations";
import OrganisationCreate from "../pages/organisations/create/OrganisationCreate";
import OrganisationEdit from "../pages/organisations/edit/OrganisationEdit";
import OrganisationsListWrapper from "../pages/organisations/list/OrganisationsListWrapper";
import RolesWrapper from "../pages/roles";
import RoleCreate from "../pages/roles/create/RoleCreate";
import RoleEdit from "../pages/roles/edit/RoleEdit";
import RolesListWrapper from "../pages/roles/list/RolesListWrapper";
import UsersWrapper from "../pages/users";
import UserCreate from "../pages/users/create/UserCreate";
import UserEdit from "../pages/users/edit/UserEdit";
import UserEditPermissions from "../pages/users/edit/UserEditPermissions";
import UsersListWrapper from "../pages/users/list/UsersListWrapper";
import UserInfo from "../pages/users/profile/views/info/UserInfo";
import UserPermissions from "../pages/users/profile/views/permissions/UserPermissions";
import VehiclesWrapper from "../pages/vehicle";
import VehicleCreate from "../pages/vehicle/create/VehicleCreate";
import VehicleEdit from "../pages/vehicle/edit/VehicleEdit";
import VehiclesListWrapper from "../pages/vehicle/list/VehiclesListWrapper";
import VehicleProfileWrapper from "../pages/vehicle/profile/VehicleProfileWrapper";
import VehicleDevicesHistory from "../pages/vehicle/profile/views/history/VehicleDevicesHistory";
import VehicleDataHistory from "../pages/vehicle/profile/views/history/VehicleDataHistory";
import VehicleInfo from "../pages/vehicle/profile/views/info/VehicleInfo";
import VehicleMetrics from "../pages/vehicle/profile/views/metrics/VehicleMetrics";
import VehicleSubTypesListWrapper from "../pages/vehicleSubTypes/list/VehiclesSubTypesListWrapper";
import VehicleSubTypesWrapper from "../pages/vehicleTypes";
import VehicleTypesWrapper from "../pages/vehicleTypes";
import VehicleTypesListWrapper from "../pages/vehicleTypes/list/VehiclesTypesListWrapper";
import { menuRoutes } from "./menu";
import DeviceProfileLayout from "../pages/devices/profile/DeviceProfileLayout";
import BrandProfileLayout from "../pages/brands/profile/BrandProfileLayout";
import VehicleTypeProfileLayout from "../pages/vehicleTypes/profile/VehicleTypeProfileLayout";
import VehicleSubTypeProfileLayout from "../pages/vehicleSubTypes/profile/VehicleSubTypeProfileLayout";
import ModelProfileLayout from "../pages/models/profile/ModelProfileLayout";
import GeolocationPage from "../pages/geolocation/GeolocationPage";
import EcusWrapper from "../pages/ecus";
import EcusListWrapper from "../pages/ecus/list/EcusListWrapper";
import EcusCreate from "../pages/ecus/create/EcusCreate";
import EcuEdit from "../pages/ecus/edit/EcuEdit";
import EcuProfileLayout from "../pages/ecus/profile/EcuProfileLayout";
import GroupsWrapper from "../pages/groups";
import GroupsListWrapper from "../pages/groups/list/GroupsListWrapper";
import GroupProfileLayout from "../pages/groups/profile/GroupProfileLayout";
import GroupCreate from "../pages/groups/create/GroupCreate";
import GroupEdit from "../pages/groups/edit/GroupEdit";
import MetricsWrapper from "../pages/metrics";
import MetricsListWrapper from "../pages/metrics/list/MetricsListWrapper";
import MetricCreate from "../pages/metrics/create/MetricsCreate";
import MetricEdit from "../pages/metrics/edit/MetricsEdit";
import MetricProfileLayout from "../pages/metrics/profile/MetricProfileLayout";

const protectedRoutes = [
	
	/******************************************************
	 * Dashboard
	 ******************************************************/
	{
		path: menuRoutes.dashboard.path,
		element: <DashboardWrapper />,
		sub: [
			{
				element: <DashboardHome />,
				index: true,
			},
            {
				element: <DashboardListWrapper />,
				path: 'users-list',
				access: {
					group: 'user',
					action: 'list_users'
				},
			},
		],
	},

    /******************************************************
	 * Organisations
	 ******************************************************/
	{
		path: menuRoutes.organisations.path,
		element: <OrganisationWrapper />,
		access: {
			group: "companies",
			action: "admin_companies"
		},
		sub: [
			{
				element: <OrganisationsListWrapper />,
				access: {
					group: "companies",
					action: "list_companies",
				},
				index: true,
			},
			{
				element: <OrganisationCreate />,
				path: menuRoutes.organisations.create,
				access: {
					group: "companies",
					action: "create_companies"
				}
			},
			{
				element: <OrganisationEdit />,
				path: ':id/edit',
				access: {
					group: "companies",
					action: "edit_companies"
				}
			}
		],
	},

	/******************************************************
	 * Roles
	 ******************************************************/
	{
		path: menuRoutes.roles.path,
		element: <RolesWrapper />,
		sub: [
			{
				element: <RolesListWrapper />,
				access: {
					group: 'roles',
					action: 'list_roles'
				},
				index: true,
			},
			{
				element: <RoleCreate />,
				path: menuRoutes.roles.create,
				access: {
					group: 'roles',
					action: 'create_roles'
				}
			},
			{
				element: <RoleEdit />,
				path: menuRoutes.roles.edit,
				access: {
					group: 'roles',
					action: 'edit_roles'
				}
			},
		]
	},

	/******************************************************
	 * Users
	 ******************************************************/
	{
		path: menuRoutes.users.path,
		element: <UsersWrapper />,
		sub: [
			{
				element: <UsersListWrapper />,
				access: {
					group: 'user',
					action: 'list_users'
				},
				index: true,
			},
			{
				element: <UserInfo />,
				path: menuRoutes.users.profile.path + menuRoutes.users.profile.info,
				access: {
					group: 'user',
					action: 'get_users'
				},
			},
			{
				element: <UserPermissions />,
				path: menuRoutes.users.profile.path + menuRoutes.users.profile.permissions,
				access: {
					group: 'user',
					action: 'get_users'
				},
			},
			{
				element: <UserCreate />,
				path: menuRoutes.users.create,
				access: {
					group: 'user',
					action: 'create_users'
				}
			},
			{
				element: <UserEdit />,
				path: menuRoutes.users.edit,
				access: {
					group: 'user',
					action: 'edit_users'
				}
			},
			{
				element: <UserEditPermissions />,
				path: menuRoutes.users.edit_permissions,
				access: {
					group: 'user',
					action: 'edit_users'
				}
			},
		]
	},

	/******************************************************
	 * Devices
	 ******************************************************/
	{
		path: menuRoutes.devices.path,
		element: <DevicesWrapper />,
		sub: [
			{
				element: <DevicesListWrapper />,
				access: {
					group: 'devices',
					action: 'list_devices'
				},
				index: true,
			},
			{
				element: <DeviceCreate />,
				path: menuRoutes.devices.create,
				access: {
					group: 'devices',
					action: 'create_devices'
				}
			},
			{
				element: <DeviceEdit />,
				path: menuRoutes.devices.edit,
				access: {
					group: 'devices',
					action: 'edit_devices'
				}
			},
			{
				element: <DeviceProfileLayout />,
				path: menuRoutes.devices.profile.path,
				access: {
					group: 'devices',
					action: 'get_devices'
				},
			},
		]
	},

	/******************************************************
	 * Vehicles
	 ******************************************************/
	{
		path: menuRoutes.vehicles.path,
		element: <VehiclesWrapper />,
		sub: [
			{
				element: <VehiclesListWrapper />,
				access: {
					group: 'vehicles',
					action: 'list_vehicles'
				},
				index: true,
			},
			{
				element: <VehicleCreate />,
				path: menuRoutes.vehicles.create,
				access: {
					group: 'vehicles',
					action: 'create_vehicles'
				}
			},
			{
				element: <VehicleEdit />,
				path: menuRoutes.vehicles.edit,
				access: {
					group: 'vehicles',
					action: 'edit_vehicles'
				}
			},
			{
				element: <VehicleProfileWrapper />,
				path: menuRoutes.vehicles.profile.path,
				access: {
					group: 'vehicles',
					action: 'get_vehicles'
				},
				sub: [
					{
						element: <VehicleInfo />,
						path: menuRoutes.vehicles.profile.info,
						access: {
							group: 'vehicles',
							action: 'get_vehicles'
						}
					},
					{
						element: <VehicleDevicesHistory />,
						path: menuRoutes.vehicles.profile.device_history,
						access: {
							group: 'vehicles',
							action: 'get_vehicles'
						}
					},
					{
						element: <VehicleMetrics view="profiles-only" />,
						path: menuRoutes.vehicles.profile.metrics,
						access: {
							group: 'vehicles',
							action: 'get_vehicles'
						}
					},
					{
						element: <VehicleDataHistory />,
						path: menuRoutes.vehicles.profile.data_history,
						access: {
							group: 'vehicles',
							action: 'get_vehicles'
						}
					}
				]
			},
		]
	},

	/******************************************************
	 * Brands
	 ******************************************************/
	{
		path: menuRoutes.brands.path,
		element: <BrandsWrapper />,
		sub: [
			{
				element: <BrandsListWrapper />,
				access: {
					group: 'brands',
					action: 'list_brands'
				},
				index: true,
			},
			{
				element: <BrandProfileLayout />,
				path: menuRoutes.brands.profile.path + menuRoutes.brands.profile.info,
				access: {
					group: 'brands',
					action: 'get_brands'
				},
			}
		]
	},

	/******************************************************
	 * Models
	 ******************************************************/
	{
		path: menuRoutes.models.path,
		element: <ModelsWrapper />,
		sub: [
			{
				element: <ModelsListWrapper />,
				access: {
					group: 'models',
					action: 'list_models'
				},
				index: true,
			},
			{
				element: <ModelProfileLayout />,
				path: menuRoutes.models.profile.path + menuRoutes.models.profile.info,
				access: {
					group: 'models',
					action: 'get_models'
				},
			},
			{
				element: <MetricsConfig />,
				path: menuRoutes.models.profile.path + menuRoutes.models.profile.metrics_config,
				access: {
					group: 'models',
					action: 'edit_models'
				},
			}
		]
	},

	/******************************************************
	 * Vehicle Types
	 ******************************************************/

	{
		path: menuRoutes.vehicleTypes.path,
		element: <VehicleTypesWrapper />,
		sub: [
			{
				element: <VehicleTypesListWrapper />,
				access: {
					group: 'vehicle_types',
					action: 'list_vehicle_types'
				},
				index: true,
			},
			{
				element: <VehicleTypeProfileLayout />,
				path: menuRoutes.vehicleTypes.profile.path + menuRoutes.vehicleTypes.profile.info,
				access: {
					group: 'vehicle_types',
					action: 'get_vehicle_types'
				},
			}
		]
	},

	/******************************************************
	 * Vehicle Sub Types
	 ******************************************************/
	{
		path: menuRoutes.vehicleSubTypes.path,
		element: <VehicleSubTypesWrapper />,
		sub: [
			{
				element: <VehicleSubTypesListWrapper />,
				access: {
					group: 'vehicle_subtypes',
					action: 'list_vehicle_subtypes'
				},
				index: true,
			},
			{
				element: <VehicleSubTypeProfileLayout />,
				path: menuRoutes.vehicleSubTypes.profile.path + menuRoutes.vehicleSubTypes.profile.info,
				access: {
					group: 'vehicle_subtypes',
					action: 'get_vehicle_subtypes'
				},
			}
		]
	},

	/******************************************************
	 * ECUS
	 ******************************************************/
	{
		path: menuRoutes.ecus.path,
		element: <EcusWrapper />,
		sub: [
			{
				element: <EcusListWrapper />,
				access: {
					group: 'metrics',
					action: 'list_metrics'
				},
				index: true,
			},
			{
				element: <EcusCreate />,
				path: menuRoutes.ecus.create,
				access: {
					group: 'metrics',
					action: 'create_metrics'
				}
			},
			{
				element: <EcuEdit />,
				path: menuRoutes.ecus.edit,
				access: {
					group: 'metrics',
					action: 'edit_metrics'
				}
			},
			{
				element: <EcuProfileLayout />,
				path: menuRoutes.ecus.profile.path + menuRoutes.ecus.profile.info,
				access: {
					group: 'metrics',
					action: 'get_metrics'
				},
			}
		]
	},

	/******************************************************
	 * Groups
	 ******************************************************/
	{
		path: menuRoutes.groups.path,
		element: <GroupsWrapper />,
		sub: [
			{
				element: <GroupsListWrapper />,
				access: {
					group: 'metrics',
					action: 'list_metrics'
				},
				index: true,
			},
			{
				element: <GroupCreate />,
				path: menuRoutes.groups.create,
				access: {
					group: 'metrics',
					action: 'create_metrics'
				}
			},
			{
				element: <GroupEdit />,
				path: menuRoutes.groups.edit,	
				access: {
					group: 'metrics',
					action: 'edit_metrics'
				}
			},
			{
				element: <GroupProfileLayout />,
				path: menuRoutes.groups.profile.path + menuRoutes.groups.profile.info,
				access: {
					group: 'metrics',
					action: 'get_metrics'
				},
			}
		]
	},

	/******************************************************
	 * Metrics
	 ******************************************************/
	{
		path: menuRoutes.metrics.path,
		element: <MetricsWrapper />,
		sub: [
			{
				element: <MetricsListWrapper />,
				access: {
					group: 'metrics',
					action: 'list_metrics'
				},
				index: true,
			},
			{
				element: <MetricCreate />,
				path: menuRoutes.metrics.create,
				access: {
					group: 'metrics',
					action: 'create_metrics'
				}
			},
			{
				element: <MetricEdit />,
				path: menuRoutes.metrics.edit,	
				access: {
					group: 'metrics',
					action: 'edit_metrics'
				}
			},
			{
				element: <MetricProfileLayout />,
				path: menuRoutes.metrics.profile.path + menuRoutes.metrics.profile.info,
				access: {
					group: 'metrics',
					action: 'get_metrics'
				},
			}
		]
	},

	/******************************************************
	 * Geolocation
	 ******************************************************/
	{
		path: menuRoutes.geolocation.path,
		element: <GeolocationPage />,
		access: {
			group: 'vehicles',
			action: 'list_vehicles'
		},
	},
];

const contents = [...protectedRoutes];
export default contents;
