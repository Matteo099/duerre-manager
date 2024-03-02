import { DieType } from "../entities/die.type";
import { MaterialType } from "../entities/material-type";
import { DieDataDao } from "./die-data-dao";

export interface DieDao {
    name: string;
    dieData: DieDataDao;
    aliases: string[];
    customer: string;

    dieType: DieType;
    material: MaterialType;
    totalHeight: number;
    totalWidth: number;
    shoeWidth: number;
    crestWidth: number;
}