import { DieDataDao } from "./die-data-dao";

export interface DieSimilarSearchDao {
    dieData: DieDataDao;
    name: string | null;
}