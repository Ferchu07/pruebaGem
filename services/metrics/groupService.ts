import { AxiosResponse } from 'axios';
import { RestServiceConnection } from '../restServiceConnection';

const GROUPS_ENDPOINT = '/groups';

export class GroupService extends RestServiceConnection {

    listGroups = async (filters?: any) => {
        this.response = await this.makeRequest({
            method: 'POST',
            url: GROUPS_ENDPOINT + '/list',
            data: filters,
        }, true) as AxiosResponse;
        return this;
    }

    listGroupsForSelect = async (filters?: any) => {
        this.response = await this.makeRequest({
            method: 'POST',
            url: GROUPS_ENDPOINT + '/list-groups-for-selects',
            data: filters,
        }, true) as AxiosResponse;
        return this;
    }

    getGroup = async (groupId: string) => {
        this.response = await this.makeRequest({
            method: 'POST',
            url: GROUPS_ENDPOINT + '/get',
            data: { groupId },
        }, true) as AxiosResponse;
        return this;
    }

    createGroup = async (data: any) => {
        this.response = await this.makeRequest({
            method: 'POST',
            url: GROUPS_ENDPOINT + '/create',
            data,
        }, true) as AxiosResponse;
        return this;
    }

    editGroup = async (data: any) => {
        this.response = await this.makeRequest({
            method: 'POST',
            url: GROUPS_ENDPOINT + '/edit',
            data,
        }, true) as AxiosResponse;
        return this;
    }

    deleteGroup = async (data: any) => {        
        this.response = await this.makeRequest({
            method: 'POST',
            url: GROUPS_ENDPOINT + '/delete',
            data,
        }, true) as AxiosResponse;
        return this;
    }

    deleteMultiGroups = async (ids: string[]) => {
        this.response = await this.makeRequest({
            method: 'POST',
            url: GROUPS_ENDPOINT + '/delete-multi',
            data: { ids },
        }, true) as AxiosResponse;
        return this;
    }
}
