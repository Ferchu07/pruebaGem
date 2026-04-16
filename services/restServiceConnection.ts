import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { isUser } from "../components/priviledge/PriviledgeProvider";
import { logout } from "../redux/authSlice";
import { KEY } from "../redux/browser-storage";
import store, { RootState } from "../redux/store";

export class RestServiceConnection {
    baseUrlV1: string | undefined;
    authBaseUrl: string | undefined;
    publicBaseUrl: string | undefined;
    response: AxiosResponse<any> | null = null;

    constructor() {
        this.baseUrlV1 = process.env.REACT_APP_API_URL_V1;
        this.authBaseUrl = process.env.REACT_APP_API_AUTH_URL;
        this.publicBaseUrl = process.env.REACT_APP_API_PUBLIC_URL;
        this.response = null;
    }

    async makeRequest(config: AxiosRequestConfig, isAuth: boolean = false, isPublic: boolean = false) {
        if (config.url !== undefined) {
            if ((config.data?.publicUrl === true) || isPublic) {
                config.url = this.publicBaseUrl + config.url;
            } else if (config.data?.authUrl === true) {
                config.url = this.authBaseUrl + config.url;
            } else {
                config.url = this.baseUrlV1 + config.url;
            }
        }

        if (config.headers === undefined) {
            config.headers = {
                'Content-Type': 'application/json',
            }
        }

        if (isAuth) {
            let { auth } = store.getState() as RootState;
            if (auth && isUser(auth.user)) {
                Object.assign(config.headers, {
                    'Authorization': `Bearer ${auth.user.token}`
                })
            } else {
                localStorage.removeItem(KEY);
                store.dispatch(logout());
                window.location.replace('/login');
                return null;
            }
        }

        try {
            this.response = await axios(config);
        } catch (error: any) {
            this.response = error.response;
            if (error.response?.status === 401) {
                localStorage.removeItem(KEY);
                store.dispatch(logout());
                window.location.replace('/login');
            }
        }

        return this.response;
    }

    getResponse() {
        return this.response;
    }

    getResponseData() {
        return this.response?.data;
    }

    getOnlyData() {
        return this.response?.data?.data;
    }
}
