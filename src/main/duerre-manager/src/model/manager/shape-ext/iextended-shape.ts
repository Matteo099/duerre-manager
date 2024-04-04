import Konva from "konva";
import type { IDieDataShapeDao } from "../models/idie-data-shape-dao";
import type { Vector2d } from "konva/lib/types";

export interface IExtendedShape<S extends Konva.Shape> {
    getPoints(): number[];
    setPoints(p: number[]): S;
    calculateLength(): number;
    calculateMiddlePoint(): Konva.Vector2d;
    calculatePointsGivenLength(length: number): { oldPoints: number[], newPoints: number[] };
    updateEndpoint(oldPoint: Konva.Vector2d, newValue: Konva.Vector2d): void;
    getAnchorPoints(): Konva.Vector2d[];
    getNearestPoint(pointer: Konva.Vector2d): Konva.Vector2d | undefined;
    computeCurvePoints<T extends number | Konva.Vector2d>(precision?: number): T[];
    toDieDataShape(): IDieDataShapeDao;
    get shape(): S;
}