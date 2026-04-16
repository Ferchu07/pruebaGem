
import { AxiosResponse } from 'axios';
import { RestServiceConnection } from '../restServiceConnection';

const VEHICLE_SUBTYPE_ENDPOINT = '/vehicle-subtypes';

export class VehicleSubTypeService extends RestServiceConnection {

    listVehicleSubTypes = async (filters?: any) => {
        this.response = await this.makeRequest({
            method: 'POST',
            url: VEHICLE_SUBTYPE_ENDPOINT + '/list',
            data: filters,
        }, true) as AxiosResponse;
        return this;
    }

    listVehicleSubTypesForSelectors = async (filters?: any) => {
        this.response = await this.makeRequest({
            method: 'POST',
            url: VEHICLE_SUBTYPE_ENDPOINT + '/list-vehicle-subtypes-for-select',
            data: filters,
        }, true) as AxiosResponse;
        return this;
    }

    getVehicleSubTypeById = async (vehicleSubTypeId: string) => {
        this.response = await this.makeRequest({
            method: 'POST',
            url: VEHICLE_SUBTYPE_ENDPOINT + '/get',
            data: { vehicleSubtypeId: vehicleSubTypeId },
            headers: { "Content-Type": "application/json" }
        }, true);
        return this;
    }

    createVehicleSubType = async (vehicleSubType: any) => {
        this.response = await this.makeRequest({
            method: 'POST',
            url: VEHICLE_SUBTYPE_ENDPOINT + '/create',
            data: vehicleSubType,
            headers: { "Content-Type": "application/json" }
        }, true);
        return this;
    }

    editVehicleSubType = async (vehicleSubType: any) => {
        this.response = await this.makeRequest({
            method: 'POST',
            url: VEHICLE_SUBTYPE_ENDPOINT + '/edit',
            data: vehicleSubType,
            headers: { "Content-Type": "application/json" }
        }, true);
        return this;
    }

    deleteVehicleSubTypeImg = async (vehicleSubTypeId: string) => {
        this.response = await this.makeRequest({
            method: 'POST',
            url: VEHICLE_SUBTYPE_ENDPOINT + '/delete-image',
            data: { vehicleSubTypeId }
        }, true);
        return this;
    }

    deleteVehicleSubType = async (vehicleSubTypeId: string) => {
        this.response = await this.makeRequest({
            method: 'POST',
            url: VEHICLE_SUBTYPE_ENDPOINT + '/delete',
            data: {
                vehicleSubtypeId: vehicleSubTypeId
            },
            headers: { "Content-Type": "application/json" }
        }, true);
        return this;
    }

    deleteMultiVehicleSubTypes = async (vehicleSubTypeIds: string[]) => {
        this.response = await this.makeRequest({
            method: 'POST',
            url: VEHICLE_SUBTYPE_ENDPOINT + '/delete-multi',
            data: {
                vehicleSubtypesIds: vehicleSubTypeIds
            }
        }, true);
        return this;
    }

    adminSubtypeTypes = async (vehicleSubtypeId: string, vehicleTypes: string[]) => {
        this.response = await this.makeRequest({
            method: 'POST',
            url: VEHICLE_SUBTYPE_ENDPOINT + '/admin-subtype-types',
            data: {
                vehicleSubtypeId: vehicleSubtypeId,
                vehicleTypes: vehicleTypes
            },
            headers: { "Content-Type": "application/json" }
        }, true);
        return this;
    }
}