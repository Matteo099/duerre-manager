import type {
  OpenAPIClient,
  Parameters,
  UnknownParamsObject,
  OperationResponse,
  AxiosRequestConfig,
} from 'openapi-client-axios';

declare namespace Components {
    namespace Schemas {
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
            name?: string;
            creationDate?: /**
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
        export interface DieSearchResult {
            name?: string;
            textScore?: number; // double
            sizeScore?: number; // double
            matchScore?: number; // double
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
         * 2022-03-10T12:15:50
         */
        export type LocalDateTime = string; // date-time
        export type MaterialType = "TPU" | "PVC" | "TR" | "POLIETILENE";
        export interface MessageWrapper {
            message?: any;
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
    }
}
declare namespace Paths {
    namespace CreateDie {
        export type RequestBody = Components.Schemas.DieDao;
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
    namespace EditDie {
        export type RequestBody = Components.Schemas.DieDao;
        namespace Responses {
            export type $200 = Components.Schemas.IdWrapper;
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
    namespace SearchDies {
        namespace Parameters {
            export type Threshold = number; // float
        }
        export interface QueryParameters {
            threshold?: Parameters.Threshold /* float */;
        }
        export type RequestBody = Components.Schemas.DieSearchDao;
        namespace Responses {
            export type $200 = Components.Schemas.DieSearchResult[];
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
}

export type Client = OpenAPIClient<OperationMethods, PathsDictionary>
