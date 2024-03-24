import type {
  OpenAPIClient,
  Parameters,
  UnknownParamsObject,
  OperationResponse,
  AxiosRequestConfig,
} from 'openapi-client-axios';

declare namespace Components {
    namespace Schemas {
        export interface Bson {
        }
        export interface DieDao {
            name?: string;
            dieData?: DieDataDao;
            customer?: string;
            aliases?: string[];
            dieType?: DieType;
            material?: MaterialType;
            totalHeight?: number; // double
            totalWidth?: number; // double
            shoeWidth?: number; // double
            crestWidth?: number; // double
        }
        export interface DieDataDao {
            state?: DieDataShapeDao[];
        }
        export interface DieDataShapeDao {
            type?: string;
            points?: number /* double */[];
        }
        export interface DieSearchDao {
            text?: string;
            dieData?: DieDataDao;
            customers?: string[];
            dieTypes?: DieType[];
            materials?: MaterialType[];
            totalHeight?: number; // double
            totalWidth?: number; // double
            shoeWidth?: number; // double
            crestWidth?: number; // double
            allFilters?: Bson[];
            textFilters?: Bson[];
            customersFilters?: Bson[];
            dieTypesFilters?: Bson[];
            materialsFilters?: Bson[];
            totalHeightFilters?: Bson[];
            totalWidthFilters?: Bson[];
            shoeWidthFilters?: Bson[];
            crestWidthFilters?: Bson[];
        }
        export type DieType = "MONOCOLORE" | "BICOLORE" | "TRICOLORE";
        export type MaterialType = "TPU" | "PVC" | "TR" | "POLIETILENE";
    }
}
declare namespace Paths {
    namespace ApiV1CustomerControllerListCustomers {
        namespace Get {
            namespace Responses {
                export interface $200 {
                }
            }
        }
    }
    namespace ApiV1DieControllerCreateDie {
        namespace Post {
            export type RequestBody = Components.Schemas.DieDao;
            namespace Responses {
                export interface $200 {
                }
            }
        }
    }
    namespace ApiV1DieControllerDie$Id {
        namespace Get {
            namespace Parameters {
                export type Id = string;
            }
            export interface PathParameters {
                id: Parameters.Id;
            }
            namespace Responses {
                export interface $200 {
                }
            }
        }
    }
    namespace ApiV1DieControllerListDies {
        namespace Get {
            namespace Responses {
                export interface $200 {
                }
            }
        }
    }
    namespace ApiV1DieControllerSearchDies {
        namespace Put {
            namespace Parameters {
                export type Threshold = number; // float
            }
            export interface QueryParameters {
                threshold?: Parameters.Threshold /* float */;
            }
            export type RequestBody = Components.Schemas.DieSearchDao;
            namespace Responses {
                export interface $200 {
                }
            }
        }
    }
}

export interface OperationMethods {
}

export interface PathsDictionary {
  ['/api/v1/customer-controller/list-customers']: {
  }
  ['/api/v1/die-controller/create-die']: {
  }
  ['/api/v1/die-controller/die/{id}']: {
  }
  ['/api/v1/die-controller/list-dies']: {
  }
  ['/api/v1/die-controller/search-dies']: {
  }
}

export type DuerreManagerClient = OpenAPIClient<OperationMethods, PathsDictionary>
