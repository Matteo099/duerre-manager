import { EnumHelper } from "../utils/enum-helper";

export enum DieType {
    MONOCOLORE = "MONOCOLORE",
    BICOLORE = "BICOLORE",
    TRICOLORE = "TRICOLORE",
}
export const DieTypeHelper = new EnumHelper<keyof typeof DieType>(DieType);