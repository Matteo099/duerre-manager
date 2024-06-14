import type {
  OpenAPIClient,
  Parameters,
  UnknownParamsObject,
  OperationResponse,
  AxiosRequestConfig,
} from 'openapi-client-axios';

declare namespace Components {
    namespace Schemas {
        export interface CompleteDieSearchResult {
            name?: string;
            aliases?: string[];
            dieData?: DieData;
            customer?: Customer;
            dieType?: DieType;
            material?: MaterialType;
            totalHeight?: number; // double
            totalWidth?: number; // double
            shoeWidth?: number; // double
            crestWidth?: number; // double
            creationDate?: /**
             * example:
             * 2022-03-10T12:15:50
             */
            LocalDateTime /* date-time */;
            textScore?: number; // double
            sizeScore?: number; // double
            matchScore?: number; // double
        }
        export interface Customer {
            name?: string;
        }
        /**
         * example:
         * 2022-03-10
         */
        export type Date = string; // date
        export interface Die {
            name?: string;
            aliases?: string[];
            dieData?: DieData;
            customer?: Customer;
            dieType?: DieType;
            material?: MaterialType;
            totalHeight?: number; // double
            totalWidth?: number; // double
            shoeWidth?: number; // double
            crestWidth?: number; // double
            creationDate?: /**
             * example:
             * 2022-03-10T12:15:50
             */
            LocalDateTime /* date-time */;
        }
        export interface DieDao {
            name?: string;
            dieData?: DieShapeExport;
            customer?: string;
            aliases?: string[];
            dieType?: DieType;
            material?: MaterialType;
            totalHeight?: number; // double
            totalWidth?: number; // double
            shoeWidth?: number; // double
            crestWidth?: number; // double
        }
        export interface DieData {
            lines?: DieDataLine[];
        }
        export interface DieDataLine {
            type?: string;
            points?: number /* double */[];
        }
        export interface DieLineDao {
            type?: string;
            points?: number /* double */[];
        }
        export interface DieSearch {
            id?: ObjectId;
            text?: string;
            dieData?: DieData;
            customers?: string[];
            dieTypes?: DieType[];
            materials?: MaterialType[];
            totalHeight?: number; // double
            totalWidth?: number; // double
            shoeWidth?: number; // double
            crestWidth?: number; // double
            title?: string;
            subtitle?: string;
            searchDate?: /**
             * example:
             * 2022-03-10T12:15:50
             */
            LocalDateTime /* date-time */;
        }
        export interface DieSearchDao {
            text?: string;
            dieData?: DieShapeExport;
            customers?: string[];
            dieTypes?: DieType[];
            materials?: MaterialType[];
            totalHeight?: number; // double
            totalWidth?: number; // double
            shoeWidth?: number; // double
            crestWidth?: number; // double
        }
        export interface DieShapeExport {
            lines?: DieLineDao[];
        }
        export type DieType = "MONOCOLORE" | "BICOLORE" | "TRICOLORE";
        export interface ErrorWrapper {
            message?: string;
        }
        export interface IdWrapper {
            id?: any;
        }
        /**
         * example:
         * 2022-03-10T16:15:50Z
         */
        export type Instant = string; // date-time
        /**
         * example:
         * 2022-03-10T12:15:50
         */
        export type LocalDateTime = string; // date-time
        export type MaterialType = "TPU" | "PVC" | "TR" | "POLIETILENE";
        export interface MessageWrapper {
            message?: any;
        }
        export interface Metric {
            max?: number; // double
            usage?: number; // double
            description?: string;
        }
        export interface ObjectId {
            timestamp?: number; // int32
            counter?: number; // int32
            randomValue1?: number; // int32
            randomValue2?: number;
            date?: /**
             * example:
             * 2022-03-10
             */
            Date /* date */;
        }
        export interface Order {
            id?: ObjectId;
            dieName?: string;
            customer?: Customer;
            quantity?: number; // int64
            description?: string;
            creationDate?: /**
             * example:
             * 2022-03-10T12:15:50
             */
            LocalDateTime /* date-time */;
            expirationDate?: /**
             * example:
             * 2022-03-10T12:15:50
             */
            LocalDateTime /* date-time */;
            completitionDate?: /**
             * example:
             * 2022-03-10T12:15:50
             */
            LocalDateTime /* date-time */;
            startDate?: /**
             * example:
             * 2022-03-10T12:15:50
             */
            LocalDateTime /* date-time */;
            status?: OrderStatus;
            duration?: number; // int64
            orderId?: string;
        }
        export interface OrderDao {
            dieName?: string;
            customer?: string;
            quantity?: number; // int64
            description?: string;
            expirationDate?: /**
             * example:
             * 2022-03-10T16:15:50Z
             */
            Instant /* date-time */;
            status?: OrderStatus;
            orderId?: string;
        }
        export type OrderStatus = "TODO" | "IN_PROGRESS" | "DONE" | "CANCELLED";
        export interface UpdateAvailable {
            available?: boolean;
            version?: string;
        }
        export type UpdatePhase = "UNSET" | "STARTING" | "DOWNLOADING" | "INSTALLING";
        export interface UpdateStatus {
            phase?: UpdatePhase;
            progress?: number; // double
            updating?: boolean;
            error?: string;
        }
    }
}
declare namespace Paths {
    namespace AckUpdateError {
        namespace Responses {
            export interface $200 {
            }
        }
    }
    namespace ChangeOrderStatus {
        namespace Parameters {
            export type Id = string;
            export type Status = Components.Schemas.OrderStatus;
        }
        export interface PathParameters {
            id: Parameters.Id;
            status: Parameters.Status;
        }
        namespace Responses {
            export type $200 = Components.Schemas.Order;
            export type $500 = Components.Schemas.ErrorWrapper;
        }
    }
    namespace CheckForUpdates {
        namespace Responses {
            export type $200 = Components.Schemas.UpdateAvailable;
            export type $500 = Components.Schemas.ErrorWrapper;
        }
    }
    namespace CreateDie {
        export type RequestBody = Components.Schemas.DieDao;
        namespace Responses {
            export type $200 = Components.Schemas.IdWrapper;
            export type $500 = Components.Schemas.ErrorWrapper;
        }
    }
    namespace CreateOrder {
        export type RequestBody = Components.Schemas.OrderDao;
        namespace Responses {
            export type $200 = Components.Schemas.IdWrapper;
            export type $500 = Components.Schemas.ErrorWrapper;
        }
    }
    namespace DeleteDie {
        namespace Parameters {
            export type Id = string;
        }
        export interface PathParameters {
            id: Parameters.Id;
        }
        namespace Responses {
            export type $200 = Components.Schemas.MessageWrapper;
            export type $500 = Components.Schemas.ErrorWrapper;
        }
    }
    namespace DeleteOrder {
        namespace Parameters {
            export type Id = string;
        }
        export interface PathParameters {
            id: Parameters.Id;
        }
        namespace Responses {
            export type $200 = Components.Schemas.MessageWrapper;
            export type $500 = Components.Schemas.ErrorWrapper;
        }
    }
    namespace DeleteSearch {
        namespace Parameters {
            export type Id = string;
        }
        export interface PathParameters {
            id: Parameters.Id;
        }
        namespace Responses {
            export type $200 = Components.Schemas.MessageWrapper;
            export type $500 = Components.Schemas.ErrorWrapper;
        }
    }
    namespace EditDie {
        export type RequestBody = Components.Schemas.DieDao;
        namespace Responses {
            export type $200 = Components.Schemas.IdWrapper;
            export type $500 = Components.Schemas.ErrorWrapper;
        }
    }
    namespace EditOrder {
        export type RequestBody = Components.Schemas.OrderDao;
        namespace Responses {
            export type $200 = Components.Schemas.IdWrapper;
            export type $500 = Components.Schemas.ErrorWrapper;
        }
    }
    namespace GetCPU {
        namespace Responses {
            export type $200 = Components.Schemas.Metric;
            export type $500 = Components.Schemas.ErrorWrapper;
        }
    }
    namespace GetDie {
        namespace Parameters {
            export type Id = string;
        }
        export interface PathParameters {
            id: Parameters.Id;
        }
        namespace Responses {
            export type $200 = Components.Schemas.Die;
            export type $404 = Components.Schemas.ErrorWrapper;
            export type $500 = Components.Schemas.ErrorWrapper;
        }
    }
    namespace GetHDD {
        namespace Responses {
            export type $200 = Components.Schemas.Metric[];
            export type $500 = Components.Schemas.ErrorWrapper;
        }
    }
    namespace GetOrder {
        namespace Parameters {
            export type Id = string;
        }
        export interface PathParameters {
            id: Parameters.Id;
        }
        namespace Responses {
            export type $200 = Components.Schemas.Order;
            export type $404 = Components.Schemas.ErrorWrapper;
            export type $500 = Components.Schemas.ErrorWrapper;
        }
    }
    namespace GetRAM {
        namespace Responses {
            export type $200 = Components.Schemas.Metric;
            export type $500 = Components.Schemas.ErrorWrapper;
        }
    }
    namespace GetSearches {
        namespace Parameters {
            export type PageSize = number; // int32
        }
        export interface QueryParameters {
            pageSize?: Parameters.PageSize /* int32 */;
        }
        namespace Responses {
            export type $200 = Components.Schemas.DieSearch[];
            export type $500 = Components.Schemas.ErrorWrapper;
        }
    }
    namespace ListCustomers {
        namespace Responses {
            export type $200 = Components.Schemas.Customer[];
            export type $500 = Components.Schemas.ErrorWrapper;
        }
    }
    namespace ListDies {
        namespace Responses {
            export type $200 = Components.Schemas.Die[];
            export type $500 = Components.Schemas.ErrorWrapper;
        }
    }
    namespace ListOrders {
        namespace Responses {
            export type $200 = Components.Schemas.Order[];
            export type $500 = Components.Schemas.ErrorWrapper;
        }
    }
    namespace SearchDies {
        namespace Parameters {
            export type Threshold = number; // float
        }
        export interface QueryParameters {
            threshold?: Parameters.Threshold /* float */;
        }
        export type RequestBody = Components.Schemas.DieSearchDao;
        namespace Responses {
            export type $200 = Components.Schemas.CompleteDieSearchResult[];
            export type $500 = Components.Schemas.ErrorWrapper;
        }
    }
    namespace Update {
        namespace Responses {
            export interface $200 {
            }
        }
    }
    namespace UpdateProgress {
        namespace Responses {
            export type $200 = Components.Schemas.UpdateStatus[];
        }
    }
    namespace UpdateStatus {
        namespace Responses {
            export type $200 = Components.Schemas.UpdateStatus;
            export type $500 = Components.Schemas.ErrorWrapper;
        }
    }
}

export interface OperationMethods {
  /**
   * listCustomers
   */
  'listCustomers'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.ListCustomers.Responses.$200>
  /**
   * createDie
   */
  'createDie'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: Paths.CreateDie.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.CreateDie.Responses.$200>
  /**
   * deleteDie
   */
  'deleteDie'(
    parameters?: Parameters<Paths.DeleteDie.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.DeleteDie.Responses.$200>
  /**
   * deleteSearch
   */
  'deleteSearch'(
    parameters?: Parameters<Paths.DeleteSearch.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.DeleteSearch.Responses.$200>
  /**
   * getDie
   */
  'getDie'(
    parameters?: Parameters<Paths.GetDie.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.GetDie.Responses.$200>
  /**
   * editDie
   */
  'editDie'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: Paths.EditDie.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.EditDie.Responses.$200>
  /**
   * listDies
   */
  'listDies'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.ListDies.Responses.$200>
  /**
   * searchDies
   */
  'searchDies'(
    parameters?: Parameters<Paths.SearchDies.QueryParameters> | null,
    data?: Paths.SearchDies.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.SearchDies.Responses.$200>
  /**
   * getSearches
   */
  'getSearches'(
    parameters?: Parameters<Paths.GetSearches.QueryParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.GetSearches.Responses.$200>
  /**
   * getCPU
   */
  'getCPU'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.GetCPU.Responses.$200>
  /**
   * getHDD
   */
  'getHDD'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.GetHDD.Responses.$200>
  /**
   * getRAM
   */
  'getRAM'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.GetRAM.Responses.$200>
  /**
   * changeOrderStatus
   */
  'changeOrderStatus'(
    parameters?: Parameters<Paths.ChangeOrderStatus.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.ChangeOrderStatus.Responses.$200>
  /**
   * createOrder
   */
  'createOrder'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: Paths.CreateOrder.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.CreateOrder.Responses.$200>
  /**
   * deleteOrder
   */
  'deleteOrder'(
    parameters?: Parameters<Paths.DeleteOrder.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.DeleteOrder.Responses.$200>
  /**
   * editOrder
   */
  'editOrder'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: Paths.EditOrder.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.EditOrder.Responses.$200>
  /**
   * listOrders
   */
  'listOrders'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.ListOrders.Responses.$200>
  /**
   * getOrder
   */
  'getOrder'(
    parameters?: Parameters<Paths.GetOrder.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.GetOrder.Responses.$200>
  /**
   * ackUpdateError
   */
  'ackUpdateError'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.AckUpdateError.Responses.$200>
  /**
   * checkForUpdates
   */
  'checkForUpdates'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.CheckForUpdates.Responses.$200>
  /**
   * updateProgress
   */
  'updateProgress'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.UpdateProgress.Responses.$200>
  /**
   * updateStatus
   */
  'updateStatus'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.UpdateStatus.Responses.$200>
  /**
   * update
   */
  'update'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.Update.Responses.$200>
}

export interface PathsDictionary {
  ['/api/v1/customer-controller/list-customers']: {
    /**
     * listCustomers
     */
    'get'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.ListCustomers.Responses.$200>
  }
  ['/api/v1/die-controller/create-die']: {
    /**
     * createDie
     */
    'post'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: Paths.CreateDie.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.CreateDie.Responses.$200>
  }
  ['/api/v1/die-controller/delete-die/{id}']: {
    /**
     * deleteDie
     */
    'delete'(
      parameters?: Parameters<Paths.DeleteDie.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.DeleteDie.Responses.$200>
  }
  ['/api/v1/die-controller/delete-search/{id}']: {
    /**
     * deleteSearch
     */
    'delete'(
      parameters?: Parameters<Paths.DeleteSearch.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.DeleteSearch.Responses.$200>
  }
  ['/api/v1/die-controller/die/{id}']: {
    /**
     * getDie
     */
    'get'(
      parameters?: Parameters<Paths.GetDie.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.GetDie.Responses.$200>
  }
  ['/api/v1/die-controller/edit-die']: {
    /**
     * editDie
     */
    'post'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: Paths.EditDie.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.EditDie.Responses.$200>
  }
  ['/api/v1/die-controller/list-dies']: {
    /**
     * listDies
     */
    'get'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.ListDies.Responses.$200>
  }
  ['/api/v1/die-controller/search-dies']: {
    /**
     * searchDies
     */
    'put'(
      parameters?: Parameters<Paths.SearchDies.QueryParameters> | null,
      data?: Paths.SearchDies.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.SearchDies.Responses.$200>
  }
  ['/api/v1/die-controller/searches']: {
    /**
     * getSearches
     */
    'get'(
      parameters?: Parameters<Paths.GetSearches.QueryParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.GetSearches.Responses.$200>
  }
  ['/api/v1/metric-controller/cpu']: {
    /**
     * getCPU
     */
    'get'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.GetCPU.Responses.$200>
  }
  ['/api/v1/metric-controller/hdd']: {
    /**
     * getHDD
     */
    'get'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.GetHDD.Responses.$200>
  }
  ['/api/v1/metric-controller/ram']: {
    /**
     * getRAM
     */
    'get'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.GetRAM.Responses.$200>
  }
  ['/api/v1/order-controller/change-order-status/{id}/{status}']: {
    /**
     * changeOrderStatus
     */
    'put'(
      parameters?: Parameters<Paths.ChangeOrderStatus.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.ChangeOrderStatus.Responses.$200>
  }
  ['/api/v1/order-controller/create-order']: {
    /**
     * createOrder
     */
    'post'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: Paths.CreateOrder.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.CreateOrder.Responses.$200>
  }
  ['/api/v1/order-controller/delete-order/{id}']: {
    /**
     * deleteOrder
     */
    'delete'(
      parameters?: Parameters<Paths.DeleteOrder.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.DeleteOrder.Responses.$200>
  }
  ['/api/v1/order-controller/edit-order']: {
    /**
     * editOrder
     */
    'put'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: Paths.EditOrder.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.EditOrder.Responses.$200>
  }
  ['/api/v1/order-controller/list-orders']: {
    /**
     * listOrders
     */
    'get'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.ListOrders.Responses.$200>
  }
  ['/api/v1/order-controller/order/{id}']: {
    /**
     * getOrder
     */
    'get'(
      parameters?: Parameters<Paths.GetOrder.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.GetOrder.Responses.$200>
  }
  ['/api/v1/updater-controller/ack-error']: {
    /**
     * ackUpdateError
     */
    'put'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.AckUpdateError.Responses.$200>
  }
  ['/api/v1/updater-controller/check-update']: {
    /**
     * checkForUpdates
     */
    'get'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.CheckForUpdates.Responses.$200>
  }
  ['/api/v1/updater-controller/sse']: {
    /**
     * updateProgress
     */
    'get'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.UpdateProgress.Responses.$200>
  }
  ['/api/v1/updater-controller/status']: {
    /**
     * updateStatus
     */
    'get'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.UpdateStatus.Responses.$200>
  }
  ['/api/v1/updater-controller/update']: {
    /**
     * update
     */
    'put'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.Update.Responses.$200>
  }
}

export type Client = OpenAPIClient<OperationMethods, PathsDictionary>
