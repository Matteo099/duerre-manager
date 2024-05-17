import type { AxiosError, AxiosResponse } from "axios";
import OpenAPIClientAxios from "openapi-client-axios";
import type { App } from "vue";
import { toast } from "vue3-toastify";
import type { Client as DuerreManagerClient } from "./openapi";
import Client from "./openapi";
import { useRoute, useRouter } from "vue-router";

export class GaussService {
    public client!: Promise<DuerreManagerClient>;
    public authToken?: string
    public refToken?: string
    private router?: any

    public createClient(router?: any) {
        this.router = router ?? useRouter();
        this.client = this.createClientAsync();
    }

    private async createClientAsync(): Promise<DuerreManagerClient> {
        const api = new OpenAPIClientAxios({
            definition: import.meta.env.VITE_VUE_APP_OPENAPI_URL
        })
        const client = await api.init<DuerreManagerClient>();

        // api.withServer({
        //     url: "", //import.meta.env.VITE_VUE_APP_REST_API_URL,
        //     description: 'Duerre Manager Backend'
        // })

        //const client = await api.getClient<DuerreManagerClient>()

        // **** REQUEST
        // Authorization header
        // client.interceptors.request.use(async (request: any) => {
        //     const token = await this.refreshToken()
        //     request.headers.set('Authorization', 'Bearer ' + token)
        //     return request
        // })

        // **** RESPONSE
        // Unauthorized response
        client.interceptors.response.use(this.handleResponseOk, e => this.handleResponseError(e))
        return client;
    }

    private handleResponseOk(response: AxiosResponse) {
        // console.log('axios response ok', response)
        return response
    }

    private async handleResponseError(error: AxiosError) {
        console.error('axios response error', error)
        // console.log('axios response error.response?.status = ', error.response?.status)
        const headers = error.config?.headers;
        const skip = headers?.get("skip-not-found")

        if (error.response?.status === 404 && !skip) {
            this.router?.push("/not-found");
        } else
        if (error.response?.status === 401 || error.response?.status === 403) {
            // const store = useAuthStore()
            // store.keycloak?.logout()
        } else {
            toast.error((error.response?.data as Client.Components.Schemas.ErrorWrapper)?.message || "Generic error");
        }
    }
}

const client = new GaussService();
const http = {
    async install(app: App) {
        client.createClient(app.config.globalProperties.$router);
        app.provide("$http", client);
    }
}

export const useHttp = () => client;
export default http;