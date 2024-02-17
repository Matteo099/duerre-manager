import Konva from "konva";
import { Vector2d } from "konva/lib/types";

export interface IExtendedShape<S extends Konva.Shape> {
    getPoints(): number[];
    setPoints(p: number[]): S;
    calculateLength(): number;
    calculateMiddlePoint(): Konva.Vector2d;
    calculatePointsGivenLength(length: number): { oldPoints: number[], newPoints: number[] };
    updateEndpoint(oldPoint: Konva.Vector2d, newValue: Konva.Vector2d): void;
    getAnchorPoints(): Konva.Vector2d[];
    get shape(): S;
}