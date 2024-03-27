import type { AxiosError, AxiosResponse } from "axios";
import OpenAPIClientAxios from "openapi-client-axios";
import type { App } from "vue";
import type { Client as DuerreManagerClient } from "./openapi";
import Client from "./openapi";
import { toast } from "vue3-toastify";

export class GaussService {
    public client!: Promise<DuerreManagerClient>;
    public authToken?: string
    public refToken?: string

    public createClient() {
        this.client = this.createClientAsync();
    }

    private async createClientAsync(): Promise<DuerreManagerClient> {
        const api = new OpenAPIClientAxios({
            definition: import.meta.env.VITE_VUE_APP_OPENAPI_URL
        })
        api.withServer({
            url: import.meta.env.VITE_VUE_APP_REST_API_URL,
            description: 'Duerre Manager Backend'
        })
        const client = await api.getClient<DuerreManagerClient>()

        // **** REQUEST
        // Authorization header
        // client.interceptors.request.use(async (request: any) => {
        //     const token = await this.refreshToken()
        //     request.headers.set('Authorization', 'Bearer ' + token)
        //     return request
        // })

        // **** RESPONSE
        // Unauthorized response
        client.interceptors.response.use(this.handleResponseOk, this.handleResponseError)
        return client;
    }

    private handleResponseOk(response: AxiosResponse) {
        // console.log('axios response ok', response)
        return response
    }

    private async handleResponseError(error: AxiosError) {
        console.error('axios response error', error)
        // console.log('axios response error.response?.status = ', error.response?.status)
        toast.error((error.response?.data as Client.Components.Schemas.ErrorWrapper)?.message || "Generic error");

        if (error.response?.status === 401 || error.response?.status === 403) {
            // const store = useAuthStore()
            // store.keycloak?.logout()
        }
    }
}

const client = new GaussService();
const http = {
    async install(app: App) {
        client.createClient();
        app.provide("$http", client);
    }
}

export const useHttp = () => client;
export default http;