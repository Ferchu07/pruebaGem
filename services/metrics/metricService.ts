import { AxiosResponse } from 'axios';
import { RestServiceConnection } from '../restServiceConnection';

const METRICS_ENDPOINT = '/metrics';

export class MetricService extends RestServiceConnection {

    listMetrics = async (filters?: any) => {
        this.response = await this.makeRequest({
            method: 'POST',
            url: METRICS_ENDPOINT + '/list',
            data: filters,
        }, true) as AxiosResponse;
        return this;
    }

    listMetricsForSelect = async (filters?: any) => {
        this.response = await this.makeRequest({
            method: 'POST',
            url: METRICS_ENDPOINT + '/list-metrics-for-selects',
            data: filters,
        }, true) as AxiosResponse;
        return this;
    }

    getMetric = async (metricId: string) => {
        this.response = await this.makeRequest({
            method: 'POST',
            url: METRICS_ENDPOINT + '/get',
            data: { metricId },
        }, true) as AxiosResponse;
        return this;
    }

    createMetric = async (data: any) => {
        const config: any = {
            method: 'POST',
            url: METRICS_ENDPOINT + '/create',
            data,
        };

        // If FormData, we pass empty headers to avoid RestServiceConnection setting 'application/json'
        // and let axios/browser handle the 'multipart/form-data' with boundary.
        if (data instanceof FormData) {
            config.headers = {}; 
        }

        this.response = await this.makeRequest(config, true) as AxiosResponse;
        return this;
    }

    editMetric = async (data: any) => {
        const config: any = {
            method: 'POST',
            url: METRICS_ENDPOINT + '/edit',
            data,
        };

        // If FormData, we pass empty headers to avoid RestServiceConnection setting 'application/json'
        // and let axios/browser handle the 'multipart/form-data' with boundary.
        if (data instanceof FormData) {
            config.headers = {}; 
        }

        this.response = await this.makeRequest(config, true) as AxiosResponse;
        return this;
    }

    deleteMetric = async (data: any) => {        
        this.response = await this.makeRequest({
            method: 'POST',
            url: METRICS_ENDPOINT + '/delete',
            data,
        }, true) as AxiosResponse;
        return this;
    }

    deleteMultiMetrics = async (ids: string[]) => {
        this.response = await this.makeRequest({
            method: 'POST',
            url: METRICS_ENDPOINT + '/delete-multi',
            data: { ids },
        }, true) as AxiosResponse;
        return this;
    }
}
