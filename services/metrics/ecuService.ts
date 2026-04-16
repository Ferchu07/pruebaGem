import { AxiosResponse } from 'axios';
import { RestServiceConnection } from '../restServiceConnection';

const ECUS_ENDPOINT = '/ecus';

export class EcuService extends RestServiceConnection {

    listEcus = async (filters?: any) => {
        this.response = await this.makeRequest({
            method: 'POST',
            url: ECUS_ENDPOINT + '/list',
            data: filters,
        }, true) as AxiosResponse;
        return this;
    }
    
    listEcusForSelect = async (filters?: any) => {
        this.response = await this.makeRequest({
            method: 'POST',
            url: ECUS_ENDPOINT + '/list-ecus-for-selects',
            data: filters,
        }, true) as AxiosResponse;
        return this;
    }

    getEcu = async (ecuId: string) => {
        this.response = await this.makeRequest({
            method: 'POST',
            url: ECUS_ENDPOINT + '/get',
            data: { ecuId },
        }, true) as AxiosResponse;
        return this;
    }

    createEcu = async (data: any) => {
        this.response = await this.makeRequest({
            method: 'POST',
            url: ECUS_ENDPOINT + '/create',
            data,
        }, true) as AxiosResponse;
        return this;
    }

    editEcu = async (data: any) => {
        this.response = await this.makeRequest({
            method: 'POST',
            url: ECUS_ENDPOINT + '/edit',
            data,
        }, true) as AxiosResponse;
        return this;
    }

    deleteEcu = async (data: any) => {
        this.response = await this.makeRequest({
            method: 'POST',
            url: ECUS_ENDPOINT + '/delete',
            data,
        }, true) as AxiosResponse;
        return this;
    }

    deleteMultiEcus = async (ids: string[]) => {
        this.response = await this.makeRequest({
            method: 'POST',
            url: ECUS_ENDPOINT + '/delete-multi',
            data: { ids },
        }, true) as AxiosResponse;
        return this;
    }

    editEcuImg = async (id: string, img: File) => {
        const formData = new FormData();
        formData.append('ecuId', id);
        formData.append('image', img);

        this.response = await this.makeRequest({
            method: 'POST',
            url: ECUS_ENDPOINT + '/add-image',
            data: formData,
            headers: { "Content-Type": "multipart/form-data" }
        }, true);
        return this;
    }

    deleteEcuImg = async (ecuId: string) => {
        this.response = await this.makeRequest({
            method: 'POST',
            url: ECUS_ENDPOINT + '/delete-image',
            data: { ecuId }
        }, true);
        return this;
    }
}
