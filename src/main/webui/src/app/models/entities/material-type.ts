import { EnumHelper } from "../utils/enum-helper";

export enum MaterialType {
    TPU = "TPU",
    PVC = "PVC",
    TR = "TR",
    POLIETILENE = "POLIETILENE"
}
export const MaterialTypeHelper = new EnumHelper<keyof typeof MaterialType>(MaterialType);