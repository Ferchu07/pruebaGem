import { AxiosResponse } from 'axios';
import { RestServiceConnection } from '../restServiceConnection';

const METRIC_PROFILES_ENDPOINT = '/metric-profiles';

export class MetricProfileService extends RestServiceConnection {

    getMetricProfile = async (
        metricProfileId: string,
        company?: string | null,
        vehicleId?: string | null,
        includeOrionValues?: boolean
    ) => {
        this.response = await this.makeRequest({
            method: 'POST',
            url: METRIC_PROFILES_ENDPOINT + '/get',
            data: {
                metricProfileId,
                ...(company ? { company } : {}),
                ...(vehicleId ? { vehicleId } : {}),
                ...(includeOrionValues ? { includeOrionValues: true } : {})
            },
            headers: { "Content-Type": "application/json" }
        }, true) as AxiosResponse;
        return this;
    }

    listMetricProfiles = async (filters?: any) => {
        this.response = await this.makeRequest({
            method: 'POST',
            url: METRIC_PROFILES_ENDPOINT + '/list',
            data: filters,
            headers: { "Content-Type": "application/json" }
        }, true) as AxiosResponse;
        return this;
    }

    listMyEnabledProfiles = async (filters?: any) => {
        this.response = await this.makeRequest({
            method: 'POST',
            url: METRIC_PROFILES_ENDPOINT + '/list-my-enabled-profiles',
            data: filters ?? {},
            headers: { "Content-Type": "application/json" }
        }, true) as AxiosResponse;
        return this;
    }

    listEnabledUsers = async (metricProfileId: string, company?: string | null) => {
        this.response = await this.makeRequest({
            method: 'POST',
            url: METRIC_PROFILES_ENDPOINT + '/list-enabled-users',
            data: {
                metricProfileId,
                ...(company ? { company } : {}),
            },
            headers: { "Content-Type": "application/json" }
        }, true) as AxiosResponse;
        return this;
    }

    createMetricProfile = async (data: any) => {
        this.response = await this.makeRequest({
            method: 'POST',
            url: METRIC_PROFILES_ENDPOINT + '/create',
            data: data,
            headers: { "Content-Type": "application/json" }
        }, true) as AxiosResponse;
        return this;
    }

    editMetricProfile = async (data: any) => {
        this.response = await this.makeRequest({
            method: 'POST',
            url: METRIC_PROFILES_ENDPOINT + '/edit',
            data: data,
            headers: { "Content-Type": "application/json" }
        }, true) as AxiosResponse;
        return this;
    }

    addMetricProfileImage = async (metricProfileId: string, image: File) => {
        const formData = new FormData();
        formData.append('metricProfileId', metricProfileId);
        formData.append('image', image);

        this.response = await this.makeRequest({
            method: 'POST',
            url: METRIC_PROFILES_ENDPOINT + '/add-image',
            data: formData,
            headers: { "Content-Type": "multipart/form-data" }
        }, true) as AxiosResponse;
        return this;
    }

    deleteMetricProfileImage = async (metricProfileId: string) => {
        this.response = await this.makeRequest({
            method: 'POST',
            url: METRIC_PROFILES_ENDPOINT + '/delete-image',
            data: { metricProfileId },
            headers: { "Content-Type": "application/json" }
        }, true) as AxiosResponse;
        return this;
    }

    syncMetricProfileUsers = async (data: any) => {
        this.response = await this.makeRequest({
            method: 'POST',
            url: METRIC_PROFILES_ENDPOINT + '/sync-users',
            data,
            headers: { "Content-Type": "application/json" }
        }, true) as AxiosResponse;
        return this;
    }

    deleteMetricProfile = async (metricProfileId: string) => {
        this.response = await this.makeRequest({
            method: 'POST',
            url: METRIC_PROFILES_ENDPOINT + '/delete',
            data: { metricProfileId },
            headers: { "Content-Type": "application/json" }
        }, true) as AxiosResponse;
        return this;
    }

    getVehicleMetricsData = async (signal: AbortSignal, filters: any) => {
        this.response = await this.makeRequest({
            method: 'POST',
            url: METRIC_PROFILES_ENDPOINT + '/get-vehicle-metrics-data',
            data: filters,
            signal: signal,
            headers: { "Content-Type": "application/json" }
        }, true) as AxiosResponse;
        return this;
    }
}
