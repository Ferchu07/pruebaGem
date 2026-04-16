import { RestServiceConnection } from '../restServiceConnection';

const ENDPOINT = '/documents';

export class DocumentsService extends RestServiceConnection {

    renderDocument = async (documentId: string) => {
        this.response = await this.makeRequest({
            method: 'POST',
            responseType: 'blob',
            url: ENDPOINT + '/render',
            data: { documentId: documentId },
            headers: {
                "Content-Type": "application/json"
            }
        }, true);
        return this;
    }

    uploadDocuments = async (entityId: string, entityName: string, documents: File[], documentTypeId: string) => {
        this.response = await this.makeRequest({
            method: 'POST',
            url: ENDPOINT + '/upload',
            data: {
                entityId,
                entityName,
                documents,
                documentTypeId,
            },
            headers: { "Content-Type": "multipart/form-data" }
        }, true);
        return this;
    }

    downloadDocument = async (documentId: string) => {
        this.response = await this.makeRequest({
            method: 'POST',
            url: ENDPOINT + '/download',
            responseType: 'arraybuffer', // to avoid string conversion
            data: { documentId },
        }, true);
        return this;
    }

    multiDeleteDocuments = async (documentIds: string[]) => {
        this.response = await this.makeRequest({
            method: 'POST',
            url: ENDPOINT + '/multi-delete',
            data: { documentIds: documentIds },
        }, true);
        return this;
    }

}