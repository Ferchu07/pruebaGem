import { RestServiceConnection } from '../restServiceConnection';

const ENDPOINT = '/companies';

export class OrganisationService extends RestServiceConnection {

    createOrganisation = async (organisation: FormData) => {
        this.response = await this.makeRequest({
            method: 'POST',
            url: ENDPOINT + '/create',
            data: organisation,
            headers: { "Content-Type": "application/x-www-form-urlencoded" }
        }, true);
        return this;
    }

    editOrganisation = async (organisation: FormData, hasImg: boolean) => {
        const organisationObj: any = {};
        organisation.forEach((value, key) => (organisationObj[key] = value));
        organisationObj['logo'] = null;

        this.response = await this.makeRequest({
            method: 'POST',
            url: ENDPOINT + '/edit',
            data: hasImg ? organisation : organisationObj,
            headers: { "Content-Type": hasImg ? "application/x-www-form-urlencoded" : "application/json" }
        }, true);
        return this;
    }

    listOrganisations = async (filters?: any) => {
        this.response = await this.makeRequest({
            method: 'POST',
            url: ENDPOINT + '/list',
            data: filters,
            headers: {
                "Content-Type": "application/json"
            }
        }, true);
        return this;
    }

    getOrganisationById = async (companyId: string) => {
        this.response = await this.makeRequest({
            method: 'POST',
            url: ENDPOINT + '/get',
            data: { companyId },
            headers: { "Content-Type": "application/json" }
        }, true);
        return this;
    }

    toggleOrganisationStatus = async (companyId: string, active: boolean) => {
        this.response = await this.makeRequest({
            method: 'POST',
            url: ENDPOINT + '/toggle',
            data: { companyId, active },
            headers: { "Content-Type": "application/json" }
        }, true);
        return this;
    }

    deleteOrganisation = async (companyId: string) => {
        this.response = await this.makeRequest({
            method: 'POST',
            url: ENDPOINT + '/delete',
            data: { 
                companyId: companyId 
            }
        }, true);
        return this;
    }

    deleteMultiOrganisations = async (companyIds: string[]) => {
        this.response = await this.makeRequest({
            method: 'POST',
            url: ENDPOINT + '/delete-multi',
            data: { companyIds }
        }, true);
        return this;
    }

    editOrganisationImg = async (id: string, img: File) => {
        const formData = new FormData();
        formData.append('companyId', id);
        formData.append('logo', img);

        this.response = await this.makeRequest({
            method: 'POST',
            url: ENDPOINT + '/add-image',
            data: formData,
            headers: { "Content-Type": "multipart/form-data" }
        }, true);
        return this;
    }

    deleteOrganisationImg = async (companyId: string) => {
        this.response = await this.makeRequest({
            method: 'POST',
            url: ENDPOINT + '/delete-image',
            data: { companyId }
        }, true);
        return this;
    }

    listForSelect = async () => {
        this.response = await this.makeRequest({
            method: 'GET',
            url: ENDPOINT + '/list-companies',
            headers: {
                "Content-Type": "application/json"
            }
        }, true);
        return this;
    }

}