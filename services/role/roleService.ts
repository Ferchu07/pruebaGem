import { NewRole } from '../../type/entities/role-type';
import { RestServiceConnection } from '../restServiceConnection';

const ENDPOINT = '/roles';

export class RoleService extends RestServiceConnection {

    createRole = async (role: NewRole) => {
        this.response = await this.makeRequest({
            method: 'POST',
            url: ENDPOINT + '/create',
            data: role,
            headers: { "Content-Type": "application/json" }
        }, true);
        return this;
    }

    editRole = async (role: NewRole) => {
        this.response = await this.makeRequest({
            method: 'POST',
            url: ENDPOINT + '/edit',
            data: role,
            headers: { "Content-Type": "application/json" }
        }, true);
        return this;
    }

    listRoles = async (filters?: any) => {
        this.response = await this.makeRequest({
            method: 'POST',
            url: ENDPOINT + '/list',
            data: filters,
            headers: { "Content-Type": "application/json" }
        }, true);
        return this;
    }

    getRoleById = async (roleId: string) => {
        this.response = await this.makeRequest({
            method: 'POST',
            url: ENDPOINT + '/get',
            data: { roleId },
            headers: { "Content-Type": "application/json" }
        }, true);
        return this;
    }

    toggleRoleStatus = async (roleId: string, active: boolean) => {
        this.response = await this.makeRequest({
            method: 'POST',
            url: ENDPOINT + '/toggle',
            data: { roleId, active },
            headers: { "Content-Type": "application/json" }
        }, true);
        return this;
    }

    editRolePermissions = async (role: string, company: string | null, permissions: number[]) => {
        this.response = await this.makeRequest({
            method: 'POST',
            url: ENDPOINT + '/edit-permissions',
            data: {
                roleId: role,
                company: company,
                permissions: permissions
            }
        }, true);
        return this;
    }

    deleteRole = async (roleId: string) => {
        this.response = await this.makeRequest({
            method: 'POST',
            url: ENDPOINT + '/delete',
            data: { roleId }
        }, true);
        return this;
    }

    deleteMultiRoles = async (roleIds: string[]) => {
        this.response = await this.makeRequest({
            method: 'POST',
            url: ENDPOINT + '/delete-multi',
            data: { roleIds }
        }, true);
        return this;
    }

    // TODO: Move this method to the product service
    getProductTypes = async () => {
        this.response = await this.makeRequest({
            method: 'POST',
            url: '/product/get-types',
        }, true);
        return this;
    }

}