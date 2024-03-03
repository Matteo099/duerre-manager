import { DieType } from "../entities/die.type";
import { MaterialType } from "../entities/material-type";
import { DieDataDao } from "./die-data-dao";

export interface DieSearchDao {
    names: string[] | null;
    dieData: null | DieDataDao;
    customers: null | string[];
    dieTypes: null | string[] | DieType[];
    materials: null | string[] | MaterialType[];
    totalHeight:null | number;
    totalWidth:null | number;
    shoeWidth: null | number;
    crestWidth:null | number;
}