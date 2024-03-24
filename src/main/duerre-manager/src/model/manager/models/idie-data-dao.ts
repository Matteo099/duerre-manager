import type { IDieDataShapeDao } from "./idie-data-shape-dao";

export interface IDieDataDao {
    state: IDieDataShapeDao[];
    valid: boolean;
}