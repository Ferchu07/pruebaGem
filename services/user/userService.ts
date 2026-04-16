import { AxiosResponse } from 'axios';
import { FilterOptions } from '../../hooks/useFilters';
import { RestServiceConnection } from '../restServiceConnection';

const USER_ENDPOINT = '/users';

export class UserService extends RestServiceConnection {

    listUsers = async (filters?: any) => {
        this.response = await this.makeRequest({
            method: 'POST',
            url: USER_ENDPOINT + '/list',
            data: filters,
        }, true) as AxiosResponse;
        return this;
    }

    getUserById = async (userId: string) => {
        this.response = await this.makeRequest({
            method: 'POST',
            url: USER_ENDPOINT + '/get',
            data: { userId },
            headers: { "Content-Type": "application/json" }
        }, true);
        return this;
    }

    toggleUserStatus = async (userId: string, status: boolean, companyId: string | null) => {
        this.response = await this.makeRequest({
            method: 'POST',
            url: USER_ENDPOINT + '/toggle',
            data: { userId, active: status, companyId },
            headers: { "Content-Type": "application/json" }
        }, true);
        return this;
    }

    addUserDocument = async (data: FormData) => {
        this.response = await this.makeRequest({
            method: 'POST',
            url: USER_ENDPOINT + '/add-document',
            data: data,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        }, true);
        return this;
    }

    createUser = async (user: any) => {
        this.response = await this.makeRequest({
            method: 'POST',
            url: USER_ENDPOINT + '/create',
            data: user,
            headers: { "Content-Type": "application/json" }
        }, true);
        return this;
    }

    editUser = async (user: any) => {
        this.response = await this.makeRequest({
            method: 'POST',
            url: USER_ENDPOINT + '/edit',
            data: user,
            headers: { "Content-Type": "application/json" }
        }, true);
        return this;
    }

    editUserImg = async (id: string, img: File) => {
        const formData = new FormData();
        formData.append('userId', id);
        formData.append('profileImg', img);

        this.response = await this.makeRequest({
            method: 'POST',
            url: USER_ENDPOINT + '/add-image',
            data: formData,
            headers: { "Content-Type": "multipart/form-data" }
        }, true);
        return this;
    }

    deleteUserImg = async (userId: string) => {
        this.response = await this.makeRequest({
            method: 'POST',
            url: USER_ENDPOINT + '/delete-image',
            data: { userId }
        }, true);
        return this;
    }

    deleteUser = async (userId: string) => {
        this.response = await this.makeRequest({
            method: 'POST',
            url: USER_ENDPOINT + '/delete',
            data: { userId },
            headers: { "Content-Type": "application/json" }
        }, true);
        return this;
    }

    deleteMultiUsers = async (userIds: string[]) => {
        this.response = await this.makeRequest({
            method: 'POST',
            url: USER_ENDPOINT + '/delete-multi',
            data: { userIds }
        }, true);
        return this;
    }

    editUserPermissions = async (userId: string, permissions: number[], company: string) => {
        this.response = await this.makeRequest({
            method: 'POST',
            url: USER_ENDPOINT + '/edit-permissions',
            data: {
                userId,
                permissions,
                company,
            }
        }, true);
        return this;
    }

    resetUserPermissions = async (user: string, company?: string) => {
        this.response = await this.makeRequest({
            method: 'POST',
            url: USER_ENDPOINT + '/reset-permissions',
            data: {
                userId: user,
                company: company
            }
        }, true);
        return this;
    }

    changePassword = async (userId: string, password: string, passwordConfirm: string) => {
        this.response = await this.makeRequest({
            method: 'POST',
            url: USER_ENDPOINT + '/change-password',
            data: { userId, password, passwordConfirm }
        }, true);
        return this;
    }

    loginAsUser = async (userId: string) => {
        this.response = await this.makeRequest({
            method: 'POST',
            url: USER_ENDPOINT + '/login-as-user',
            data: { userId }
        }, true);
        return this;
    }

    listUserDocuments = async (filters: FilterOptions) => {
        this.response = await this.makeRequest({
            method: 'POST',
            url: USER_ENDPOINT + '/list-documents',
            data: filters,
        }, true);
        return this;
    }

    getUserDocuments = async (userId: string, maxResults?: number | string) => {
        this.response = await this.makeRequest({
            method: 'POST',
            url: USER_ENDPOINT + '/get-documents',
            data: { userId, maxResults },
        }, true);
        return this;
    }

    listChangelogs = async (userId: string, filters?: any) => {
        filters.filter_filters.user = userId;
        this.response = await this.makeRequest({
            method: 'POST',
            url: USER_ENDPOINT + '/list-user-changes-log',
            data: filters,
            headers: { "Content-Type": "application/json" }
        }, true);
        return this;
    }

    listRolesByUser = async (filters?: any) => {
        this.response = await this.makeRequest({
            method: 'POST',
            url: USER_ENDPOINT + '/list-roles',
            data: filters,
            headers: { "Content-Type": "application/json" }
        }, true);
        return this;
    }

    manageCompanyConfiguration = async (configurationParameters: any) => {
        this.response = await this.makeRequest({
            method: 'POST',
            url: USER_ENDPOINT + '/manage-configuration',
            data: configurationParameters,
            headers: { "Content-Type": "application/json" }
        }, true);
        return this;
    }

    getCompanyConfiguration = async () => {
        this.response = await this.makeRequest({
            method: 'GET',
            url: USER_ENDPOINT + '/get-company-configuration',
            headers: { "Content-Type": "application/json" }
        }, true);
        return this;
    }

    updateCompanySignature = async (signature: any) => {
        const formData = new FormData();

        const byteArray = atob(<string>signature?.split(',')[1]); // Elimina el prefijo 'data:image/png;base64,' y decodifica base64
        const arrayBuffer = new ArrayBuffer(byteArray.length);
        const uintArray = new Uint8Array(arrayBuffer);
        for (let i = 0; i < byteArray.length; i++) {
            uintArray[i] = byteArray.charCodeAt(i);
        }

        const blob = new Blob([uintArray], { type: "image/png" }); // Se asegura de que el archivo tenga el tipo correcto
        formData.append("signature", blob, "signature.png"); // El tercer parámetro es el nombre del archivo

        this.response = await this.makeRequest({
            method: 'POST',
            url: USER_ENDPOINT + '/update-company-signature',
            data: formData,
            headers: { "Content-Type": "multipart/form-data" }
        }, true);
        return this;
    }

    updateCompanyBackgroundSignature = async (backgroundSignature: any) => {
        const formData = new FormData();
        formData.append("backgroundSignature", backgroundSignature);

        this.response = await this.makeRequest({
            method: 'POST',
            url: USER_ENDPOINT + '/update-company-background-signature',
            data: formData,
            headers: { "Content-Type": "multipart/form-data" }
        }, true);
        return this;
    }


    visualizeSignatureTemplatePdf = async () => {
        return await this.makeRequest({
            method: 'GET',
            url: USER_ENDPOINT + '/preview-company-signature',
            responseType: 'arraybuffer',
        }, true);
    };

    getContractStats = async (filters: any) => {
        this.response = await this.makeRequest({
            method: 'POST',
            url: USER_ENDPOINT + '/contract-stats',
            data: filters,
            headers: { "Content-Type": "application/json" }
        }, true);
        return this;
    }

    clearSystemCache = async () => {
        this.response = await this.makeRequest({
            method: 'POST',
            url: USER_ENDPOINT + '/clear-system-cache',
        }, true);
        return this;
    }

    importCRMData = async (crmFile: File) => {
        const formData = new FormData();
        formData.append('crmExcelFile', crmFile)
        this.response = await this.makeRequest({
            method: 'POST',
            url: USER_ENDPOINT + '/import-crm-data',
            data: formData,
            headers: { "Content-Type": "multipart/form-data" }
        }, true);
        return this;
    }

    listCompanies = async (filters?: any) => {
        this.response = await this.makeRequest({
            method: 'POST',
            url: USER_ENDPOINT + '/list-companies',
            data: filters,
        }, true);
        return this;
    }

    changeActiveCompany = async (companyId: string) => {
        this.response = await this.makeRequest({
            method: 'POST',
            url: USER_ENDPOINT + '/change-active-company-session',
            data: {
                companyId: companyId
            },
        }, true);
        return this;
    }
}