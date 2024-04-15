import Konva from "konva";
import { Subject } from 'rxjs';
import type { IDieDataShapeDao } from "../models/idie-data-shape-dao";
import type { Point } from "./point";

export type ShapeChanged = {};
export interface IExtendedShape<S extends Konva.Shape> {
    getPoints(): number[];
    setPoints(p: number[]): S;
    calculateLength(): number;
    calculateMiddlePoint(): Konva.Vector2d;
    calculatePointsGivenLength(length: number): { oldPoints: number[], newPoints: number[] };
    updateEndpoint(oldPoint: Point, newValue: Konva.Vector2d): void;
    getAnchorPoints(): Point[];
    getNearestPoint(pointer: Konva.Vector2d): Konva.Vector2d | undefined;
    computeCurvePoints<T extends number | Konva.Vector2d>(precision?: number): T[];
    toDieDataShape(): IDieDataShapeDao;
    interpolatePoint(percentage: number): Konva.Vector2d;

    get onUpdateEndpoint(): Subject<ShapeChanged>
    get shape(): S;
}