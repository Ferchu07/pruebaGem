
import { AxiosResponse } from 'axios';
import { RestServiceConnection } from '../restServiceConnection';

const VEHICLE_TYPE_ENDPOINT = '/vehicle-types';

export class VehicleTypeService extends RestServiceConnection {

    listVehicleTypes = async (filters?: any) => {
        this.response = await this.makeRequest({
            method: 'POST',
            url: VEHICLE_TYPE_ENDPOINT + '/list',
            data: filters,
        }, true) as AxiosResponse;
        return this;
    }

    listVehicleTypesForSelectors = async (filters?: any) => {
        this.response = await this.makeRequest({
            method: 'POST',
            url: VEHICLE_TYPE_ENDPOINT + '/list-vehicle-types-for-select',
            data: filters,
        }, true) as AxiosResponse;
        return this;
    }

    getVehicleTypeById = async (vehicleTypeId: string) => {
        this.response = await this.makeRequest({
            method: 'POST',
            url: VEHICLE_TYPE_ENDPOINT + '/get',
            data: { vehicleTypeId: vehicleTypeId },
            headers: { "Content-Type": "application/json" }
        }, true);
        return this;
    }

    createVehicleType = async (vehicleType: any) => {
        this.response = await this.makeRequest({
            method: 'POST',
            url: VEHICLE_TYPE_ENDPOINT + '/create',
            data: vehicleType,
            headers: { "Content-Type": "application/json" }
        }, true);
        return this;
    }

    editVehicleType = async (vehicleType: any) => {
        this.response = await this.makeRequest({
            method: 'POST',
            url: VEHICLE_TYPE_ENDPOINT + '/edit',
            data: vehicleType,
            headers: { "Content-Type": "application/json" }
        }, true);
        return this;
    }

    deleteVehicleTypeImg = async (vehicleTypeId: string) => {
        this.response = await this.makeRequest({
            method: 'POST',
            url: VEHICLE_TYPE_ENDPOINT + '/delete-image',
            data: { vehicleTypeId }
        }, true);
        return this;
    }

    deleteVehicleType = async (vehicleTypeId: string) => {
        this.response = await this.makeRequest({
            method: 'POST',
            url: VEHICLE_TYPE_ENDPOINT + '/delete',
            data: {
                vehicleTypeId: vehicleTypeId
            },
            headers: { "Content-Type": "application/json" }
        }, true);
        return this;
    }

    deleteMultiVehicleTypes = async (vehicleTypeIds: string[]) => {
        this.response = await this.makeRequest({
            method: 'POST',
            url: VEHICLE_TYPE_ENDPOINT + '/delete-multi',
            data: {
                vehicleTypesIds: vehicleTypeIds
            }
        }, true);
        return this;
    }

    adminTypeSubtypes = async (vehicleTypeId: string, vehicleSubtypes: string[]) => {
        this.response = await this.makeRequest({
            method: 'POST',
            url: VEHICLE_TYPE_ENDPOINT + '/admin-type-subtypes',
            data: {
                vehicleTypeId: vehicleTypeId,
                vehicleSubtypes: vehicleSubtypes
            },
            headers: { "Content-Type": "application/json" }
        }, true);
        return this;
    }
}