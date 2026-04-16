
import { AxiosResponse } from 'axios';
import { RestServiceConnection } from '../restServiceConnection';

const BRAND_ENDPOINT = '/brands';

export class BrandService extends RestServiceConnection {

    listBrands = async (filters?: any) => {
        this.response = await this.makeRequest({
            method: 'POST',
            url: BRAND_ENDPOINT + '/list',
            data: filters,
        }, true) as AxiosResponse;
        return this;
    }

    listBrandsForSelectors = async (filters?: any) => {
        this.response = await this.makeRequest({
            method: 'POST',
            url: BRAND_ENDPOINT + '/list-brands-for-selects',
            data: filters,
        }, true) as AxiosResponse;
        return this;
    }

    getBrandById = async (brandId: string) => {
        this.response = await this.makeRequest({
            method: 'POST',
            url: BRAND_ENDPOINT + '/get',
            data: { brandId: brandId },
            headers: { "Content-Type": "application/json" }
        }, true);
        return this;
    }

    toggleBrandStatus = async (brandId: string) => {
        this.response = await this.makeRequest({
            method: 'POST',
            url: BRAND_ENDPOINT + '/toggle',
            data: { brandId: brandId },
            headers: { "Content-Type": "application/json" }
        }, true);
        return this;
    }

    createBrand = async (brand: any) => {
        this.response = await this.makeRequest({
            method: 'POST',
            url: BRAND_ENDPOINT + '/create',
            data: brand,
            headers: { "Content-Type": "application/json" }
        }, true);
        return this;
    }

    editBrand = async (brand: any) => {
        this.response = await this.makeRequest({
            method: 'POST',
            url: BRAND_ENDPOINT + '/edit',
            data: brand,
            headers: { "Content-Type": "application/json" }
        }, true);
        return this;
    }

    editBrandImg = async (id: string, img: File) => {
        const formData = new FormData();
        formData.append('brandId', id);
        formData.append('brandImg', img);

        this.response = await this.makeRequest({
            method: 'POST',
            url: BRAND_ENDPOINT + '/add-image',
            data: formData,
            headers: { "Content-Type": "multipart/form-data" }
        }, true);
        return this;
    }

    deleteBrandImg = async (brandId: string) => {
        this.response = await this.makeRequest({
            method: 'POST',
            url: BRAND_ENDPOINT + '/delete-image',
            data: { brandId }
        }, true);
        return this;
    }

    deleteBrand = async (brandId: string) => {
        this.response = await this.makeRequest({
            method: 'POST',
            url: BRAND_ENDPOINT + '/delete',
            data: {
                brandId: brandId
            },
            headers: { "Content-Type": "application/json" }
        }, true);
        return this;
    }

    deleteMultiBrands = async (brandIds: string[]) => {
        this.response = await this.makeRequest({
            method: 'POST',
            url: BRAND_ENDPOINT + '/delete-multi',
            data: {
                brandsIds: brandIds
            }
        }, true);
        return this;
    }
}