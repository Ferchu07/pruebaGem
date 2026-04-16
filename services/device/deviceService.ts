import { AxiosResponse } from 'axios';
import { RestServiceConnection } from '../restServiceConnection';

const DEVICE_ENDPOINT = '/devices';

export class DeviceService extends RestServiceConnection {

    listDevices = async (filters?: any) => {
        this.response = await this.makeRequest({
            method: 'POST',
            url: DEVICE_ENDPOINT + '/list',
            data: filters,
        }, true) as AxiosResponse;
        return this;
    }

    listForSelectDevices = async () => {
        this.response = await this.makeRequest({
            method: 'POST',
            url: DEVICE_ENDPOINT + '/list-for-select',
            data: {},
        }, true);
        return this;
    }

    getDeviceById = async (deviceId: string) => {
        this.response = await this.makeRequest({
            method: 'POST',
            url: DEVICE_ENDPOINT + '/get',
            data: { deviceId },
            headers: { "Content-Type": "application/json" }
        }, true);
        return this;
    }

    toggleDeviceStatus = async (deviceId: string, status: boolean) => {
        this.response = await this.makeRequest({
            method: 'POST',
            url: DEVICE_ENDPOINT + '/toggle',
            data: { deviceId, active: status },
            headers: { "Content-Type": "application/json" }
        }, true);
        return this;
    }

    createDevice = async (device: any) => {
        this.response = await this.makeRequest({
            method: 'POST',
            url: DEVICE_ENDPOINT + '/create',
            data: device,
            headers: { "Content-Type": "application/json" }
        }, true);
        return this;
    }

    editDevice = async (device: any) => {
        this.response = await this.makeRequest({
            method: 'POST',
            url: DEVICE_ENDPOINT + '/edit',
            data: device,   
            headers: { "Content-Type": "application/json" }
        }, true);
        return this;
    }

    deleteDevice = async (deviceId: string) => {
        this.response = await this.makeRequest({
            method: 'POST',
            url: DEVICE_ENDPOINT + '/delete',
            data: { 
                deviceId: deviceId 
            },
            headers: { "Content-Type": "application/json" }
        }, true);
        return this;
    }

    deleteMultiDevices = async (deviceIds: string[]) => {
        this.response = await this.makeRequest({
            method: 'POST',
            url: DEVICE_ENDPOINT + '/delete-multi',
            data: { deviceIds }
        }, true);
        return this;
    }

    changeDeviceStatus = async (deviceId: string, statusId: string) => {
        this.response = await this.makeRequest({
            method: 'POST',
            url: DEVICE_ENDPOINT + '/toggle',
            data: { deviceId: deviceId, status: statusId },
            headers: { "Content-Type": "application/json" }
        }, true);
        return this;
    }

    asignDeviceToCompany = async (deviceIds: string[], companyId: string) => {
        this.response = await this.makeRequest({
            method: 'POST',
            url: DEVICE_ENDPOINT + '/assign-to-company',
            data: { deviceIds: deviceIds, company: companyId },
            headers: { "Content-Type": "application/json" }
        }, true);
        return this;
    }

    unassignCompany = async (deviceIds: string[]) => {
        this.response = await this.makeRequest({
            method: 'POST',
            url: DEVICE_ENDPOINT + '/unassign-from-company',
            data: { deviceIds: deviceIds },
            headers: { "Content-Type": "application/json" }
        }, true);
        return this;
    }
}