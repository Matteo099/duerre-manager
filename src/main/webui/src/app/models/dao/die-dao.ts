import { DieDataDao } from "./die-data-dao";

export interface DieDao {
    name: string;
    dieData: DieDataDao;
    data: string | null;
    aliases: string[];
    customer: string;
}