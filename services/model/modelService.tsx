
import { AxiosResponse } from 'axios';
import { RestServiceConnection } from '../restServiceConnection';

const MODEL_ENDPOINT = '/models';

export class ModelService extends RestServiceConnection {

    listModels = async (filters?: any) => {
        this.response = await this.makeRequest({
            method: 'POST',
            url: MODEL_ENDPOINT + '/list',
            data: filters,
        }, true) as AxiosResponse;
        return this;
    }

    listModelsForSelect = async (filters?: any) => {
        this.response = await this.makeRequest({
            method: 'POST',
            url: MODEL_ENDPOINT + '/list-models-for-selects',
            data: filters,
        }, true) as AxiosResponse;
        return this;
    }

    getModelById = async (modelId: string) => {
        this.response = await this.makeRequest({
            method: 'POST',
            url: MODEL_ENDPOINT + '/get',
            data: { modelId: modelId },
            headers: { "Content-Type": "application/json" }
        }, true);
        return this;
    }

    toggleModelStatus = async (modelId: string) => {
        this.response = await this.makeRequest({
            method: 'POST',
            url: MODEL_ENDPOINT + '/toggle',
            data: { modelId: modelId },
            headers: { "Content-Type": "application/json" }
        }, true);
        return this;
    }

    createModel = async (model: any) => {
        this.response = await this.makeRequest({
            method: 'POST',
            url: MODEL_ENDPOINT + '/create',
            data: model ,
            headers: { "Content-Type": "application/json" }
        }, true);
        return this;
    }

    editModel = async (model: any) => {
        this.response = await this.makeRequest({
            method: 'POST',
            url:  MODEL_ENDPOINT + '/edit',
            data: model,
            headers: { "Content-Type": "application/json" }
        }, true);
        return this;
    }

    deleteModel = async (modelId: string) => {
        this.response = await this.makeRequest({
            method: 'POST',
            url: MODEL_ENDPOINT + '/delete',
            data: {
                modelId: modelId
            },
            headers: { "Content-Type": "application/json" }
        }, true);
        return this;
    }

    deleteMultiModels = async (modelIds: string[]) => {
        this.response = await this.makeRequest({
            method: 'POST',
            url: MODEL_ENDPOINT + '/delete-multi',
            data: {
                modelsIds: modelIds
            }
        }, true);
        return this;
    }

    adminModelMetrics = async (data: any) => {
        this.response = await this.makeRequest({
            method: 'POST',
            url: MODEL_ENDPOINT + '/admin-model-metrics',
            data: data,
            headers: { "Content-Type": "application/json" }
        }, true);
        return this;
    }
}