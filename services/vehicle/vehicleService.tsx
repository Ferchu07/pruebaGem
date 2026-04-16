
import { AxiosResponse } from 'axios';
import { RestServiceConnection } from '../restServiceConnection';

const VEHICLE_ENDPOINT = '/vehicles';

export class VehicleService extends RestServiceConnection {

    listVehicles = async (filters?: any) => {
        this.response = await this.makeRequest({
            method: 'POST',
            url: VEHICLE_ENDPOINT + '/list',
            data: filters,
        }, true) as AxiosResponse;
        return this;
    }

    listVehiclesForMap = async (filters?: any) => {
        this.response = await this.makeRequest({
            method: 'POST',
            url: VEHICLE_ENDPOINT + '/list-for-map',
            data: filters ?? {
                filter_order: [],
                filter_filters: { search_text: '', statuses_to_show: [1, 0] },
                limit: 500,
                page: 1
            },
        }, true);
        return this;
    }

    getVehicleById = async (vehicleId: string) => {
        this.response = await this.makeRequest({
            method: 'POST',
            url: VEHICLE_ENDPOINT + '/get',
            data: { vehicleId: vehicleId },
            headers: { "Content-Type": "application/json" }
        }, true);
        return this;
    }

    toggleVehicleStatus = async (vehicleId: string, status: boolean) => {
        this.response = await this.makeRequest({
            method: 'POST',
            url: VEHICLE_ENDPOINT + '/toggle',
            data: { vehicleId: vehicleId, active: status },
            headers: { "Content-Type": "application/json" }
        }, true);
        return this;
    }

    createVehicle = async (vehicle: any) => {
        this.response = await this.makeRequest({
            method: 'POST',
            url: VEHICLE_ENDPOINT + '/create',
            data: vehicle,
            headers: { "Content-Type": "application/json" }
        }, true);
        return this;
    }

    editVehicle = async (vehicle: any) => {
        this.response = await this.makeRequest({
            method: 'POST',
            url: VEHICLE_ENDPOINT + '/edit',
            data: vehicle,
            headers: { "Content-Type": "application/json" }
        }, true);
        return this;
    }

    deleteVehicle = async (vehicleId: string) => {
        this.response = await this.makeRequest({
            method: 'POST',
            url: VEHICLE_ENDPOINT + '/delete',
            data: {
                vehicleId: vehicleId
            },
            headers: { "Content-Type": "application/json" }
        }, true);
        return this;
    }

    deleteMultiVehicles = async (vehicleIds: string[]) => {
        this.response = await this.makeRequest({
            method: 'POST',
            url: VEHICLE_ENDPOINT + '/delete-multi',
            data: {
                vehiclesIds: vehicleIds
            }
        }, true);
        return this;
    }

    changeVehicleStatus = async (vehicleId: string, statusId: string) => {
        this.response = await this.makeRequest({
            method: 'POST',
            url: VEHICLE_ENDPOINT + '/toggle',
            data: { vehicleId: vehicleId, status: statusId },
            headers: { "Content-Type": "application/json" }
        }, true);
        return this;
    }

    assignVehicleToDevice = async (vehicleId: string, deviceId: string) => {
        this.response = await this.makeRequest({
            method: 'POST',
            url: VEHICLE_ENDPOINT + '/assign-device',
            data: {
                vehicleId: vehicleId,
                deviceId: deviceId
            },
            headers: { "Content-Type": "application/json" }
        }, true);
        return this;
    }

    unassignVehicleFromDevice = async (vehicleId: string) => {
        this.response = await this.makeRequest({
            method: 'POST',
            url: VEHICLE_ENDPOINT + '/unassign-device',
            data: { vehicleId: vehicleId },
            headers: { "Content-Type": "application/json" }
        }, true);
        return this;
    }

    showVehicleDeviceHistory = async (vehicleId: string, companyId: string | null = null) => {
        this.response = await this.makeRequest({
            method: 'POST',
            url: VEHICLE_ENDPOINT + '/get-device-history',
            data: { vehicleId: vehicleId, companyId: companyId },
            headers: { "Content-Type": "application/json" }
        }, true);
        return this;
    }

    getVehicleRoute = async (vehicleId: string, dates: { startDate: string; endDate: string }) => {
        this.response = await this.makeRequest({
            method: 'POST',
            url: VEHICLE_ENDPOINT + '/get-vehicle-route',
            data: { vehicleId, dates },
            headers: { "Content-Type": "application/json" }
        }, true);
        return this;
    }

    // METRICS

    getValuesMetadata = async () => {
        this.response = await this.makeRequest({
            method: 'GET',
            url: VEHICLE_ENDPOINT + '/get-values-metadata',
            headers: { "Content-Type": "application/json" }
        }, true);
        return this;
    }

    getMetricGroupsData = async (signal: AbortSignal, filters: any) => {
        this.response = await this.makeRequest({
            method: 'POST',
            url: VEHICLE_ENDPOINT + '/get-metric-groups-data',
            data: filters,
            signal: signal,
            headers: { "Content-Type": "application/json" }
        }, true);
        return this;
    }

    getEBC1Data = async (signal: AbortSignal, filters: any) => {
        this.response = await this.makeRequest({
            method: 'POST',
            url: VEHICLE_ENDPOINT + '/get-ebc1-data',
            data: filters,
            signal: signal,
            headers: { "Content-Type": "application/json" }
        }, true);
        return this;
    }

    getEBC2Data = async (signal: AbortSignal, filters: any) => {
        this.response = await this.makeRequest({
            method: 'POST',
            url: VEHICLE_ENDPOINT + '/get-ebc2-data',
            data: filters,
            signal: signal,
            headers: { "Content-Type": "application/json" }
        }, true);
        return this;
    }

    getEBC3Data = async (signal: AbortSignal, filters: any) => {
        this.response = await this.makeRequest({
            method: 'POST',
            url: VEHICLE_ENDPOINT + '/get-ebc3-data',
            data: filters,
            signal: signal,
            headers: { "Content-Type": "application/json" }
        }, true);
        return this;
    }

    getEBC4Data = async (signal: AbortSignal, filters: any) => {
        this.response = await this.makeRequest({
            method: 'POST',
            url: VEHICLE_ENDPOINT + '/get-ebc4-data',
            data: filters,
            signal: signal,
            headers: { "Content-Type": "application/json" }
        }, true);
        return this;
    }

    getEBC5Data = async (signal: AbortSignal, filters: any) => {
        this.response = await this.makeRequest({
            method: 'POST',
            url: VEHICLE_ENDPOINT + '/get-ebc5-data',
            data: filters,
            signal: signal,
            headers: { "Content-Type": "application/json" }
        }, true);
        return this;
    }

    getTSC1Data = async (signal: AbortSignal, filters: any) => {
        this.response = await this.makeRequest({
            method: 'POST',
            url: VEHICLE_ENDPOINT + '/get-tsc1-data',
            data: filters,
            signal: signal,
            headers: { "Content-Type": "application/json" }
        }, true);
        return this;
    }

    getVDC1Data = async (signal: AbortSignal, filters: any) => {
        this.response = await this.makeRequest({
            method: 'POST',
            url: VEHICLE_ENDPOINT + '/get-vdc1-data',
            data: filters,
            signal: signal,
            headers: { "Content-Type": "application/json" }
        }, true);
        return this;
    }

    getVDC2Data = async (signal: AbortSignal, filters: any) => {
        this.response = await this.makeRequest({
            method: 'POST',
            url: VEHICLE_ENDPOINT + '/get-vdc2-data',
            data: filters,
            signal: signal,
            headers: { "Content-Type": "application/json" }
        }, true);
        return this;
    }

    getCVWData = async (signal: AbortSignal, filters: any) => {
        this.response = await this.makeRequest({
            method: 'POST',
            url: VEHICLE_ENDPOINT + '/get-cvw-data',
            data: filters,
            signal: signal,
            headers: { "Content-Type": "application/json" }
        }, true);
        return this;
    }

    getXBRData = async (signal: AbortSignal, filters: any) => {
        this.response = await this.makeRequest({
            method: 'POST',
            url: VEHICLE_ENDPOINT + '/get-xbr-data',
            data: filters,
            signal: signal,
            headers: { "Content-Type": "application/json" }
        }, true);
        return this;
    }

    getAEBS1Data = async (signal: AbortSignal, filters: any) => {
        this.response = await this.makeRequest({
            method: 'POST',
            url: VEHICLE_ENDPOINT + '/get-aebs1-data',
            data: filters,
            signal: signal,
            headers: { "Content-Type": "application/json" }
        }, true);
        return this;
    }

    getAEBS2Data = async (signal: AbortSignal, filters: any) => {
        this.response = await this.makeRequest({
            method: 'POST',
            url: VEHICLE_ENDPOINT + '/get-aebs2-data',
            data: filters,
            signal: signal,
            headers: { "Content-Type": "application/json" }
        }, true);
        return this;
    }

}