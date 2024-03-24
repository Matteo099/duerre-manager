import Konva from "konva";
import type { IDieDataShapeDao } from "../models/idie-data-shape-dao";

export interface IExtendedShape<S extends Konva.Shape> {
    getPoints(): number[];
    setPoints(p: number[]): S;
    calculateLength(): number;
    calculateMiddlePoint(): Konva.Vector2d;
    calculatePointsGivenLength(length: number): { oldPoints: number[], newPoints: number[] };
    updateEndpoint(oldPoint: Konva.Vector2d, newValue: Konva.Vector2d): void;
    getAnchorPoints(): Konva.Vector2d[];
    toDieDataShape(): IDieDataShapeDao;
    get shape(): S;
}