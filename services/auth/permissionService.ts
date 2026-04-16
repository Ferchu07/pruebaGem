import { AxiosResponse } from 'axios';
import { RestServiceConnection } from '../restServiceConnection';

const ENDPOINT = '/permissions';

export class PermissionService extends RestServiceConnection {

    getPermissions = async (group?: string) => {
        this.response = await this.makeRequest({
            method: 'POST',
            url: ENDPOINT + '/get-all',
            data: { group },
            headers: { "Content-Type": "application/json" }
        }, true) as AxiosResponse;
        return this;
    }

}